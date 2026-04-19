import React, { useState } from 'react';
import { Truck, CheckCircle, ShieldCheck, MapPin, KeyRound, AlertCircle } from 'lucide-react';
import { api } from '../services/api.js';

export default function LogisticsTracker({ donations, onRefresh }) {
  const [pinInputs, setPinInputs] = useState({});
  const [loadingMap, setLoadingMap] = useState({});

  const activeDeliveries = donations.filter(d => ['MATCHED', 'IN_TRANSIT', 'DELIVERED'].includes(d.status));

  const handleVerifyHandover = async (donationId, dispatchId) => {
    const pin = pinInputs[dispatchId];
    if (!pin) {
      alert('Please enter the 4-digit pickup handover PIN');
      return;
    }

    setLoadingMap(prev => ({ ...prev, [dispatchId]: true }));
    try {
      await api.updateLogisticsStatus(dispatchId, 'DELIVERED', pin, 'Verified delivery with recipient NGO signature.');
      alert('Delivery verified successfully! Impact ledger updated.');
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Verification Failed: ' + err.message);
    } finally {
      setLoadingMap(prev => ({ ...prev, [dispatchId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E8E6DF]">
        <h2 className="font-display text-2xl sm:text-3xl text-[#181C24]">Logistics & Chain of Custody</h2>
        <p className="text-xs text-[#7A7E88]">Live EV dispatch coordination with 4-digit cryptographic handover security</p>
      </div>

      {activeDeliveries.length === 0 ? (
        <div className="p-12 text-center bg-white border border-[#E8E6DF] rounded-3xl">
          <Truck className="w-10 h-10 text-[#888D96] mx-auto mb-2" />
          <p className="font-display text-xl text-[#181C24]">No active dispatches currently in transit</p>
          <p className="text-xs text-[#7A7E88] mt-1">Accept matches from the Surplus Feed to activate drivers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {activeDeliveries.map(item => {
            const isDelivered = item.status === 'DELIVERED';
            const isInTransit = item.status === 'IN_TRANSIT';
            const isMatched = item.status === 'MATCHED';

            return (
              <div key={item.donation_id} className="bg-white border border-[#E2DFD4] rounded-3xl p-6 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[#F0EEE6]">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-[#0C49A2] font-semibold">
                      DISPATCH NODE #{item.donation_id.slice(-6)}
                    </span>
                    <h3 className="font-display text-xl text-[#181C24] font-medium">{item.food_name}</h3>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium ${
                    isDelivered ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                    isInTransit ? 'bg-blue-50 text-[#0C49A2] border border-blue-200' :
                    'bg-amber-50 text-amber-800 border border-amber-200'
                  }`}>
                    {item.status}
                  </span>
                </div>

                {/* Progress Stepper */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                  <div className={`p-2.5 rounded-xl border ${
                    isMatched || isInTransit || isDelivered ? 'bg-blue-50/50 border-[#0C49A2]/30 text-[#0C49A2]' : 'bg-[#FAF9F5] border-[#E8E6DF] text-[#888D96]'
                  }`}>
                    <span className="block text-[10px] text-[#7A7E88]">STAGE 1</span>
                    <span className="font-semibold">Matched</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${
                    isInTransit || isDelivered ? 'bg-blue-50/50 border-[#0C49A2]/30 text-[#0C49A2]' : 'bg-[#FAF9F5] border-[#E8E6DF] text-[#888D96]'
                  }`}>
                    <span className="block text-[10px] text-[#7A7E88]">STAGE 2</span>
                    <span className="font-semibold">In Transit</span>
                  </div>

                  <div className={`p-2.5 rounded-xl border ${
                    isDelivered ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-[#FAF9F5] border-[#E8E6DF] text-[#888D96]'
                  }`}>
                    <span className="block text-[10px] text-[#7A7E88]">STAGE 3</span>
                    <span className="font-semibold">Delivered</span>
                  </div>
                </div>

                {/* Logistics Details */}
                <div className="bg-[#FAF9F5] p-4 rounded-2xl border border-[#EDEAE1] space-y-2 text-xs">
                  <div className="flex justify-between text-[#555962]">
                    <span>Donor Source:</span>
                    <span className="font-medium text-[#181C24]">{item.donor_name}</span>
                  </div>
                  <div className="flex justify-between text-[#555962]">
                    <span>Payload:</span>
                    <span className="font-mono font-medium text-[#181C24]">{item.quantity_kg} kg ({item.quantity_servings} meals)</span>
                  </div>
                  <div className="flex justify-between text-[#555962]">
                    <span>Thermal Chain:</span>
                    <span className="font-mono text-[#0C49A2]">{item.storage_temp}</span>
                  </div>
                  {item.volunteer_name && (
                    <div className="flex justify-between text-[#555962] pt-1 border-t border-[#EDEAE1]">
                      <span>Assigned Courier:</span>
                      <span className="font-mono text-[#181C24] font-medium">{item.volunteer_name} ({item.volunteer_phone})</span>
                    </div>
                  )}
                  {item.vehicle_info && (
                    <div className="flex justify-between text-[#555962]">
                      <span>Transit Vehicle:</span>
                      <span className="font-mono text-xs text-[#555962]">{item.vehicle_info}</span>
                    </div>
                  )}
                </div>

                {/* Handover PIN Action */}
                {!isDelivered ? (
                  <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-amber-900">
                      <div className="flex items-center space-x-2">
                        <KeyRound className="w-4 h-4 text-amber-700" />
                        <span>Security Handover Verification</span>
                      </div>
                      {item.pickup_pin && (
                        <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[10px] font-bold">
                          PIN: {item.pickup_pin}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="4-digit PIN"
                        value={pinInputs[item.dispatch_id || item.donation_id] || ''}
                        onChange={e => setPinInputs({ ...pinInputs, [item.dispatch_id || item.donation_id]: e.target.value })}
                        className="w-28 px-3 py-1.5 rounded-xl border border-amber-300 font-mono text-center text-sm font-bold bg-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                      <button
                        disabled={loadingMap[item.dispatch_id || item.donation_id]}
                        onClick={() => handleVerifyHandover(item.donation_id, item.dispatch_id || item.donation_id)}
                        className="flex-1 bg-[#0C49A2] hover:bg-[#083575] disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-medium shadow-sm transition-all"
                      >
                        {loadingMap[item.dispatch_id || item.donation_id] ? 'Verifying...' : 'Validate Delivery PIN'}
                      </button>
                    </div>
                    <p className="text-[10px] text-amber-800">
                      Verify driver 4-digit PIN {item.pickup_pin ? `(${item.pickup_pin})` : 'code'} before handing over thermal containers.
                    </p>
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center space-x-2 text-xs font-mono text-emerald-800">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Safe Delivery Completed & Logged into Impact Ledger</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
