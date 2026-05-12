<?php

namespace Tests\Feature;

use App\Models\Marcador;
use App\Models\TipoMarcador;
use App\Models\Usuario;
use App\Models\Voto;
use App\Notifications\ReporteCaducadoNotification;
use App\Notifications\ReporteSinVidaNotification;
use App\Notifications\VotoReporteNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PerfilAjustesVotosTest extends TestCase
{
    use RefreshDatabase;

    public function test_el_perfil_devuelve_los_counts_del_usuario_activo(): void
    {
        $usuario = $this->crearUsuarioConAntiguedad([
            'nombre' => 'Anas',
            'email' => 'anas@walkea.test',
            'password' => 'secret123',
            'reputacion' => 30,
        ], 45);

        $otroUsuario = $this->crearUsuarioConAntiguedad([
            'nombre' => 'Otro',
            'email' => 'otro@walkea.test',
            'password' => 'secret123',
            'reputacion' => 0,
        ], 5);

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
            ->assertJsonPath('estadisticas.nivel', 'medio')
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

    public function test_un_usuario_inhabilitado_no_puede_iniciar_sesion(): void
    {
        Usuario::create([
            'nombre' => 'Bloqueado',
            'email' => 'bloqueado@walkea.test',
            'password' => 'secret123',
            'reputacion' => 0,
            'activo' => false,
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'bloqueado@walkea.test',
            'password' => 'secret123',
        ]);

        $response
            ->assertForbidden()
            ->assertJsonPath('mensaje', 'Tu cuenta esta inhabilitada. Contacta con un administrador.');
    }

    public function test_un_usuario_inhabilitado_no_puede_acceder_a_rutas_protegidas(): void
    {
        $usuario = Usuario::create([
            'nombre' => 'Bloqueado',
            'email' => 'bloqueado.token@walkea.test',
            'password' => 'secret123',
            'reputacion' => 0,
            'activo' => false,
        ]);

        $response = $this->getJson('/api/perfil', $this->authHeaders($usuario));

        $response
            ->assertForbidden()
            ->assertJsonPath('mensaje', 'Tu cuenta esta inhabilitada. Contacta con un administrador.');
    }

    public function test_un_admin_puede_inhabilitar_usuarios_y_borrar_sus_reportes(): void
    {
        $admin = Usuario::create([
            'nombre' => 'Admin',
            'email' => 'admin.moderacion@walkea.test',
            'password' => 'secret123',
            'reputacion' => 100,
            'rol' => 'admin',
        ]);

        $usuario = Usuario::create([
            'nombre' => 'Autor',
            'email' => 'autor.reportes@walkea.test',
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
            'titulo' => 'Reporte uno',
            'descripcion' => 'Primer reporte',
            'vida' => 2,
            'estado' => 'activo',
            'id_usuario' => $usuario->id_usuario,
            'id_tipo_marcador' => $tipo->id_tipo_marcador,
        ]);

        Marcador::create([
            'latitud' => 41.6177000,
            'longitud' => 0.6232000,
            'titulo' => 'Reporte dos',
            'descripcion' => 'Segundo reporte',
            'vida' => 1,
            'estado' => 'activo',
            'id_usuario' => $usuario->id_usuario,
            'id_tipo_marcador' => $tipo->id_tipo_marcador,
        ]);

        $inhabilitarResponse = $this->patchJson(
            "/api/admin/usuarios/{$usuario->id_usuario}/estado",
            ['activo' => false],
            $this->authHeaders($admin)
        );

        $inhabilitarResponse
            ->assertOk()
            ->assertJsonPath('usuario.activo', false);

        $borrarReportesResponse = $this->deleteJson(
            "/api/admin/usuarios/{$usuario->id_usuario}/reportes",
            [],
            $this->authHeaders($admin)
        );

        $borrarReportesResponse
            ->assertOk()
            ->assertJsonPath('total_eliminados', 2);

        $this->assertDatabaseHas('usuarios', [
            'id_usuario' => $usuario->id_usuario,
            'activo' => false,
        ]);
        $this->assertDatabaseCount('marcador', 0);
        $this->assertDatabaseCount('admin_reportes_eliminados', 2);
    }

    public function test_la_vida_inicial_del_reporte_sale_del_rango_del_usuario(): void
    {
        $tipo = TipoMarcador::create([
            'nombre' => 'Obras',
            'icono' => 'obras',
        ]);

        $novato = $this->crearUsuarioConAntiguedad([
            'nombre' => 'Novato',
            'email' => 'novato@walkea.test',
            'password' => 'secret123',
            'reputacion' => 0,
        ], 5);

        $medio = $this->crearUsuarioConAntiguedad([
            'nombre' => 'Medio',
            'email' => 'medio@walkea.test',
            'password' => 'secret123',
            'reputacion' => 30,
        ], 45);

        $veterano = $this->crearUsuarioConAntiguedad([
            'nombre' => 'Veterano',
            'email' => 'veterano.inicial@walkea.test',
            'password' => 'secret123',
            'reputacion' => 120,
        ], 120);

        $respuestaNovato = $this->postJson('/api/marcador', [
            'latitud' => 41.6167000,
            'longitud' => 0.6222000,
            'titulo' => 'Reporte novato',
            'descripcion' => 'Incidencia creada por novato',
            'id_tipo_marcador' => $tipo->id_tipo_marcador,
        ], $this->authHeaders($novato));

        $respuestaMedio = $this->postJson('/api/marcador', [
            'latitud' => 41.6177000,
            'longitud' => 0.6232000,
            'titulo' => 'Reporte medio',
            'descripcion' => 'Incidencia creada por rango medio',
            'id_tipo_marcador' => $tipo->id_tipo_marcador,
        ], $this->authHeaders($medio));

        $respuestaVeterano = $this->postJson('/api/marcador', [
            'latitud' => 41.6187000,
            'longitud' => 0.6242000,
            'titulo' => 'Reporte veterano',
            'descripcion' => 'Incidencia creada por veterano',
            'id_tipo_marcador' => $tipo->id_tipo_marcador,
        ], $this->authHeaders($veterano));

        $respuestaNovato
            ->assertCreated()
            ->assertJsonPath('marcador.vida', 1);

        $respuestaMedio
            ->assertCreated()
            ->assertJsonPath('marcador.vida', 2);

        $respuestaVeterano
            ->assertCreated()
            ->assertJsonPath('marcador.vida', 3);
    }

    public function test_un_voto_negativo_con_peso_agota_el_reporte_y_notifica_al_creador(): void
    {
        Notification::fake();

        $creador = $this->crearUsuarioConAntiguedad([
            'nombre' => 'Creador',
            'email' => 'creador@walkea.test',
            'password' => 'secret123',
            'reputacion' => 0,
        ], 5);

        $votante = $this->crearUsuarioConAntiguedad([
            'nombre' => 'Veterano',
            'email' => 'veterano@walkea.test',
            'password' => 'secret123',
            'reputacion' => 120,
        ], 120);

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
            ->assertJsonPath('nivel_usuario', 'veterano')
            ->assertJsonPath('peso_voto', 3)
            ->assertJsonPath('vida_marcador', 0)
            ->assertJsonPath('hp_vida', 0);

        $marcador->refresh();

        $this->assertSame(0, $marcador->vida);
        $this->assertSame('agotado', $marcador->estado);

        Notification::assertSentTo($creador, ReporteSinVidaNotification::class);
    }

    public function test_el_creador_no_puede_votar_su_propio_reporte(): void
    {
        $usuario = $this->crearUsuarioConAntiguedad([
            'nombre' => 'Autor',
            'email' => 'autor@walkea.test',
            'password' => 'secret123',
            'reputacion' => 0,
        ], 5);

        $tipo = TipoMarcador::create([
            'nombre' => 'Obras',
            'icono' => 'obras',
        ]);

        $marcador = Marcador::create([
            'latitud' => 41.6167000,
            'longitud' => 0.6222000,
            'descripcion' => 'Reporte propio',
            'vida' => 8,
            'estado' => 'activo',
            'id_usuario' => $usuario->id_usuario,
            'id_tipo_marcador' => $tipo->id_tipo_marcador,
        ]);

        $response = $this->postJson(
            "/api/marcador/{$marcador->id_marcador}/votar",
            ['tipo' => 'positivo'],
            $this->authHeaders($usuario)
        );

        $response
            ->assertForbidden()
            ->assertJsonPath('mensaje', 'No puedes votar tu propio reporte');
    }

    public function test_un_reporte_agotado_no_admite_mas_votos(): void
    {
        $creador = $this->crearUsuarioConAntiguedad([
            'nombre' => 'Autor',
            'email' => 'autor2@walkea.test',
            'password' => 'secret123',
            'reputacion' => 0,
        ], 5);

        $votante = $this->crearUsuarioConAntiguedad([
            'nombre' => 'Usuario',
            'email' => 'usuario@walkea.test',
            'password' => 'secret123',
            'reputacion' => 0,
        ], 5);

        $tipo = TipoMarcador::create([
            'nombre' => 'Otros',
            'icono' => 'otros',
        ]);

        $marcador = Marcador::create([
            'latitud' => 41.6167000,
            'longitud' => 0.6222000,
            'descripcion' => 'Reporte agotado',
            'vida' => 0,
            'estado' => 'agotado',
            'id_usuario' => $creador->id_usuario,
            'id_tipo_marcador' => $tipo->id_tipo_marcador,
        ]);

        $response = $this->postJson(
            "/api/marcador/{$marcador->id_marcador}/votar",
            ['tipo' => 'positivo'],
            $this->authHeaders($votante)
        );

        $response
            ->assertStatus(409)
            ->assertJsonPath('mensaje', 'Este reporte ya esta agotado y no admite mas votos');
    }

    public function test_un_reporte_sin_votos_mas_de_24_horas_se_caduca_y_no_sale_en_mapa_principal(): void
    {
        Notification::fake();

        $creador = $this->crearUsuarioConAntiguedad([
            'nombre' => 'Creador',
            'email' => 'caducado@walkea.test',
            'password' => 'secret123',
            'reputacion' => 0,
        ], 60);

        $tipo = TipoMarcador::create([
            'nombre' => 'Obras',
            'icono' => 'obras',
        ]);

        $caducado = Marcador::create([
            'latitud' => 41.6167000,
            'longitud' => 0.6222000,
            'titulo' => 'Reporte viejo',
            'descripcion' => 'Sin votos',
            'vida' => 2,
            'estado' => 'activo',
            'id_usuario' => $creador->id_usuario,
            'id_tipo_marcador' => $tipo->id_tipo_marcador,
        ]);

        Marcador::withoutTimestamps(function () use ($caducado) {
            $fecha = now()->subDays(2);
            $caducado->forceFill([
                'created_at' => $fecha,
                'updated_at' => $fecha,
            ])->saveQuietly();
        });

        $activo = Marcador::create([
            'latitud' => 41.6177000,
            'longitud' => 0.6232000,
            'titulo' => 'Reporte activo',
            'descripcion' => 'Reciente',
            'vida' => 1,
            'estado' => 'activo',
            'id_usuario' => $creador->id_usuario,
            'id_tipo_marcador' => $tipo->id_tipo_marcador,
        ]);

        $response = $this->getJson('/api/marcador?solo_activos=1');

        $response->assertOk();

        $ids = collect($response->json())->pluck('id_marcador')->all();

        $this->assertNotContains($caducado->id_marcador, $ids);
        $this->assertContains($activo->id_marcador, $ids);

        $caducado->refresh();

        $this->assertSame('caducado', $caducado->estado);

        Notification::assertSentTo($creador, ReporteCaducadoNotification::class);
    }

    public function test_un_voto_normal_genera_notificacion_real_en_backend_para_el_creador(): void
    {
        $creador = $this->crearUsuarioConAntiguedad([
            'nombre' => 'Creador',
            'email' => 'noti.creador@walkea.test',
            'password' => 'secret123',
            'reputacion' => 0,
        ], 60);

        $votante = $this->crearUsuarioConAntiguedad([
            'nombre' => 'Usuario Medio',
            'email' => 'noti.votante@walkea.test',
            'password' => 'secret123',
            'reputacion' => 0,
        ], 45);

        $tipo = TipoMarcador::create([
            'nombre' => 'Peligro',
            'icono' => 'alerta',
        ]);

        $marcador = Marcador::create([
            'latitud' => 41.6167000,
            'longitud' => 0.6222000,
            'titulo' => 'Cruce complicado',
            'descripcion' => 'Necesita revision',
            'vida' => 1,
            'estado' => 'activo',
            'id_usuario' => $creador->id_usuario,
            'id_tipo_marcador' => $tipo->id_tipo_marcador,
        ]);

        $this->postJson(
            "/api/marcador/{$marcador->id_marcador}/votar",
            ['tipo' => 'positivo'],
            $this->authHeaders($votante)
        )->assertCreated();

        $creador->refresh();
        $creador->load('notifications');

        $this->assertCount(1, $creador->notifications);
        $this->assertSame(VotoReporteNotification::class, $creador->notifications->first()->type);

        $response = $this->getJson('/api/notificaciones', $this->authHeaders($creador));

        $response
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.tipo', 'voto_recibido');
    }

    private function authHeaders(Usuario $usuario): array
    {
        $token = auth('api')->login($usuario);

        return [
            'Authorization' => "Bearer {$token}",
        ];
    }

    private function crearUsuarioConAntiguedad(array $datos, int $diasAntiguedad): Usuario
    {
        $usuario = Usuario::create($datos);

        Usuario::withoutTimestamps(function () use ($usuario, $diasAntiguedad) {
            $fecha = now()->subDays($diasAntiguedad);
            $usuario->forceFill([
                'created_at' => $fecha,
                'updated_at' => $fecha,
            ])->saveQuietly();
        });

        return $usuario->fresh();
    }
}
