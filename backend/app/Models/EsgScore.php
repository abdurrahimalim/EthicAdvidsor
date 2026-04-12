<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class EsgScore extends Model
{
    protected $fillable = [
        'report_id', 'environmental_score', 'social_score',
        'governance_score', 'overall_score', 'ojk_score',
        'carbon_emission', 'profit_margin', 'return_on_assets'
    ];

    public function report()
    {
        return $this->belongsTo(Report::class);
    }
}