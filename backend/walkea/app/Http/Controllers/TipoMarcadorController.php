<?php

namespace App\Http\Controllers;

use App\Models\TipoMarcador;
use Illuminate\Http\Request;

class TipoMarcadorController extends Controller
{
    // GET /api/tipo-marcador
    public function index()
    {
        return TipoMarcador::all();
    }

    // POST /api/tipo-marcador
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'icono' => 'nullable|string|max:255',
        ]);

        $tipo = TipoMarcador::create($request->only('nombre', 'icono'));

        return response()->json($tipo, 201);
    }

    // GET /api/tipo-marcador/{id}
    public function show($id)
    {
        $tipo = TipoMarcador::findOrFail($id);
        return response()->json($tipo);
    }

    // PUT /api/tipo-marcador/{id}
    public function update(Request $request, $id)
    {
        $tipo = TipoMarcador::findOrFail($id);

        $request->validate([
            'nombre' => 'sometimes|required|string|max:255',
            'icono' => 'nullable|string|max:255',
        ]);

        $tipo->update($request->only('nombre', 'icono'));

        return response()->json($tipo);
    }

    // DELETE /api/tipo-marcador/{id}
    public function destroy($id)
    {
        $tipo = TipoMarcador::findOrFail($id);
        $tipo->delete();

        return response()->json(['mensaje' => 'Tipo de marcador eliminado']);
    }
}
