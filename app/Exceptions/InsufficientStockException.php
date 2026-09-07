<?php

namespace App\Exceptions;

use App\Models\Product;
use RuntimeException;

class InsufficientStockException extends RuntimeException
{
    public function __construct(
        private readonly Product $product,
        private readonly int $requested,
    ) {
        parent::__construct(
            "Stock insuficiente para el producto '{$product->name}'. "
            ."Solicitado: {$requested}, Disponible: {$product->current_stock}"
        );
    }

    public function getProduct(): Product
    {
        return $this->product;
    }

    public function getRequested(): int
    {
        return $this->requested;
    }
}
