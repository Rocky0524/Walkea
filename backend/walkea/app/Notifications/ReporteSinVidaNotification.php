<?php

namespace App\Notifications;

use App\Models\Marcador;
use App\Models\Usuario;
use App\Models\Voto;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ReporteSinVidaNotification extends Notification
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
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Tu reporte ha llegado a 0 HP')
            ->greeting("Hola {$notifiable->nombre},")
            ->line("Tu reporte #{$this->marcador->id_marcador} se ha quedado sin vida.")
            ->line("El ultimo voto registrado fue {$this->voto->tipo} y lo emitio {$this->votante->nombre}.")
            ->line("Estado actual del reporte: {$this->marcador->estado}.")
            ->line('Revisa el estado del reporte en Walkea.');
    }
}
