import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard';
import RegisterModal from '../components/RegisterModal';

export default function Home() {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('userToken')) { navigate('/'); return; }
    fetch('/.netlify/functions/getEvents')
      .then(res => res.json())
      .then(data => { setEvents(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8 sm:mb-16 text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-3 sm:mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-500 tracking-tight">
          Discover Campus Events
        </h1>
        <p className="text-textSecondary text-sm sm:text-lg max-w-2xl mx-auto font-light px-2">
          Browse and register for the latest events happening around campus.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {events.map(event => (
          <EventCard key={event.id} event={event} onRegister={() => setSelectedEvent(event)} />
        ))}
      </div>

      {loading && <p className="text-textSecondary text-center py-8">Loading events...</p>}
      {!loading && events.length === 0 && <p className="text-textSecondary text-center py-8">No events available right now.</p>}

      {selectedEvent && <RegisterModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  );
}
