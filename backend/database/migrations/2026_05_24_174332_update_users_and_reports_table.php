<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Update users table
        Schema::table('users', function (Blueprint $table) {
            $table->enum('user_type', ['auditor', 'perusahaan_fintech'])->default('perusahaan_fintech')->after('role');
            $table->string('company_name')->nullable()->after('user_type');
            $table->string('company_type')->nullable()->after('company_name');
            $table->string('location')->nullable()->after('company_type');
        });

        // Update reports table
        Schema::table('reports', function (Blueprint $table) {
            // Informasi Perusahaan tambahan
            $table->string('company_type')->nullable()->after('company_name');
            $table->integer('employee_count')->nullable()->after('company_type');
            $table->string('location')->nullable()->after('employee_count');
            $table->string('period_type')->nullable()->after('location'); // tahunan/semester/kuartal
            $table->date('period_start')->nullable()->after('period_type');
            $table->date('period_end')->nullable()->after('period_start');

            // Data keuangan tambahan
            $table->decimal('total_liabilities', 15, 2)->default(0)->after('total_assets');
            $table->decimal('total_equity', 15, 2)->default(0)->after('total_liabilities');
            $table->decimal('operational_expenses', 15, 2)->default(0)->after('total_equity');
            $table->decimal('cash_and_equivalents', 15, 2)->default(0)->after('operational_expenses');
            $table->string('report_file_path')->nullable()->after('cash_and_equivalents');

            // Data ESG Environmental
            $table->float('energy_consumption')->nullable()->after('carbon_emission');
            $table->float('renewable_energy_pct')->nullable()->after('energy_consumption');

            // Data ESG Social
            $table->integer('employee_training_count')->nullable();
            $table->float('employee_training_hours')->nullable();
            $table->float('women_percentage')->nullable();
            $table->integer('customer_complaints')->nullable();

            // Data ESG Governance
            $table->boolean('has_internal_audit')->default(false);
            $table->boolean('has_fraud_policy')->default(false);
            $table->boolean('has_anti_corruption')->default(false);
            $table->integer('legal_cases')->nullable();
            $table->boolean('report_on_time')->default(false);

            // Data Kepatuhan OJK
            $table->boolean('has_audit')->default(false);
            $table->boolean('has_complete_legality')->default(false);
            $table->boolean('has_regulatory_violations')->default(false);
            $table->boolean('has_esg_report')->default(false);

            // Pilihan laporan
            $table->enum('report_type', ['financial', 'esg', 'both'])->default('both');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['user_type', 'company_name', 'company_type', 'location']);
        });
        Schema::table('reports', function (Blueprint $table) {
            $table->dropColumn([
                'company_type', 'employee_count', 'location', 'period_type',
                'period_start', 'period_end', 'total_liabilities', 'total_equity',
                'operational_expenses', 'cash_and_equivalents', 'report_file_path',
                'energy_consumption', 'renewable_energy_pct', 'employee_training_count',
                'employee_training_hours', 'women_percentage', 'customer_complaints',
                'has_internal_audit', 'has_fraud_policy', 'has_anti_corruption',
                'legal_cases', 'report_on_time', 'has_audit', 'has_complete_legality',
                'has_regulatory_violations', 'has_esg_report', 'report_type'
            ]);
        });
    }
};