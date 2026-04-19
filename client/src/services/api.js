const API_BASE = '/api';

export const api = {
  async getDonations(status) {
    const url = status ? `${API_BASE}/donations?status=${status}` : `${API_BASE}/donations`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch donations');
    const json = await res.json();
    return json.data;
  },

  async getDonationById(id) {
    const res = await fetch(`${API_BASE}/donations/${id}`);
    if (!res.ok) throw new Error('Failed to fetch donation details');
    const json = await res.json();
    return json.data;
  },

  async createDonation(data) {
    const res = await fetch(`${API_BASE}/donations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('Failed to create donation');
    const json = await res.json();
    return json.data;
  },

  async getMatches(donationId) {
    const res = await fetch(`${API_BASE}/matches/${donationId}`);
    if (!res.ok) throw new Error('Failed to fetch matches');
    const json = await res.json();
    return json.data;
  },

  async confirmMatch(donationId, matchId) {
    const res = await fetch(`${API_BASE}/matches/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ donationId, matchId })
    });
    if (!res.ok) throw new Error('Failed to confirm match');
    const json = await res.json();
    return json.data;
  },

  async rejectMatch(donationId, matchId) {
    const res = await fetch(`${API_BASE}/matches/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ donationId, matchId })
    });
    if (!res.ok) throw new Error('Failed to reject match');
    const json = await res.json();
    return json.data;
  },

  async updateLogisticsStatus(dispatchId, status, verificationPin, notes) {
    const res = await fetch(`${API_BASE}/logistics/${dispatchId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, verificationPin, notes })
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Failed to update logistics status');
    return json.data;
  },

  async getImpactAnalytics() {
    const res = await fetch(`${API_BASE}/analytics/impact`);
    if (!res.ok) throw new Error('Failed to fetch impact analytics');
    const json = await res.json();
    return json.data;
  },

  async getDemandPrediction() {
    const res = await fetch(`${API_BASE}/analytics/demand-prediction`);
    if (!res.ok) throw new Error('Failed to fetch demand prediction data');
    const json = await res.json();
    return json.data;
  },

  async getNgos() {
    const res = await fetch(`${API_BASE}/ngos`);
    if (!res.ok) throw new Error('Failed to fetch NGOs');
    const json = await res.json();
    return json.data;
  }
};
