<?php

namespace App\Http\Requests\User;

use App\Enums\UserRole;
use App\Models\User;
use App\Services\TextNormalizer;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
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
     * @return array<string, array<int, ValidationRule|\Illuminate\Contracts\Validation\Rule|\Stringable|array<mixed>|string>>
     */
    public function rules(): array
    {
        $user = $this->route('user');
        $userId = $user instanceof User ? $user->id : null;

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'password' => ['nullable', 'string', 'min:8', 'confirmed', Password::defaults()],
            'role' => ['required', Rule::enum(UserRole::class)],
        ];
    }
}
