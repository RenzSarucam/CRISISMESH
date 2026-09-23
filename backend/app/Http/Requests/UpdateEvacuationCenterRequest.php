<?php

namespace App\Http\Requests;

use App\Models\EvacuationCenter;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateEvacuationCenterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('evacuation_center')) ?? false;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'latitude' => ['sometimes', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'numeric', 'between:-180,180'],
            'capacity' => ['sometimes', 'integer', 'min:0'],
            'current_occupancy' => ['nullable', 'integer', 'min:0'],
            'contact' => ['nullable', 'string', 'max:255'],
            'status' => ['sometimes', Rule::in(EvacuationCenter::STATUSES)],
            'facilities' => ['nullable', 'array'],
            'verified' => ['nullable', 'boolean'],
        ];
    }
}
