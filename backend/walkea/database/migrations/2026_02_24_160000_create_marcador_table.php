<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('marcador', function (Blueprint $table) {
            $table->id('id_marcador');
            $table->decimal('latitud', 10, 7);
            $table->decimal('longitud', 10, 7);
            $table->string('estado', 50)->default('activo');
            $table->text('descripcion');
            $table->unsignedTinyInteger('vida')->default(10);
            $table->foreignId('id_usuario')
                ->constrained(table: 'usuarios', column: 'id_usuario')
                ->cascadeOnUpdate()
                ->cascadeOnDelete();
            $table->foreignId('id_tipo_marcador')
                ->constrained(table: 'tipo_marcador', column: 'id_tipo_marcador')
                ->cascadeOnUpdate()
                ->restrictOnDelete();
            $table->timestamps();

            $table->index(['latitud', 'longitud']);
            $table->index('estado');
            $table->index('vida');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('marcador');
    }
};
