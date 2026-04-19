import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../../data/surplus_link.db');

export const db = new DatabaseSync(DB_PATH);

// Initialize schema and views
export function initializeDatabase() {
  db.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS donors (
      donor_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      org_type TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      rating REAL DEFAULT 4.8,
      verified INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ngos (
      ngo_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      reg_number TEXT NOT NULL,
      contact_person TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      address TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      daily_intake_capacity_kg REAL NOT NULL,
      preferred_food_types TEXT NOT NULL,
      active_beneficiaries INTEGER NOT NULL,
      verified INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS donations (
      donation_id TEXT PRIMARY KEY,
      donor_id TEXT NOT NULL,
      food_name TEXT NOT NULL,
      food_category TEXT NOT NULL,
      quantity_kg REAL NOT NULL,
      quantity_servings INTEGER NOT NULL,
      prep_time DATETIME NOT NULL,
      expiry_time DATETIME NOT NULL,
      storage_temp TEXT NOT NULL,
      dietary_tags TEXT NOT NULL,
      pickup_address TEXT,
      pickup_lat REAL,
      pickup_lng REAL,
      contact_phone TEXT,
      status TEXT DEFAULT 'AVAILABLE',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (donor_id) REFERENCES donors(donor_id) ON DELETE CASCADE
    );
  `);

  // Column migration for donations if table already existed
  try {
    const dInfo = db.prepare("PRAGMA table_info('donations');").all();
    const cols = dInfo.map(c => c.name);
    if (!cols.includes('pickup_address')) db.exec("ALTER TABLE donations ADD COLUMN pickup_address TEXT;");
    if (!cols.includes('pickup_lat')) db.exec("ALTER TABLE donations ADD COLUMN pickup_lat REAL;");
    if (!cols.includes('pickup_lng')) db.exec("ALTER TABLE donations ADD COLUMN pickup_lng REAL;");
    if (!cols.includes('contact_phone')) db.exec("ALTER TABLE donations ADD COLUMN contact_phone TEXT;");
  } catch (err) {}

  db.exec(`
    CREATE TABLE IF NOT EXISTS matches (
      match_id TEXT PRIMARY KEY,
      donation_id TEXT NOT NULL,
      ngo_id TEXT NOT NULL,
      match_score REAL NOT NULL,
      distance_km REAL NOT NULL,
      urgency_index REAL NOT NULL,
      demand_match_score REAL DEFAULT 85.0,
      rank INTEGER NOT NULL,
      status TEXT DEFAULT 'PROPOSED',
      response_time DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (donation_id) REFERENCES donations(donation_id) ON DELETE CASCADE,
      FOREIGN KEY (ngo_id) REFERENCES ngos(ngo_id) ON DELETE CASCADE
    );
  `);

  try {
    const mInfo = db.prepare("PRAGMA table_info('matches');").all();
    const mCols = mInfo.map(c => c.name);
    if (!mCols.includes('demand_match_score')) db.exec("ALTER TABLE matches ADD COLUMN demand_match_score REAL DEFAULT 85.0;");
  } catch (err) {}

  db.exec(`
    CREATE TABLE IF NOT EXISTS dispatches (
      dispatch_id TEXT PRIMARY KEY,
      donation_id TEXT NOT NULL,
      match_id TEXT NOT NULL,
      ngo_id TEXT NOT NULL,
      pickup_pin TEXT NOT NULL,
      volunteer_name TEXT,
      volunteer_phone TEXT,
      vehicle_info TEXT,
      status TEXT DEFAULT 'ASSIGNED',
      pickup_time DATETIME,
      delivery_time DATETIME,
      verification_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (donation_id) REFERENCES donations(donation_id) ON DELETE CASCADE,
      FOREIGN KEY (match_id) REFERENCES matches(match_id) ON DELETE CASCADE,
      FOREIGN KEY (ngo_id) REFERENCES ngos(ngo_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS impact_ledger (
      log_id TEXT PRIMARY KEY,
      donation_id TEXT NOT NULL,
      kg_rescued REAL NOT NULL,
      meals_served INTEGER NOT NULL,
      co2_mitigated_kg REAL NOT NULL,
      water_saved_liters REAL NOT NULL,
      logged_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (donation_id) REFERENCES donations(donation_id) ON DELETE CASCADE
    );

    -- Slide 7: Demand Prediction & Receiver Capacity Table
    CREATE TABLE IF NOT EXISTS ngo_demand_forecast (
      forecast_id TEXT PRIMARY KEY,
      ngo_id TEXT NOT NULL,
      food_category TEXT NOT NULL,
      meal_slot TEXT NOT NULL,
      daily_predicted_demand_kg REAL NOT NULL,
      current_fulfilled_today_kg REAL NOT NULL,
      unmet_gap_kg REAL NOT NULL,
      active_beneficiaries INTEGER NOT NULL,
      urgency_level TEXT DEFAULT 'NORMAL',
      historical_consumption_trend REAL DEFAULT 4.5,
      last_forecast_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ngo_id) REFERENCES ngos(ngo_id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
    CREATE INDEX IF NOT EXISTS idx_donations_expiry ON donations(expiry_time);
    CREATE INDEX IF NOT EXISTS idx_matches_donation ON matches(donation_id);
    CREATE INDEX IF NOT EXISTS idx_dispatches_donation ON dispatches(donation_id);
    CREATE INDEX IF NOT EXISTS idx_demand_ngo ON ngo_demand_forecast(ngo_id);

    DROP VIEW IF EXISTS v_active_donations;
    CREATE VIEW v_active_donations AS
    SELECT 
      d.donation_id,
      d.food_name,
      d.food_category,
      d.quantity_kg,
      d.quantity_servings,
      d.prep_time,
      d.expiry_time,
      d.storage_temp,
      d.dietary_tags,
      d.status,
      d.notes,
      d.created_at,
      dn.donor_id,
      dn.name AS donor_name,
      dn.org_type AS donor_org_type,
      COALESCE(d.contact_phone, dn.phone) AS donor_phone,
      COALESCE(d.pickup_address, dn.address) AS donor_address,
      COALESCE(d.pickup_lat, dn.latitude) AS donor_lat,
      COALESCE(d.pickup_lng, dn.longitude) AS donor_lng,
      disp.dispatch_id,
      disp.pickup_pin,
      disp.volunteer_name,
      disp.volunteer_phone,
      disp.vehicle_info,
      disp.status AS dispatch_status
    FROM donations d
    JOIN donors dn ON d.donor_id = dn.donor_id
    LEFT JOIN dispatches disp ON d.donation_id = disp.donation_id;

    DROP VIEW IF EXISTS v_impact_summary;
    CREATE VIEW v_impact_summary AS
    SELECT 
      COALESCE(SUM(kg_rescued), 0) AS total_kg_rescued,
      COALESCE(SUM(meals_served), 0) AS total_meals_served,
      COALESCE(SUM(co2_mitigated_kg), 0) AS total_co2_kg,
      COALESCE(SUM(water_saved_liters), 0) AS total_water_liters,
      COUNT(log_id) AS total_transactions
    FROM impact_ledger;
  `);
}

initializeDatabase();
