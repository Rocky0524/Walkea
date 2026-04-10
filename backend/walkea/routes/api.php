<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PerfilController;
use App\Http\Controllers\TipoMarcadorController;
use App\Http\Controllers\MarcadorController;
use App\Http\Controllers\VotacionController;

// Rutas publicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/tipo-marcador', [TipoMarcadorController::class, 'index']);
Route::get('/tipo-marcador/{id}', [TipoMarcadorController::class, 'show']);

Route::get('/marcador', [MarcadorController::class, 'index']);
Route::get('/marcador/{id}', [MarcadorController::class, 'show']);

// Rutas protegidas con JWT
Route::middleware('auth:api')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/perfil', [PerfilController::class, 'resumen']);
    Route::put('/ajustes', [PerfilController::class, 'actualizarAjustes']);

    Route::post('/tipo-marcador', [TipoMarcadorController::class, 'store']);
    Route::put('/tipo-marcador/{id}', [TipoMarcadorController::class, 'update']);
    Route::delete('/tipo-marcador/{id}', [TipoMarcadorController::class, 'destroy']);

    Route::post('/marcador', [MarcadorController::class, 'store']);
    Route::put('/marcador/{id}', [MarcadorController::class, 'update']);
    Route::delete('/marcador/{id}', [MarcadorController::class, 'destroy']);

    Route::post('/marcador/{id}/votar', [VotacionController::class, 'votar']);
});
