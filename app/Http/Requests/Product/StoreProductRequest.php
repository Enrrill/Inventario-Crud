<?php

namespace App\Http\Requests\Product;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreProductRequest extends FormRequest
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
            'sku_product' => ['required', 'string', 'max:50', 'unique:products,sku_product'],
            'name_product' => ['required', 'string', 'max:200'],
            'description_product' => ['nullable', 'string'],
            'category_id' => ['required', 'exists:categories,id'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'unit_price_product' => ['required', 'numeric', 'min:0'],
            'unit_of_measure_product' => ['required', 'string', 'max:50'],
            'minimum_stock_product' => ['required', 'integer', 'min:0'],
            'current_stock_product' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
