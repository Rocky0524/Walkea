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

    public function marcadores()
    {
        return $this->hasMany(Marcador::class, 'id_usuario', 'id_usuario');
    }

    public function votos()
    {
        return $this->hasMany(Voto::class, 'id_usuario', 'id_usuario');
    }

    public function resolverPesoVoto(): int
    {
        $reputacion = (int) ($this->reputacion ?? 0);

        if ($reputacion >= 100) {
            return 3;
        }

        if ($reputacion >= 25) {
            return 2;
        }

        return 1;
    }

    public function resolverNivel(): string
    {
        return match ($this->resolverPesoVoto()) {
            3 => 'experto',
            2 => 'veterano',
            default => 'novato',
        };
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
