import React, { useState, useEffect } from 'react';
import { Building2, ShieldCheck, MapPin, Phone, Mail, Users } from 'lucide-react';
import { api } from '../services/api.js';

export default function NgoDirectory() {
  const [ngos, setNgos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getNgos()
      .then(data => setNgos(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E8E6DF]">
        <h2 className="font-display text-2xl sm:text-3xl text-[#181C24]">Verified Receiver Network</h2>
        <p className="text-xs text-[#7A7E88]">FSSAI certified hunger shelters, orphanages, and community feeding partners</p>
      </div>

      {loading ? (
        <div className="text-center py-12 font-mono text-xs text-[#7A7E88]">Loading verified NGOs...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ngos.map(ngo => (
            <div key={ngo.ngo_id} className="bg-white border border-[#E2DFD4] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#0C49A2] font-semibold">
                    REG: {ngo.reg_number}
                  </span>
                  <h3 className="font-display text-xl text-[#181C24] font-medium mt-0.5">{ngo.name}</h3>
                </div>
                <span className="p-1 rounded-full bg-emerald-50 text-emerald-600">
                  <ShieldCheck className="w-5 h-5" />
                </span>
              </div>

              <div className="space-y-2 text-xs text-[#555962]">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-3.5 h-3.5 text-[#0C49A2] shrink-0" />
                  <span>{ngo.address}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{ngo.active_beneficiaries} Active Beneficiaries</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>{ngo.contact_person} • {ngo.phone}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F0EEE6]">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#8A8E98] block">Daily Intake Capacity</span>
                <span className="font-mono text-lg font-bold text-[#0C49A2]">{ngo.daily_intake_capacity_kg} kg/day</span>
                <p className="text-[11px] text-[#7A7E88] mt-1">Accepts: {ngo.preferred_food_types}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
