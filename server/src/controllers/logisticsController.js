import { donationService } from '../services/donationService.js';
import { logisticsRepository } from '../repositories/logisticsRepository.js';

export const getDispatchByDonation = (req, res, next) => {
  try {
    const dispatch = logisticsRepository.findByDonation(req.params.donationId);
    res.json({ status: 'success', data: dispatch });
  } catch (err) {
    next(err);
  }
};

export const updateDispatchStatus = (req, res, next) => {
  try {
    const { status, notes, verificationPin } = req.body;
    const updated = donationService.updateLogisticsStatus(req.params.id, status, notes, verificationPin);
    res.json({ status: 'success', data: updated });
  } catch (err) {
    next(err);
  }
};
