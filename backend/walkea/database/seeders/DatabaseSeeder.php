<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    // Aqui llamamos a todos los seeders que queremos ejecutar
    public function run(): void
    {
        $this->call([
            UsuarioSeeder::class,
            TipoMarcadorSeeder::class,
        ]);
    }
}
