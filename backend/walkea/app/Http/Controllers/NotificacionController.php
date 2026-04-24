<?php

namespace App\Http\Controllers;

use App\Services\CaducidadMarcadorService;
use Illuminate\Http\JsonResponse;

class NotificacionController extends Controller
{
    public function __construct(private readonly CaducidadMarcadorService $caducidadMarcadorService)
    {
    }

    public function index(): JsonResponse
    {
        $this->caducidadMarcadorService->ejecutar();

        $notificaciones = auth()->user()
            ->notifications()
            ->latest()
            ->limit(20)
            ->get()
            ->map(function ($notificacion) {
                return [
                    'id' => $notificacion->id,
                    'texto' => $notificacion->data['texto'] ?? 'Nueva notificacion',
                    'fecha' => $notificacion->created_at?->toISOString(),
                    'leida' => $notificacion->read_at !== null,
                    'marcadorId' => $notificacion->data['marcador_id'] ?? null,
                    'tipo' => $notificacion->data['tipo'] ?? 'general',
                ];
            })
            ->values();

        return response()->json($notificaciones);
    }

    public function marcarTodasComoLeidas(): JsonResponse
    {
        auth()->user()->unreadNotifications->markAsRead();

        return response()->json([
            'mensaje' => 'Notificaciones marcadas como leidas',
        ]);
    }

    public function destroy(): JsonResponse
    {
        auth()->user()->notifications()->delete();

        return response()->json([
            'mensaje' => 'Notificaciones eliminadas',
        ]);
    }
}
