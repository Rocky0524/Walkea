<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    /**
     * Registrar un nuevo usuario.
     */
    public function register(Request $request)
    {
        // Validar datos
        $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'required|email|unique:usuarios,email',
            'password' => 'required|string|min:6',
        ]);

        // Crear usuario (la contraseña se hashea automáticamente por el cast del modelo)
        $usuario = Usuario::create([
            'nombre' => $request->nombre,
            'email' => $request->email,
            'password' => $request->password,
        ]);

        return response()->json([
            'mensaje' => 'Usuario registrado correctamente',
            'usuario' => [
                'id_usuario' => $usuario->id_usuario,
                'nombre' => $usuario->nombre,
                'email' => $usuario->email,
                'reputacion' => $usuario->reputacion,
            ]
        ], 201);
    }

    /**
     * Iniciar sesión (verificar contraseña).
     */
    public function login(Request $request)
    {
        // Validar datos
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        // Buscar usuario por email
        $usuario = Usuario::where('email', $request->email)->first();

        // Verificar que existe y que la contraseña es correcta
        if (!$usuario || !Hash::check($request->password, $usuario->password)) {
            return response()->json([
                'mensaje' => 'Email o contraseña incorrectos'
            ], 401);
        }

        return response()->json([
            'mensaje' => 'Login correcto',
            'usuario' => [
                'id_usuario' => $usuario->id_usuario,
                'nombre' => $usuario->nombre,
                'email' => $usuario->email,
                'reputacion' => $usuario->reputacion,
            ]
        ], 200);
    }
}
