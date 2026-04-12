<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('esg_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained()->onDelete('cascade');
            $table->float('environmental_score');
            $table->float('social_score');
            $table->float('governance_score');
            $table->float('overall_score');
            $table->float('ojk_score')->default(0);
            $table->float('carbon_emission');
            $table->float('profit_margin')->default(0);
            $table->float('return_on_assets')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('esg_scores');
    }
};
