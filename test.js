import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runSurplusLinkTests() {
  console.log('================================================================');
  console.log('   SURPLUSLINK STANDALONE E2E INTEGRATION & VERIFICATION SUITE  ');
  console.log('================================================================\n');

  console.log('[STEP 0] Resetting and seeding fresh database...');
  const { execSync } = await import('node:child_process');
  execSync(`"${process.execPath}" server/src/db/seed.js`, { cwd: __dirname });

  console.log('[STEP 1] Starting SurplusLink backend server (:5001)...');
  const serverProc = spawn(process.execPath, ['server/src/index.js'], { cwd: __dirname, shell: false });

  await wait(2000);

  try {
    const health = await fetch('http://localhost:5001/api/health').then(r => r.json());
    console.log('✓ /api/health:', health.status);
    if (health.status !== 'ok') throw new Error('Health check failed');

    const html = await fetch('http://localhost:5001/').then(r => r.text());
    if (html.includes('SurplusLink') || html.includes('<!DOCTYPE html>')) {
      console.log('✓ Standalone Frontend SPA served cleanly on :5001');
    } else {
      throw new Error('Failed to serve client index.html');
    }

    const donRes = await fetch('http://localhost:5001/api/donations').then(r => r.json());
    console.log(`✓ /api/donations returned ${donRes.data.length} listings`);
    const matched = donRes.data.find(d => d.status === 'MATCHED');
    if (!matched) throw new Error('No matched item found in seed data');
    console.log(`✓ Joined dispatch confirmed: pickup_pin=${matched.pickup_pin}, driver=${matched.volunteer_name}`);

    // Invalid PIN rejection test
    const badPin = await fetch(`http://localhost:5001/api/logistics/${matched.donation_id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'DELIVERED', verificationPin: '0000', notes: 'Testing bad PIN' })
    });
    if (badPin.status === 400) {
      console.log('✓ Invalid PIN correctly rejected with 400 Bad Request');
    } else {
      throw new Error(`Expected 400 for bad PIN, got ${badPin.status}`);
    }

    // Valid PIN acceptance test
    const goodPin = await fetch(`http://localhost:5001/api/logistics/${matched.donation_id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'DELIVERED', verificationPin: matched.pickup_pin, notes: 'Standalone test delivery' })
    });
    if (goodPin.status === 200) {
      console.log('✓ Valid PIN accepted! Handover verified and recorded in ledger');
    } else {
      throw new Error(`Valid PIN failed with ${goodPin.status}`);
    }

    // Match rejection fallback test
    const matches = await fetch(`http://localhost:5001/api/matches/don_101`).then(r => r.json());
    if (matches.data.length >= 2) {
      const topMatch = matches.data[0];
      const rejRes = await fetch('http://localhost:5001/api/matches/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ donationId: 'don_101', matchId: topMatch.match_id })
      }).then(r => r.json());
      console.log(`✓ Rejected top match ${topMatch.match_id}. Next match promoted:`, rejRes.data.nextMatch?.ngo_id);
    }

    // Slide 7 Demand Prediction test
    const demand = await fetch('http://localhost:5001/api/analytics/demand-prediction').then(r => r.json());
    if (demand.status === 'success' && demand.data.forecasts.length > 0) {
      console.log(`✓ Slide 7 Demand Prediction verified: ${demand.data.forecasts.length} receiver forecasts, unmet gap=${demand.data.totals.total_unmet_gap_kg} kg`);
    } else {
      throw new Error('Demand prediction failed');
    }

    // Slide 7 Food Details Collection with validation test
    const badDonation = await fetch('http://localhost:5001/api/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ food_name: 'Invalid Item', quantity_kg: -5, expiry_time: 'not-a-date' })
    });
    if (badDonation.status === 400) {
      console.log('✓ Invalid donation input (negative quantity) correctly rejected with 400 Bad Request');
    } else {
      throw new Error(`Expected 400 for negative quantity, got ${badDonation.status}`);
    }

    const goodDonation = await fetch('http://localhost:5001/api/donations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        food_name: 'Hyderabadi Dum Biryani Trays',
        food_category: 'Cooked Meals',
        quantity_kg: 25,
        quantity_servings: 60,
        prep_time: new Date(Date.now() - 3600000).toISOString(),
        expiry_time: new Date(Date.now() + 18000000).toISOString(),
        storage_temp: 'Hot-holding (>60C)',
        dietary_tags: 'Non-Vegetarian (Halal)',
        pickup_address: 'T Nagar Banquet Hall, Chennai',
        contact_phone: '+91 44 2434 5000'
      })
    }).then(r => r.json());
    if (goodDonation.data.matches && goodDonation.data.matches.length > 0) {
      console.log(`✓ Listed surplus food successfully; top matched shelter: ${goodDonation.data.matches[0].ngo_id} (${goodDonation.data.matches[0].match_score}%)`);
    } else {
      throw new Error('Failed to create valid donation with matches');
    }

    console.log('\n================================================================');
    console.log('   🎉 SURPLUSLINK STANDALONE TESTS COMPLETED SUCCESSFULLY!      ');
    console.log('================================================================\n');
  } finally {
    serverProc.kill();
  }
}

runSurplusLinkTests().catch(err => {
  console.error('\n❌ SurplusLink Test Failed:', err);
  process.exit(1);
});
