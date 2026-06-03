<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\EsgScore;
use App\Models\Regulation;
use App\Models\Notification;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function store(Request $request)
    {
        // Mapping alias dari frontend ke nama kolom database
        $data = $request->all();
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
        foreach ($aliasMap as $alias => $real) {
            if (array_key_exists($alias, $data)) {
                $data[$real] = $data[$alias];
                unset($data[$alias]);
            }
        }
        $request->replace($data);

        // Validasi — period_type & report_type boleh kosong (frontend lama tidak kirim ini)
        $request->validate([
            'company_name' => 'required|string',
        ]);

        // Hitung tahun
        $year = $request->year
            ?? ($request->period_start ? date('Y', strtotime($request->period_start)) : date('Y'));

        // Tentukan report_type
        $reportType = $request->report_type ?? 'both';

        // ── ESG ──────────────────────────────────────────────────────────────
        $envScore = 0; $socialScore = 0; $govScore = 0;
        $overallScore = 0; $ojkScore = 0;
        $carbonEmission = $request->carbon_emission ?? 0;

        if (in_array($reportType, ['esg', 'both'])) {
            $envScore = max(0, 100 - ($carbonEmission / 600) * 50);

            // Social Score
            $socialFactors = 0; $socialCount = 0;
            if ($request->employee_training_count) {
                $socialFactors += min(100, $request->employee_training_count * 2);
                $socialCount++;
            }
            if ($request->women_percentage) {
                $socialFactors += $request->women_percentage;
                $socialCount++;
            }
            if ($request->customer_complaints !== null) {
                $socialFactors += max(0, 100 - $request->customer_complaints * 5);
                $socialCount++;
            }
            $socialScore = $socialCount > 0
                ? $socialFactors / $socialCount
                : ($request->social_score ?? 0);

            // Governance Score
            $govFactors = 0;
            if ($request->has_internal_audit)  $govFactors += 25;
            if ($request->has_fraud_policy)    $govFactors += 25;
            if ($request->has_anti_corruption) $govFactors += 25;
            if ($request->report_on_time)      $govFactors += 25;
            $govScore = $govFactors > 0 ? $govFactors : ($request->governance_score ?? 0);

            // OJK Score
            $ojkFactors = 0;
            if ($request->has_audit)                  $ojkFactors += 25;
            if ($request->has_complete_legality)      $ojkFactors += 25;
            if (!$request->has_regulatory_violations) $ojkFactors += 25;
            if ($request->has_esg_report)             $ojkFactors += 25;
            $ojkScore = $ojkFactors;

            $overallScore = ($envScore * 0.30) + ($socialScore * 0.35) + ($govScore * 0.35);
        }

        // ── Financial ────────────────────────────────────────────────────────
        $profitMargin = 0; $roa = 0;

        if (in_array($reportType, ['financial', 'both'])) {
            $revenue     = $request->revenue ?? 0;
            $netProfit   = $request->net_profit ?? 0;
            $totalAssets = max(1, $request->total_assets ?? 1);

            $profitMargin = $revenue > 0 ? round(($netProfit / $revenue) * 100, 1) : 0;
            $roa          = round(($netProfit / $totalAssets) * 100, 1);
        }

        // ── Simpan Report ────────────────────────────────────────────────────
        $report = Report::create([
            'user_id'               => $request->user()->id,
            'company_name'          => $request->company_name,
            'address'               => $request->address,
            'company_type'          => $request->company_type,
            'employee_count'        => $request->employee_count,
            'location'              => $request->location,
            'year'                  => $year,
            'period_type'           => $request->period_type ?? 'tahunan',
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
            'revenue'               => $request->revenue ?? 0,
            'net_profit'            => $request->net_profit ?? 0,
            'total_assets'          => $request->total_assets ?? 0,
            'total_liabilities'     => $request->total_liabilities ?? 0,
            'total_equity'          => $request->total_equity ?? 0,
            'operational_expenses'  => $request->operational_expenses ?? 0,
            'cash_and_equivalents'  => $request->cash_and_equivalents ?? 0,
            'report_type'           => $reportType,
            'status'                => 'processed',
        ]);

        // ── ESG Score & Regulations ──────────────────────────────────────────
        if (in_array($reportType, ['esg', 'both'])) {
            EsgScore::create([
                'report_id'           => $report->id,
                'environmental_score' => round($envScore, 1),
                'social_score'        => round($socialScore, 1),
                'governance_score'    => round($govScore, 1),
                'overall_score'       => round($overallScore, 1),
                'ojk_score'           => $ojkScore,
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
        }

        // ── Notifikasi ───────────────────────────────────────────────────────
        if ($carbonEmission > 600) {
            Notification::create([
                'user_id'   => $request->user()->id,
                'report_id' => $report->id,
                'message'   => "Emisi karbon {$carbonEmission} ton melebihi batas maksimum 600 ton.",
                'type'      => 'danger',
                'is_read'   => false,
            ]);
        }

        Notification::create([
            'user_id'   => $request->user()->id,
            'report_id' => $report->id,
            'message'   => "Laporan {$request->company_name} berhasil diproses.",
            'type'      => 'ok',
            'is_read'   => false,
        ]);

        return response()->json([
            'message' => 'Laporan berhasil diproses',
            'report'  => $report->load(['esgScore', 'regulations']),
        ], 201);
    }

    public function index(Request $request)
    {
        $report = Report::where('user_id', $request->user()->id)
            ->with(['esgScore', 'regulations'])
            ->latest()
            ->first();

        return response()->json($report);
    }

    public function history(Request $request)
    {
        $reports = Report::where('user_id', $request->user()->id)
            ->with(['esgScore', 'regulations'])
            ->latest()
            ->get();

        return response()->json($reports);
    }

    public function detail(Request $request, $id)
    {
        $report = Report::where('user_id', $request->user()->id)
            ->where('id', $id)
            ->with(['esgScore', 'regulations'])
            ->firstOrFail();

        $roa = $report->total_assets > 0
            ? round(($report->net_profit / $report->total_assets) * 100, 2) : 0;
        $roe = $report->total_equity > 0
            ? round(($report->net_profit / $report->total_equity) * 100, 2) : 0;
        $der = $report->total_equity > 0
            ? round($report->total_liabilities / $report->total_equity, 2) : 0;
        $liquidityRatio = $report->total_liabilities > 0
            ? round($report->cash_and_equivalents / $report->total_liabilities, 2) : 0;
        $profitMargin = $report->revenue > 0
            ? round(($report->net_profit / $report->revenue) * 100, 2) : 0;

        return response()->json([
            'report' => $report,
            'ratios' => compact('roa', 'roe', 'der', 'liquidityRatio', 'profitMargin'),
        ]);
    }

    public function show(Request $request)
    {
        $report = Report::where('user_id', $request->user()->id)
            ->with(['esgScore', 'regulations'])
            ->latest()
            ->first();

        if (!$report) {
            return response()->json(['message' => 'Belum ada laporan'], 404);
        }

        $roa = $report->total_assets > 0
            ? round(($report->net_profit / $report->total_assets) * 100, 2) : 0;
        $roe = $report->total_equity > 0
            ? round(($report->net_profit / $report->total_equity) * 100, 2) : 0;
        $der = $report->total_equity > 0
            ? round($report->total_liabilities / $report->total_equity, 2) : 0;
        $liquidityRatio = $report->total_liabilities > 0
            ? round($report->cash_and_equivalents / $report->total_liabilities, 2) : 0;
        $profitMargin = $report->revenue > 0
            ? round(($report->net_profit / $report->revenue) * 100, 2) : 0;

        return response()->json([
            'report' => $report,
            'ratios' => compact('roa', 'roe', 'der', 'liquidityRatio', 'profitMargin'),
        ]);
    }
}