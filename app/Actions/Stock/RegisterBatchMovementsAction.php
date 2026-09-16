<?php

namespace App\Actions\Stock;

use App\Enums\StockMovementType;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class RegisterBatchMovementsAction
{
    public function __construct(
        private RegisterEntryAction $registerEntry,
        private RegisterExitAction $registerExit,
        private RegisterAdjustmentAction $registerAdjustment,
    ) {}

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
        return DB::transaction(function () use ($movements, $reference, $notes, $user) {
            $created = collect();

            foreach ($movements as $movement) {
                $product = Product::lockForUpdate()->findOrFail($movement['product_id']);
                $type = StockMovementType::from($movement['type_movement']);

                $record = match ($type) {
                    StockMovementType::Entry => $this->registerEntry->handle(
                        $product,
                        $movement['quantity_movement'],
                        $reference,
                        $notes,
                        $user,
                    ),
                    StockMovementType::Exit => $this->registerExit->handle(
                        $product,
                        $movement['quantity_movement'],
                        $reference,
                        $notes,
                        $user,
                    ),
                    StockMovementType::Adjustment => $this->registerAdjustment->handle(
                        $product,
                        $movement['quantity_movement'],
                        $reference,
                        $notes,
                        $user,
                    ),
                };

                $created->push($record);
            }

            return $created;
        });
    }
}
