<?php

namespace App\Http\Requests;

use App\Models\SosRequest;
use Illuminate\Foundation\Http\FormRequest;

class StoreSosRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', SosRequest::class) ?? false;
    }

    public function rules(): array
    {
        return [
            'uuid' => ['nullable', 'uuid'],
            'device_id' => ['nullable', 'string'],
            'latitude' => ['required', 'numeric', 'between:-90,90'],
            'longitude' => ['required', 'numeric', 'between:-180,180'],
            'battery_percent' => ['nullable', 'integer', 'between:0,100'],
            'network_status' => ['nullable', 'string'],
            'message' => ['nullable', 'string'],
        ];
    }
}
