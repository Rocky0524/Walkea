<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Marcador extends Model
{
    use HasFactory;

    // Tabla asociada
    protected $table = 'marcador';
    protected $primaryKey = 'id_marcador';
    protected $appends = ['hp_vida'];

    // Campos rellenables por el usuario
    protected $fillable = [
        'latitud',
        'longitud',
        'estado',
        'titulo',
        'descripcion',
        'vida',
        'id_usuario',
        'id_tipo_marcador',
    ];

    /**
     * Relaciones con otras tablas
     */

    // Un marcador pertenece a un usuario (quien lo creo)
    public function usuario()
    {
        return $this->belongsTo(Usuario::class, 'id_usuario', 'id_usuario');
    }

    // Un marcador tiene un tipo asignado
    public function tipoMarcador()
    {
        return $this->belongsTo(TipoMarcador::class, 'id_tipo_marcador', 'id_tipo_marcador');
    }

    // Un marcador tiene varios votos
    public function votos()
    {
        return $this->hasMany(Voto::class, 'id_marcador', 'id_marcador');
    }

    public function getHpVidaAttribute(): int
    {
        return (int) $this->vida;
    }
}
