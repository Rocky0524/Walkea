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
            ->where('rol', 'admin')
            ->where('reputacion', '<', 100)
            ->update(['reputacion' => 100]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No revertimos para no degradar reputacion real de usuarios admin.
    }
};
