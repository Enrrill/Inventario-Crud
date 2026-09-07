<?php

namespace App\Http\Requests\Category;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
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
        $categoryId = $this->route('category')?->id;

        return [
            'name_category' => ['required', 'string', 'max:100'],
            'description_category' => ['nullable', 'string'],
            'parent_category_id' => [
                'nullable',
                'exists:categories,id',
                Rule::notIn([$categoryId]),
            ],
        ];
    }
}
