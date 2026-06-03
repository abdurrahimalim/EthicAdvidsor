<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Report;
use App\Models\EsgScore;
use App\Models\Regulation;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    // ─── USER CRUD ────────────────────────────────────────

    public function getUsers()
    {
        $users = User::withCount('reports')->latest()->get();
        return response()->json($users);
    }

    public function createUser(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users',
            'password' => 'required|min:6',
            'role'     => 'required|in:user,admin',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
        ]);

        return response()->json($user->loadCount('reports'), 201);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'role'  => 'required|in:user,admin',
        ]);

        $data = [
            'name'  => $request->name,
            'email' => $request->email,
            'role'  => $request->role,
        ];

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        return response()->json($user->loadCount('reports'));
    }

    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();
        return response()->json(['message' => 'User berhasil dihapus']);
    }

    // ─── REPORT CRUD ──────────────────────────────────────

    public function getReports()
    {
        $reports = Report::with(['user', 'esgScore'])->latest()->get();
        return response()->json($reports);
    }

    public function createReport(Request $request)
    {
        $request->validate([
            'user_id'      => 'required|exists:users,id',
            'company_name' => 'required|string',
            'year'         => 'required|integer',
        ]);

        // Mapping alias sama seperti di ReportController
        $aliasMap = [
            'start_date'          => 'period_start',
            'end_date'            => 'period_end',
            'operational_cost'    => 'operational_expenses',
            'cash'                => 'cash_and_equivalents',
            'renewable_energy'    => 'renewable_energy_pct',
            'employee_training'   => 'employee_training_count',
            'training_hours'      => 'employee_training_hours',
            'audit_available'     => 'has_audit',
            'legal_complete'      => 'has_complete_legality',
            'regulator_violation' => 'has_regulatory_violations',
            'sdg_report'          => 'has_esg_report',
            'internal_audit'      => 'has_internal_audit',
            'anti_fraud'          => 'has_fraud_policy',
            'anti_corruption'     => 'has_anti_corruption',
            'timely_report'       => 'report_on_time',
        ];
        $data = $request->all();
        foreach ($aliasMap as $alias => $real) {
            if (isset($data[$alias])) {
                $data[$real] = $data[$alias];
                unset($data[$alias]);
            }
        }
        $request->replace($data);

        $carbonEmission = $request->carbon_emission ?? 0;
        $socialScore    = $request->social_score ?? 0;
        $govScore       = $request->governance_score ?? 0;

        if ($govScore == 0) {
            $g = 0;
            if ($request->has_internal_audit)    $g += 25;
            if ($request->has_fraud_policy)      $g += 25;
            if ($request->has_anti_corruption)   $g += 25;
            if ($request->report_on_time)        $g += 25;
            $govScore = $g;
        }

        $envScore     = max(0, 100 - ($carbonEmission / 600) * 50);
        $overallScore = ($envScore * 0.30) + ($socialScore * 0.35) + ($govScore * 0.35);
        $ojkFactors   = 0;
        if ($request->has_audit)                    $ojkFactors += 25;
        if ($request->has_complete_legality)        $ojkFactors += 25;
        if (!$request->has_regulatory_violations)   $ojkFactors += 25;
        if ($request->has_esg_report)               $ojkFactors += 25;

        $totalAssets = max(1, $request->total_assets ?? 1);
        $revenue     = $request->revenue ?? 0;
        $netProfit   = $request->net_profit ?? 0;
        $profitMargin = $revenue > 0 ? round(($netProfit / $revenue) * 100, 1) : 0;
        $roa = round(($netProfit / $totalAssets) * 100, 1);

        $report = Report::create([
            'user_id'               => $request->user_id,
            'company_name'          => $request->company_name,
            'address'               => $request->address,
            'company_type'          => $request->company_type,
            'employee_count'        => $request->employee_count,
            'year'                  => $request->year,
            'period_start'          => $request->period_start,
            'period_end'            => $request->period_end,
            'carbon_emission'       => $carbonEmission,
            'energy_consumption'    => $request->energy_consumption,
            'renewable_energy_pct'  => $request->renewable_energy_pct,
            'social_score'          => round($socialScore, 1),
            'governance_score'      => round($govScore, 1),
            'employee_training_count' => $request->employee_training_count,
            'employee_training_hours' => $request->employee_training_hours,
            'women_percentage'      => $request->women_percentage,
            'customer_complaints'   => $request->customer_complaints,
            'has_internal_audit'    => $request->has_internal_audit ?? false,
            'has_fraud_policy'      => $request->has_fraud_policy ?? false,
            'has_anti_corruption'   => $request->has_anti_corruption ?? false,
            'legal_cases'           => $request->legal_cases ?? 0,
            'report_on_time'        => $request->report_on_time ?? false,
            'has_audit'             => $request->has_audit ?? false,
            'has_complete_legality' => $request->has_complete_legality ?? false,
            'has_regulatory_violations' => $request->has_regulatory_violations ?? false,
            'has_esg_report'        => $request->has_esg_report ?? false,
            'revenue'               => $revenue,
            'net_profit'            => $netProfit,
            'total_assets'          => $request->total_assets ?? 0,
            'total_liabilities'     => $request->total_liabilities ?? 0,
            'total_equity'          => $request->total_equity ?? 0,
            'operational_expenses'  => $request->operational_expenses ?? 0,
            'cash_and_equivalents'  => $request->cash_and_equivalents ?? 0,
            'report_type'           => 'both',
            'status'                => 'processed',
        ]);

        EsgScore::create([
            'report_id'           => $report->id,
            'environmental_score' => round($envScore, 1),
            'social_score'        => round($socialScore, 1),
            'governance_score'    => round($govScore, 1),
            'overall_score'       => round($overallScore, 1),
            'ojk_score'           => $ojkFactors,
            'carbon_emission'     => $carbonEmission,
            'profit_margin'       => $profitMargin,
            'return_on_assets'    => $roa,
        ]);

        $regulations = [
            ['name' => 'POJK No. 77/2016', 'threshold' => $govScore >= 65],
            ['name' => 'BI Regulation',    'threshold' => $socialScore >= 60],
            ['name' => 'SLIK Reporting',   'threshold' => $carbonEmission <= 600],
            ['name' => 'ESG Disclosure',   'threshold' => $overallScore >= 70],
        ];
        foreach ($regulations as $reg) {
            Regulation::create([
                'report_id' => $report->id,
                'name'      => $reg['name'],
                'status'    => $reg['threshold'] ? 'compliant' : 'warning',
                'score'     => $reg['threshold'] ? rand(85, 96) : rand(45, 72),
            ]);
        }

        return response()->json($report->load(['user', 'esgScore']), 201);
    }

    public function updateReport(Request $request, $id)
    {
        $report = Report::findOrFail($id);

        $data = [];
        if ($request->filled('company_name')) $data['company_name'] = $request->company_name;
        if ($request->filled('year'))         $data['year']         = $request->year;
        if ($request->filled('status'))       $data['status']       = $request->status;
        if ($request->has('notes'))           $data['notes']        = $request->notes;

        $report->update($data);

        // Update ESG score jika ada
        if ($request->filled('esg_score') && $report->esgScore) {
            $report->esgScore->update([
                'overall_score' => $request->esg_score,
            ]);
        }

        return response()->json([
            'message' => 'Laporan berhasil diperbarui',
            'data'    => $report->load(['user', 'esgScore']),
        ]);
    }

    public function deleteReport($id)
    {
        $report = Report::findOrFail($id);
        $report->delete();
        return response()->json(['message' => 'Laporan berhasil dihapus']);
    }
}