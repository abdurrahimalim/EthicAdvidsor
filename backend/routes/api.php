<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\AdminController;

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
    Route::get('/reports/history', [ReportController::class, 'history']);

    Route::get('/dashboard', [DashboardController::class, 'index']);

    Route::get('/notifications',           [NotificationController::class, 'index']);
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::patch('/notifications/read-all',  [NotificationController::class, 'markAllRead']);
    
    Route::delete('/account', [AuthController::class, 'deleteAccount']);
    Route::put('/profile', [AuthController::class, 'updateProfile']);

    Route::get('/reports/{id}/detail', [ReportController::class, 'detail']);
});


// Admin routes
Route::middleware('auth:sanctum')->prefix('admin')->group(function () {
    // User CRUD
    Route::get('/users',          [AdminController::class, 'getUsers']);
    Route::post('/users',         [AdminController::class, 'createUser']);
    Route::put('/users/{id}',     [AdminController::class, 'updateUser']);
    Route::delete('/users/{id}',  [AdminController::class, 'deleteUser']);

    // Report CRUD
    Route::get('/reports',        [AdminController::class, 'getReports']);
    Route::post('/reports',       [AdminController::class, 'createReport']);
    Route::put('/reports/{id}',   [AdminController::class, 'updateReport']);
    Route::delete('/reports/{id}',[AdminController::class, 'deleteReport']);
});

// History route (alias untuk /reports/history)
Route::middleware('auth:sanctum')->get('/history', [ReportController::class, 'history']);