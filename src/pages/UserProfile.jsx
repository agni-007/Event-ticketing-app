import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

export default function UserProfile() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) { navigate('/'); return; }
    fetch('/.netlify/functions/getUserRegistrations', { headers: { 'Authorization': `Bearer ${token}` } })
      .then(res => { if (!res.ok) throw new Error('Failed'); return res.json(); })
      .then(data => { setRegistrations(data); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [navigate]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl font-bold text-white mb-6 sm:mb-8">My Registered Events</h1>
      {error && <p className="text-red-400 mb-4 text-sm">{error}</p>}

      {loading ? <p className="text-textSecondary text-sm">Loading your profile...</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {registrations.length === 0 ? (
            <p className="text-textSecondary text-sm">You haven't registered for any events yet.</p>
          ) : registrations.map(reg => (
            <div key={reg.id} className="glass-panel p-4 sm:p-6 rounded-2xl flex flex-col items-center">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2 text-center">{reg.event_title}</h3>
              
              {reg.status === 'approved' ? (
                <>
                  <div className="bg-white p-3 sm:p-4 rounded-xl my-3">
                    <QRCodeSVG value={reg.qr_data} size={120} />
                  </div>
                  <p className="text-xs sm:text-sm text-textSecondary mb-1">Ticket: <span className="font-mono text-white text-xs">{reg.reg_id}</span></p>
                  <p className="text-green-400 font-medium mt-2 bg-green-400/10 px-3 py-1 rounded-full text-xs sm:text-sm">Approved</p>
                </>
              ) : reg.status === 'declined' ? (
                <div className="flex-1 flex items-center justify-center py-8">
                  <p className="text-red-400 font-medium bg-red-400/10 px-4 py-2 rounded-full text-sm">Declined</p>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center py-8">
                  <p className="text-yellow-400 font-medium bg-yellow-400/10 px-4 py-2 rounded-full text-sm mb-2">Pending Approval</p>
                  <p className="text-xs text-textSecondary text-center px-2">QR code will appear once approved.</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
