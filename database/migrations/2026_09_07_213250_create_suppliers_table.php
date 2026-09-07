<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('name_supplier', 150);
            $table->string('contact_name_supplier', 150)->nullable();
            $table->string('email_supplier')->nullable();
            $table->string('phone_supplier', 50)->nullable();
            $table->text('address_supplier')->nullable();
            $table->timestamps();

            $table->index('name_supplier');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
