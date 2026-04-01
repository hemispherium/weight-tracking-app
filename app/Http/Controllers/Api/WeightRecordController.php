<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WeightRecord;
use Illuminate\Http\Request;

class WeightRecordController extends Controller
{
    public function index(Request $request)
    {
        return $request->user()->weightRecords()->orderBy('date', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date'      => 'required|date',
            'weight'    => 'required|numeric|min:0',
            'body_fat'  => 'nullable|numeric|min:0|max:100',
            'emoji'     => 'nullable|string',
            'memo'      => 'nullable|string',
            'image_url' => 'nullable|url',
        ]);

        $record = $request->user()->weightRecords()->updateOrCreate(
            ['date' => $validated['date']],
            $validated
        );

        return response()->json($record, 201);
    }

    public function show(Request $request, string $id)
    {
        return $request->user()->weightRecords()->findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $record = $request->user()->weightRecords()->findOrFail($id);

        $validated = $request->validate([
            'date'      => 'sometimes|date',
            'weight'    => 'sometimes|numeric|min:0',
            'body_fat'  => 'nullable|numeric|min:0|max:100',
            'emoji'     => 'nullable|string',
            'memo'      => 'nullable|string',
            'image_url' => 'nullable|url',
        ]);

        $record->update($validated);

        return response()->json($record);
    }

    public function destroy(Request $request, string $id)
    {
        $request->user()->weightRecords()->findOrFail($id)->delete();

        return response()->json(null, 204);
    }
}
