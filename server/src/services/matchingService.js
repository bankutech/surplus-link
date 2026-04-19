import { ngoRepository } from '../repositories/ngoRepository.js';
import { matchRepository } from '../repositories/matchRepository.js';
import { donationRepository } from '../repositories/donationRepository.js';
import { db } from '../db/connection.js';

// Haversine formula to compute great-circle distance between two coordinates in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

export class MatchingService {
  computeMatchesForDonation(donationId) {
    const donation = donationRepository.findById(donationId);
    if (!donation) {
      throw new Error(`Donation ${donationId} not found`);
    }

    // Check if matches already calculated
    const existing = matchRepository.findByDonation(donationId);
    if (existing && existing.length > 0) {
      return existing;
    }

    const ngos = ngoRepository.findAvailableReceivers();
    const donorLat = donation.donor_lat || 13.0105;
    const donorLng = donation.donor_lng || 80.2206;
    const now = new Date();
    const expiry = new Date(donation.expiry_time);
    const hoursRemaining = Math.max(0.1, (expiry - now) / 3600000);

    // Slide 7 Urgency Index: 1.0 if < 2 hours, scales down to 0.2 if > 24 hours
    const urgencyFactor = Math.min(1.0, Math.max(0.2, 4.0 / hoursRemaining));

    // Get active demand forecasts
    const demandStmt = db.prepare('SELECT * FROM ngo_demand_forecast WHERE ngo_id = ?');

    const scoredNgos = ngos.map(ngo => {
      const distance = calculateDistance(donorLat, donorLng, ngo.latitude, ngo.longitude);
      
      // 1. Proximity score (0 to 35 pts): max score at 0 km, 0 at 25 km
      const proximityScore = Math.max(0, (1 - distance / 25)) * 35;

      // 2. Urgency response score (0 to 25 pts)
      const urgencyScore = urgencyFactor * 25;

      // 3. Category suitability match (0 to 15 pts)
      const preferredCategories = (ngo.preferred_food_types || '').toLowerCase();
      const isPreferred = preferredCategories.includes((donation.food_category || '').toLowerCase());
      const categoryScore = isPreferred ? 15 : 6;

      // 4. Slide 7: Demand Prediction & Gap Fulfillment (0 to 25 pts)
      const forecast = demandStmt.get(ngo.ngo_id);
      const unmetGap = forecast ? forecast.unmet_gap_kg : (ngo.daily_intake_capacity_kg * 0.6);
      const predictedDaily = forecast ? forecast.daily_predicted_demand_kg : ngo.daily_intake_capacity_kg;
      
      // Calculate how optimally this surplus quantity satisfies the receiver's unmet deficit
      const fulfillRatio = Math.min(1.0, donation.quantity_kg / Math.max(1, unmetGap));
      const demandMatchScore = Math.round(Math.min(100, Math.max(40, (1 - Math.abs(donation.quantity_kg - unmetGap) / Math.max(50, unmetGap)) * 100)));
      const demandScore = (demandMatchScore / 100) * 25;

      const totalScore = Math.min(99.5, Math.round((proximityScore + urgencyScore + categoryScore + demandScore) * 10) / 10);

      return {
        ngo_id: ngo.ngo_id,
        ngo_name: ngo.name,
        ngo_phone: ngo.phone,
        ngo_address: ngo.address,
        contact_person: ngo.contact_person,
        active_beneficiaries: ngo.active_beneficiaries,
        daily_intake_capacity_kg: ngo.daily_intake_capacity_kg,
        distance_km: distance,
        urgency_index: Math.round(urgencyFactor * 100) / 100,
        demand_match_score: demandMatchScore,
        unmet_gap_kg: unmetGap,
        daily_predicted_demand_kg: predictedDaily,
        match_score: totalScore
      };
    });

    // Sort descending by match score
    scoredNgos.sort((a, b) => b.match_score - a.match_score);

    // Persist matches with rank
    const generatedMatches = [];
    scoredNgos.forEach((candidate, index) => {
      const rank = index + 1;
      const matchId = `mat_${Date.now()}_${rank}`;
      const record = {
        match_id: matchId,
        donation_id: donationId,
        ngo_id: candidate.ngo_id,
        match_score: candidate.match_score,
        distance_km: candidate.distance_km,
        urgency_index: candidate.urgency_index,
        demand_match_score: candidate.demand_match_score,
        rank,
        status: rank === 1 ? 'PROPOSED' : 'PENDING'
      };
      matchRepository.create(record);
      generatedMatches.push({ ...candidate, ...record });
    });

    return generatedMatches;
  }
}

export const matchingService = new MatchingService();
