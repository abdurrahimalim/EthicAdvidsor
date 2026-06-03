<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Notification;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $userId = $request->user()->id;

        // Ambil semua laporan user diurutkan dari terlama
        $reports = Report::where('user_id', $userId)
            ->with(['esgScore', 'regulations'])
            ->oldest()
            ->get();

        $latestReport = $reports->last();

        // Notifikasi terbaru
        $notifications = Notification::where('user_id', $userId)
            ->latest()
            ->take(5)
            ->get();

        // Hitung financial ratios dari laporan terbaru
        $financialHealth = null;
        if ($latestReport) {
            $roa = $latestReport->total_assets > 0
                ? round(($latestReport->net_profit / $latestReport->total_assets) * 100, 2) : 0;
            $roe = $latestReport->total_equity > 0
                ? round(($latestReport->net_profit / $latestReport->total_equity) * 100, 2) : 0;
            $der = $latestReport->total_equity > 0
                ? round($latestReport->total_liabilities / $latestReport->total_equity, 2) : 0;
            $liquidityRatio = $latestReport->total_liabilities > 0
                ? round($latestReport->cash_and_equivalents / $latestReport->total_liabilities, 2) : 0;

            $financialHealth = [
                'roa'              => $roa,
                'roe'              => $roe,
                'der'              => $der,
                'liquidity_ratio'  => $liquidityRatio,
                'status'           => $this->getFinancialStatus($roa, $der, $liquidityRatio),
            ];
        }

        // Data trend untuk semua periode
        $trendData = $reports->map(function ($report) {
            return [
                'period'       => $report->period_start,
                'period_label' => $this->getPeriodLabel($report),
                'esg_score'    => $report->esgScore?->overall_score ?? 0,
                'env_score'    => $report->esgScore?->environmental_score ?? 0,
                'social_score' => $report->esgScore?->social_score ?? 0,
                'gov_score'    => $report->esgScore?->governance_score ?? 0,
                'net_profit'   => $report->net_profit ?? 0,
                'carbon'       => $report->esgScore?->carbon_emission ?? 0,
                'roa'          => $report->total_assets > 0
                    ? round(($report->net_profit / $report->total_assets) * 100, 2) : 0,
                'roe'          => $report->total_equity > 0
                    ? round(($report->net_profit / $report->total_equity) * 100, 2) : 0,
                'der'          => $report->total_equity > 0
                    ? round($report->total_liabilities / $report->total_equity, 2) : 0,
            ];
        });

        return response()->json([
            'latest_report'   => $latestReport,
            'financial_health' => $financialHealth,
            'notifications'   => $notifications,
            'trend_data'      => $trendData,
            'total_reports'   => $reports->count(),
        ]);
    }

    private function getFinancialStatus($roa, $der, $liquidityRatio)
    {
        if ($roa >= 5 && $der <= 2 && $liquidityRatio >= 1) return 'Sehat';
        if ($roa >= 2 || ($der <= 3 && $liquidityRatio >= 0.5)) return 'Warning';
        return 'Risiko Tinggi';
    }

    private function getPeriodLabel($report)
    {
        if (!$report->period_start) return $report->year;
        $start = date('M Y', strtotime($report->period_start));
        $end = date('M Y', strtotime($report->period_end));
        return "$start - $end";
    }
}