import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';

export default function RegistrationsTab() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRegistrations = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) { setError("No admin token."); setLoading(false); return; }
    try {
      const res = await fetch('/.netlify/functions/getRegistrations', { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch');
      setRegistrations(await res.json());
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRegistrations(); }, []);

  const handleUpdateStatus = async (regId, status) => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch('/.netlify/functions/updateRegistrationStatus', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ regId, status })
      });
      if (!res.ok) throw new Error('Failed');
      fetchRegistrations();
    } catch (err) { alert(err.message); }
  };

  const handleDelete = async (regId) => {
    if (!confirm('Delete this registration permanently?')) return;
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch('/.netlify/functions/deleteRegistration', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ regId })
      });
      if (!res.ok) throw new Error('Failed');
      fetchRegistrations();
    } catch (err) { alert(err.message); }
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      approved: 'text-green-400 bg-green-400/10',
      declined: 'text-red-400 bg-red-400/10',
      pending: 'text-yellow-400 bg-yellow-400/10'
    };
    return <span className={`${styles[status] || styles.pending} px-2 py-0.5 rounded-full text-xs font-medium capitalize`}>{status}</span>;
  };

  return (
    <div>
      <h1 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-white">All Registrations</h1>
      {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}

      {loading ? <p className="text-textSecondary text-sm">Loading...</p> : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm text-textSecondary">
              <thead className="text-xs uppercase bg-white/5 border-b border-borderDark">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Event</th>
                  <th className="px-4 py-3">Reg ID</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr key={reg.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-4 py-3 font-medium text-white">{reg.full_name}</td>
                    <td className="px-4 py-3">{reg.email}</td>
                    <td className="px-4 py-3">{reg.event_title}</td>
                    <td className="px-4 py-3 font-mono text-xs">{reg.reg_id}</td>
                    <td className="px-4 py-3"><StatusBadge status={reg.status} /></td>
                    <td className="px-4 py-3">
                      {reg.status === 'pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdateStatus(reg.id, 'approved')} className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded">Approve</button>
                          <button onClick={() => handleUpdateStatus(reg.id, 'declined')} className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded">Decline</button>
                        </div>
                      )}
                      {reg.status === 'approved' && reg.attended === 1 && <span className="text-xs text-gray-400 italic">Attended</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(reg.id)} className="p-1.5 rounded-lg text-textSecondary hover:text-red-400 hover:bg-red-400/10" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
                {registrations.length === 0 && <tr><td colSpan="7" className="px-4 py-6 text-center text-sm">No registrations found.</td></tr>}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {registrations.length === 0 && <p className="text-textSecondary text-center py-6 text-sm">No registrations found.</p>}
            {registrations.map((reg) => (
              <div key={reg.id} className="bg-white/5 border border-borderDark rounded-xl p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-white text-sm">{reg.full_name}</p>
                    <p className="text-xs text-textSecondary truncate">{reg.email}</p>
                  </div>
                  <StatusBadge status={reg.status} />
                </div>
                <div className="flex items-center justify-between text-xs text-textSecondary mt-2 pt-2 border-t border-white/5">
                  <div>
                    <p className="text-accent">{reg.event_title}</p>
                    <p className="font-mono mt-0.5">{reg.reg_id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {reg.status === 'pending' && (
                      <>
                        <button onClick={() => handleUpdateStatus(reg.id, 'approved')} className="bg-green-500 text-white px-2.5 py-1 rounded text-xs">✓</button>
                        <button onClick={() => handleUpdateStatus(reg.id, 'declined')} className="bg-red-500 text-white px-2.5 py-1 rounded text-xs">✕</button>
                      </>
                    )}
                    <button onClick={() => handleDelete(reg.id)} className="p-1.5 rounded-lg text-textSecondary hover:text-red-400 hover:bg-red-400/10">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
