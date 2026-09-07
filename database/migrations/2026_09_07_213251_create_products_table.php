<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('sku_product', 50)->unique();
            $table->string('name_product', 200);
            $table->text('description_product')->nullable();
            $table->foreignId('category_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('supplier_id')
                ->nullable()
                ->constrained()
                ->nullOnDelete();
            $table->decimal('unit_price_product', 10, 2)->default(0);
            $table->string('unit_of_measure_product', 50)->default('pieza');
            $table->integer('minimum_stock_product')->default(0);
            $table->integer('current_stock_product')->default(0);
            $table->boolean('is_active_product')->default(true);
            $table->timestamps();

            $table->index('category_id');
            $table->index('supplier_id');
            $table->index('is_active_product');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
