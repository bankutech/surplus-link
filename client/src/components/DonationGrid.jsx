import React, { useState, useEffect } from 'react';
import { Clock, MapPin, Users, Sparkles, AlertTriangle, ArrowRight, ShieldCheck, Thermometer } from 'lucide-react';

function getRemainingTime(expiryStr) {
  const diff = new Date(expiryStr).getTime() - Date.now();
  if (diff <= 0) return { text: 'Expired', urgent: true, hours: 0 };
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  return {
    text: `${hours}h ${minutes}m left`,
    urgent: hours < 3,
    hours
  };
}

export default function DonationGrid({ donations, onSelectDonation, onOpenRegister, loading }) {
  const [filter, setFilter] = useState('ALL');
  const [now, setNow] = useState(Date.now());

  // Tick every 30s to update countdowns
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  const categories = ['ALL', 'Cooked Meals', 'Bakery', 'Fresh Produce'];

  const filtered = donations.filter(d => {
    if (filter === 'ALL') return true;
    return d.food_category === filter;
  });

  return (
    <div className="space-y-6">
      {/* Filters & Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E6DF]">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl text-[#181C24]">Live Surplus Inventory</h2>
          <p className="text-xs text-[#7A7E88]">High-priority perishable listings awaiting NGO claim & driver coordination</p>
        </div>

        <div className="flex items-center space-x-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === cat
                  ? 'bg-[#0C49A2] text-white shadow-sm'
                  : 'bg-white border border-[#DDD9CE] text-[#555962] hover:bg-[#F0EEE6]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-[#E8E6DF] rounded-3xl p-6 space-y-4 animate-pulse">
              <div className="h-6 bg-slate-100 rounded w-1/3"></div>
              <div className="h-8 bg-slate-100 rounded w-3/4"></div>
              <div className="h-16 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white border border-[#E8E6DF] rounded-3xl p-8">
          <p className="font-display text-2xl text-[#181C24]">No active surplus food listed in this category</p>
          <p className="text-xs text-[#7A7E88] mt-2">All registered donations have either been claimed or safely redistributed.</p>
          <button
            onClick={onOpenRegister}
            className="mt-4 inline-flex items-center space-x-2 bg-[#0C49A2] text-white px-5 py-2.5 rounded-full text-xs font-medium"
          >
            <span>List New Surplus Food</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(item => {
            const countdown = getRemainingTime(item.expiry_time);
            const isAvailable = item.status === 'AVAILABLE';

            return (
              <div
                key={item.donation_id}
                className={`bg-white rounded-3xl border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                  countdown.urgent && isAvailable
                    ? 'border-amber-300 ring-1 ring-amber-200'
                    : 'border-[#E2DFD4]'
                }`}
              >
                <div className="p-6 space-y-4">
                  {/* Top Tags */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#EBF1FA] text-[#0C49A2] font-semibold">
                      {item.food_category}
                    </span>

                    <span
                      className={`inline-flex items-center space-x-1 text-xs font-mono px-2.5 py-1 rounded-full ${
                        countdown.urgent
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{countdown.text}</span>
                    </span>
                  </div>

                  {/* Title & Notes */}
                  <div>
                    <h3 className="font-display text-xl text-[#181C24] font-medium leading-snug line-clamp-2">
                      {item.food_name}
                    </h3>
                    <p className="text-xs text-[#6F737C] mt-1.5 line-clamp-2 leading-relaxed">
                      {item.notes || 'No extra donor notes specified.'}
                    </p>
                  </div>

                  {/* Metrics Badges */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#EDEAE1]">
                      <span className="text-[10px] text-[#7A7E88] block">Volume Rescued</span>
                      <span className="font-mono text-base font-bold text-[#0C49A2]">
                        {item.quantity_kg} kg
                      </span>
                    </div>

                    <div className="bg-[#FAF9F5] p-3 rounded-2xl border border-[#EDEAE1]">
                      <span className="text-[10px] text-[#7A7E88] block">Beneficiary Meals</span>
                      <span className="font-mono text-base font-bold text-[#181C24]">
                        ~{item.quantity_servings}
                      </span>
                    </div>
                  </div>

                  {/* Donor & Thermal Specs */}
                  <div className="space-y-1.5 pt-2 text-xs text-[#555962] border-t border-[#F0EEE6]">
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#0C49A2] shrink-0" />
                      <span className="truncate">{item.donor_name} — {item.donor_address}</span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="text-[11px] font-mono text-[#6F737C]">{item.storage_temp} • {item.dietary_tags}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Action Card */}
                <div className="px-6 py-4 bg-[#FAF9F5] border-t border-[#EDEAE1] flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      item.status === 'AVAILABLE' ? 'bg-emerald-500' :
                      item.status === 'MATCHED' ? 'bg-amber-500' :
                      item.status === 'IN_TRANSIT' ? 'bg-blue-500' : 'bg-slate-400'
                    }`}></span>
                    <span className="text-xs font-mono font-medium text-[#444852] uppercase">{item.status}</span>
                  </div>

                  <button
                    onClick={() => onSelectDonation(item)}
                    className="inline-flex items-center space-x-1 text-xs font-medium text-[#0C49A2] hover:text-[#083575] hover:underline"
                  >
                    <span>Match Engine</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
