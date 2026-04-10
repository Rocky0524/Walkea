<?php

namespace Tests\Feature;

use App\Models\Marcador;
use App\Models\TipoMarcador;
use App\Models\Usuario;
use App\Models\Voto;
use App\Notifications\ReporteSinVidaNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PerfilAjustesVotosTest extends TestCase
{
    use RefreshDatabase;

    public function test_el_perfil_devuelve_los_counts_del_usuario_activo(): void
    {
        $usuario = Usuario::create([
            'nombre' => 'Anas',
            'email' => 'anas@walkea.test',
            'password' => 'secret123',
            'reputacion' => 30,
        ]);

        $otroUsuario = Usuario::create([
            'nombre' => 'Otro',
            'email' => 'otro@walkea.test',
            'password' => 'secret123',
            'reputacion' => 0,
        ]);

        $tipo = TipoMarcador::create([
            'nombre' => 'Obras',
            'icono' => 'obras',
        ]);

        Marcador::create([
            'latitud' => 41.6167000,
            'longitud' => 0.6222000,
            'descripcion' => 'Reporte 1',
            'vida' => 10,
            'estado' => 'activo',
            'id_usuario' => $usuario->id_usuario,
            'id_tipo_marcador' => $tipo->id_tipo_marcador,
        ]);

        Marcador::create([
            'latitud' => 41.6177000,
            'longitud' => 0.6232000,
            'descripcion' => 'Reporte 2',
            'vida' => 8,
            'estado' => 'activo',
            'id_usuario' => $usuario->id_usuario,
            'id_tipo_marcador' => $tipo->id_tipo_marcador,
        ]);

        $marcadorAjeno = Marcador::create([
            'latitud' => 41.6187000,
            'longitud' => 0.6242000,
            'descripcion' => 'Reporte 3',
            'vida' => 7,
            'estado' => 'activo',
            'id_usuario' => $otroUsuario->id_usuario,
            'id_tipo_marcador' => $tipo->id_tipo_marcador,
        ]);

        Voto::create([
            'tipo' => 'positivo',
            'id_usuario' => $usuario->id_usuario,
            'id_marcador' => $marcadorAjeno->id_marcador,
        ]);

        $marcadorAjenoDos = Marcador::create([
            'latitud' => 41.6197000,
            'longitud' => 0.6252000,
            'descripcion' => 'Reporte 4',
            'vida' => 6,
            'estado' => 'activo',
            'id_usuario' => $otroUsuario->id_usuario,
            'id_tipo_marcador' => $tipo->id_tipo_marcador,
        ]);

        Voto::create([
            'tipo' => 'negativo',
            'id_usuario' => $usuario->id_usuario,
            'id_marcador' => $marcadorAjenoDos->id_marcador,
        ]);

        $response = $this->getJson('/api/perfil', $this->authHeaders($usuario));

        $response
            ->assertOk()
            ->assertJsonPath('estadisticas.total_reportes', 2)
            ->assertJsonPath('estadisticas.total_votos', 2)
            ->assertJsonPath('estadisticas.nivel', 'veterano')
            ->assertJsonPath('estadisticas.peso_voto', 2);
    }

    public function test_ajustes_actualiza_datos_sensibles_si_la_password_actual_es_valida(): void
    {
        $usuario = Usuario::create([
            'nombre' => 'Anas',
            'email' => 'anas@walkea.test',
            'password' => 'secret123',
            'reputacion' => 0,
        ]);

        $response = $this->putJson('/api/ajustes', [
            'nombre' => 'Anas Nuevo',
            'email' => 'anas.nuevo@walkea.test',
            'password' => 'secret456',
            'password_confirmation' => 'secret456',
            'current_password' => 'secret123',
        ], $this->authHeaders($usuario));

        $response
            ->assertOk()
            ->assertJsonPath('usuario.nombre', 'Anas Nuevo')
            ->assertJsonPath('usuario.email', 'anas.nuevo@walkea.test');

        $usuario->refresh();

        $this->assertSame('Anas Nuevo', $usuario->nombre);
        $this->assertSame('anas.nuevo@walkea.test', $usuario->email);
        $this->assertTrue(Hash::check('secret456', $usuario->password));
    }

    public function test_un_voto_negativo_con_peso_agota_el_reporte_y_notifica_al_creador(): void
    {
        Notification::fake();

        $creador = Usuario::create([
            'nombre' => 'Creador',
            'email' => 'creador@walkea.test',
            'password' => 'secret123',
            'reputacion' => 0,
        ]);

        $votante = Usuario::create([
            'nombre' => 'Veterano',
            'email' => 'veterano@walkea.test',
            'password' => 'secret123',
            'reputacion' => 120,
        ]);

        $tipo = TipoMarcador::create([
            'nombre' => 'Peligro',
            'icono' => 'alerta',
        ]);

        $marcador = Marcador::create([
            'latitud' => 41.6167000,
            'longitud' => 0.6222000,
            'descripcion' => 'Cruce peligroso',
            'vida' => 2,
            'estado' => 'activo',
            'id_usuario' => $creador->id_usuario,
            'id_tipo_marcador' => $tipo->id_tipo_marcador,
        ]);

        $response = $this->postJson(
            "/api/marcador/{$marcador->id_marcador}/votar",
            ['tipo' => 'negativo'],
            $this->authHeaders($votante)
        );

        $response
            ->assertCreated()
            ->assertJsonPath('nivel_usuario', 'experto')
            ->assertJsonPath('peso_voto', 3)
            ->assertJsonPath('vida_marcador', 0)
            ->assertJsonPath('hp_vida', 0);

        $marcador->refresh();

        $this->assertSame(0, $marcador->vida);
        $this->assertSame('agotado', $marcador->estado);

        Notification::assertSentTo($creador, ReporteSinVidaNotification::class);
    }

    private function authHeaders(Usuario $usuario): array
    {
        $token = auth('api')->login($usuario);

        return [
            'Authorization' => "Bearer {$token}",
        ];
    }
}
