<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class MarcadorSeeder extends Seeder
{
    public function run(): void
    {
        $usuario = DB::table('usuarios')->where('email', 'admin@walkea.com')->first();
        if (!$usuario) {
            $usuario = DB::table('usuarios')->first();
        }

        if ($usuario) {
            $marcadores = [
                // Peligro (ID 1) - Enfocado a tropiezos o inseguridad
                [
                    'titulo' => 'Baldosas sueltas',
                    'descripcion' => 'Cuidado al pisar, las baldosas bailan y salpican agua si ha llovido.',
                    'latitud' => 41.6177,
                    'longitud' => 0.6267,
                    'vida' => 6,
                    'estado' => 'activo',
                    'id_usuario' => $usuario->id_usuario,
                    'id_tipo_marcador' => 1,
                    'created_at' => Carbon::now()->subHours(1),
                    'updated_at' => Carbon::now(),
                ],
                [
                    'titulo' => 'Excrementos sin recoger',
                    'descripcion' => 'Muchos excrementos de perro en mitad de la acera estrecha.',
                    'latitud' => 41.6155,
                    'longitud' => 0.6280,
                    'vida' => 4,
                    'estado' => 'activo',
                    'id_usuario' => $usuario->id_usuario,
                    'id_tipo_marcador' => 1,
                    'created_at' => Carbon::now()->subHours(3),
                    'updated_at' => Carbon::now(),
                ],
                // Obras / Incidencias (ID 2) - Obstaculos en el camino
                [
                    'titulo' => 'Acera cortada por andamio',
                    'descripcion' => 'El andamio no deja espacio para pasar con carrito o silla de ruedas.',
                    'latitud' => 41.6150,
                    'longitud' => 0.6220,
                    'vida' => 10,
                    'estado' => 'activo',
                    'id_usuario' => $usuario->id_usuario,
                    'id_tipo_marcador' => 2,
                    'created_at' => Carbon::now()->subDays(1),
                    'updated_at' => Carbon::now(),
                ],
                [
                    'titulo' => 'Farola que parpadea',
                    'descripcion' => 'Zona muy oscura por la noche, da inseguridad caminar por aqui.',
                    'latitud' => 41.6190,
                    'longitud' => 0.6210,
                    'vida' => 8,
                    'estado' => 'activo',
                    'id_usuario' => $usuario->id_usuario,
                    'id_tipo_marcador' => 2,
                    'created_at' => Carbon::now()->subHours(8),
                    'updated_at' => Carbon::now(),
                ],
                // Zona segura / Positivo (ID 3) - Amigable para el peaton
                [
                    'titulo' => 'Nueva zona peatonal',
                    'descripcion' => 'Han puesto bancos y arboles, es muy agradable pasear por aqui.',
                    'latitud' => 41.6130,
                    'longitud' => 0.6240,
                    'vida' => 10,
                    'estado' => 'activo',
                    'id_usuario' => $usuario->id_usuario,
                    'id_tipo_marcador' => 3,
                    'created_at' => Carbon::now()->subDays(3),
                    'updated_at' => Carbon::now(),
                ],
                [
                    'titulo' => 'Paso cebra bien iluminado',
                    'descripcion' => 'Han instalado focos nuevos y se ve perfecto al cruzar de noche.',
                    'latitud' => 41.6160,
                    'longitud' => 0.6250,
                    'vida' => 10,
                    'estado' => 'activo',
                    'id_usuario' => $usuario->id_usuario,
                    'id_tipo_marcador' => 3,
                    'created_at' => Carbon::now()->subHours(12),
                    'updated_at' => Carbon::now(),
                ],
                // Otros (ID 4)
                [
                    'titulo' => 'Ramas bajas en la acera',
                    'descripcion' => 'Las ramas del arbol obligan a agacharse para poder pasar.',
                    'latitud' => 41.6110,
                    'longitud' => 0.6290,
                    'vida' => 5,
                    'estado' => 'activo',
                    'id_usuario' => $usuario->id_usuario,
                    'id_tipo_marcador' => 4,
                    'created_at' => Carbon::now()->subHours(2),
                    'updated_at' => Carbon::now(),
                ]
            ];

            DB::table('marcador')->insert($marcadores);
        }
    }
}