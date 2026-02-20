<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TipoMarcadorController;

// Rutas de autenticación
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// CRUD tipo_marcador
Route::get('/tipo-marcador', [TipoMarcadorController::class, 'index']);
Route::post('/tipo-marcador', [TipoMarcadorController::class, 'store']);
Route::get('/tipo-marcador/{id}', [TipoMarcadorController::class, 'show']);
Route::put('/tipo-marcador/{id}', [TipoMarcadorController::class, 'update']);
Route::delete('/tipo-marcador/{id}', [TipoMarcadorController::class, 'destroy']);
