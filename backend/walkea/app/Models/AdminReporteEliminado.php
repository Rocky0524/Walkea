<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdminReporteEliminado extends Model
{
    protected $table = 'admin_reportes_eliminados';

    protected $fillable = [
        'id_admin_usuario',
        'id_marcador_original',
        'titulo',
        'descripcion',
        'estado',
        'vida',
        'id_usuario_reportero',
        'email_usuario_reportero',
    ];

    public function adminUsuario()
    {
        return $this->belongsTo(Usuario::class, 'id_admin_usuario', 'id_usuario');
    }
}
