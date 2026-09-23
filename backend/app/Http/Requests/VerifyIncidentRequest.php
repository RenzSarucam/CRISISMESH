<?php

namespace App\Http\Requests;

use App\Models\Incident;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class VerifyIncidentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('verify', $this->route('incident')) ?? false;
    }

    public function rules(): array
    {
        return [
            'verification_status' => ['required', Rule::in(Incident::VERIFICATION_STATUSES)],
            'note' => ['nullable', 'string'],
        ];
    }
}
