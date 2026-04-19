import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, Utensils, AlertTriangle, ShieldCheck, RefreshCw, Sparkles, MapPin, BarChart2 } from 'lucide-react';
import { api } from '../services/api.js';

export default function DemandPredictionView() {
  const [demandData, setDemandData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testSurplusKg, setTestSurplusKg] = useState(40);

  useEffect(() => {
    loadDemand();
  }, []);

  async function loadDemand() {
    setLoading(true);
    try {
      const data = await api.getDemandPrediction();
      setDemandData(data);
    } catch (err) {
      console.error('Failed to load demand prediction data:', err);
    } finally {
      setLoading(false);
    }
  }

  const totals = demandData?.totals || {
    total_predicted_demand_kg: 540.0,
    total_fulfilled_today_kg: 210.0,
    total_unmet_gap_kg: 330.0,
    total_beneficiaries: 1410
  };

  const forecasts = demandData?.forecasts || [];

  return (
    <div className="space-y-8">
      {/* Overview Banner */}
      <div className="bg-[#FAF9F5] border border-[#E3DFD5] rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAE7DC] pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-2 bg-[#EBF1FA] text-[#0C49A2] text-xs font-mono px-3 py-1 rounded-full font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Slide 7 &amp; 8 Architecture: Algorithmic Demand Prediction</span>
            </div>
            <h2 className="font-display text-3xl font-bold text-[#181C24] tracking-tight">
              Receiver Demand Forecasting &amp; Deficit Analytics
            </h2>
            <p className="text-sm text-[#555962] max-w-3xl leading-relaxed">
              Analyzes historical intake logs, resident headcount, dietary requirements, and meal-slot schedules to estimate daily food requirements and prioritize distributions before expiration.
            </p>
          </div>

          <button
            onClick={loadDemand}
            className="self-start md:self-auto px-4 py-2 bg-white hover:bg-[#F2EFE8] border border-[#D5D1C7] text-[#181C24] font-mono text-xs font-medium rounded-full flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Telemetry</span>
          </button>
        </div>

        {/* Global Demand KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="bg-white p-5 rounded-2xl border border-[#E8E5DC] shadow-sm space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#7A7E88] font-bold block">
              Daily Predicted Intake
            </span>
            <div className="font-display text-3xl font-bold text-[#181C24]">
              {totals.total_predicted_demand_kg} <span className="text-sm font-mono font-normal text-[#7A7E88]">kg/day</span>
            </div>
            <span className="text-xs text-emerald-700 font-mono flex items-center pt-1">
              <TrendingUp className="w-3.5 h-3.5 mr-1" /> Multi-shelter aggregate
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E5DC] shadow-sm space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#7A7E88] font-bold block">
              Fulfilled Today
            </span>
            <div className="font-display text-3xl font-bold text-[#0C49A2]">
              {totals.total_fulfilled_today_kg} <span className="text-sm font-mono font-normal text-[#7A7E88]">kg</span>
            </div>
            <div className="w-full bg-[#EAE7DC] h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-[#0C49A2] h-full"
                style={{ width: `${Math.min(100, (totals.total_fulfilled_today_kg / Math.max(1, totals.total_predicted_demand_kg)) * 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E5DC] shadow-sm space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#7A7E88] font-bold block">
              Active Unmet Food Gap
            </span>
            <div className="font-display text-3xl font-bold text-[#B3261E]">
              {totals.total_unmet_gap_kg} <span className="text-sm font-mono font-normal text-[#7A7E88]">kg</span>
            </div>
            <span className="text-xs text-[#B3261E] font-mono flex items-center pt-1">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Critical dinner demand deficit
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E5DC] shadow-sm space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#7A7E88] font-bold block">
              Beneficiaries Supported
            </span>
            <div className="font-display text-3xl font-bold text-[#181C24]">
              {totals.total_beneficiaries} <span className="text-sm font-mono font-normal text-[#7A7E88]">residents</span>
            </div>
            <span className="text-xs text-[#555962] font-mono flex items-center pt-1">
              <Users className="w-3.5 h-3.5 mr-1" /> Across 5 verified NGO partners
            </span>
          </div>
        </div>
      </div>

      {/* Real-time Shelter Forecast Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl font-bold text-[#181C24]">
            Shelter-Level Predicted Demand &amp; Deficit Status
          </h3>
          <span className="text-xs font-mono text-[#7A7E88]">
            Updated hourly via historical ingestion
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {forecasts.map(fc => {
            const fulfillmentPct = Math.round((fc.current_fulfilled_today_kg / Math.max(1, fc.daily_predicted_demand_kg)) * 100);
            return (
              <div
                key={fc.forecast_id}
                className="bg-white border border-[#E3DFD5] rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#0C49A2]/40 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-md bg-[#F4F1EA] text-[#484C56] font-semibold">
                      {fc.meal_slot} Shift
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase ${
                        fc.urgency_level === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-900 border border-rose-300'
                          : fc.urgency_level === 'HIGH'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      {fc.urgency_level} Priority
                    </span>
                  </div>

                  <div>
                    <h4 className="font-display text-xl text-[#181C24] font-semibold">{fc.ngo_name}</h4>
                    <p className="text-xs font-mono text-[#7A7E88] flex items-center mt-0.5">
                      <MapPin className="w-3 h-3 mr-1 text-[#0C49A2]" />
                      <span>{fc.ngo_address}</span>
                    </p>
                  </div>

                  {/* Demand telemetry bars */}
                  <div className="space-y-2 pt-2 border-t border-[#F0ECE1]">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#555962]">Daily Predicted Need:</span>
                      <span className="font-bold text-[#181C24]">{fc.daily_predicted_demand_kg} kg</span>
                    </div>

                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#555962]">Unmet Deficit Gap:</span>
                      <span className="font-bold text-[#B3261E]">{fc.unmet_gap_kg} kg</span>
                    </div>

                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#7A7E88]">
                        <span>Fulfillment: {fulfillmentPct}%</span>
                        <span>{fc.current_fulfilled_today_kg} / {fc.daily_predicted_demand_kg} kg</span>
                      </div>
                      <div className="w-full bg-[#EAE7DC] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#0C49A2] h-full rounded-full transition-all"
                          style={{ width: `${Math.min(100, fulfillmentPct)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#F0ECE1] flex items-center justify-between text-xs font-mono text-[#555962]">
                  <span className="flex items-center space-x-1">
                    <Users className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{fc.active_beneficiaries} residents</span>
                  </span>
                  <span className="text-[#0C49A2] font-semibold">
                    +{fc.historical_consumption_trend}% trend
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
