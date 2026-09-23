<?php

namespace App\Http\Requests;

use App\Models\Resource;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreResourceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Resource::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'uuid' => ['nullable', 'uuid'],
            'name' => ['required', 'string', 'max:255'],
            'type' => ['required', Rule::in(Resource::TYPES)],
            'description' => ['nullable', 'string'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'availability' => ['nullable', Rule::in(Resource::AVAILABILITIES)],
            'quantity' => ['nullable', 'integer'],
            'contact' => ['nullable', 'string', 'max:255'],
            'operating_hours' => ['nullable', 'string', 'max:255'],
            'verified' => ['nullable', 'boolean'],
        ];
    }
}
