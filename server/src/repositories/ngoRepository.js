import { db } from '../db/connection.js';

export class NgoRepository {
  findAll() {
    const stmt = db.prepare('SELECT * FROM ngos ORDER BY name ASC');
    return stmt.all();
  }

  findById(id) {
    const stmt = db.prepare('SELECT * FROM ngos WHERE ngo_id = ?');
    return stmt.get(id);
  }

  findAvailableReceivers() {
    const stmt = db.prepare('SELECT * FROM ngos WHERE verified = 1');
    return stmt.all();
  }
}

export const ngoRepository = new NgoRepository();
