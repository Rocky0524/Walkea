<?php

namespace Tests\Feature;

use App\Models\Usuario;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_accepts_email_alias_from_local_part(): void
    {
        Usuario::create([
            'nombre' => 'Administrador',
            'email' => 'admin@walkea.com',
            'password' => '123456',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'admin',
            'password' => '123456',
        ]);

        $response
            ->assertOk()
            ->assertJsonStructure([
                'mensaje',
                'usuario',
                'token',
            ]);
    }

    public function test_login_accepts_regular_email(): void
    {
        Usuario::create([
            'nombre' => 'Usuario Demo',
            'email' => 'demo@walkea.com',
            'password' => '123456',
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'demo@walkea.com',
            'password' => '123456',
        ]);

        $response->assertOk();
    }
}
