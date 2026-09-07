<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->string('type_movement', 20);
            $table->integer('quantity_movement');
            $table->integer('previous_stock_movement');
            $table->integer('new_stock_movement');
            $table->string('reference_movement', 100)->nullable();
            $table->text('notes_movement')->nullable();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->timestamps();

            $table->index('product_id');
            $table->index('type_movement');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_movements');
    }
};
