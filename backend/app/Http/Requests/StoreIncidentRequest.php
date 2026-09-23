<?php

namespace App\Http\Requests;

use App\Models\Incident;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreIncidentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'uuid' => ['nullable', 'uuid'],
            'device_id' => ['nullable', 'string'],
            'type' => ['required', Rule::in(Incident::TYPES)],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'location_accuracy' => ['nullable', 'numeric'],
            'severity' => ['required', Rule::in(Incident::SEVERITIES)],
            'source' => ['nullable', Rule::in(Incident::SOURCES)],
            'created_offline' => ['nullable', 'boolean'],
        ];
    }
}
