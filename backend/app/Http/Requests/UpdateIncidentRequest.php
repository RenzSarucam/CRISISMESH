<?php

namespace App\Http\Requests;

use App\Models\Incident;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateIncidentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('update', $this->route('incident')) ?? false;
    }

    public function rules(): array
    {
        return [
            'type' => ['sometimes', Rule::in(Incident::TYPES)],
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'latitude' => ['sometimes', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'numeric', 'between:-180,180'],
            'location_accuracy' => ['nullable', 'numeric'],
            'severity' => ['sometimes', Rule::in(Incident::SEVERITIES)],
            'status' => ['sometimes', Rule::in(Incident::STATUSES)],
        ];
    }
}
