import { useState } from 'react';
import EventsTab from '../admin-tabs/EventsTab';
import RegistrationsTab from '../admin-tabs/RegistrationsTab';
import VerifyTab from '../admin-tabs/VerifyTab';

const tabs = [
  { id: 'events', label: 'Events', emoji: '📋' },
  { id: 'registrations', label: 'Registrations', emoji: '📝' },
  { id: 'verify', label: 'Verify', emoji: '🔍' },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('events');
  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 flex flex-col md:flex-row gap-4 sm:gap-6">
      
      {/* Sidebar — horizontal scrollable tabs on mobile, vertical on desktop */}
      <div className="w-full md:w-56 lg:w-64 shrink-0">
        {/* Mobile: horizontal pill tabs */}
        <div className="md:hidden flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id 
                  ? 'bg-accent/20 text-accent border border-accent/30' 
                  : 'bg-white/5 text-textSecondary border border-borderDark hover:bg-white/10 hover:text-white'
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Desktop: vertical sidebar */}
        <div className="hidden md:block glass-panel rounded-2xl p-5 min-h-[60vh]">
          <h2 className="text-base font-bold mb-5 text-white border-b border-borderDark pb-3">Admin Menu</h2>
          <nav className="flex flex-col space-y-1.5">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-2.5 rounded-lg transition-colors text-sm ${
                  activeTab === tab.id 
                    ? 'bg-white/10 text-white font-medium' 
                    : 'text-textSecondary hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="mr-2">{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 glass-panel rounded-2xl p-4 sm:p-6 lg:p-8 w-full min-w-0 overflow-hidden">
        {activeTab === 'events' && <EventsTab />}
        {activeTab === 'registrations' && <RegistrationsTab />}
        {activeTab === 'verify' && <VerifyTab />}
      </div>
    </div>
  );
}
