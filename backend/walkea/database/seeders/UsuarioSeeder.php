<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class UsuarioSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('usuarios')->updateOrInsert(
            ['email' => 'admin@walkea.com'],
            [
                'nombre' => 'Profe User',
                'password' => Hash::make('123456'),
                'reputacion' => 100,
                'rol' => 'admin',
                'updated_at' => Carbon::now(),
                'created_at' => Carbon::now(),
            ]
        );

        DB::table('usuarios')->updateOrInsert(
            ['email' => 'user@walkea.com'],
            [
                'nombre' => 'Usuario Demo',
                'password' => Hash::make('123456'),
                'reputacion' => 10,
                'rol' => 'usuario',
                'updated_at' => Carbon::now(),
                'created_at' => Carbon::now(),
            ]
        );
    }
}
