import { useState } from 'react';
import EventCard from '../components/EventCard';
import RegisterModal from '../components/RegisterModal';

export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Hardcoded mock events for Phase 1
  const events = [
    {
      id: 1,
      title: "Tech Symposium 2026",
      date: "2026-10-15T10:00:00",
      venue: "Main Auditorium",
      description: "Annual technology symposium featuring guest speakers and hackathons.",
      image_url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60",
      is_active: true
    },
    {
      id: 2,
      title: "Cultural Fest - Nexus",
      date: "2026-11-20T17:00:00",
      venue: "Open Air Theatre",
      description: "The biggest cultural night of the year. Music, dance, and drama.",
      image_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800&auto=format&fit=crop&q=60",
      is_active: true
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tight">
          Discover Campus Events
        </h1>
        <p className="text-textSecondary text-lg max-w-2xl mx-auto font-light">
          Browse and register for the latest events happening around campus. Fast, simple, and secure ticketing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {events.map(event => (
          <EventCard 
            key={event.id} 
            event={event} 
            onRegister={() => setSelectedEvent(event)} 
          />
        ))}
      </div>

      {selectedEvent && (
        <RegisterModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
        />
      )}
    </div>
  );
}
