<?php

namespace App\Listeners;

use App\Events\ReporteSinVida;
use App\Notifications\ReporteSinVidaNotification;

class NotificarCreadorReporteSinVida
{
    public function handle(ReporteSinVida $event): void
    {
        $creador = $event->marcador->usuario;

        if (!$creador) {
            return;
        }

        $creador->notify(new ReporteSinVidaNotification(
            $event->marcador,
            $event->votante,
            $event->voto,
        ));
    }
}
