<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Usuario;

class UsuarioController extends Controller
{
    public function obtenerTodos()
    {
        //Si el token JWT no pertenece a un admin, cortamos el acceso
        if (auth()->user()->rol !== 'admin') {
            return response()->json(['mensaje' => 'Acceso denegado. No eres administrador.'], 403);
        }

        // Pedimos todos los usuarios ordenados del más nuevo al más antiguo
        $usuarios = Usuario::orderBy('created_at', 'desc')->get();

        return response()->json($usuarios);
    }
}