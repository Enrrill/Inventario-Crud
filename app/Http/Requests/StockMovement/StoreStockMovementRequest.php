<?php

namespace App\Http\Requests\StockMovement;

use App\Enums\StockMovementType;
use App\Models\Product;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStockMovementRequest extends FormRequest
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
            'product_id' => ['required', 'exists:products,id'],
            'type_movement' => ['required', Rule::enum(StockMovementType::class)],
            'quantity_movement' => ['required', 'integer', 'min:1'],
            'reference_movement' => ['nullable', 'string', 'max:100'],
            'notes_movement' => ['nullable', 'string'],
        ];
    }

    /**
     * Get the validation messages that apply to the request.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'product_id.required' => 'Debe seleccionar un producto.',
            'product_id.exists' => 'El producto seleccionado no existe.',
            'type_movement.required' => 'Debe seleccionar un tipo de movimiento.',
            'type_movement.enum' => 'El tipo de movimiento no es válido.',
            'quantity_movement.required' => 'La cantidad es obligatoria.',
            'quantity_movement.integer' => 'La cantidad debe ser un número entero.',
            'quantity_movement.min' => 'La cantidad debe ser al menos 1.',
        ];
    }

    /**
     * Validate stock availability for exit movements.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($validator->errors()->hasAny(['product_id', 'type_movement', 'quantity_movement'])) {
                return;
            }

            $product = Product::find($this->product_id);

            if ($this->type_movement === StockMovementType::Exit && $this->quantity_movement > $product->current_stock_product) {
                $validator->errors()->add(
                    'quantity_movement',
                    "Stock insuficiente. Disponible: {$product->current_stock_product}"
                );
            }
        });
    }
}
