<?php

namespace App\Http\Controllers;

use App\Models\Marcador;
use Illuminate\Http\Request;

class MarcadorController extends Controller
{
    public function index()
    {
        $marcadores = Marcador::where('estado', 'activo')->get();
        return response()->json($marcadores);
    }

    public function store(Request $request)
    {
        $request->validate([
            'latitud' => 'required',
            'longitud' => 'required',
            'descripcion' => 'required',
            'id_tipo_marcador' => 'required',
        ]);

        $marcador = Marcador::create([
            'latitud' => $request->latitud,
            'longitud' => $request->longitud,
            'descripcion' => $request->descripcion,
            'id_tipo_marcador' => $request->id_tipo_marcador,
            'id_usuario' => auth()->id(),
        ]);

        return response()->json($marcador, 201);
    }

    public function show($id)
    {
        $marcador = Marcador::findOrFail($id);
        return response()->json($marcador);
    }

    public function update(Request $request, $id)
    {
        $marcador = Marcador::findOrFail($id);
        $marcador->update($request->only('descripcion', 'estado', 'id_tipo_marcador'));
        return response()->json($marcador);
    }

    public function destroy($id)
    {
        $marcador = Marcador::findOrFail($id);
        $marcador->delete();
        return response()->json(['mensaje' => 'Marcador eliminado']);
    }
}
