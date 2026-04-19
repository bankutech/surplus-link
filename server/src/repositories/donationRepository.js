import { db } from '../db/connection.js';

export class DonationRepository {
  findAll(status = null) {
    if (status) {
      const stmt = db.prepare('SELECT * FROM v_active_donations WHERE status = ? ORDER BY created_at DESC');
      return stmt.all(status);
    }
    const stmt = db.prepare('SELECT * FROM v_active_donations ORDER BY created_at DESC');
    return stmt.all();
  }

  findById(id) {
    const stmt = db.prepare('SELECT * FROM v_active_donations WHERE donation_id = ?');
    return stmt.get(id);
  }

  create(data) {
    const stmt = db.prepare(`
      INSERT INTO donations (
        donation_id, donor_id, food_name, food_category, quantity_kg,
        quantity_servings, prep_time, expiry_time, storage_temp,
        dietary_tags, pickup_address, pickup_lat, pickup_lng, contact_phone, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      data.donation_id,
      data.donor_id,
      data.food_name,
      data.food_category,
      data.quantity_kg,
      data.quantity_servings,
      data.prep_time,
      data.expiry_time,
      data.storage_temp,
      data.dietary_tags,
      data.pickup_address || null,
      data.pickup_lat || null,
      data.pickup_lng || null,
      data.contact_phone || null,
      data.status || 'AVAILABLE',
      data.notes || ''
    );

    return this.findById(data.donation_id);
  }

  updateStatus(id, status) {
    const stmt = db.prepare('UPDATE donations SET status = ? WHERE donation_id = ?');
    stmt.run(status, id);
    return this.findById(id);
  }

  delete(id) {
    const stmt = db.prepare('DELETE FROM donations WHERE donation_id = ?');
    stmt.run(id);
  }
}

export const donationRepository = new DonationRepository();
