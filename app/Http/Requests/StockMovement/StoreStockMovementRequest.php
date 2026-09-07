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
            'type' => ['required', Rule::enum(StockMovementType::class)],
            'quantity' => ['required', 'integer', 'min:1'],
            'reference' => ['nullable', 'string', 'max:100'],
            'notes' => ['nullable', 'string'],
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
            'type.required' => 'Debe seleccionar un tipo de movimiento.',
            'type.enum' => 'El tipo de movimiento no es válido.',
            'quantity.required' => 'La cantidad es obligatoria.',
            'quantity.integer' => 'La cantidad debe ser un número entero.',
            'quantity.min' => 'La cantidad debe ser al menos 1.',
        ];
    }

    /**
     * Validate stock availability for exit movements.
     */
    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            if ($validator->errors()->hasAny(['product_id', 'type', 'quantity'])) {
                return;
            }

            $product = Product::find($this->product_id);

            if ($this->type === StockMovementType::Exit && $this->quantity > $product->current_stock) {
                $validator->errors()->add(
                    'quantity',
                    "Stock insuficiente. Disponible: {$product->current_stock}"
                );
            }
        });
    }
}
