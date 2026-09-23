<?php

namespace App\Http\Requests;

use App\Models\EvacuationCenter;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreEvacuationCenterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', EvacuationCenter::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'uuid' => ['nullable', 'uuid'],
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'capacity' => ['required', 'integer', 'min:0'],
            'current_occupancy' => ['nullable', 'integer', 'min:0'],
            'contact' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', Rule::in(EvacuationCenter::STATUSES)],
            'facilities' => ['nullable', 'array'],
            'verified' => ['nullable', 'boolean'],
        ];
    }
}
