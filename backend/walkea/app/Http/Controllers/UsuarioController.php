<?php

namespace App\Http\Controllers;

use App\Models\AdminReporteEliminado;
use App\Models\Marcador;
use App\Models\Usuario;

class UsuarioController extends Controller
{
    private function verificarAdmin()
    {
        $usuario = auth()->user();

        if (!$usuario || strtolower((string) ($usuario->rol ?? '')) !== 'admin') {
            return response()->json(['mensaje' => 'Acceso denegado. No eres administrador.'], 403);
        }

        return $usuario;
    }

    public function obtenerTodos()
    {
        $admin = $this->verificarAdmin();
        if (!($admin instanceof Usuario)) {
            return $admin;
        }

        $usuarios = Usuario::orderBy('created_at', 'desc')->get();

        return response()->json($usuarios);
    }

    public function obtenerReportes()
    {
        $admin = $this->verificarAdmin();
        if (!($admin instanceof Usuario)) {
            return $admin;
        }

        $reportes = Marcador::with(['usuario', 'tipoMarcador'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reportes);
    }

    public function eliminarReporte($id)
    {
        $admin = $this->verificarAdmin();
        if (!($admin instanceof Usuario)) {
            return $admin;
        }

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
        $admin = $this->verificarAdmin();
        if (!($admin instanceof Usuario)) {
            return $admin;
        }

        $auditoria = AdminReporteEliminado::with('adminUsuario')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($auditoria);
    }
}
