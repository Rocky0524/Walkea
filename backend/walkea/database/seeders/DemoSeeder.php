<?php

namespace Database\Seeders;

use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        $usuarios = [
            [
                'email' => 'novato@walkea.com',
                'nombre' => 'Nora Novata',
                'reputacion' => 5,
                'rol' => 'usuario',
                'activo' => true,
                'created_at' => $now->copy()->subDays(10),
            ],
            [
                'email' => 'medio@walkea.com',
                'nombre' => 'Mario Medio',
                'reputacion' => 35,
                'rol' => 'usuario',
                'activo' => true,
                'created_at' => $now->copy()->subDays(45),
            ],
            [
                'email' => 'veterano@walkea.com',
                'nombre' => 'Vera Veterana',
                'reputacion' => 80,
                'rol' => 'usuario',
                'activo' => true,
                'created_at' => $now->copy()->subDays(120),
            ],
            [
                'email' => 'inactivo@walkea.com',
                'nombre' => 'Irene Inactiva',
                'reputacion' => 12,
                'rol' => 'usuario',
                'activo' => false,
                'created_at' => $now->copy()->subDays(20),
            ],
        ];

        foreach ($usuarios as $usuario) {
            DB::table('usuarios')->updateOrInsert(
                ['email' => $usuario['email']],
                [
                    'nombre' => $usuario['nombre'],
                    'password' => Hash::make('123456'),
                    'reputacion' => $usuario['reputacion'],
                    'rol' => $usuario['rol'],
                    'activo' => $usuario['activo'],
                    'created_at' => $usuario['created_at'],
                    'updated_at' => $now,
                ]
            );
        }

        $usuariosPorEmail = DB::table('usuarios')
            ->whereIn('email', array_merge(
                ['admin@walkea.com', 'user@walkea.com'],
                array_column($usuarios, 'email')
            ))
            ->pluck('id_usuario', 'email')
            ->all();

        $tipos = DB::table('tipo_marcador')->pluck('id_tipo_marcador', 'nombre')->all();
        $tipoPorDefecto = (int) DB::table('tipo_marcador')->value('id_tipo_marcador');

        if (!$tipoPorDefecto) {
            return;
        }

        $tipoId = fn (string $nombre): int => (int) ($tipos[$nombre] ?? $tipoPorDefecto);

        $reportes = [
            [
                'email' => 'novato@walkea.com',
                'titulo' => 'Paso oscuro junto al parque',
                'descripcion' => 'La farola principal no funciona y la zona queda con poca visibilidad por la noche.',
                'latitud' => 41.6171,
                'longitud' => 0.6236,
                'vida' => 3,
                'estado' => 'activo',
                'id_tipo_marcador' => $tipoId('Farola rota'),
                'created_at' => $now->copy()->subHours(4),
            ],
            [
                'email' => 'medio@walkea.com',
                'titulo' => 'Banco roto en la plaza',
                'descripcion' => 'El respaldo esta suelto y puede caer si alguien se apoya.',
                'latitud' => 41.6184,
                'longitud' => 0.6261,
                'vida' => 6,
                'estado' => 'activo',
                'id_tipo_marcador' => $tipoId('Mobiliario roto'),
                'created_at' => $now->copy()->subHours(16),
            ],
            [
                'email' => 'veterano@walkea.com',
                'titulo' => 'Bache peligroso en carril bici',
                'descripcion' => 'El agujero ocupa casi todo el paso y obliga a invadir la calzada.',
                'latitud' => 41.6202,
                'longitud' => 0.6272,
                'vida' => 8,
                'estado' => 'activo',
                'id_tipo_marcador' => $tipoId('Bache en carretera'),
                'created_at' => $now->copy()->subDays(2),
            ],
            [
                'email' => 'user@walkea.com',
                'titulo' => 'Basura acumulada cerca del instituto',
                'descripcion' => 'Varias bolsas llevan dias fuera del contenedor y bloquean parte de la acera.',
                'latitud' => 41.6144,
                'longitud' => 0.6257,
                'vida' => 5,
                'estado' => 'activo',
                'id_tipo_marcador' => $tipoId('Basura acumulada'),
                'created_at' => $now->copy()->subHours(7),
            ],
            [
                'email' => 'novato@walkea.com',
                'titulo' => 'Demo reporte agotado',
                'descripcion' => 'Reporte de demo sin HP para ensenar el estado agotado y el bloqueo de votos.',
                'latitud' => 41.6128,
                'longitud' => 0.6219,
                'vida' => 0,
                'estado' => 'agotado',
                'id_tipo_marcador' => $tipoId('Caca de perro'),
                'created_at' => $now->copy()->subDays(3),
            ],
            [
                'email' => 'inactivo@walkea.com',
                'titulo' => 'Demo reporte caducado',
                'descripcion' => 'Reporte antiguo sin actividad para ensenar el estado caducado en administracion.',
                'latitud' => 41.6216,
                'longitud' => 0.6245,
                'vida' => 2,
                'estado' => 'caducado',
                'id_tipo_marcador' => $tipoId('Farola rota'),
                'created_at' => $now->copy()->subHours(30),
            ],
        ];

        foreach ($reportes as $reporte) {
            $idUsuario = $usuariosPorEmail[$reporte['email']] ?? null;

            if (!$idUsuario) {
                continue;
            }

            DB::table('marcador')->updateOrInsert(
                [
                    'titulo' => $reporte['titulo'],
                    'id_usuario' => $idUsuario,
                ],
                [
                    'descripcion' => $reporte['descripcion'],
                    'latitud' => $reporte['latitud'],
                    'longitud' => $reporte['longitud'],
                    'vida' => $reporte['vida'],
                    'estado' => $reporte['estado'],
                    'id_tipo_marcador' => $reporte['id_tipo_marcador'],
                    'created_at' => $reporte['created_at'],
                    'updated_at' => $now,
                ]
            );
        }

        $this->crearVotosDemo($usuariosPorEmail, $now);
    }

    private function crearVotosDemo(array $usuariosPorEmail, Carbon $now): void
    {
        $reportes = DB::table('marcador')
            ->whereIn('titulo', [
                'Paso oscuro junto al parque',
                'Banco roto en la plaza',
                'Bache peligroso en carril bici',
                'Basura acumulada cerca del instituto',
            ])
            ->pluck('id_marcador', 'titulo')
            ->all();

        $votos = [
            ['email' => 'medio@walkea.com', 'titulo' => 'Paso oscuro junto al parque', 'tipo' => 'positivo'],
            ['email' => 'veterano@walkea.com', 'titulo' => 'Paso oscuro junto al parque', 'tipo' => 'positivo'],
            ['email' => 'novato@walkea.com', 'titulo' => 'Banco roto en la plaza', 'tipo' => 'positivo'],
            ['email' => 'admin@walkea.com', 'titulo' => 'Banco roto en la plaza', 'tipo' => 'negativo'],
            ['email' => 'user@walkea.com', 'titulo' => 'Bache peligroso en carril bici', 'tipo' => 'positivo'],
            ['email' => 'veterano@walkea.com', 'titulo' => 'Basura acumulada cerca del instituto', 'tipo' => 'negativo'],
        ];

        foreach ($votos as $voto) {
            $idUsuario = $usuariosPorEmail[$voto['email']] ?? null;
            $idMarcador = $reportes[$voto['titulo']] ?? null;

            if (!$idUsuario || !$idMarcador) {
                continue;
            }

            DB::table('votos')->updateOrInsert(
                [
                    'id_usuario' => $idUsuario,
                    'id_marcador' => $idMarcador,
                ],
                [
                    'tipo' => $voto['tipo'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }
}
