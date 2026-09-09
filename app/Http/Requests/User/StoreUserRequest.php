<?php

namespace App\Http\Requests\User;

use App\Enums\UserRole;
use App\Services\TextNormalizer;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class StoreUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'name' => isset($this->name) ? TextNormalizer::normalizeName($this->name) : $this->name,
            'email' => isset($this->email) ? TextNormalizer::normalizeEmail($this->email) : $this->email,
        ]);
    }

    /**
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed', Password::defaults()],
            'role' => ['required', Rule::enum(UserRole::class)],
        ];
    }
}
