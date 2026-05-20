<?php

namespace App\Services;

use App\Models\Marcador;
use App\Notifications\ReporteCaducadoNotification;

class CaducidadMarcadorService
{
    public function ejecutar(): void
    {
        // Busca todos los marcadores activos, creados hace más de un día, que NADIE ha votado
        $marcadores = Marcador::with(['usuario', 'tipoMarcador'])
            ->where('estado', 'activo')
            ->where('created_at', '<=', now()->subDay()) // Más de 24h
            ->doesntHave('votos') // Sin interacción
            ->get();

        foreach ($marcadores as $marcador) {
            // Los damos por caducados para que dejen de salir en el mapa y notificamos al creador
            $marcador->estado = 'caducado';
            $marcador->save();

            $marcador->usuario?->notify(new ReporteCaducadoNotification($marcador));
        }
    }
}
