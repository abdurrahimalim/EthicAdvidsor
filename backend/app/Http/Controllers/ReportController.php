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
        $request->validate([
            'company_name'     => 'required|string',
            'year'             => 'required|integer',
            'carbon_emission'  => 'required|numeric',
            'social_score'     => 'required|numeric|min:0|max:100',
            'governance_score' => 'required|numeric|min:0|max:100',
            'revenue'          => 'required|numeric',
            'net_profit'       => 'required|numeric',
            'total_assets'     => 'required|numeric',
        ]);

        // Simpan report
        $report = Report::create([
            'user_id'          => $request->user()->id,
            'company_name'     => $request->company_name,
            'year'             => $request->year,
            'carbon_emission'  => $request->carbon_emission,
            'social_score'     => $request->social_score,
            'governance_score' => $request->governance_score,
            'revenue'          => $request->revenue,
            'net_profit'       => $request->net_profit,
            'total_assets'     => $request->total_assets,
            'status'           => 'processed',
        ]);

        // Hitung ESG Score
        $envScore     = max(0, 100 - ($request->carbon_emission / 600) * 50);
        $overallScore = ($envScore * 0.30) + ($request->social_score * 0.35) + ($request->governance_score * 0.35);
        $profitMargin = $request->total_assets > 0 ? ($request->net_profit / $request->revenue) * 100 : 0;
        $roa          = $request->total_assets > 0 ? ($request->net_profit / $request->total_assets) * 100 : 0;

        // Simpan ESG Score
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

        // Simpan Regulations
        $regulations = [
            ['name' => 'POJK No. 77/2016',  'threshold' => $request->governance_score >= 65],
            ['name' => 'BI Regulation',      'threshold' => $request->social_score >= 60],
            ['name' => 'SLIK Reporting',     'threshold' => $request->carbon_emission <= 600],
            ['name' => 'ESG Disclosure',     'threshold' => $overallScore >= 70],
        ];

        foreach ($regulations as $reg) {
            Regulation::create([
                'report_id' => $report->id,
                'name'      => $reg['name'],
                'status'    => $reg['threshold'] ? 'compliant' : 'warning',
                'score'     => $reg['threshold'] ? rand(85, 96) : rand(45, 72),
            ]);
        }

        // Generate Notifikasi otomatis
        if ($request->carbon_emission > 600) {
            Notification::create([
                'user_id'   => $request->user()->id,
                'report_id' => $report->id,
                'message'   => 'Emisi karbon ' . $request->carbon_emission . ' ton melebihi batas maksimum 600 ton.',
                'type'      => 'danger',
                'is_read'   => false,
            ]);
        }

        if ($request->social_score < 60) {
            Notification::create([
                'user_id'   => $request->user()->id,
                'report_id' => $report->id,
                'message'   => 'Social score ' . $request->social_score . ' di bawah threshold minimum 60.',
                'type'      => 'warning',
                'is_read'   => false,
            ]);
        }

        if ($request->governance_score < 65) {
            Notification::create([
                'user_id'   => $request->user()->id,
                'report_id' => $report->id,
                'message'   => 'Governance score ' . $request->governance_score . ' di bawah threshold minimum 65.',
                'type'      => 'warning',
                'is_read'   => false,
            ]);
        }

        Notification::create([
            'user_id'   => $request->user()->id,
            'report_id' => $report->id,
            'message'   => 'Laporan ' . $request->company_name . ' tahun ' . $request->year . ' berhasil diproses.',
            'type'      => 'ok',
            'is_read'   => false,
        ]);

        return response()->json([
            'message' => 'Laporan berhasil diproses',
            'report'  => $report->load(['esgScore', 'regulations']),
        ], 201);
    }

    public function show(Request $request)
    {
        $report = Report::where('user_id', $request->user()->id)
            ->latest()
            ->with(['esgScore', 'regulations'])
            ->first();

        if (!$report) {
            return response()->json(['message' => 'Belum ada laporan'], 404);
        }

        return response()->json($report);
    }

    public function index(Request $request)
    {
        $reports = Report::where('user_id', $request->user()->id)
            ->with(['esgScore', 'regulations'])
            ->latest()
            ->get();

        return response()->json($reports);
    }
}