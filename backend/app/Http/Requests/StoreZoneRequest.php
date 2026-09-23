<?php

namespace App\Http\Requests;

use App\Models\EmergencyZone;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreZoneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', EmergencyZone::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'uuid' => ['nullable', 'uuid'],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(EmergencyZone::TYPES)],
            'polygon' => ['required', 'array', 'min:3'],
            'polygon.*' => ['array', 'size:2'],
            'description' => ['nullable', 'string'],
            'active' => ['nullable', 'boolean'],
        ];
    }
}
