<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeightRecord extends Model
{
    protected $fillable = ['user_id', 'date', 'weight', 'body_fat', 'emoji', 'memo', 'image_url'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
