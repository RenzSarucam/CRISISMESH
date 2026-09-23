<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('incidents', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('uuid')->unique();
            $table->foreignUuid('reporter_id')->nullable()->constrained('users')->nullOnDelete();
            $table->uuid('device_id')->nullable();
            $table->string('type');
            $table->string('title');
            $table->text('description')->nullable();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->float('location_accuracy')->nullable();
            $table->string('severity');
            $table->string('status')->default('REPORTED');
            $table->string('verification_status')->default('UNVERIFIED');
            $table->string('source')->default('USER');
            $table->boolean('created_offline')->default(false);
            $table->timestamp('synced_at')->nullable();
            $table->foreignUuid('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();

            $table->index('type');
            $table->index('severity');
            $table->index('status');
            $table->index('verification_status');
            $table->index('device_id');
            $table->index('reporter_id');
            $table->index('created_at');
            $table->index(['latitude', 'longitude']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('incidents');
    }
};
