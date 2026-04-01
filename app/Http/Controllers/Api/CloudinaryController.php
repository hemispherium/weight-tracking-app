<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CloudinaryController extends Controller
{
    public function signature(Request $request)
    {
        $request->validate([
            'date'   => 'required|date',
            'weight' => 'required|numeric',
            'label'  => 'nullable|string|max:50',
        ]);

        $user      = $request->user();
        $date      = $request->input('date');           // 例: 2026-04-01
        $weight    = $request->input('weight');
        $label     = $request->input('label', '');
        $env       = config('app.env') === 'production' ? 'weight_app_prod' : 'weight_app_dev';

        // フォルダ: weight_app_dev/<user_id>/<YYYY-MM-DD>/
        $folder    = "{$env}/{$user->id}/{$date}";

        // ファイル名: <YYYYMMDD>_<体重>kg[_<ラベル>]
        $yyyymmdd  = str_replace('-', '', $date);
        $weightStr = str_replace('.', '_', $weight) . 'kg';
        $filename  = $label
            ? "{$yyyymmdd}_{$weightStr}_{$label}"
            : "{$yyyymmdd}_{$weightStr}";

        $publicId  = "{$folder}/{$filename}";

        $timestamp = time();
        $apiSecret = config('services.cloudinary.api_secret');
        $apiKey    = config('services.cloudinary.api_key');
        $cloudName = config('services.cloudinary.cloud_name');

        $params = [
            'public_id' => $publicId,
            'timestamp' => $timestamp,
        ];
        ksort($params);

        $parts = [];
        foreach ($params as $key => $value) {
            $parts[] = "{$key}={$value}";
        }
        $paramStr  = implode('&', $parts);
        $signature = hash('sha256', $paramStr . $apiSecret);

        return response()->json([
            'signature'  => $signature,
            'timestamp'  => $timestamp,
            'api_key'    => $apiKey,
            'cloud_name' => $cloudName,
            'public_id'  => $publicId,
        ]);
    }
}
