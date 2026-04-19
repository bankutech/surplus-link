import { db, initializeDatabase } from './connection.js';

export function seedDatabase() {
  initializeDatabase();

  // Clear existing
  db.exec(`
    DELETE FROM impact_ledger;
    DELETE FROM dispatches;
    DELETE FROM matches;
    DELETE FROM ngo_demand_forecast;
    DELETE FROM donations;
    DELETE FROM ngos;
    DELETE FROM donors;
  `);

  // Insert Donors
  const insertDonor = db.prepare(`
    INSERT INTO donors (donor_id, name, org_type, email, phone, address, latitude, longitude, rating, verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const donors = [
    ['donor_1', 'Grand Chola Banquet Operations', 'Hotel & Banquet', 'banquets@grandchola.in', '+91 44 2220 0000', '63 Mount Road, Guindy, Chennai', 13.0105, 80.2206, 4.9, 1],
    ['donor_2', 'Tech Park Canteen Block 4', 'Corporate Canteen', 'cafeteria@tidelpark.com', '+91 44 2254 0100', 'TIDEL Park, Rajiv Gandhi Salai, Taramani', 12.9897, 80.2474, 4.8, 1],
    ['donor_3', 'GreenLeaf Artisan Bakery', 'Bakery', 'orders@greenleafbakes.com', '+91 98401 22334', '14 Besant Avenue, Adyar, Chennai', 13.0012, 80.2565, 4.7, 1],
    ['donor_4', 'Marina Convention Catering', 'Event Catering', 'dispatch@marinacatering.org', '+91 94440 98765', 'Santhome High Road, Mylapore, Chennai', 13.0336, 80.2785, 4.9, 1],
    ['donor_5', 'Metro Fresh Daily Supercenter', 'Supermarket', 'inventory@metrofresh.in', '+91 44 4300 5500', '100 Feet Road, Velachery, Chennai', 12.9780, 80.2185, 4.6, 1]
  ];

  for (const d of donors) {
    insertDonor.run(...d);
  }

  // Insert NGOs
  const insertNgo = db.prepare(`
    INSERT INTO ngos (ngo_id, name, reg_number, contact_person, phone, email, address, latitude, longitude, daily_intake_capacity_kg, preferred_food_types, active_beneficiaries, verified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const ngos = [
    ['ngo_1', 'Karuna Trust Feeding Mission', 'TN/2018/009182', 'Senthil Nathan', '+91 98405 11223', 'karuna.trust@relief.org', '12 Gandhi Mandapam Rd, Kotturpuram', 13.0135, 80.2392, 120.0, 'Cooked Meals, Bakery, Packaged', 350, 1],
    ['ngo_2', 'Hope Harbor Community Shelter', 'TN/2020/014490', 'Ananya Vasudevan', '+91 99620 44556', 'shelter@hopeharbor.org', '45 Canal Bank Rd, RA Puram', 13.0245, 80.2520, 85.0, 'Cooked Meals, Fresh Produce', 220, 1],
    ['ngo_3', 'Annakshetra Children Welfare', 'TN/2016/003819', 'R. Meenakshi', '+91 97890 88771', 'care@annakshetra.org', '28 Velachery Main Rd, Guindy', 13.0030, 80.2150, 60.0, 'Bakery, Dairy, Cooked Meals', 160, 1],
    ['ngo_4', 'Seva Bharathi Hunger Relief', 'TN/2014/000217', 'V. Balachander', '+91 94451 33445', 'service@sevabharathi.org', '89 Lattice Bridge Rd, Thiruvanmiyur', 12.9832, 80.2592, 200.0, 'Cooked Meals, Fresh Produce, Packaged', 500, 1],
    ['ngo_5', 'Mercy Light Transit Care', 'TN/2021/019934', 'Father David', '+91 98840 99001', 'contact@mercylight.org', '19 Royapettah High Rd, Mylapore', 13.0410, 80.2640, 75.0, 'Cooked Meals, Bakery', 180, 1]
  ];

  for (const n of ngos) {
    insertNgo.run(...n);
  }

  // Insert Slide 7: Demand Prediction Forecasts for Receivers
  const insertDemand = db.prepare(`
    INSERT INTO ngo_demand_forecast (forecast_id, ngo_id, food_category, meal_slot, daily_predicted_demand_kg, current_fulfilled_today_kg, unmet_gap_kg, active_beneficiaries, urgency_level, historical_consumption_trend)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const demandForecasts = [
    ['fc_01', 'ngo_1', 'Cooked Meals', 'Dinner', 120.0, 45.0, 75.0, 350, 'HIGH', 6.2],
    ['fc_02', 'ngo_2', 'Cooked Meals', 'Dinner', 85.0, 25.0, 60.0, 220, 'CRITICAL', 8.4],
    ['fc_03', 'ngo_3', 'Bakery', 'Breakfast', 60.0, 30.0, 30.0, 160, 'NORMAL', 3.1],
    ['fc_04', 'ngo_4', 'Cooked Meals', 'Lunch', 200.0, 90.0, 110.0, 500, 'CRITICAL', 11.5],
    ['fc_05', 'ngo_5', 'Fresh Produce', 'Dinner', 75.0, 20.0, 55.0, 180, 'HIGH', 5.0]
  ];

  for (const df of demandForecasts) {
    insertDemand.run(...df);
  }

  // Insert Active & Historical Donations
  const now = new Date();
  const formatIso = (d) => d.toISOString();
  const addHours = (hours) => new Date(now.getTime() + hours * 3600000);
  const subHours = (hours) => new Date(now.getTime() - hours * 3600000);

  const insertDonation = db.prepare(`
    INSERT INTO donations (donation_id, donor_id, food_name, food_category, quantity_kg, quantity_servings, prep_time, expiry_time, storage_temp, dietary_tags, pickup_address, pickup_lat, pickup_lng, contact_phone, status, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const donations = [
    ['don_101', 'donor_1', 'South Indian Royal Buffet Assortment', 'Cooked Meals', 38.5, 95, formatIso(subHours(2)), formatIso(addHours(4)), 'Hot-holding (>60C)', 'Vegetarian, Nut-Free', '63 Mount Road, Guindy, Chennai', 13.0105, 80.2206, '+91 44 2220 0000', 'AVAILABLE', 'Freshly prepared executive conference spread: Sambar rice, paneer pulao, avial, roti.'],
    ['don_102', 'donor_2', 'Corporate Lunch Extra Entrees', 'Cooked Meals', 22.0, 60, formatIso(subHours(1.5)), formatIso(addHours(3.5)), 'Hot-holding (>60C)', 'Vegetarian, Halal-Friendly', 'TIDEL Park, Rajiv Gandhi Salai, Taramani', 12.9897, 80.2474, '+91 44 2254 0100', 'AVAILABLE', 'Untouched catering trays sealed in aluminum food-grade containers.'],
    ['don_103', 'donor_3', 'Artisan Whole Wheat Loaves & Croissants', 'Bakery', 16.0, 50, formatIso(subHours(5)), formatIso(addHours(14)), 'Ambient (20-25C)', 'Vegetarian, Eggless', '14 Besant Avenue, Adyar, Chennai', 13.0012, 80.2565, '+91 98401 22334', 'AVAILABLE', 'Day-end premium bake inventory, packed in sanitized paper bakery bags.'],
    ['don_104', 'donor_4', 'Wedding Feast Surplus (Biryani & Gravy)', 'Cooked Meals', 55.0, 140, formatIso(subHours(3)), formatIso(addHours(2.5)), 'Refrigerated (<5C)', 'Non-Vegetarian, Halal', 'Santhome High Road, Mylapore, Chennai', 13.0336, 80.2785, '+91 94440 98765', 'MATCHED', 'Rapidly chilled to 4C according to FSSAI food safety guidelines.'],
    ['don_105', 'donor_5', 'Farm Fresh Crates (Apples, Tomatoes, Greens)', 'Fresh Produce', 45.0, 110, formatIso(subHours(8)), formatIso(addHours(36)), 'Cool Chilled (8-10C)', 'Vegan, Organic', '100 Feet Road, Velachery, Chennai', 12.9780, 80.2185, '+91 44 4300 5500', 'IN_TRANSIT', 'Grade-A surplus farm produce from morning farm intake.'],
    ['don_106', 'donor_1', 'Completed High-Tea Pastries & Cutlets', 'Cooked Meals', 28.0, 70, formatIso(subHours(26)), formatIso(subHours(20)), 'Ambient', 'Vegetarian', '63 Mount Road, Guindy, Chennai', 13.0105, 80.2206, '+91 44 2220 0000', 'DELIVERED', 'Successfully delivered to Hope Harbor Community Shelter yesterday.']
  ];

  for (const d of donations) {
    insertDonation.run(...d);
  }

  // Insert Matches
  const insertMatch = db.prepare(`
    INSERT INTO matches (match_id, donation_id, ngo_id, match_score, distance_km, urgency_index, demand_match_score, rank, status, response_time)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertMatch.run('mat_201', 'don_104', 'ngo_1', 94.2, 2.1, 0.88, 92.0, 1, 'ACCEPTED', formatIso(subHours(1)));
  insertMatch.run('mat_202', 'don_104', 'ngo_2', 88.5, 3.4, 0.88, 86.5, 2, 'PROPOSED', null);
  insertMatch.run('mat_203', 'don_105', 'ngo_4', 96.0, 1.8, 0.45, 95.0, 1, 'ACCEPTED', formatIso(subHours(2)));
  insertMatch.run('mat_204', 'don_106', 'ngo_2', 92.0, 2.8, 0.90, 89.0, 1, 'ACCEPTED', formatIso(subHours(24)));

  // Insert Dispatches
  const insertDispatch = db.prepare(`
    INSERT INTO dispatches (dispatch_id, donation_id, match_id, ngo_id, pickup_pin, volunteer_name, volunteer_phone, vehicle_info, status, pickup_time, delivery_time, verification_notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertDispatch.run(
    'dsp_301',
    'don_104',
    'mat_201',
    'ngo_1',
    '7412',
    'Karthik Raghavan',
    '+91 98410 77123',
    'Piaggio Ape Electric Van (TN-07-BZ-4412)',
    'ASSIGNED',
    null,
    null,
    'Driver dispatched with insulated thermal containers.'
  );

  insertDispatch.run(
    'dsp_302',
    'don_105',
    'mat_203',
    'ngo_4',
    '5189',
    'Muruganathan P',
    '+91 97909 33211',
    'Tata Ace Food Rescue Vehicle (TN-09-CQ-8801)',
    'PICKED_UP',
    formatIso(subHours(0.5)),
    null,
    'Verified produce weight: 45.2 kg. Handover PIN validated.'
  );

  insertDispatch.run(
    'dsp_303',
    'don_106',
    'mat_204',
    'ngo_2',
    '9034',
    'Selvamani R',
    '+91 94444 12389',
    'Mahindra Bolero Maxi Truck (TN-10-AA-1002)',
    'DELIVERED',
    formatIso(subHours(23)),
    formatIso(subHours(21.5)),
    'Delivered with zero spoilage. 70 individuals served dinner.'
  );

  // Insert Impact Ledger
  const insertImpact = db.prepare(`
    INSERT INTO impact_ledger (log_id, donation_id, kg_rescued, meals_served, co2_mitigated_kg, water_saved_liters, logged_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertImpact.run('imp_01', 'don_106', 28.0, 70, 70.0, 33600.0, formatIso(subHours(21.5)));
  insertImpact.run('imp_02', 'don_105', 45.0, 110, 112.5, 54000.0, formatIso(subHours(1)));
  insertImpact.run('imp_03', 'don_104', 55.0, 140, 137.5, 66000.0, formatIso(subHours(0.2)));

  console.log('SurplusLink database successfully seeded with realistic enterprise data & demand prediction telemetry.');
}

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase();
}
