import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import HeroSection from './components/HeroSection.jsx';
import DonationGrid from './components/DonationGrid.jsx';
import MatchModal from './components/MatchModal.jsx';
import RegisterDonationModal from './components/RegisterDonationModal.jsx';
import LogisticsTracker from './components/LogisticsTracker.jsx';
import ImpactDashboard from './components/ImpactDashboard.jsx';
import DemandPredictionView from './components/DemandPredictionView.jsx';
import NgoDirectory from './components/NgoDirectory.jsx';
import { api } from './services/api.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('donations');
  const [donations, setDonations] = useState([]);
  const [impactData, setImpactData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [donList, impact] = await Promise.all([
        api.getDonations(),
        api.getImpactAnalytics().catch(() => null)
      ]);
      setDonations(donList);
      setImpactData(impact);
    } catch (err) {
      console.error('Error loading initial data:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreatedDonation = (newDonation) => {
    setDonations(prev => [newDonation, ...prev]);
    setSelectedDonation(newDonation);
  };

  const handleMatchConfirmed = () => {
    loadData();
  };

  return (
    <div className="min-h-screen bg-[#FBFBF9] text-[#1F2228] relative">
      <div className="fixed inset-0 pointer-events-none bg-grain z-50"></div>

      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRegister={() => setIsRegisterOpen(true)}
        impactSummary={impactData?.summary}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {activeTab === 'donations' && (
          <>
            <HeroSection
              impactSummary={impactData?.summary}
              onExplore={() => {
                const el = document.getElementById('grid-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
            />
            <div id="grid-section">
              <DonationGrid
                donations={donations}
                onSelectDonation={(d) => setSelectedDonation(d)}
                onOpenRegister={() => setIsRegisterOpen(true)}
                loading={loading}
              />
            </div>
          </>
        )}

        {activeTab === 'demand' && (
          <DemandPredictionView />
        )}

        {activeTab === 'logistics' && (
          <LogisticsTracker donations={donations} onRefresh={loadData} />
        )}

        {activeTab === 'impact' && (
          <ImpactDashboard impactData={impactData} />
        )}

        {activeTab === 'ngos' && (
          <NgoDirectory />
        )}
      </main>

      <MatchModal
        donation={selectedDonation}
        onClose={() => setSelectedDonation(null)}
        onMatchConfirmed={handleMatchConfirmed}
      />

      <RegisterDonationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onCreated={handleCreatedDonation}
      />

      <footer className="mt-20 border-t border-[#E8E6DF] py-10 bg-[#FAF9F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#7A7E88] font-mono gap-4">
          <p>SurplusLink — Advanced SQL &amp; Algorithmic Redistribution Platform</p>
          <p>Production-Grade Environmental Logistics &amp; Resource Allocation Engine</p>
        </div>
      </footer>
    </div>
  );
}
