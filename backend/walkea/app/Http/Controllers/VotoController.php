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
        $request->validate([
            'tipo' => 'required|in:positivo,negativo',
        ]);

        $marcador = Marcador::findOrFail($id);
        $usuario = auth()->user();

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
            'tipo' => $request->tipo,
            'id_usuario' => $usuario->id_usuario,
            'id_marcador' => $id,
        ]);

        // Calcular peso segun nivel del usuario
        $peso = $this->pesoVoto($usuario);

        // Aplicar voto a la vida del marcador
        if ($request->tipo === 'positivo') {
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
