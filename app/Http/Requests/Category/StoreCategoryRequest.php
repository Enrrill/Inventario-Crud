<?php

namespace App\Http\Requests\Category;

use App\Services\TextNormalizer;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name_category' => isset($this->name_category) ? TextNormalizer::normalizeName($this->name_category) : $this->name_category,
            'description_category' => isset($this->description_category) ? TextNormalizer::normalizeText($this->description_category) : $this->description_category,
        ]);
    }

    /**
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        return [
            'name_category' => ['required', 'string', 'max:100'],
            'description_category' => ['nullable', 'string'],
            'parent_category_id' => ['nullable', 'exists:categories,id'],
        ];
    }
}
