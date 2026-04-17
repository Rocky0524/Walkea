<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('marcador', function (Blueprint $table) {
            $table->string('titulo', 120)->default('Sin titulo')->after('estado');
        });
    }

    public function down(): void
    {
        Schema::table('marcador', function (Blueprint $table) {
            $table->dropColumn('titulo');
        });
    }
};
