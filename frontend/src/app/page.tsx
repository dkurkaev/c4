'use client';

import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import DDPage from '@/domain/dd/DDPage';

export default function Home() {
  const [activeSection, setActiveSection] = useState('C2');

  const renderContent = () => {
    switch (activeSection) {
      case 'C2':
        return (
          <div className="p-8">
            <h1 className="text-3xl font-bold">C2</h1>
          </div>
        );
      case 'DD':
        return <DDPage />;
      default:
        return <div className="p-8">Выберите раздел</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar onSectionChange={setActiveSection} activeSection={activeSection} />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
}
