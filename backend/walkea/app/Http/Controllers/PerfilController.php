<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class PerfilController extends Controller
{
    public function resumen(Request $request)
    {
        $usuario = $request->user();
        $usuario->loadCount(['marcadores', 'votos']);

        return response()->json([
            'usuario' => $usuario,
            'estadisticas' => [
                'total_reportes' => $usuario->marcadores_count,
                'total_votos' => $usuario->votos_count,
                'nivel' => $usuario->resolverNivel(),
                'peso_voto' => $usuario->resolverPesoVoto(),
            ],
        ]);
    }

    public function actualizarAjustes(Request $request)
    {
        $usuario = $request->user();

        $request->validate([
            'nombre' => 'sometimes|string|max:255',
            'email' => [
                'sometimes',
                'email',
                Rule::unique('usuarios', 'email')->ignore($usuario->id_usuario, 'id_usuario'),
            ],
            'current_password' => 'nullable|string',
            'password' => 'sometimes|string|min:6|confirmed',
        ]);

        $cambiaDatoSensible = $request->filled('email') || $request->filled('password');
        if ($cambiaDatoSensible) {
            if (!$request->filled('current_password') || !Hash::check($request->current_password, $usuario->password)) {
                return response()->json([
                    'mensaje' => 'Debes confirmar tu contraseña actual para actualizar email o contraseña',
                ], 422);
            }
        }

        $datos = [];

        if ($request->filled('nombre')) {
            $datos['nombre'] = $request->nombre;
        }

        if ($request->filled('email')) {
            $datos['email'] = $request->email;
        }

        if ($request->filled('password')) {
            $datos['password'] = $request->password;
        }

        if ($datos === []) {
            return response()->json([
                'mensaje' => 'No se enviaron cambios para actualizar',
                'usuario' => $usuario,
            ]);
        }

        $usuario->fill($datos);
        $usuario->save();

        return response()->json([
            'mensaje' => 'Ajustes actualizados correctamente',
            'usuario' => $usuario->fresh(),
        ]);
    }
}
