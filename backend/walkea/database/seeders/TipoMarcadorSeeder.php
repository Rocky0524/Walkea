<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class TipoMarcadorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $tipos = [
            [
                'nombre' => 'Caca de perro',
                'icono' => 'poop-icon.png',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Farola rota',
                'icono' => 'lightbulb-off-icon.png',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Bache en carretera',
                'icono' => 'road-alert-icon.png',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Basura acumulada',
                'icono' => 'trash-icon.png',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nombre' => 'Mobiliario roto',
                'icono' => 'bench-broken-icon.png',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        foreach ($tipos as $tipo) {
            DB::table('tipo_marcador')->updateOrInsert(
                ['nombre' => $tipo['nombre']],
                $tipo
            );
        }
    }
}
