import { useState, useEffect, useCallback } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Users, CheckCircle2, Trash2 } from 'lucide-react';

export default function VerifyTab() {
  const [regIdInput, setRegIdInput] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);
  const [statusType, setStatusType] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loadingAttendees, setLoadingAttendees] = useState(true);

  const fetchAttendees = useCallback(async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    try {
      const res = await fetch('/.netlify/functions/getAttendees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      setAttendees(data);
    } catch (e) {
      console.error('Failed to load attendees', e);
    } finally {
      setLoadingAttendees(false);
    }
  }, []);

  useEffect(() => { fetchAttendees(); }, [fetchAttendees]);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);
    scanner.render((decodedText) => {
      try {
        const data = JSON.parse(decodedText);
        if (data.regId) {
          verifyEntry(data.regId);
          scanner.pause(true);
          setTimeout(() => scanner.resume(), 3000);
        }
      } catch (e) {
        handleVerifyResult(false, "Invalid QR Code format.");
      }
    }, () => {});
    return () => { scanner.clear().catch(e => console.error("Failed to clear scanner.", e)); };
  }, []);

  const handleManualVerify = (e) => {
    e.preventDefault();
    if (regIdInput.trim()) { verifyEntry(regIdInput.trim()); setRegIdInput(''); }
  };

  const verifyEntry = async (regId) => {
    const token = localStorage.getItem('adminToken');
    if (!token) { handleVerifyResult(false, "No admin token. Please log in."); return; }
    try {
      const res = await fetch('/.netlify/functions/verifyAttendee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ regId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      handleVerifyResult(true, `Entry verified for: ${data.name}`);
      fetchAttendees();
    } catch (err) {
      handleVerifyResult(false, err.message);
    }
  };

  const handleVerifyResult = (success, message) => {
    setStatusType(success ? 'success' : 'error');
    setStatusMsg(message);
    setTimeout(() => { setStatusMsg(null); setStatusType(null); }, 5000);
  };

  const handleClearEventAttendance = async (eventTitle) => {
    if (!window.confirm(`Clear all attendance records for "${eventTitle}"? This will reset their attended status.`)) return;
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch('/.netlify/functions/clearEventAttendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ eventTitle })
      });
      if (!res.ok) throw new Error('Failed to clear attendance');
      fetchAttendees();
    } catch (err) {
      alert(err.message);
    }
  };

  const byEvent = attendees.reduce((acc, a) => {
    if (!acc[a.event_title]) acc[a.event_title] = [];
    acc[a.event_title].push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Verify Entry</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* QR Scanner */}
        <div className="bg-white/5 border border-borderDark rounded-xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Scan QR Code</h2>
          <div id="reader" className="w-full bg-black rounded-lg overflow-hidden border border-white/10"></div>
          <style>{`
            #reader__dashboard_section_csr span { color: white; }
            #reader button { background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); border-radius: 8px; padding: 6px 12px; margin: 4px; }
            #reader a { color: #888; }
          `}</style>
        </div>

        {/* Manual + Status */}
        <div>
          <div className="bg-white/5 border border-borderDark rounded-xl p-6 mb-6">
            <h2 className="text-lg font-bold text-white mb-4">Manual Entry</h2>
            <form onSubmit={handleManualVerify} className="flex gap-4">
              <input
                type="text"
                placeholder="Enter Registration ID (e.g. REG-...)"
                className="flex-1 bg-transparent border-b border-white/20 text-white p-2 focus:outline-none focus:border-white transition-colors"
                value={regIdInput}
                onChange={e => setRegIdInput(e.target.value)}
              />
              <button type="submit" className="bg-white text-black px-6 py-2 rounded-full font-medium hover:bg-white/90 transition-colors">
                Verify
              </button>
            </form>
          </div>
          {statusMsg && (
            <div className={`p-4 rounded-xl border ${statusType === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              <p className="font-bold">{statusType === 'success' ? '✅ Valid' : '❌ Error'}</p>
              <p>{statusMsg}</p>
            </div>
          )}
        </div>
      </div>

      {/* Live Attendance Board */}
      <div className="bg-white/5 border border-borderDark rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <Users className="w-5 h-5 text-green-400" />
          </div>
          <h2 className="text-lg font-bold text-white">Live Attendance</h2>
          <span className="ml-auto text-sm text-textSecondary bg-white/5 px-3 py-1 rounded-full border border-borderDark">
            {attendees.length} total attended
          </span>
        </div>

        {loadingAttendees ? (
          <p className="text-textSecondary">Loading attendance data...</p>
        ) : attendees.length === 0 ? (
          <p className="text-textSecondary text-center py-8">No attendees checked in yet.</p>
        ) : (
          <div className="space-y-8">
            {Object.entries(byEvent).map(([eventTitle, people]) => (
              <div key={eventTitle}>
                {/* Event header with Clear button */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-accent uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    {eventTitle}
                    <span className="text-textSecondary font-normal normal-case">({people.length} attending)</span>
                  </h3>
                  <button
                    onClick={() => handleClearEventAttendance(eventTitle)}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-white hover:bg-red-500 bg-red-400/10 border border-red-400/20 px-3 py-1.5 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear All
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-textSecondary min-w-[500px]">
                    <thead>
                      <tr className="text-xs uppercase text-textSecondary/60 border-b border-white/5">
                        <th className="py-2 px-3">#</th>
                        <th className="py-2 px-3">Name</th>
                        <th className="py-2 px-3">Email</th>
                        <th className="py-2 px-3">Reg ID</th>
                      </tr>
                    </thead>
                    <tbody>
                      {people.map((a, idx) => (
                        <tr key={a.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="py-2 px-3 text-textSecondary/60">{idx + 1}</td>
                          <td className="py-2 px-3 font-medium text-white">{a.full_name}</td>
                          <td className="py-2 px-3">{a.email}</td>
                          <td className="py-2 px-3 font-mono text-xs">{a.reg_id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
