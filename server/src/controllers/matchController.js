import { matchingService } from '../services/matchingService.js';
import { donationService } from '../services/donationService.js';
import { matchRepository } from '../repositories/matchRepository.js';

export const getMatches = (req, res, next) => {
  try {
    const { donationId } = req.params;
    const matches = matchingService.computeMatchesForDonation(donationId);
    res.json({ status: 'success', results: matches.length, data: matches });
  } catch (err) {
    next(err);
  }
};

export const confirmMatch = (req, res, next) => {
  try {
    const { donationId, matchId } = req.body;
    const result = donationService.confirmMatch(donationId, matchId);
    res.json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};

export const rejectMatch = (req, res, next) => {
  try {
    const { donationId, matchId } = req.body;
    const result = donationService.rejectMatch(donationId, matchId);
    res.json({ status: 'success', data: result });
  } catch (err) {
    next(err);
  }
};
