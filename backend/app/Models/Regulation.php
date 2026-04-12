<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Regulation extends Model
{
    protected $fillable = [
        'report_id', 'name', 'status', 'score'
    ];

    public function report()
    {
        return $this->belongsTo(Report::class);
    }
}