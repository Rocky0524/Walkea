<?php

namespace App\Http\Controllers;

use App\Models\Usuario;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    // Registrar nuevo usuario y hacer auto-login devolviendo el token
    public function register(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'email' => 'required|email|unique:usuarios,email',
            'password' => 'required|string|min:6',
        ], [
            'nombre.required' => 'El nombre es obligatorio.',
            'email.required' => 'El correo electrónico es obligatorio.',
            'email.email' => 'El correo electrónico no es válido.',
            'email.unique' => 'Este correo electrónico ya está registrado.',
            'password.required' => 'La contraseña es obligatoria.',
            'password.min' => 'La contraseña debe tener al menos 6 caracteres.',
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

    // Login - valida credenciales y devuelve el token JWT para usar en el frontend
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $usuario = Usuario::where('email', $request->email)->first();

        if ($usuario && !$usuario->estaActivo()) {
            return response()->json([
                'mensaje' => 'Tu cuenta esta inhabilitada. Contacta con un administrador.',
            ], 403);
        }

        $credentials = $request->only('email', 'password');

        // El attempt() comprueba si el email y hash de password coinciden. Si es correcto, genera el JWT.
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
