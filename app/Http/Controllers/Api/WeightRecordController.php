<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WeightRecord;
use Illuminate\Http\Request;

class WeightRecordController extends Controller
{
    public function index()
    {
        return WeightRecord::orderBy('date', 'desc')->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date'     => 'required|date',
            'weight'   => 'required|numeric|min:0',
            'body_fat' => 'nullable|numeric|min:0|max:100',
            'emoji'    => 'nullable|string',
            'memo'     => 'nullable|string',
        ]);

        $record = WeightRecord::updateOrCreate(
            ['date' => $validated['date']],
            $validated
        );

        return response()->json($record, 201);
    }

    public function show(string $id)
    {
        return WeightRecord::findOrFail($id);
    }

    public function update(Request $request, string $id)
    {
        $record = WeightRecord::findOrFail($id);

        $validated = $request->validate([
            'date'     => 'sometimes|date',
            'weight'   => 'sometimes|numeric|min:0',
            'body_fat' => 'nullable|numeric|min:0|max:100',
            'emoji'    => 'nullable|string',
            'memo'     => 'nullable|string',
        ]);

        $record->update($validated);

        return response()->json($record);
    }

    public function destroy(string $id)
    {
        WeightRecord::findOrFail($id)->delete();

        return response()->json(null, 204);
    }
}
