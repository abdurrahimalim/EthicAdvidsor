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

    public function getUsers()
    {
        $users = User::withCount('reports')->latest()->get();
        return response()->json($users);
    }

    public function createUser(Request $request)
    {
        $request->validate([
            'name'     => 'required|string',
            'email'    => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
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
            'name'  => 'sometimes|string',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'role'  => 'sometimes|in:user,admin',
        ]);

        $data = $request->only(['name', 'email', 'role']);

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

    public function getReports()
    {
        $reports = Report::with(['user', 'esgScore'])->latest()->get();
        return response()->json($reports);
    }

    public function createReport(Request $request)
    {
        $request->validate([
            'user_id'          => 'required|exists:users,id',
            'company_name'     => 'required|string',
            'year'             => 'required|integer',
            'carbon_emission'  => 'required|numeric',
            'social_score'     => 'required|numeric|min:0|max:100',
            'governance_score' => 'required|numeric|min:0|max:100',
            'revenue'          => 'required|numeric',
            'net_profit'       => 'required|numeric',
            'total_assets'     => 'required|numeric',
        ]);

        $report = Report::create([
            'user_id'          => $request->user_id,
            'company_name'     => $request->company_name,
            'year'             => $request->year,
            'carbon_emission'  => $request->carbon_emission,
            'social_score'     => $request->social_score,
            'governance_score' => $request->governance_score,
            'revenue'          => $request->revenue,
            'net_profit'       => $request->net_profit,
            'total_assets'     => $request->total_assets,
            'status'           => 'pending',
        ]);

        $envScore     = max(0, 100 - ($request->carbon_emission / 600) * 50);
        $overallScore = ($envScore * 0.30) + ($request->social_score * 0.35) + ($request->governance_score * 0.35);
        $profitMargin = $request->revenue > 0 ? ($request->net_profit / $request->revenue) * 100 : 0;
        $roa          = $request->total_assets > 0 ? ($request->net_profit / $request->total_assets) * 100 : 0;

        EsgScore::create([
            'report_id'           => $report->id,
            'environmental_score' => round($envScore, 1),
            'social_score'        => $request->social_score,
            'governance_score'    => $request->governance_score,
            'overall_score'       => round($overallScore, 1),
            'ojk_score'           => round(($request->social_score + $request->governance_score) / 2, 1),
            'carbon_emission'     => $request->carbon_emission,
            'profit_margin'       => round($profitMargin, 1),
            'return_on_assets'    => round($roa, 1),
        ]);

        $regulations = [
            ['name' => 'POJK No. 77/2016', 'threshold' => $request->governance_score >= 65],
            ['name' => 'BI Regulation',     'threshold' => $request->social_score >= 60],
            ['name' => 'SLIK Reporting',    'threshold' => $request->carbon_emission <= 600],
            ['name' => 'ESG Disclosure',    'threshold' => $overallScore >= 70],
        ];

        foreach ($regulations as $reg) {
            Regulation::create([
                'report_id' => $report->id,
                'name'      => $reg['name'],
                'status'    => $reg['threshold'] ? 'compliant' : 'warning',
                'score'     => $reg['threshold'] ? rand(85, 96) : rand(45, 72),
            ]);
        }

        Notification::create([
            'user_id'   => $request->user_id,
            'report_id' => $report->id,
            'message'   => 'Laporan ' . $request->company_name . ' tahun ' . $request->year . ' telah ditambahkan oleh admin.',
            'type'      => 'ok',
            'is_read'   => false,
        ]);

        return response()->json($report->load(['esgScore', 'user']), 201);
    }

    public function deleteReport($id)
    {
        $report = Report::findOrFail($id);
        $report->delete();
        return response()->json(['message' => 'Laporan berhasil dihapus']);
    }
}