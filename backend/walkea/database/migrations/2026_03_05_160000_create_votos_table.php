<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('votos', function (Blueprint $table) {
            $table->id('id_voto');
            $table->enum('tipo', ['positivo', 'negativo']);
            $table->foreignId('id_usuario')
                ->constrained(table: 'usuarios', column: 'id_usuario')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('id_marcador')
                ->constrained(table: 'marcador', column: 'id_marcador')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->timestamps();

            // Un usuario solo puede votar una vez por marcador
            $table->unique(['id_usuario', 'id_marcador']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('votos');
    }
};
