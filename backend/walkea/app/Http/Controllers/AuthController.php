<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    // Registrar nuevo usuario
    public function register(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'required|email|unique:usuarios,email',
            'password' => 'required|string|min:6',
        ]);

        $usuario = Usuario::create([
            'nombre' => $request->nombre,
            'email' => $request->email,
            'password' => $request->password,
        ]);

        $token = auth()->login($usuario);

        return response()->json([
            'mensaje' => 'Usuario registrado correctamente',
            'usuario' => $usuario,
            'token' => $token,
        ], 201);
    }

    // Login - devuelve token JWT
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $credentials = $request->only('email', 'password');

        if (!$token = auth()->attempt($credentials)) {
            return response()->json([
                'mensaje' => 'Email o contraseña incorrectos'
            ], 401);
        }

        return response()->json([
            'mensaje' => 'Login correcto',
            'usuario' => auth()->user(),
            'token' => $token,
        ]);
    }

    // Cerrar sesion
    public function logout()
    {
        auth()->logout();
        return response()->json(['mensaje' => 'Sesión cerrada']);
    }

    // Datos del usuario logueado
    public function me()
    {
        return response()->json(auth()->user());
    }

    // Refrescar token
    public function refresh()
    {
        return response()->json([
            'token' => auth()->refresh(),
        ]);
    }
}

