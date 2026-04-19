import { db } from '../db/connection.js';

export class LogisticsRepository {
  findByDonation(donationId) {
    const stmt = db.prepare(`
      SELECT d.*, n.name AS ngo_name, n.phone AS ngo_phone, n.address AS ngo_address
      FROM dispatches d
      JOIN ngos n ON d.ngo_id = n.ngo_id
      WHERE d.donation_id = ?
    `);
    return stmt.get(donationId);
  }

  create(data) {
    const stmt = db.prepare(`
      INSERT INTO dispatches (
        dispatch_id, donation_id, match_id, ngo_id, pickup_pin,
        volunteer_name, volunteer_phone, vehicle_info, status,
        verification_notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      data.dispatch_id,
      data.donation_id,
      data.match_id,
      data.ngo_id,
      data.pickup_pin,
      data.volunteer_name || 'Assigned Volunteer',
      data.volunteer_phone || '+91 98400 00000',
      data.vehicle_info || 'Eco Delivery Vehicle',
      data.status || 'ASSIGNED',
      data.verification_notes || 'Handover PIN generated'
    );
    return this.findById(data.dispatch_id);
  }

  findById(id) {
    const stmt = db.prepare(`
      SELECT d.*, n.name AS ngo_name, n.address AS ngo_address, n.phone AS ngo_phone
      FROM dispatches d
      JOIN ngos n ON d.ngo_id = n.ngo_id
      WHERE d.dispatch_id = ?
    `);
    return stmt.get(id);
  }

  updateStatus(id, status, notes = null) {
    let query = 'UPDATE dispatches SET status = ?';
    const params = [status];
    if (status === 'PICKED_UP') {
      query += ', pickup_time = CURRENT_TIMESTAMP';
    } else if (status === 'DELIVERED') {
      query += ', delivery_time = CURRENT_TIMESTAMP';
    }
    if (notes) {
      query += ', verification_notes = ?';
      params.push(notes);
    }
    query += ' WHERE dispatch_id = ?';
    params.push(id);

    const stmt = db.prepare(query);
    stmt.run(...params);
    return this.findById(id);
  }
}

export const logisticsRepository = new LogisticsRepository();
