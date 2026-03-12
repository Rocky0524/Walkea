<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MarcadorSeeder extends Seeder
{
    public function run(): void
    {
        // Obtener el primer tipo de marcador y el usuario creado
        $tipo = DB::table('tipo_marcador')->first();
        $usuario = DB::table('usuarios')->first();

        if ($tipo && $usuario) {
            DB::table('marcador')->insert([
                [
                    'titulo' => 'Bache peligroso',
                    'descripcion' => 'Hay un bache enorme en mitad de la calle.',
                    'latitud' => 40.416775,
                    'longitud' => -3.703790,
                    'vida' => 5,
                    'id_usuario' => $usuario->id_usuario,
                    'id_tipo' => $tipo->id_tipo,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ],
                [
                    'titulo' => 'Farola rota',
                    'descripcion' => 'La farola no enciende por las noches.',
                    'latitud' => 40.417775,
                    'longitud' => -3.704790,
                    'vida' => 5,
                    'id_usuario' => $usuario->id_usuario,
                    'id_tipo' => $tipo->id_tipo,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]
            ]);
        }
    }
}
