import React from 'react';
import { useApp } from './context/AppContext';
import Header from './components/layout/Header';
import Navigation from './components/layout/Navigation';
import LiveWalkView from './components/live_walk/LiveWalkView';
import BreedEncyclopedia from './components/breeds/BreedEncyclopedia';
import DogProfilesView from './components/profiles/DogProfilesView';
import TrainingGuidesView from './components/training/TrainingGuidesView';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';

export function App() {
  const { activeTab, error } = useApp();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'live_walk':
        return <LiveWalkView />;
      case 'breeds':
        return <BreedEncyclopedia />;
      case 'profiles':
        return <DogProfilesView />;
      case 'training':
        return <TrainingGuidesView />;
      case 'analytics':
        return <AnalyticsDashboard />;
      default:
        return <LiveWalkView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream-100 text-ink-primary font-sans">
      {/* Top Header */}
      <Header />

      {/* Responsive Navigation Bar */}
      <Navigation />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-sm font-semibold flex items-center justify-between shadow-soft animate-fade-in">
            <span>{error}</span>
          </div>
        )}

        {renderActiveView()}
      </main>
    </div>
  );
}

export default App;
