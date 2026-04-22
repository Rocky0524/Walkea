<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::table('usuarios')
            ->where('email', 'admin@walkea.com')
            ->update(['rol' => 'admin']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('usuarios')
            ->where('email', 'admin@walkea.com')
            ->where('rol', 'admin')
            ->update(['rol' => 'usuario']);
    }
};
