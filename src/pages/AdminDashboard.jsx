import { useState } from 'react';
import EventsTab from '../admin-tabs/EventsTab';
import RegistrationsTab from '../admin-tabs/RegistrationsTab';
import VerifyTab from '../admin-tabs/VerifyTab';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('events');
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex">
      {/* Sidebar stub */}
      <div className="w-64 glass-panel rounded-2xl p-6 mr-8 min-h-[70vh]">
        <h2 className="text-lg font-bold mb-6 text-white border-b border-borderDark pb-4">Admin Menu</h2>
        <nav className="space-y-2">
          <button 
            onClick={() => setActiveTab('events')} 
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'events' ? 'bg-white/10 text-white font-medium' : 'text-textSecondary hover:bg-white/5 hover:text-white'}`}
          >Events</button>
          <button 
            onClick={() => setActiveTab('registrations')} 
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'registrations' ? 'bg-white/10 text-white font-medium' : 'text-textSecondary hover:bg-white/5 hover:text-white'}`}
          >Registrations</button>
          <button 
            onClick={() => setActiveTab('verify')} 
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${activeTab === 'verify' ? 'bg-white/10 text-white font-medium' : 'text-textSecondary hover:bg-white/5 hover:text-white'}`}
          >Verify Entry</button>
        </nav>
      </div>

      {/* Content Area */}
      <div className="flex-1 glass-panel rounded-2xl p-8">
        {activeTab === 'events' && <EventsTab />}
        {activeTab === 'registrations' && <RegistrationsTab />}
        {activeTab === 'verify' && <VerifyTab />}
      </div>
    </div>
  );
}
