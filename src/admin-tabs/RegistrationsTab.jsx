import { useState, useEffect } from 'react';

export default function RegistrationsTab() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegistrations = async () => {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError("No admin token found. Please log in.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/.netlify/functions/getRegistrations', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch registrations');
        const data = await res.json();
        setRegistrations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRegistrations();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-white">All Registrations</h1>

      {error && <p className="text-danger mb-4">{error}</p>}

      {loading ? (
        <p className="text-textSecondary">Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-textSecondary">
            <thead className="text-xs text-textSecondary uppercase bg-white/5 border-b border-borderDark">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">Reg ID</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((reg) => (
                <tr key={reg.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium text-white">{reg.full_name}</td>
                  <td className="px-4 py-3">{reg.email}</td>
                  <td className="px-4 py-3">{reg.event_title}</td>
                  <td className="px-4 py-3 font-mono text-xs">{reg.reg_id}</td>
                  <td className="px-4 py-3">
                    {reg.attended ? (
                      <span className="text-green-400 bg-green-400/10 px-2 py-1 rounded-full text-xs">Attended</span>
                    ) : (
                      <span className="text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full text-xs">Pending</span>
                    )}
                  </td>
                </tr>
              ))}
              {registrations.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-4 py-6 text-center">No registrations found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
