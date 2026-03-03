<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Marcador extends Model
{
    protected $table = 'marcador';
    protected $primaryKey = 'id_marcador';

    protected $fillable = [
        'latitud',
        'longitud',
        'estado',
        'descripcion',
        'vida',
        'id_usuario',
        'id_tipo_marcador',
    ];

    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    public function tipoMarcador()
    {
        return $this->belongsTo(TipoMarcador::class, 'id_tipo_marcador', 'id_tipo_marcador');
    }
}
