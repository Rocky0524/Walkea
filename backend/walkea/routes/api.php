<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TipoMarcadorController;

// Rutas publicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/tipo-marcador', [TipoMarcadorController::class, 'index']);
Route::get('/tipo-marcador/{id}', [TipoMarcadorController::class, 'show']);

// Rutas protegidas con JWT
Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);

    Route::post('/tipo-marcador', [TipoMarcadorController::class, 'store']);
    Route::put('/tipo-marcador/{id}', [TipoMarcadorController::class, 'update']);
    Route::delete('/tipo-marcador/{id}', [TipoMarcadorController::class, 'destroy']);
});
