<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureUsuarioActivo
{
    public function handle(Request $request, Closure $next)
    {
        $usuario = $request->user();

        if ($usuario && !$usuario->estaActivo()) {
            return response()->json([
                'mensaje' => 'Tu cuenta esta inhabilitada. Contacta con un administrador.',
            ], 403);
        }

        return $next($request);
    }
}
