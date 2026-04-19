import { db } from '../db/connection.js';

export class AnalyticsRepository {
  getSummary() {
    const stmt = db.prepare('SELECT * FROM v_impact_summary');
    return stmt.get();
  }

  getDonationBreakdown() {
    const stmt = db.prepare(`
      SELECT food_category, COUNT(*) as count, SUM(quantity_kg) as total_kg, SUM(quantity_servings) as total_servings
      FROM donations
      GROUP BY food_category
      ORDER BY total_kg DESC
    `);
    return stmt.all();
  }

  getDemandPredictionAnalytics() {
    const forecasts = db.prepare(`
      SELECT df.*, n.name AS ngo_name, n.phone AS ngo_phone, n.address AS ngo_address, 
             n.latitude, n.longitude, n.preferred_food_types
      FROM ngo_demand_forecast df
      JOIN ngos n ON df.ngo_id = n.ngo_id
      ORDER BY df.unmet_gap_kg DESC
    `).all();

    const totals = db.prepare(`
      SELECT 
        ROUND(SUM(daily_predicted_demand_kg), 1) as total_predicted_demand_kg,
        ROUND(SUM(current_fulfilled_today_kg), 1) as total_fulfilled_today_kg,
        ROUND(SUM(unmet_gap_kg), 1) as total_unmet_gap_kg,
        SUM(active_beneficiaries) as total_beneficiaries
      FROM ngo_demand_forecast
    `).get();

    return {
      totals,
      forecasts
    };
  }

  getRecentLedger() {
    const stmt = db.prepare(`
      SELECT l.*, d.food_name, d.food_category, dn.name AS donor_name
      FROM impact_ledger l
      JOIN donations d ON l.donation_id = d.donation_id
      JOIN donors dn ON d.donor_id = dn.donor_id
      ORDER BY l.logged_at DESC
      LIMIT 10
    `);
    return stmt.all();
  }

  recordImpact(data) {
    const stmt = db.prepare(`
      INSERT INTO impact_ledger (log_id, donation_id, kg_rescued, meals_served, co2_mitigated_kg, water_saved_liters)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      data.log_id,
      data.donation_id,
      data.kg_rescued,
      data.meals_served,
      data.co2_mitigated_kg,
      data.water_saved_liters
    );
  }
}

export const analyticsRepository = new AnalyticsRepository();
