<?php
 
namespace App\Http\Controllers;
 
use Illuminate\Http\Request;
use App\Models\Report;
use App\Models\Notification;
 
class HistoryController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
 
        // Ambil semua report milik user
        $reports = Report::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($r) => [
                'id'          => 'report_' . $r->id,
                'type'        => 'upload',
                'title'       => "Laporan {$r->company_name} tahun {$r->year} diunggah",
                'description' => "Status: {$r->status} · Carbon: {$r->carbon_emission}t",
                'status'      => $r->status === 'processed' ? 'success' : 'pending',
                'created_at'  => $r->created_at,
            ]);
 
        // Ambil semua notifikasi milik user
        $notifications = Notification::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($n) => [
                'id'          => 'notif_' . $n->id,
                'type'        => $n->type === 'warning' ? 'warning' : 'analysis',
                'title'       => $n->message,
                'description' => $n->report_id ? "Report ID #{$n->report_id}" : null,
                'status'      => $n->type === 'error' ? 'failed'
                                : ($n->type === 'warning' ? 'pending' : 'success'),
                'created_at'  => $n->created_at,
            ]);
 
        // Gabung + urutkan by created_at desc
        $history = $reports->concat($notifications)
            ->sortByDesc('created_at')
            ->values();
 
        return response()->json([
            'data'  => $history,
            'total' => $history->count(),
        ]);
    }
}