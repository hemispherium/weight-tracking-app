<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WeightRecord extends Model
{
    protected $fillable = ['date', 'weight', 'body_fat', 'emoji', 'memo'];
}
