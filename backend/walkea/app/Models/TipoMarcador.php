<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TipoMarcador extends Model
{
    protected $table = 'tipo_marcador';
    protected $primaryKey = 'id_tipo_marcador';

    protected $fillable = [
        'nombre',
        'icono',
    ];
}
