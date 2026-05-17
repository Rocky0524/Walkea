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

        DB::table('usuarios')
            ->where('email', 'user@walkea.com')
            ->delete();

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
                'email' => 'novato@walkea.com',
                'nombre' => 'Usuario Novato',
                'password' => Hash::make('123456'),
                'reputacion' => 10,
                'rol' => 'usuario',
                'activo' => true,
                'created_at' => $ahora->copy(),
                'updated_at' => $ahora->copy(),
            ],
            [
                'email' => 'medio@walkea.com',
                'nombre' => 'Usuario Medio',
                'password' => Hash::make('123456'),
                'reputacion' => 25,
                'rol' => 'usuario',
                'activo' => true,
                'created_at' => $ahora->copy()->subDays(30),
                'updated_at' => $ahora->copy(),
            ],
            [
                'email' => 'veterano@walkea.com',
                'nombre' => 'Usuario Veterano',
                'password' => Hash::make('123456'),
                'reputacion' => 50,
                'rol' => 'usuario',
                'activo' => true,
                'created_at' => $ahora->copy()->subDays(90),
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
