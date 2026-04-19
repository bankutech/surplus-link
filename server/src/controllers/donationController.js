import { donationService } from '../services/donationService.js';
import { donationRepository } from '../repositories/donationRepository.js';

export const getDonations = (req, res, next) => {
  try {
    const { status } = req.query;
    const donations = donationService.getAllDonations(status);
    res.json({ status: 'success', results: donations.length, data: donations });
  } catch (err) {
    next(err);
  }
};

export const getDonationById = (req, res, next) => {
  try {
    const donation = donationService.getDonationById(req.params.id);
    res.json({ status: 'success', data: donation });
  } catch (err) {
    next(err);
  }
};

export const createDonation = (req, res, next) => {
  try {
    const created = donationService.createDonation(req.body);
    res.status(201).json({ status: 'success', data: created });
  } catch (err) {
    next(err);
  }
};

export const deleteDonation = (req, res, next) => {
  try {
    donationRepository.delete(req.params.id);
    res.json({ status: 'success', message: 'Donation deleted successfully' });
  } catch (err) {
    next(err);
  }
};
