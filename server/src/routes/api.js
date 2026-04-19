import { Router } from 'express';
import { getDonations, getDonationById, createDonation, deleteDonation } from '../controllers/donationController.js';
import { getMatches, confirmMatch, rejectMatch } from '../controllers/matchController.js';
import { getDispatchByDonation, updateDispatchStatus } from '../controllers/logisticsController.js';
import { getImpactSummary, getDemandPrediction } from '../controllers/analyticsController.js';
import { ngoRepository } from '../repositories/ngoRepository.js';

const router = Router();

router.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'SurplusLink API', timestamp: new Date().toISOString() });
});

router.get('/ngos', (req, res) => {
  res.json({ status: 'success', data: ngoRepository.findAll() });
});

router.get('/donations', getDonations);
router.get('/donations/:id', getDonationById);
router.post('/donations', createDonation);
router.delete('/donations/:id', deleteDonation);

router.get('/matches/:donationId', getMatches);
router.post('/matches/confirm', confirmMatch);
router.post('/matches/reject', rejectMatch);

router.get('/logistics/:donationId', getDispatchByDonation);
router.patch('/logistics/:id/status', updateDispatchStatus);

router.get('/analytics/impact', getImpactSummary);
router.get('/analytics/demand-prediction', getDemandPrediction);

export default router;
