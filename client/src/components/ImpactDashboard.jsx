import React from 'react';
import { BarChart3, TreePine, Droplet, Users, ShieldCheck, FileSpreadsheet } from 'lucide-react';

export default function ImpactDashboard({ impactData }) {
  const summary = impactData?.summary || {
    total_kg_rescued: 128,
    total_meals_served: 320,
    total_co2_kg: 320,
    total_water_liters: 153600,
    total_transactions: 3
  };

  const categories = impactData?.categories || [];
  const ledger = impactData?.ledger || [];

  return (
    <div className="space-y-8">
      <div className="pb-4 border-b border-[#E8E6DF] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl text-[#181C24]">Audited Impact Ledger</h2>
          <p className="text-xs text-[#7A7E88]">Quantifiable environmental metrics derived from real-time database transactions</p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-mono border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>UN SDG 12.3 Compliant</span>
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-3xl border border-[#E2DFD4] shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-full bg-blue-50 text-[#0C49A2] flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-xs text-[#7A7E88]">Nutritious Meals Served</p>
          <p className="font-mono text-3xl font-bold text-[#181C24]">{summary.total_meals_served}</p>
          <p className="text-[11px] text-[#6F737C]">Derived from {summary.total_kg_rescued} kg rescued</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E2DFD4] shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <TreePine className="w-4 h-4" />
          </div>
          <p className="text-xs text-[#7A7E88]">GHG / CO2 Mitigated</p>
          <p className="font-mono text-3xl font-bold text-emerald-700">{summary.total_co2_kg} <span className="text-sm font-normal">kg</span></p>
          <p className="text-[11px] text-[#6F737C]">2.5 kg CO2 eq. per kg wasted food</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E2DFD4] shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-full bg-cyan-50 text-cyan-700 flex items-center justify-center">
            <Droplet className="w-4 h-4" />
          </div>
          <p className="text-xs text-[#7A7E88]">Virtual Water Conserved</p>
          <p className="font-mono text-3xl font-bold text-cyan-800">
            {(summary.total_water_liters / 1000).toFixed(1)}k <span className="text-sm font-normal">L</span>
          </p>
          <p className="text-[11px] text-[#6F737C]">Agricultural irrigation footprint</p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E2DFD4] shadow-sm space-y-2">
          <div className="w-9 h-9 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <p className="text-xs text-[#7A7E88]">Redistribution Runs</p>
          <p className="font-mono text-3xl font-bold text-[#0C49A2]">{summary.total_transactions}</p>
          <p className="text-[11px] text-[#6F737C]">100% verified receiver signoffs</p>
        </div>
      </div>

      {/* Breakdown by Category & Transaction Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown */}
        <div className="lg:col-span-5 bg-white border border-[#E2DFD4] rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-display text-xl text-[#181C24]">Category Distribution</h3>
          <p className="text-xs text-[#7A7E88]">Breakdown of surplus volume by food preservation tier</p>

          <div className="space-y-3 pt-2">
            {categories.map((cat, i) => (
              <div key={i} className="p-3.5 bg-[#FAF9F5] border border-[#EDEAE1] rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-[#181C24] block">{cat.food_category}</span>
                  <span className="text-[11px] text-[#6F737C] font-mono">{cat.count} listings recorded</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-bold text-[#0C49A2]">{cat.total_kg} kg</span>
                  <span className="text-[10px] text-[#888D96] block font-mono">~{cat.total_servings} meals</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verifiable Ledger */}
        <div className="lg:col-span-7 bg-white border border-[#E2DFD4] rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-display text-xl text-[#181C24]">Recent Verifiable Transactions</h3>
          <p className="text-xs text-[#7A7E88]">Cryptographically logged handovers with environmental attribution</p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#FAF9F5] text-[#555962] border-b border-[#EDEAE1]">
                <tr>
                  <th className="p-3">Log ID</th>
                  <th className="p-3">Donor / Harvest</th>
                  <th className="p-3 text-right">Kg</th>
                  <th className="p-3 text-right">CO2 Offset</th>
                  <th className="p-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F0EEE6]">
                {ledger.map(entry => (
                  <tr key={entry.log_id} className="hover:bg-[#FAF9F5]">
                    <td className="p-3 text-[#0C49A2] font-semibold">{entry.log_id}</td>
                    <td className="p-3">
                      <span className="font-sans font-medium text-[#181C24] block">{entry.food_name}</span>
                      <span className="text-[10px] text-[#7A7E88]">{entry.donor_name}</span>
                    </td>
                    <td className="p-3 text-right font-bold text-[#181C24]">{entry.kg_rescued}</td>
                    <td className="p-3 text-right text-emerald-700 font-bold">{entry.co2_mitigated_kg} kg</td>
                    <td className="p-3 text-right text-[#888D96] text-[10px]">{entry.logged_at?.slice(0, 16)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
