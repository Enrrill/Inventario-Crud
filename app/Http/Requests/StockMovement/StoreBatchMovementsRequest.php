<?php

namespace App\Http\Requests\StockMovement;

use App\Enums\StockMovementType;
use App\Models\Product;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreBatchMovementsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        return [
            'movements' => ['required', 'array', 'min:1', 'max:20'],
            'movements.*.product_id' => ['required', 'exists:products,id'],
            'movements.*.type_movement' => ['required', Rule::enum(StockMovementType::class)],
            'movements.*.quantity_movement' => ['required', 'integer', 'min:1'],
            'reference_movement' => ['nullable', 'string', 'max:100'],
            'notes_movement' => ['nullable', 'string'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'movements.required' => 'Debe agregar al menos un movimiento.',
            'movements.array' => 'Los movements deben ser un arreglo.',
            'movements.min' => 'Debe agregar al menos un movimiento.',
            'movements.max' => 'No puede registrar más de 20 movimientos a la vez.',
            'movements.*.product_id.required' => 'Debe seleccionar un producto en cada movimiento.',
            'movements.*.product_id.exists' => 'Uno de los productos seleccionados no existe.',
            'movements.*.type_movement.required' => 'Debe seleccionar un tipo de movimiento en cada fila.',
            'movements.*.type_movement.enum' => 'El tipo de movimiento no es válido.',
            'movements.*.quantity_movement.required' => 'La cantidad es obligatoria en cada movimiento.',
            'movements.*.quantity_movement.integer' => 'La cantidad debe ser un número entero.',
            'movements.*.quantity_movement.min' => 'La cantidad debe ser al menos 1.',
        ];
    }

    /**
     * Validate stock availability for exit movements and check for duplicate products.
     *
     * @param  Validator  $validator
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($validator->errors()->hasAny(['movements'])) {
                return;
            }

            $movements = $this->movements ?? [];
            $productIds = [];

            foreach ($movements as $index => $movement) {
                if (isset($movement['product_id'])) {
                    $productIds[] = $movement['product_id'];
                }
            }

            $duplicates = array_diff_key($productIds, array_unique($productIds));
            if ($duplicates) {
                $validator->errors()->add(
                    'movements',
                    'No puede registrar el mismo producto más de una vez en un lote.'
                );

                return;
            }

            foreach ($movements as $index => $movement) {
                if (
                    ! isset($movement['product_id'], $movement['type_movement'], $movement['quantity_movement'])
                    || $movement['type_movement'] !== StockMovementType::Exit->value
                ) {
                    continue;
                }

                $product = Product::find($movement['product_id']);

                if ($product && $movement['quantity_movement'] > $product->current_stock_product) {
                    $validator->errors()->add(
                        "movements.{$index}.quantity_movement",
                        "Stock insuficiente para {$product->name_product}. Disponible: {$product->current_stock_product}"
                    );
                }
            }
        });
    }
}
