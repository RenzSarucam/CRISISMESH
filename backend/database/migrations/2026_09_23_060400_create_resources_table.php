<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('resources', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('uuid')->unique();
            $table->string('name');
            $table->string('type');
            $table->text('description')->nullable();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->string('availability')->default('AVAILABLE');
            $table->integer('quantity')->nullable();
            $table->string('contact')->nullable();
            $table->string('operating_hours')->nullable();
            $table->boolean('verified')->default(false);
            $table->timestamp('last_updated_at')->nullable();
            $table->timestamps();

            $table->index('type');
            $table->index('availability');
            $table->index(['latitude', 'longitude']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('resources');
    }
};
