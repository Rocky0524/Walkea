<?php

namespace App\Notifications;

use App\Models\Marcador;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class ReporteCaducadoNotification extends Notification
{
    use Queueable;

    public function __construct(private readonly Marcador $marcador)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toArray(object $notifiable): array
    {
        $titulo = $this->marcador->titulo ?: "Reporte #{$this->marcador->id_marcador}";

        return [
            'tipo' => 'reporte_caducado',
            'texto' => "Tu reporte \"{$titulo}\" ha caducado por no recibir votos en 24 horas.",
            'marcador_id' => $this->marcador->id_marcador,
            'estado' => $this->marcador->estado,
            'hp_vida' => $this->marcador->hp_vida,
        ];
    }
}
