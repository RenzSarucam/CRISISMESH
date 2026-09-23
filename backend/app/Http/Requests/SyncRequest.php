<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SyncRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'device_id' => ['nullable', 'string'],
            'operations' => ['required', 'array', 'min:1'],
            'operations.*.operation_id' => ['required', 'string'],
            'operations.*.type' => ['required', 'string', 'in:CREATE_INCIDENT,CREATE_SOS,UPDATE_INCIDENT'],
            'operations.*.payload' => ['required', 'array'],
        ];
    }
}
