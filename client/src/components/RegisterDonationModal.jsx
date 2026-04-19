import React, { useState, useEffect } from 'react';
import { X, Utensils, Check, MapPin, Clock, Calendar, Sparkles, AlertCircle } from 'lucide-react';
import { api } from '../services/api.js';

export default function RegisterDonationModal({ isOpen, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    food_name: '',
    food_category: 'Cooked Meals',
    quantity_kg: '',
    quantity_servings: '',
    prep_time: new Date(Date.now() - 3600000).toISOString().slice(0, 16),
    expiry_hours: '4',
    storage_temp: 'Hot-holding (>60C)',
    dietary_tags: 'Vegetarian',
    pickup_address: '63 Mount Road, Guindy, Chennai',
    contact_phone: '+91 44 2220 0000',
    notes: ''
  });
  const [demandData, setDemandData] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      api.getDemandPrediction().then(res => setDemandData(res)).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleKgChange = (e) => {
    const kg = e.target.value;
    const estServings = kg ? Math.round(parseFloat(kg) * 2.5) : '';
    setFormData(prev => ({
      ...prev,
      quantity_kg: kg,
      quantity_servings: estServings
    }));
  };

  const currentKg = parseFloat(formData.quantity_kg) || 0;
  const totalUnmetGap = demandData?.totals?.total_unmet_gap_kg || 195;
  const fulfillmentEstimatePct = currentKg > 0 ? Math.min(100, Math.round((currentKg / Math.max(1, totalUnmetGap)) * 100)) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const kg = parseFloat(formData.quantity_kg);
    if (!formData.food_name.trim() || isNaN(kg) || kg <= 0) {
      alert('Please provide a valid food description and positive surplus quantity in kilograms.');
      return;
    }

    setSubmitting(true);
    try {
      const expiry = new Date(Date.now() + parseFloat(formData.expiry_hours) * 3600000).toISOString();
      const payload = {
        food_name: formData.food_name,
        food_category: formData.food_category,
        quantity_kg: parseFloat(formData.quantity_kg),
        quantity_servings: parseInt(formData.quantity_servings) || Math.round(parseFloat(formData.quantity_kg) * 2.5),
        prep_time: new Date(formData.prep_time).toISOString(),
        expiry_time: expiry,
        storage_temp: formData.storage_temp,
        dietary_tags: formData.dietary_tags,
        pickup_address: formData.pickup_address,
        contact_phone: formData.contact_phone,
        notes: formData.notes
      };

      const result = await api.createDonation(payload);
      if (onCreated) onCreated(result);
      onClose();
    } catch (err) {
      alert('Error creating surplus listing: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-[#E3DFD5] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#EAE7DC] flex items-center justify-between bg-[#FBFBF9]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-[#EBF1FA] text-[#0C49A2] flex items-center justify-center">
              <Utensils className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#0C49A2] font-semibold">
                Slide 7: Food Details Collection
              </span>
              <h3 className="font-display text-2xl text-[#181C24]">List Surplus Harvest</h3>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-[#7A7E88] hover:text-[#181C24] rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#555962] mb-1">
              Food Item / Spread Description *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Executive Buffet: Paneer Butter Masala & Jeera Rice Trays"
              value={formData.food_name}
              onChange={e => setFormData({ ...formData, food_name: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#D8D4C8] text-sm focus:outline-none focus:border-[#0C49A2] bg-[#FAF9F6]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#555962] mb-1">Food Type / Category *</label>
              <select
                value={formData.food_category}
                onChange={e => setFormData({ ...formData, food_category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8D4C8] text-sm focus:outline-none focus:border-[#0C49A2] bg-[#FAF9F6]"
              >
                <option value="Cooked Meals">Cooked Meals (Buffet / Catering)</option>
                <option value="Bakery">Bakery & Grains</option>
                <option value="Fresh Produce">Fresh Produce</option>
                <option value="Dairy">Dairy & Chilled</option>
                <option value="Packaged">Packaged Goods</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#555962] mb-1">Dietary Classification</label>
              <select
                value={formData.dietary_tags}
                onChange={e => setFormData({ ...formData, dietary_tags: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8D4C8] text-sm focus:outline-none focus:border-[#0C49A2] bg-[#FAF9F6]"
              >
                <option value="Vegetarian">Pure Vegetarian</option>
                <option value="Non-Vegetarian, Halal">Non-Vegetarian (Halal)</option>
                <option value="Vegan, Organic">100% Vegan</option>
                <option value="Eggless Bakery">Eggless Bakery</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#555962] mb-1">Quantity (kg) *</label>
              <input
                type="number"
                step="0.5"
                required
                placeholder="e.g. 25"
                value={formData.quantity_kg}
                onChange={handleKgChange}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8D4C8] text-sm focus:outline-none focus:border-[#0C49A2] bg-[#FAF9F6]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#555962] mb-1">Estimated Servings</label>
              <input
                type="number"
                placeholder="e.g. 60"
                value={formData.quantity_servings}
                onChange={e => setFormData({ ...formData, quantity_servings: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8D4C8] text-sm focus:outline-none focus:border-[#0C49A2] bg-[#FAF9F6]"
              />
            </div>
          </div>

          {/* Slide 7: Demand Prediction Estimation Feedback */}
          {currentKg > 0 && (
            <div className="bg-[#EBF1FA] border border-[#BDD1EC] p-3 rounded-2xl flex items-start space-x-2.5 text-xs text-[#0C49A2]">
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-[#0C49A2]" />
              <div className="space-y-0.5">
                <span className="font-semibold block">Slide 7 Demand Prediction Estimation:</span>
                <p className="text-[11px] leading-relaxed text-[#1F4172]">
                  Based on historical food-demand telemetry, local shelters currently face an active daily deficit of <strong>{totalUnmetGap} kg</strong>. Your listing of <strong>{currentKg} kg</strong> will fulfill ~<strong>{fulfillmentEstimatePct}%</strong> of aggregate hunger gap!
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#555962] mb-1">Preparation Time *</label>
              <div className="relative">
                <input
                  type="datetime-local"
                  required
                  value={formData.prep_time}
                  onChange={e => setFormData({ ...formData, prep_time: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#D8D4C8] text-xs focus:outline-none focus:border-[#0C49A2] bg-[#FAF9F6]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#555962] mb-1">Safe Consumption Window *</label>
              <select
                value={formData.expiry_hours}
                onChange={e => setFormData({ ...formData, expiry_hours: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8D4C8] text-sm focus:outline-none focus:border-[#0C49A2] bg-[#FAF9F6]"
              >
                <option value="2">2 Hours (Critical Urgency)</option>
                <option value="4">4 Hours (Standard Evening)</option>
                <option value="8">8 Hours (Next Morning)</option>
                <option value="24">24 Hours (Bakery / Chilled)</option>
                <option value="48">48 Hours (Fresh Produce)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#555962] mb-1">Storage Condition</label>
              <select
                value={formData.storage_temp}
                onChange={e => setFormData({ ...formData, storage_temp: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8D4C8] text-sm focus:outline-none focus:border-[#0C49A2] bg-[#FAF9F6]"
              >
                <option value="Hot-holding (>60C)">Hot-holding (&gt;60°C)</option>
                <option value="Refrigerated (<5C)">Refrigerated (&lt;5°C)</option>
                <option value="Ambient (20-25C)">Ambient (20–25°C)</option>
                <option value="Frozen (< -18C)">Frozen (&lt; -18°C)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[#555962] mb-1">Contact Phone</label>
              <input
                type="text"
                placeholder="+91 44 2220 0000"
                value={formData.contact_phone}
                onChange={e => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#D8D4C8] text-sm focus:outline-none focus:border-[#0C49A2] bg-[#FAF9F6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#555962] mb-1">Pickup Location Address *</label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#7A7E88] absolute left-3 top-3" />
              <input
                type="text"
                required
                placeholder="e.g. 63 Mount Road, Guindy, Chennai"
                value={formData.pickup_address}
                onChange={e => setFormData({ ...formData, pickup_address: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D8D4C8] text-sm focus:outline-none focus:border-[#0C49A2] bg-[#FAF9F6]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[#555962] mb-1">Packaging &amp; Donor Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Packed in 5 sealed stainless containers. Please bring thermal transport bags."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border border-[#D8D4C8] text-sm focus:outline-none focus:border-[#0C49A2] bg-[#FAF9F6]"
            ></textarea>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-medium text-[#555962] hover:bg-[#F0EEE6]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-full text-xs font-medium bg-[#0C49A2] text-white hover:bg-[#083575] disabled:opacity-50 shadow-sm"
            >
              {submitting ? 'Registering...' : 'Publish Surplus & Run Match Engine'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
