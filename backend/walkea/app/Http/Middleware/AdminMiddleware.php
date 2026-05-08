<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $usuario = auth()->user();

        if (!$usuario || strtolower((string) ($usuario->rol ?? '')) !== 'admin') {
            return response()->json(['mensaje' => 'Acceso denegado. No eres administrador.'], 403);
        }

        return $next($request);
    }
}
