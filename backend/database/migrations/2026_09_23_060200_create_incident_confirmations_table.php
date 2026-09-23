<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incident_confirmations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('incident_id')->constrained('incidents')->cascadeOnDelete();
            $table->foreignUuid('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('role_at_time');
            $table->string('type');
            $table->text('note')->nullable();
            $table->timestamp('created_at')->nullable();

            $table->index('incident_id');
            $table->index('user_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incident_confirmations');
    }
};
