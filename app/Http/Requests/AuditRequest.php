<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AuditRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['nullable', 'exists:users,id'],
            'auditable_type' => ['nullable', 'string'],
            'event' => ['nullable', Rule::in(['created', 'updated', 'deleted'])],
            'date_from' => ['nullable', 'date'],
            'date_to' => ['nullable', 'date', 'after_or_equal:date_from'],
        ];
    }
}
