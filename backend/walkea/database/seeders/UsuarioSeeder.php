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
        $ahora = Carbon::now();

        $usuariosDemo = [
            [
                'email' => 'admin@walkea.com',
                'nombre' => 'Admin Demo',
                'password' => Hash::make('123456'),
                'reputacion' => 100,
                'rol' => 'admin',
                'activo' => true,
                'created_at' => $ahora->copy(),
                'updated_at' => $ahora->copy(),
            ],
            [
                'email' => 'user@walkea.com',
                'nombre' => 'Usuario Demo',
                'password' => Hash::make('123456'),
                'reputacion' => 10,
                'rol' => 'usuario',
                'activo' => true,
                'created_at' => $ahora->copy(),
                'updated_at' => $ahora->copy(),
            ],
        ];

        foreach ($usuariosDemo as $usuario) {
            DB::table('usuarios')->updateOrInsert(
                ['email' => $usuario['email']],
                $usuario
            );
        }
    }
}
