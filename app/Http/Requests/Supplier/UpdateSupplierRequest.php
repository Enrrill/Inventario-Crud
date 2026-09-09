<?php

namespace App\Http\Requests\Supplier;

use App\Services\TextNormalizer;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateSupplierRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name_supplier' => isset($this->name_supplier) ? TextNormalizer::normalizeName($this->name_supplier) : $this->name_supplier,
            'contact_name_supplier' => isset($this->contact_name_supplier) ? TextNormalizer::normalizeName($this->contact_name_supplier) : $this->contact_name_supplier,
            'email_supplier' => isset($this->email_supplier) ? TextNormalizer::normalizeEmail($this->email_supplier) : $this->email_supplier,
            'phone_supplier' => isset($this->phone_supplier) ? TextNormalizer::normalizePhone($this->phone_supplier) : $this->phone_supplier,
            'address_supplier' => isset($this->address_supplier) ? TextNormalizer::normalizeText($this->address_supplier) : $this->address_supplier,
        ]);
    }

    /**
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        $supplierId = $this->route('supplier')?->id;

        return [
            'name_supplier' => ['required', 'string', 'max:150'],
            'contact_name_supplier' => ['nullable', 'string', 'max:150'],
            'email_supplier' => [
                'nullable',
                'email',
                'max:255',
                Rule::unique('suppliers', 'email_supplier')->ignore($supplierId),
            ],
            'phone_supplier' => ['nullable', 'string', 'max:50'],
            'address_supplier' => ['nullable', 'string'],
        ];
    }
}
