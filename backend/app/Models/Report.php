<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = [
        'user_id', 'company_name', 'address', 'company_type', 'employee_count',
        'location', 'year', 'period_type', 'period_start', 'period_end',
        'carbon_emission', 'energy_consumption', 'renewable_energy_pct',
        'social_score', 'governance_score',
        'employee_training_count', 'employee_training_hours',
        'women_percentage', 'customer_complaints',
        'has_internal_audit', 'has_fraud_policy', 'has_anti_corruption',
        'legal_cases', 'report_on_time',
        'has_audit', 'has_complete_legality', 'has_regulatory_violations', 'has_esg_report',
        'revenue', 'net_profit', 'total_assets', 'total_liabilities',
        'total_equity', 'operational_expenses', 'cash_and_equivalents',
        'report_file_path', 'report_type', 'status', 'notes',
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