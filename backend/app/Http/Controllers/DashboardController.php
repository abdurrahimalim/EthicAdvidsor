<?php

namespace App\Http\Controllers;

use App\Models\Report;
use App\Models\Notification;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $report = Report::where('user_id', $request->user()->id)
            ->latest()
            ->with(['esgScore', 'regulations'])
            ->first();

        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'report'        => $report,
            'notifications' => $notifications,
        ]);
    }
}