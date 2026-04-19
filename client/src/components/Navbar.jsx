import React from 'react';
import { Utensils, HeartHandshake, Truck, BarChart3, Building2, Plus, Sparkles } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenRegister, impactSummary }) {
  const tabs = [
    { id: 'donations', label: 'Surplus Feed', icon: Utensils },
    { id: 'demand', label: 'Demand Prediction (Slide 7)', icon: Sparkles },
    { id: 'logistics', label: 'Dispatch Tracking', icon: Truck },
    { id: 'impact', label: 'Impact Ledger', icon: BarChart3 },
    { id: 'ngos', label: 'Verified Receivers', icon: Building2 }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#FBFBF9]/90 backdrop-blur-md border-b border-[#E8E6DF]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Tagline */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('donations')}>
            <div className="w-10 h-10 rounded-full bg-[#0C49A2] flex items-center justify-center text-white shadow-sm">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-display text-2xl tracking-tight text-[#0C49A2] font-semibold">SurplusLink</span>
                <span className="text-[10px] uppercase tracking-widest font-mono bg-[#EBF1FA] text-[#0C49A2] px-2 py-0.5 rounded-full font-medium">ASQL Edition</span>
              </div>
              <p className="text-xs text-[#6F737B] hidden sm:block">Smart Algorithmic Food Redistribution</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#F0EEE6] p-1.5 rounded-full border border-[#E3E1D7]">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-full text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-white text-[#0C49A2] shadow-sm font-semibold'
                      : 'text-[#565961] hover:text-[#1F2228] hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Action Button & Telemetry */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex flex-col items-end text-right font-mono text-[11px] text-[#555962] border-r border-[#E3E1D7] pr-3">
              <span className="text-[#0C49A2] font-semibold">{impactSummary?.total_kg_rescued || 128} kg Rescued</span>
              <span className="text-emerald-700">● 5 Shelters Online</span>
            </div>

            <button
              onClick={onOpenRegister}
              className="bg-[#0C49A2] hover:bg-[#083575] text-white px-5 py-2.5 rounded-full text-xs font-medium flex items-center space-x-2 shadow-sm transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>List Surplus Food</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
