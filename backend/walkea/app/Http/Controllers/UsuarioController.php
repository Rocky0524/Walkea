<?php

namespace App\Http\Controllers;

use App\Models\AdminReporteEliminado;
use App\Models\Marcador;
use App\Models\Usuario;

class UsuarioController extends Controller
{
    public function obtenerTodos()
    {
        // El middleware 'admin' ya garantiza que solo admins llegan aqui
        $usuarios = Usuario::orderBy('created_at', 'desc')->get();

        return response()->json($usuarios);
    }

    public function obtenerReportes()
    {
        $reportes = Marcador::with(['usuario', 'tipoMarcador'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reportes);
    }

    public function eliminarReporte($id)
    {
        $admin = auth()->user();
        $marcador = Marcador::with('usuario')->findOrFail($id);

        AdminReporteEliminado::create([
            'id_admin_usuario' => $admin->id_usuario,
            'id_marcador_original' => $marcador->id_marcador,
            'titulo' => $marcador->titulo,
            'descripcion' => $marcador->descripcion,
            'estado' => $marcador->estado,
            'vida' => (int) ($marcador->vida ?? 0),
            'id_usuario_reportero' => $marcador->usuario?->id_usuario,
            'email_usuario_reportero' => $marcador->usuario?->email,
        ]);

        $marcador->delete();

        return response()->json([
            'mensaje' => 'Reporte eliminado por admin correctamente',
        ]);
    }

    public function obtenerAuditoriaReportes()
    {
        $auditoria = AdminReporteEliminado::with('adminUsuario')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($auditoria);
    }
}
