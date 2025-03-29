import React from 'react';
import ArchitectureOverview from './components/ArchitectureOverview';
import ClientFeatures from './components/ClientFeatures';
import DemoSection from './components/DemoSection';

function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">AIACD Core Client</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="space-y-8">
            <ArchitectureOverview />
            <ClientFeatures />
            <DemoSection />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;