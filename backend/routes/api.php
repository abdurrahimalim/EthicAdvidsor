<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout',   [AuthController::class, 'logout']);
    Route::get('/me',        [AuthController::class, 'me']);

    Route::post('/reports',  [ReportController::class, 'store']);
    Route::get('/reports',   [ReportController::class, 'index']);
    Route::get('/report',    [ReportController::class, 'show']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/notifications',           [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::patch('/notifications/read-all',  [NotificationController::class, 'markAllRead']);
});