<?php

namespace App\Http\Controllers;

use App\Models\Voto;
use App\Models\Marcador;
use Illuminate\Http\Request;

class VotoController extends Controller
{
    // POST /api/marcador/{id}/votar
    public function votar(Request $request, $id)
    {
        // Aceptamos tanto 'tipo' (string) como 'voto' (boolean) para facilitar las pruebas
        $request->validate([
            'tipo' => 'nullable|string|in:positivo,negativo',
            'voto' => 'nullable|boolean',
        ]);

        $marcador = Marcador::findOrFail($id);
        $usuario = auth()->user();

        // Determinar el tipo de voto (mapeamos boolean a string si viene)
        $tipoVoto = $request->tipo;
        if ($request->has('voto')) {
            $tipoVoto = $request->voto ? 'positivo' : 'negativo';
        }

        if (!$tipoVoto) {
            return response()->json(['mensaje' => 'Debes enviar "tipo" (positivo/negativo) o "voto" (true/false)'], 422);
        }

        // Bloquear voto duplicado
        $yaVoto = Voto::where('id_usuario', $usuario->id_usuario)
            ->where('id_marcador', $id)
            ->exists();

        if ($yaVoto) {
            return response()->json([
                'mensaje' => 'Ya has votado en este marcador'
            ], 409);
        }

        // Crear el voto
        $voto = Voto::create([
            'tipo' => $tipoVoto,
            'id_usuario' => $usuario->id_usuario,
            'id_marcador' => $id,
        ]);

        // Calcular peso segun nivel del usuario
        $peso = $this->pesoVoto($usuario);

        // Aplicar voto a la vida del marcador
        if ($tipoVoto === 'positivo') {
            $marcador->vida = min(10, $marcador->vida + $peso);
        } else {
            $marcador->vida = max(0, $marcador->vida - $peso);
        }

        $marcador->save();

        return response()->json([
            'mensaje' => 'Voto registrado correctamente',
            'voto' => $voto,
            'vida_marcador' => $marcador->vida,
        ], 201);
    }

    // Peso del voto segun tiempo registrado del usuario
    private function pesoVoto($usuario)
    {
        // Si por algun motivo no tiene fecha de creacion, es novel
        if (!$usuario->created_at) {
            return 1;
        }

        // Calcula los meses desde que se registro hasta hoy
        $mesesRegistrado = $usuario->created_at->diffInMonths(now());

        if ($mesesRegistrado >= 6) {
            return 3; // Experto: más de 6 meses
        } elseif ($mesesRegistrado >= 1) {
            return 2; // Veterano: de 1 a 5 meses
        } else {
            return 1; // Novel: menos de 1 mes
        }
    }
}
