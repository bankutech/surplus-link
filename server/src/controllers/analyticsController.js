import { analyticsRepository } from '../repositories/analyticsRepository.js';

export const getImpactSummary = (req, res, next) => {
  try {
    const summary = analyticsRepository.getSummary();
    const categories = analyticsRepository.getDonationBreakdown();
    const ledger = analyticsRepository.getRecentLedger();
    res.json({
      status: 'success',
      data: {
        summary,
        categories,
        ledger
      }
    });
  } catch (err) {
    next(err);
  }
};

export const getDemandPrediction = (req, res, next) => {
  try {
    const data = analyticsRepository.getDemandPredictionAnalytics();
    res.json({
      status: 'success',
      data
    });
  } catch (err) {
    next(err);
  }
};
