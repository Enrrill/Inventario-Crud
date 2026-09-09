<?php

namespace App\Http\Requests\Product;

use App\Services\TextNormalizer;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'sku_product' => isset($this->sku_product) ? TextNormalizer::normalizeSku($this->sku_product) : $this->sku_product,
            'name_product' => isset($this->name_product) ? TextNormalizer::normalizeName($this->name_product) : $this->name_product,
            'description_product' => isset($this->description_product) ? TextNormalizer::normalizeText($this->description_product) : $this->description_product,
        ]);
    }

    /**
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        $productId = $this->route('product')?->id;

        return [
            'sku_product' => [
                'required',
                'string',
                'max:50',
                Rule::unique('products', 'sku_product')->ignore($productId),
            ],
            'name_product' => ['required', 'string', 'max:200'],
            'description_product' => ['nullable', 'string'],
            'category_id' => ['required', 'exists:categories,id'],
            'supplier_id' => ['nullable', 'exists:suppliers,id'],
            'unit_price_product' => ['required', 'numeric', 'min:0'],
            'unit_of_measure_product' => ['required', 'string', 'max:50'],
            'minimum_stock_product' => ['required', 'integer', 'min:0'],
            'is_active_product' => ['boolean'],
        ];
    }
}
