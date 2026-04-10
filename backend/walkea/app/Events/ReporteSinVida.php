<?php

namespace App\Events;

use App\Models\Marcador;
use App\Models\Usuario;
use App\Models\Voto;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ReporteSinVida
{
    use Dispatchable, SerializesModels;

    public function __construct(
        public Marcador $marcador,
        public Usuario $votante,
        public Voto $voto,
    ) {
    }
}
