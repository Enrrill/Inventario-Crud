<?php

namespace App\Http\Requests\Supplier;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreSupplierRequest extends FormRequest
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
            'name_supplier' => ['required', 'string', 'max:150'],
            'contact_name_supplier' => ['nullable', 'string', 'max:150'],
            'email_supplier' => ['nullable', 'email', 'max:255', 'unique:suppliers,email_supplier'],
            'phone_supplier' => ['nullable', 'string', 'max:50'],
            'address_supplier' => ['nullable', 'string'],
        ];
    }
}
