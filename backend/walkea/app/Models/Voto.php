<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Voto extends Model
{
    protected $table = 'votos';
    protected $primaryKey = 'id_voto';

    protected $fillable = [
        'tipo',
        'id_usuario',
        'id_marcador',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    public function marcador()
    {
        return $this->belongsTo(Marcador::class, 'id_marcador', 'id_marcador');
    }
}
