import { db } from '../db/connection.js';

export class MatchRepository {
  findByDonation(donationId) {
    const stmt = db.prepare(`
      SELECT m.*, n.name AS ngo_name, n.phone AS ngo_phone, n.address AS ngo_address,
             n.contact_person, n.active_beneficiaries, n.daily_intake_capacity_kg,
             df.daily_predicted_demand_kg, df.unmet_gap_kg
      FROM matches m
      JOIN ngos n ON m.ngo_id = n.ngo_id
      LEFT JOIN ngo_demand_forecast df ON n.ngo_id = df.ngo_id
      WHERE m.donation_id = ?
      ORDER BY m.rank ASC
    `);
    return stmt.all(donationId);
  }

  create(match) {
    const stmt = db.prepare(`
      INSERT INTO matches (match_id, donation_id, ngo_id, match_score, distance_km, urgency_index, demand_match_score, rank, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      match.match_id,
      match.donation_id,
      match.ngo_id,
      match.match_score,
      match.distance_km,
      match.urgency_index,
      match.demand_match_score || 85.0,
      match.rank,
      match.status || 'PROPOSED'
    );
  }

  updateStatus(matchId, status) {
    const stmt = db.prepare(`
      UPDATE matches 
      SET status = ?, response_time = CURRENT_TIMESTAMP 
      WHERE match_id = ?
    `);
    stmt.run(status, matchId);
  }

  findById(matchId) {
    const stmt = db.prepare('SELECT * FROM matches WHERE match_id = ?');
    return stmt.get(matchId);
  }
}

export const matchRepository = new MatchRepository();
