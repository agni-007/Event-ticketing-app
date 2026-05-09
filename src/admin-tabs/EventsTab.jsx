import { useState, useEffect } from 'react';

export default function EventsTab() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', venue: '', image_url: '' });

  const fetchEvents = async () => {
    try {
      const res = await fetch('/.netlify/functions/getEvents');
      if (!res.ok) throw new Error('Failed to fetch events');
      setEvents(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleAddEvent = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('adminToken');
    if (!token) { alert("No admin token."); return; }
    try {
      const res = await fetch('/.netlify/functions/addEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newEvent)
      });
      if (!res.ok) throw new Error('Failed to add event');
      await fetchEvents();
      setNewEvent({ title: '', description: '', date: '', venue: '', image_url: '' });
    } catch (err) { alert(err.message); }
  };

  const handleDeleteEvent = async (id) => {
    if (!confirm("Delete this event?")) return;
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch('/.netlify/functions/deleteEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchEvents();
    } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">Manage Events</h1>
      {error && <p className="text-danger mb-4 text-sm">{error}</p>}

      {/* Add Event Form */}
      <div className="bg-white/5 border border-borderDark rounded-xl p-4 sm:p-6 mb-6">
        <h2 className="text-sm sm:text-base font-bold text-white mb-3 sm:mb-4">Add New Event</h2>
        <form onSubmit={handleAddEvent} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <input type="text" placeholder="Event Title" required className="bg-transparent border-b border-white/20 text-white p-2 text-sm focus:outline-none focus:border-white transition-colors" value={newEvent.title} onChange={e => setNewEvent({...newEvent, title: e.target.value})} />
          <input type="datetime-local" required className="bg-transparent border-b border-white/20 text-white p-2 text-sm focus:outline-none focus:border-white transition-colors" value={newEvent.date} onChange={e => setNewEvent({...newEvent, date: e.target.value})} />
          <input type="text" placeholder="Venue" required className="bg-transparent border-b border-white/20 text-white p-2 text-sm focus:outline-none focus:border-white transition-colors" value={newEvent.venue} onChange={e => setNewEvent({...newEvent, venue: e.target.value})} />
          <input type="text" placeholder="Image URL (Optional)" className="bg-transparent border-b border-white/20 text-white p-2 text-sm focus:outline-none focus:border-white transition-colors" value={newEvent.image_url} onChange={e => setNewEvent({...newEvent, image_url: e.target.value})} />
          <textarea placeholder="Description" required rows="2" className="sm:col-span-2 bg-transparent border-b border-white/20 text-white p-2 text-sm focus:outline-none focus:border-white transition-colors resize-none" value={newEvent.description} onChange={e => setNewEvent({...newEvent, description: e.target.value})} />
          <div className="sm:col-span-2 flex justify-end mt-1">
            <button type="submit" className="bg-white text-black px-5 py-2 rounded-full font-medium text-sm hover:bg-white/90">Add Event</button>
          </div>
        </form>
      </div>

      {/* Events List */}
      <div>
        <h2 className="text-sm sm:text-base font-bold text-white mb-3 sm:mb-4">Current Events</h2>
        {loading ? <p className="text-textSecondary text-sm">Loading...</p> : (
          <div className="space-y-3">
            {events.map(event => (
              <div key={event.id} className="bg-white/5 border border-borderDark rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div className="min-w-0">
                  <h3 className="text-white font-medium text-sm sm:text-base truncate">{event.title}</h3>
                  <p className="text-xs sm:text-sm text-textSecondary truncate">{new Date(event.date).toLocaleString()} • {event.venue}</p>
                </div>
                <button onClick={() => handleDeleteEvent(event.id)} className="self-end sm:self-center text-danger border border-danger/30 hover:bg-danger/10 px-3 py-1.5 rounded-lg text-xs shrink-0">Delete</button>
              </div>
            ))}
            {events.length === 0 && <p className="text-textSecondary text-sm">No events found.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
