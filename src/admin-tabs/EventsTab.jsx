import { useState, useEffect } from 'react';

export default function EventsTab() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    venue: '',
    image_url: ''
  });

  const fetchEvents = async () => {
    try {
      const res = await fetch('/.netlify/functions/getEvents');
      if (!res.ok) throw new Error('Failed to fetch events');
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    if (!token) {
      alert("No admin token found. Please log in.");
      return;
    }
    
    try {
      const res = await fetch('/.netlify/functions/addEvent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newEvent)
      });
      if (!res.ok) throw new Error('Failed to add event');
      await fetchEvents();
      setNewEvent({ title: '', description: '', date: '', venue: '', image_url: '' });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    const token = localStorage.getItem('adminToken');
    
    try {
      const res = await fetch('/.netlify/functions/deleteEvent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error('Failed to delete event');
      await fetchEvents();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-white">Manage Events</h1>

      {error && <p className="text-danger mb-4">{error}</p>}

      {/* Add Event Form */}
      <div className="bg-white/5 border border-borderDark rounded-xl p-6 mb-8">
        <h2 className="text-lg font-bold text-white mb-4">Add New Event</h2>
        <form onSubmit={handleAddEvent} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Event Title" required className="bg-transparent border-b border-white/20 text-white p-2 focus:outline-none focus:border-white transition-colors" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
          <input type="datetime-local" required className="bg-transparent border-b border-white/20 text-white p-2 focus:outline-none focus:border-white transition-colors" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
          <input type="text" placeholder="Venue" required className="bg-transparent border-b border-white/20 text-white p-2 focus:outline-none focus:border-white transition-colors" value={newEvent.venue} onChange={e => setNewEvent({...newEvent, venue: e.target.value})} />
          <input type="text" placeholder="Image URL (Optional)" className="bg-transparent border-b border-white/20 text-white p-2 focus:outline-none focus:border-white transition-colors" value={newEvent.image_url} onChange={e => setNewEvent({...newEvent, image_url: e.target.value})} />
          <textarea placeholder="Description" required rows="2" className="md:col-span-2 bg-transparent border-b border-white/20 text-white p-2 focus:outline-none focus:border-white transition-colors resize-none" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
          <div className="md:col-span-2 flex justify-end mt-2">
            <button type="submit" className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-white/90 transition-colors">Add Event</button>
          </div>
        </form>
      </div>

      {/* Events List */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4">Current Events</h2>
        {loading ? (
          <p className="text-textSecondary">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {events.map(event => (
              <div key={event.id} className="bg-white/5 border border-borderDark rounded-xl p-4 flex justify-between items-center">
                <div>
                  <h3 className="text-white font-medium">{event.title}</h3>
                  <p className="text-sm text-textSecondary">{new Date(event.date).toLocaleString()} • {event.venue}</p>
                </div>
                <button onClick={() => handleDeleteEvent(event.id)} className="text-danger border border-danger/30 hover:bg-danger/10 px-4 py-1.5 rounded-lg text-sm transition-colors">Delete</button>
              </div>
            ))}
            {events.length === 0 && <p className="text-textSecondary text-sm">No events found.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
