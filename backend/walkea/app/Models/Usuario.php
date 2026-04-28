<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Tymon\JWTAuth\Contracts\JWTSubject;

class Usuario extends Authenticatable implements JWTSubject
{
    use HasFactory, Notifiable;

    protected $table = 'usuarios';
    protected $primaryKey = 'id_usuario';

    protected $fillable = [
        'nombre',
        'email',
        'password',
        'reputacion',
        'rol',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    protected static function booted(): void
    {
        static::saving(function (Usuario $usuario) {
            if ($usuario->esAdmin() && (int) ($usuario->reputacion ?? 0) < 100) {
                $usuario->reputacion = 100;
            }
        });
    }

    public function marcadores()
    {
        return $this->hasMany(Marcador::class, 'id_usuario', 'id_usuario');
    }

    public function votos()
    {
        return $this->hasMany(Voto::class, 'id_usuario', 'id_usuario');
    }

    public function resolverAntiguedadDias(): int
    {
        if (!$this->created_at) {
            return 0;
        }

        return (int) $this->created_at->diffInDays(now());
    }

    public function resolverPesoVoto(): int
    {
        if ($this->esAdmin()) {
            return 3;
        }

        $dias = $this->resolverAntiguedadDias();

        if ($dias >= 90) {
            return 3;
        }

        if ($dias >= 30) {
            return 2;
        }

        return 1;
    }

    public function resolverNivel(): string
    {
        if ($this->esAdmin()) {
            return 'veterano';
        }

        return match ($this->resolverPesoVoto()) {
            3 => 'veterano',
            2 => 'medio',
            default => 'novato',
        };
    }

    public function esAdmin(): bool
    {
        return strtolower((string) $this->rol) === 'admin';
    }

    // JWTSubject
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    public function getJWTCustomClaims()
    {
        return [];
    }
}
