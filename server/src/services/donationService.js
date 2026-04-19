import { donationRepository } from '../repositories/donationRepository.js';
import { matchRepository } from '../repositories/matchRepository.js';
import { logisticsRepository } from '../repositories/logisticsRepository.js';
import { analyticsRepository } from '../repositories/analyticsRepository.js';
import { matchingService } from './matchingService.js';
import { AppError } from '../middleware/errorHandler.js';

export class DonationService {
  getAllDonations(status) {
    return donationRepository.findAll(status);
  }

  getDonationById(id) {
    const donation = donationRepository.findById(id);
    if (!donation) {
      throw new AppError(`Donation with ID ${id} not found`, 404);
    }
    const matches = matchRepository.findByDonation(id);
    const dispatch = logisticsRepository.findByDonation(id);
    return { ...donation, matches, dispatch };
  }

  createDonation(data) {
    if (!data.food_name || data.quantity_kg === undefined || data.quantity_kg === null || !data.expiry_time) {
      throw new AppError('food_name, quantity_kg, and expiry_time are required fields', 400);
    }

    const qty = parseFloat(data.quantity_kg);
    if (isNaN(qty) || qty <= 0) {
      throw new AppError('quantity_kg must be a positive number greater than 0', 400);
    }

    const expiryTimeMs = new Date(data.expiry_time).getTime();
    if (isNaN(expiryTimeMs)) {
      throw new AppError('expiry_time must be a valid date/time string', 400);
    }

    const donationId = `don_${Date.now()}`;
    const newDonation = {
      donation_id: donationId,
      donor_id: data.donor_id || 'donor_1',
      food_name: data.food_name,
      food_category: data.food_category || 'Cooked Meals',
      quantity_kg: parseFloat(data.quantity_kg),
      quantity_servings: parseInt(data.quantity_servings || Math.round(data.quantity_kg * 2.5)),
      prep_time: data.prep_time || new Date().toISOString(),
      expiry_time: data.expiry_time,
      storage_temp: data.storage_temp || 'Ambient (20-25C)',
      dietary_tags: data.dietary_tags || 'Vegetarian',
      pickup_address: data.pickup_address || null,
      pickup_lat: data.pickup_lat ? parseFloat(data.pickup_lat) : null,
      pickup_lng: data.pickup_lng ? parseFloat(data.pickup_lng) : null,
      contact_phone: data.contact_phone || null,
      status: 'AVAILABLE',
      notes: data.notes || ''
    };

    donationRepository.create(newDonation);

    const matches = matchingService.computeMatchesForDonation(donationId);

    return { ...newDonation, matches };
  }

  confirmMatch(donationId, matchId) {
    const donation = donationRepository.findById(donationId);
    if (!donation) {
      throw new AppError('Donation not found', 404);
    }

    const match = matchRepository.findById(matchId);
    if (!match) {
      throw new AppError('Match record not found', 404);
    }

    matchRepository.updateStatus(matchId, 'ACCEPTED');
    donationRepository.updateStatus(donationId, 'MATCHED');

    const pickupPin = Math.floor(1000 + Math.random() * 9000).toString();
    const dispatchId = `dsp_${Date.now()}`;
    
    const dispatch = logisticsRepository.create({
      dispatch_id: dispatchId,
      donation_id: donationId,
      match_id: matchId,
      ngo_id: match.ngo_id,
      pickup_pin: pickupPin,
      volunteer_name: 'Verified Rapid Responder',
      volunteer_phone: '+91 98402 55991',
      vehicle_info: 'Dedicated Thermal Transit EV',
      status: 'ASSIGNED',
      verification_notes: 'Handover code generated. Awaiting pickup.'
    });

    return { success: true, donation_id: donationId, match_id: matchId, dispatch };
  }

  rejectMatch(donationId, matchId) {
    const match = matchRepository.findById(matchId);
    if (!match) {
      throw new AppError('Match record not found', 404);
    }

    matchRepository.updateStatus(matchId, 'REJECTED');

    const pendingMatches = matchRepository.findByDonation(donationId).filter(m => m.status === 'PENDING');
    if (pendingMatches.length > 0) {
      matchRepository.updateStatus(pendingMatches[0].match_id, 'PROPOSED');
    }

    return { success: true, rejectedMatchId: matchId, nextMatch: pendingMatches[0] || null };
  }

  updateLogisticsStatus(identifier, status, notes = null, verificationPin = null) {
    let dispatch = logisticsRepository.findById(identifier);
    if (!dispatch) {
      dispatch = logisticsRepository.findByDonation(identifier);
    }
    if (!dispatch) {
      throw new AppError('Dispatch record not found', 404);
    }

    if (status === 'PICKED_UP' || status === 'DELIVERED') {
      if (!verificationPin || String(verificationPin).trim() !== String(dispatch.pickup_pin).trim()) {
        throw new AppError(`Invalid handover PIN code "${verificationPin || ''}". Verification failed.`, 400);
      }
    }

    if (status === 'PICKED_UP') {
      donationRepository.updateStatus(dispatch.donation_id, 'IN_TRANSIT');
    }

    if (status === 'DELIVERED') {
      donationRepository.updateStatus(dispatch.donation_id, 'DELIVERED');
      
      const donation = donationRepository.findById(dispatch.donation_id);
      if (donation) {
        analyticsRepository.recordImpact({
          log_id: `imp_${Date.now()}`,
          donation_id: donation.donation_id,
          kg_rescued: donation.quantity_kg,
          meals_served: donation.quantity_servings,
          co2_mitigated_kg: Math.round(donation.quantity_kg * 2.5 * 10) / 10,
          water_saved_liters: Math.round(donation.quantity_kg * 1200)
        });
      }
    }

    return logisticsRepository.updateStatus(dispatch.dispatch_id, status, notes);
  }
}

export const donationService = new DonationService();
