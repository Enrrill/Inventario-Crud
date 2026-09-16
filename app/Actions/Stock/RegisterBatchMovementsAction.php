<?php

namespace App\Actions\Stock;

use App\Enums\StockMovementType;
use App\Exceptions\InsufficientStockException;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Context;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RegisterBatchMovementsAction
{
    /**
     * Register multiple stock movements in a single database transaction.
     *
     * @param  array<int, array{product_id: int, type_movement: string, quantity_movement: int}>  $movements
     * @return Collection<int, StockMovement>
     */
    public function handle(
        array $movements,
        ?string $reference,
        ?string $notes,
        User $user,
    ): Collection {
        $batchId = Str::uuid()->toString();
        Context::add('audit_batch_id', $batchId);

        try {
            return DB::transaction(function () use ($movements, $reference, $notes, $user) {
                $created = collect();

                foreach ($movements as $movement) {
                    $product = Product::lockForUpdate()->findOrFail($movement['product_id']);
                    $type = StockMovementType::from($movement['type_movement']);
                    $quantity = $movement['quantity_movement'];

                    $record = match ($type) {
                        StockMovementType::Entry => $this->registerEntry($product, $quantity, $reference, $notes, $user),
                        StockMovementType::Exit => $this->registerExit($product, $quantity, $reference, $notes, $user),
                        StockMovementType::Adjustment => $this->registerAdjustment($product, $quantity, $reference, $notes, $user),
                    };

                    $created->push($record);
                }

                return $created;
            });
        } finally {
            Context::forget('audit_batch_id');
        }
    }

    private function registerEntry(
        Product $product,
        int $quantity,
        ?string $reference,
        ?string $notes,
        User $user,
    ): StockMovement {
        $previousStock = $product->current_stock_product;
        $newStock = $previousStock + $quantity;

        $product->update(['current_stock_product' => $newStock]);

        return StockMovement::create([
            'product_id' => $product->id,
            'type_movement' => StockMovementType::Entry,
            'quantity_movement' => $quantity,
            'previous_stock_movement' => $previousStock,
            'new_stock_movement' => $newStock,
            'reference_movement' => $reference,
            'notes_movement' => $notes,
            'user_id' => $user->id,
        ]);
    }

    private function registerExit(
        Product $product,
        int $quantity,
        ?string $reference,
        ?string $notes,
        User $user,
    ): StockMovement {
        if ($quantity > $product->current_stock_product) {
            throw new InsufficientStockException($product, $quantity);
        }

        $previousStock = $product->current_stock_product;
        $newStock = $previousStock - $quantity;

        $product->update(['current_stock_product' => $newStock]);

        return StockMovement::create([
            'product_id' => $product->id,
            'type_movement' => StockMovementType::Exit,
            'quantity_movement' => $quantity,
            'previous_stock_movement' => $previousStock,
            'new_stock_movement' => $newStock,
            'reference_movement' => $reference,
            'notes_movement' => $notes,
            'user_id' => $user->id,
        ]);
    }

    private function registerAdjustment(
        Product $product,
        int $newQuantity,
        ?string $reference,
        ?string $notes,
        User $user,
    ): StockMovement {
        $previousStock = $product->current_stock_product;
        $quantity = abs($newQuantity - $previousStock);

        $product->update(['current_stock_product' => $newQuantity]);

        return StockMovement::create([
            'product_id' => $product->id,
            'type_movement' => StockMovementType::Adjustment,
            'quantity_movement' => $quantity,
            'previous_stock_movement' => $previousStock,
            'new_stock_movement' => $newQuantity,
            'reference_movement' => $reference,
            'notes_movement' => $notes,
            'user_id' => $user->id,
        ]);
    }
}
