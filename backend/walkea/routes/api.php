<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PerfilController;
use App\Http\Controllers\TipoMarcadorController;
use App\Http\Controllers\MarcadorController;
use App\Http\Controllers\VotacionController;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\NotificacionController;

// Rutas publicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::get('/tipo-marcador', [TipoMarcadorController::class, 'index']);
Route::get('/tipo-marcador/{id}', [TipoMarcadorController::class, 'show']);

Route::get('/marcador', [MarcadorController::class, 'index']);
Route::get('/marcador/{id}', [MarcadorController::class, 'show']);

// Rutas protegidas con JWT
Route::middleware(['auth:api', 'usuario.activo'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/refresh', [AuthController::class, 'refresh']);
    Route::get('/perfil', [PerfilController::class, 'resumen']);
    Route::put('/ajustes', [PerfilController::class, 'actualizarAjustes']);

    Route::get('/notificaciones', [NotificacionController::class, 'index']);
    Route::post('/notificaciones/marcar-leidas', [NotificacionController::class, 'marcarTodasComoLeidas']);
    Route::delete('/notificaciones', [NotificacionController::class, 'destroy']);

    Route::post('/tipo-marcador', [TipoMarcadorController::class, 'store']);
    Route::put('/tipo-marcador/{id}', [TipoMarcadorController::class, 'update']);
    Route::delete('/tipo-marcador/{id}', [TipoMarcadorController::class, 'destroy']);

    Route::post('/marcador', [MarcadorController::class, 'store']);
    Route::put('/marcador/{id}', [MarcadorController::class, 'update']);
    Route::delete('/marcador/{id}', [MarcadorController::class, 'destroy']);

    Route::post('/marcador/{id}/votar', [VotacionController::class, 'votar']);

    // Rutas de administracion - protegidas con middleware admin
    Route::middleware('admin')->group(function () {
        Route::get('/admin/usuarios', [UsuarioController::class, 'obtenerTodos']);
        Route::patch('/admin/usuarios/{id}/estado', [UsuarioController::class, 'actualizarEstadoUsuario']);
        Route::delete('/admin/usuarios/{id}/reportes', [UsuarioController::class, 'eliminarReportesUsuario']);
        Route::get('/admin/reportes', [UsuarioController::class, 'obtenerReportes']);
        Route::delete('/admin/reportes/{id}', [UsuarioController::class, 'eliminarReporte']);
        Route::get('/admin/reportes-auditoria', [UsuarioController::class, 'obtenerAuditoriaReportes']);
    });
});
