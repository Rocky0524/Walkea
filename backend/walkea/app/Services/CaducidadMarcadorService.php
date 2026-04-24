<?php

namespace App\Services;

use App\Models\Marcador;
use App\Notifications\ReporteCaducadoNotification;

class CaducidadMarcadorService
{
    public function ejecutar(): void
    {
        $marcadores = Marcador::with(['usuario', 'tipoMarcador'])
            ->where('estado', 'activo')
            ->where('created_at', '<=', now()->subDay())
            ->doesntHave('votos')
            ->get();

        foreach ($marcadores as $marcador) {
            $marcador->estado = 'caducado';
            $marcador->save();

            $marcador->usuario?->notify(new ReporteCaducadoNotification($marcador));
        }
    }
}
