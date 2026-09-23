<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AssignIncidentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('assign', $this->route('incident')) ?? false;
    }

    public function rules(): array
    {
        return [
            'responder_id' => ['required', 'uuid', 'exists:users,id'],
        ];
    }
}
