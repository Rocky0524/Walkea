<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MarcadorSeeder extends Seeder
{
    public function run(): void
    {
        $tipo = DB::table('tipo_marcador')->first();
        $usuario = DB::table('usuarios')->first();

        if ($tipo && $usuario) {
            DB::table('marcador')->insert([
                [
                    'descripcion' => 'Hay un bache enorme en mitad de la calle.',
                    'latitud' => 41.6177,
                    'longitud' => 0.6267,
                    'vida' => 5,
                    'estado' => 'activo',
                    'id_usuario' => $usuario->id_usuario,
                    'id_tipo_marcador' => $tipo->id_tipo_marcador,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ],
                [
                    'descripcion' => 'La farola no enciende por las noches.',
                    'latitud' => 41.6150,
                    'longitud' => 0.6220,
                    'vida' => 8,
                    'estado' => 'activo',
                    'id_usuario' => $usuario->id_usuario,
                    'id_tipo_marcador' => $tipo->id_tipo_marcador,
                    'created_at' => Carbon::now(),
                    'updated_at' => Carbon::now(),
                ]
            ]);
        }
    }
}