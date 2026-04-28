<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('admin_reportes_eliminados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_admin_usuario')->constrained('usuarios', 'id_usuario')->cascadeOnDelete();
            $table->unsignedBigInteger('id_marcador_original');
            $table->string('titulo', 120)->nullable();
            $table->text('descripcion')->nullable();
            $table->string('estado', 40)->nullable();
            $table->unsignedTinyInteger('vida')->default(0);
            $table->unsignedBigInteger('id_usuario_reportero')->nullable();
            $table->string('email_usuario_reportero')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_reportes_eliminados');
    }
};
