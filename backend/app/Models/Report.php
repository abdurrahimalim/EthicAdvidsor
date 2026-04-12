<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = [
        'user_id', 'company_name', 'year',
        'carbon_emission', 'social_score', 'governance_score',
        'revenue', 'net_profit', 'total_assets', 'status'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function esgScore()
    {
        return $this->hasOne(EsgScore::class);
    }

    public function regulations()
    {
        return $this->hasMany(Regulation::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }
}