<?php

namespace App\Http\Controllers;

use App\Events\ReporteSinVida;
use App\Models\Marcador;
use App\Models\Voto;
use App\Notifications\VotoReporteNotification;
use App\Services\CaducidadMarcadorService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VotacionController extends Controller
{
    public function votar(Request $request, $id, CaducidadMarcadorService $caducidadMarcadorService)
    {
        $caducidadMarcadorService->ejecutar();

        $request->validate([
            'tipo' => 'nullable|string|in:positivo,negativo',
            'voto' => 'nullable|boolean',
        ]);

        $usuario = auth()->user();
        $tipoVoto = $request->tipo;

        if ($request->has('voto')) {
            $tipoVoto = $request->boolean('voto') ? 'positivo' : 'negativo';
        }

        if (!$tipoVoto) {
            return response()->json([
                'mensaje' => 'Debes enviar "tipo" (positivo/negativo) o "voto" (true/false)',
            ], 422);
        }

        $resultado = DB::transaction(function () use ($id, $tipoVoto, $usuario) {
            $marcador = Marcador::with('usuario')->lockForUpdate()->findOrFail($id);

            if ((int) $marcador->id_usuario === (int) $usuario->id_usuario) {
                return [
                    'error_code' => 'self_vote',
                ];
            }

            if ((int) $marcador->vida === 0 || $marcador->estado === 'agotado') {
                return [
                    'error_code' => 'agotado',
                ];
            }

            if ($marcador->estado === 'caducado') {
                return [
                    'error_code' => 'caducado',
                ];
            }

            $yaVoto = Voto::where('id_usuario', $usuario->id_usuario)
                ->where('id_marcador', $id)
                ->exists();

            if ($yaVoto) {
                return [
                    'error_code' => 'duplicate_vote',
                ];
            }

            $voto = Voto::create([
                'tipo' => $tipoVoto,
                'id_usuario' => $usuario->id_usuario,
                'id_marcador' => $id,
            ]);

            $peso = $usuario->resolverPesoVoto();
            $vidaAnterior = (int) $marcador->vida;

            $marcador->vida = $tipoVoto === 'positivo'
                ? min(10, $vidaAnterior + $peso)
                : max(0, $vidaAnterior - $peso);

            if ($vidaAnterior > 0 && (int) $marcador->vida === 0) {
                $marcador->estado = 'agotado';
            }

            $marcador->save();

            return [
                'voto' => $voto,
                'peso' => $peso,
                'marcador' => $marcador->fresh('usuario'),
                'se_agoto' => $vidaAnterior > 0 && (int) $marcador->vida === 0,
            ];
        });

        if (($resultado['error_code'] ?? null) === 'self_vote') {
            return response()->json([
                'mensaje' => 'No puedes votar tu propio reporte',
            ], 403);
        }

        if (($resultado['error_code'] ?? null) === 'agotado') {
            return response()->json([
                'mensaje' => 'Este reporte ya esta agotado y no admite mas votos',
            ], 409);
        }

        if (($resultado['error_code'] ?? null) === 'caducado') {
            return response()->json([
                'mensaje' => 'Este reporte ha caducado y ya no admite mas votos',
            ], 409);
        }

        if (($resultado['error_code'] ?? null) === 'duplicate_vote') {
            return response()->json([
                'mensaje' => 'Ya has votado en este marcador',
            ], 409);
        }

        if ($resultado['se_agoto']) {
            event(new ReporteSinVida($resultado['marcador'], $usuario, $resultado['voto']));
        } else {
            $resultado['marcador']->usuario?->notify(new VotoReporteNotification(
                $resultado['marcador'],
                $usuario,
                $resultado['voto'],
            ));
        }

        return response()->json([
            'mensaje' => 'Voto registrado correctamente',
            'voto' => $resultado['voto'],
            'nivel_usuario' => $usuario->resolverNivel(),
            'peso_voto' => $resultado['peso'],
            'vida_marcador' => $resultado['marcador']->vida,
            'hp_vida' => $resultado['marcador']->hp_vida,
        ], 201);
    }
}
