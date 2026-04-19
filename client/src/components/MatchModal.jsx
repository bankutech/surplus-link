import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, MapPin, Users, Truck, ShieldAlert, Award } from 'lucide-react';
import { api } from '../services/api.js';

export default function MatchModal({ donation, onClose, onMatchConfirmed }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [confirmedMatch, setConfirmedMatch] = useState(null);

  useEffect(() => {
    if (donation) {
      loadMatches();
    }
  }, [donation]);

  async function loadMatches() {
    setLoading(true);
    try {
      const data = await api.getMatches(donation.donation_id);
      setMatches(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm(match) {
    setConfirming(true);
    try {
      const result = await api.confirmMatch(donation.donation_id, match.match_id);
      setConfirmedMatch(result);
      if (onMatchConfirmed) onMatchConfirmed(result);
    } catch (err) {
      alert('Error confirming match: ' + err.message);
    } finally {
      setConfirming(false);
    }
  }

  async function handleReject(match) {
    setConfirming(true);
    try {
      await api.rejectMatch(donation.donation_id, match.match_id);
      await loadMatches();
      if (onMatchConfirmed) onMatchConfirmed();
    } catch (err) {
      alert('Error declining match: ' + err.message);
    } finally {
      setConfirming(false);
    }
  }

  if (!donation) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-[#E3DFD5] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-[#EAE7DC] flex items-center justify-between bg-[#FBFBF9]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#EBF1FA] text-[#0C49A2] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0C49A2] font-semibold">Intelligent Matching Engine</span>
              <h3 className="font-display text-2xl text-[#181C24]">Optimal Receiver Scoring</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#7A7E88] hover:text-[#181C24] hover:bg-[#F0EEE6] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Target Donation Context */}
          <div className="bg-[#FAF9F5] border border-[#EAE7DC] p-4 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-xs text-[#7A7E88]">Target Surplus Food</p>
              <p className="font-display text-lg text-[#181C24] font-medium">{donation.food_name}</p>
              <p className="text-xs text-[#555962] font-mono">{donation.quantity_kg} kg • ~{donation.quantity_servings} servings</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-blue-50 text-[#0C49A2] border border-blue-200">
                {donation.food_category}
              </span>
            </div>
          </div>

          {confirmedMatch ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-600 text-white rounded-full mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-display text-2xl text-emerald-950">Donation Handover Dispatched!</h4>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Receiver confirmed. An EV courier has been routed. Please verify the 4-digit handover PIN with the driver before release.
              </p>
              
              <div className="inline-block bg-white p-4 rounded-2xl border border-emerald-300 font-mono shadow-sm">
                <span className="text-[11px] uppercase tracking-widest text-[#666B75] block">Secure Handover PIN</span>
                <span className="text-3xl font-bold tracking-widest text-[#0C49A2]">
                  {confirmedMatch.dispatch?.pickup_pin || '7412'}
                </span>
              </div>

              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="bg-[#0C49A2] text-white px-6 py-2.5 rounded-full text-xs font-medium hover:bg-[#083575]"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          ) : loading ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-8 h-8 border-2 border-[#0C49A2] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs font-mono text-[#7A7E88]">Calculating Haversine distances & intake ratios...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs font-mono text-[#666B75] uppercase tracking-wider">
                Ranked Candidate Receivers ({matches.length})
              </p>

              {matches.map((item, idx) => {
                const isTopRank = idx === 0;
                return (
                  <div
                    key={item.match_id || idx}
                    className={`p-5 rounded-2xl border transition-all ${
                      isTopRank
                        ? 'bg-blue-50/40 border-[#0C49A2]/40 shadow-sm'
                        : 'bg-white border-[#E2DFD4]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                            isTopRank ? 'bg-[#0C49A2] text-white font-bold' : 'bg-[#EAE7DC] text-[#444852]'
                          }`}>
                            RANK #{item.rank || idx + 1}
                          </span>
                          <h4 className="font-display text-lg text-[#181C24] font-medium">{item.ngo_name}</h4>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-[#666B75]">
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-[#0C49A2]" />
                            <span>{item.distance_km} km away</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Users className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{item.active_beneficiaries} residents</span>
                          </span>
                          <span>Cap: {item.daily_intake_capacity_kg} kg/day</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <span className="text-[10px] text-[#7A7E88] block font-mono">MATCH SCORE</span>
                          <span className="font-mono text-xl font-bold text-[#0C49A2]">
                            {item.match_score}%
                          </span>
                        </div>

                        {item.status === 'REJECTED' ? (
                          <span className="text-xs font-mono px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
                            Declined
                          </span>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <button
                              disabled={confirming}
                              onClick={() => handleReject(item)}
                              className="px-3 py-2 border border-[#D5D1C7] text-[#555962] hover:bg-[#F0EEE6] disabled:opacity-50 rounded-full text-xs font-medium transition-all"
                              title="Decline and evaluate next ranked receiver"
                            >
                              Decline
                            </button>
                            <button
                              disabled={confirming}
                              onClick={() => handleConfirm(item)}
                              className="bg-[#0C49A2] hover:bg-[#083575] disabled:opacity-50 text-white px-4 py-2 rounded-full text-xs font-medium shadow-sm transition-transform active:scale-95"
                            >
                              Confirm &amp; Dispatch
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
