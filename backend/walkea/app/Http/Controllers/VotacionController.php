<?php

namespace App\Http\Controllers;

use App\Events\ReporteSinVida;
use App\Models\Marcador;
use App\Models\Voto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VotacionController extends Controller
{
    public function votar(Request $request, $id)
    {
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

            $yaVoto = Voto::where('id_usuario', $usuario->id_usuario)
                ->where('id_marcador', $id)
                ->exists();

            if ($yaVoto) {
                return null;
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

        if ($resultado === null) {
            return response()->json([
                'mensaje' => 'Ya has votado en este marcador',
            ], 409);
        }

        if ($resultado['se_agoto']) {
            event(new ReporteSinVida($resultado['marcador'], $usuario, $resultado['voto']));
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
