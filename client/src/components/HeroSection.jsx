import React from 'react';
import { ArrowUpRight, Clock, ShieldCheck, Sparkles, Navigation } from 'lucide-react';

export default function HeroSection({ impactSummary, onExplore }) {
  return (
    <section className="relative overflow-hidden pt-12 pb-14 border-b border-[#E8E6DF] bg-gradient-to-b from-[#F7F6F0] to-[#FBFBF9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Main Title & Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-full text-xs text-amber-900 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Algorithmic Matching Engine v2.4 Active</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-[#181C24] leading-[1.08] tracking-tight">
              Routing surplus banquet harvests to active hunger shelters in real time.
            </h1>

            <p className="text-base sm:text-lg text-[#5A5E67] max-w-2xl leading-relaxed">
              Every evening, commercial kitchens and event banquets produce surplus untouched food. 
              SurplusLink computes real-time geodesic proximity, shelf-life decay, and intake capacity to coordinate immediate driver pickup.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExplore}
                className="inline-flex items-center space-x-2 bg-[#0C49A2] hover:bg-[#083575] text-white px-6 py-3 rounded-full text-sm font-medium transition-all shadow-sm hover:shadow"
              >
                <span>View Urgent Surplus Listings</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2 text-xs text-[#6A6E78] font-mono">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>FSSAI Hygiene & Temperature Audited</span>
              </div>
            </div>
          </div>

          {/* Telemetry Telemetrics Card */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-[#E0DED4] p-6 rounded-3xl shadow-sm space-y-5 relative">
              <div className="flex items-center justify-between pb-3 border-b border-[#F0EEE6]">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#8A8E98]">Redistribution Telemetry</span>
                  <h3 className="font-display text-xl text-[#181C24]">Chennai Regional Node</h3>
                </div>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
                  Live Dispatch
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#EDEBE1]">
                  <p className="text-xs text-[#7A7E88]">Total Food Rescued</p>
                  <p className="text-2xl font-mono font-bold text-[#0C49A2] mt-1">
                    {impactSummary?.total_kg_rescued || 128} <span className="text-xs font-normal text-[#5A5E67]">kg</span>
                  </p>
                  <p className="text-[11px] text-[#8A8E98] mt-1">~{impactSummary?.total_meals_served || 320} meals provided</p>
                </div>

                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#EDEBE1]">
                  <p className="text-xs text-[#7A7E88]">CO2 Offset Equivalent</p>
                  <p className="text-2xl font-mono font-bold text-emerald-700 mt-1">
                    {impactSummary?.total_co2_kg || 320} <span className="text-xs font-normal text-[#5A5E67]">kg</span>
                  </p>
                  <p className="text-[11px] text-[#8A8E98] mt-1">Landfill methane avoided</p>
                </div>

                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#EDEBE1]">
                  <p className="text-xs text-[#7A7E88]">Water Conserved</p>
                  <p className="text-2xl font-mono font-bold text-cyan-700 mt-1">
                    {((impactSummary?.total_water_liters || 153600) / 1000).toFixed(1)}k <span className="text-xs font-normal text-[#5A5E67]">L</span>
                  </p>
                  <p className="text-[11px] text-[#8A8E98] mt-1">Virtual water footprint</p>
                </div>

                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#EDEBE1]">
                  <p className="text-xs text-[#7A7E88]">Average Dispatch Time</p>
                  <p className="text-2xl font-mono font-bold text-[#181C24] mt-1">
                    18.4 <span className="text-xs font-normal text-[#5A5E67]">min</span>
                  </p>
                  <p className="text-[11px] text-[#8A8E98] mt-1">From alert to pickup</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-[#7A7E88] font-mono">
                <span className="flex items-center space-x-1">
                  <Navigation className="w-3.5 h-3.5 text-[#0C49A2]" />
                  <span>Max Radius: 25 km</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  <span>Median Decay Window: 4.2h</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
