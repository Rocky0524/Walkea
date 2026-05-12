<?php

namespace App\Http\Controllers;

use App\Models\AdminReporteEliminado;
use App\Models\Marcador;
use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UsuarioController extends Controller
{
    public function obtenerTodos()
    {
        // El middleware 'admin' ya garantiza que solo admins llegan aqui
        $usuarios = Usuario::withCount('marcadores')
            ->orderByDesc('activo')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($usuarios);
    }

    public function obtenerReportes()
    {
        $reportes = Marcador::with(['usuario', 'tipoMarcador'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($reportes);
    }

    public function actualizarEstadoUsuario(Request $request, $id)
    {
        $admin = $request->user();
        $usuario = Usuario::findOrFail($id);
        $datos = $request->validate([
            'activo' => 'required|boolean',
        ]);

        if ($admin->id_usuario === $usuario->id_usuario && !$datos['activo']) {
            return response()->json([
                'mensaje' => 'No puedes inhabilitar tu propia cuenta de administrador.',
            ], 422);
        }

        $usuario->activo = $datos['activo'];
        $usuario->save();

        return response()->json([
            'mensaje' => $usuario->activo
                ? 'Usuario habilitado correctamente'
                : 'Usuario inhabilitado correctamente',
            'usuario' => $usuario->fresh()->loadCount('marcadores'),
        ]);
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

    public function eliminarReportesUsuario($id)
    {
        $admin = auth()->user();
        $usuario = Usuario::findOrFail($id);
        $reportes = Marcador::with('usuario')
            ->where('id_usuario', $usuario->id_usuario)
            ->get();

        $totalEliminados = 0;

        DB::transaction(function () use ($admin, $reportes, &$totalEliminados) {
            foreach ($reportes as $marcador) {
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
                $totalEliminados++;
            }
        });

        return response()->json([
            'mensaje' => $totalEliminados > 0
                ? 'Reportes del usuario eliminados correctamente'
                : 'El usuario no tenia reportes para eliminar',
            'total_eliminados' => $totalEliminados,
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
