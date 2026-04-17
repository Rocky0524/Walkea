<?php

namespace App\Http\Controllers;

use App\Models\Marcador;
use Illuminate\Http\Request;

class MarcadorController extends Controller
{
    /**
     * Devuelve la lista de marcadores.
     * Si le pasamos lat y lng por GET, filtra los que esten cerca (5km).
     */
    public function index(Request $request)
    {
        // Pillamos los parametros de la url (si existen)
        $lat = $request->query('lat');
        $lng = $request->query('lng');
        $radius = 5; // Ponemos 5 kilometros por defecto si no nos pasan radio

        if ($lat && $lng) {
            // Formula Haversine manual, en mysql va muy bien para calculo de distancias
            // Calculamos la distancia con selectRaw y lo llamamos 'distancia'
            $marcadores = Marcador::selectRaw(
                "*, ( 6371 * acos( cos( radians(?) ) * cos( radians( latitud ) ) * cos( radians( longitud ) - radians(?) ) + sin( radians(?) ) * sin( radians( latitud ) ) ) ) AS distancia",
                [$lat, $lng, $lat]
            )
                ->having('distancia', '<', $radius)
                ->with(['tipoMarcador', 'usuario']) // Cargamos relaciones para que el front no tenga que hacer 50 peticiones
                ->orderBy('distancia')
                ->get();

            return response()->json($marcadores, 200);
        }

        // Si no han buscado por zona, devolvemos todos sin filtrar
        $marcadores = Marcador::with(['tipoMarcador', 'usuario'])->get();
        return response()->json($marcadores, 200);
    }

    /**
     * Devuelve un solo marcador dado su id
     */
    public function show($id)
    {
        // Buscamos el marcador por id_marcador, si no lo encuentra salta un error 404 de laravel automatico
        $marcador = Marcador::with(['tipoMarcador', 'usuario', 'votos'])->findOrFail($id);
        return response()->json($marcador, 200);
    }

    /**
     * Crea un nuevo marcador en base de datos
     */
    public function store(Request $request)
    {
        // Comprobamos que vengan los datos mínimos y correctos
        $request->validate([
            'latitud' => 'required|numeric',
            'longitud' => 'required|numeric',
            'titulo' => 'required|string|max:120',
            'descripcion' => 'required|string',
            'id_tipo_marcador' => 'required|exists:tipo_marcador,id_tipo_marcador',
        ]);

        // Cogemos al usuario logueado en este momento (sacado del token JWT)
        $usuario = auth()->user();

        // Creamos el marcador
        $marcador = Marcador::create([
            'latitud' => $request->latitud,
            'longitud' => $request->longitud,
            'titulo' => $request->titulo,
            'descripcion' => $request->descripcion,
            'id_usuario' => $usuario->id_usuario,
            'id_tipo_marcador' => $request->id_tipo_marcador,
            'vida' => 10, // Por la prueba, le ponemos 10 de vida base
            'estado' => 'activo'
        ]);

        return response()->json([
            'mensaje' => 'Marcador creado correctamente',
            'marcador' => $marcador
        ], 201);
    }

    /**
     * Opcional: Modifica la posicion o la descripcion de tu marcador
     */
    public function update(Request $request, $id)
    {
        // sometimes significa que solo validará si el front lo manda. Si no lo manda lo ignora.
        $request->validate([
            'latitud' => 'sometimes|numeric',
            'longitud' => 'sometimes|numeric',
            'titulo' => 'sometimes|string|max:120',
            'descripcion' => 'sometimes|string',
            'id_tipo_marcador' => 'sometimes|exists:tipo_marcador,id_tipo_marcador',
        ]);

        $marcador = Marcador::findOrFail($id);
        $usuario = auth()->user();

        // Un poco de seguridad: impedimos a un usuario editar marcadores que sean de otro
        if ($marcador->id_usuario !== $usuario->id_usuario) {
            return response()->json(['mensaje' => 'No tienes permisos, este marcador no es tuyo'], 403);
        }

        $marcador->update($request->all());

        return response()->json([
            'mensaje' => 'Marcador modificado correctamente',
            'marcador' => $marcador
        ], 200);
    }

    /**
     * Elimina el marcador (por ahora borrado fisico de base de datos)
     */
    public function destroy($id)
    {
        $marcador = Marcador::findOrFail($id);
        $usuario = auth()->user();

        // Misma seguridad que en el update
        if ($marcador->id_usuario !== $usuario->id_usuario) {
            return response()->json(['mensaje' => 'No puedes borrar un marcador que no has creado tu'], 403);
        }

        $marcador->delete();

        return response()->json([
            'mensaje' => 'Marcador borrado perféctamente'
        ], 200);
    }
}
