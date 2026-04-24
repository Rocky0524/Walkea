<?php

namespace App\Notifications;

use App\Models\Marcador;
use App\Models\Usuario;
use App\Models\Voto;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class VotoReporteNotification extends Notification
{
    use Queueable;

    public function __construct(
        private readonly Marcador $marcador,
        private readonly Usuario $votante,
        private readonly Voto $voto,
    ) {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $titulo = $this->marcador->titulo ?: "Reporte #{$this->marcador->id_marcador}";
        $hp = $this->marcador->hp_vida;

        return [
            'tipo' => 'voto_recibido',
            'texto' => "{$this->votante->nombre} ha votado {$this->voto->tipo} tu reporte \"{$titulo}\". HP actual: {$hp}/10.",
            'marcador_id' => $this->marcador->id_marcador,
            'votante' => $this->votante->nombre,
            'voto' => $this->voto->tipo,
            'estado' => $this->marcador->estado,
            'hp_vida' => $hp,
        ];
    }
}
