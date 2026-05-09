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
      setAttendees(await res.json());
    } catch (e) { console.error(e); }
    finally { setLoadingAttendees(false); }
  }, []);

  useEffect(() => { fetchAttendees(); }, [fetchAttendees]);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 220, height: 220 } }, false);
    scanner.render((text) => {
      try {
        const d = JSON.parse(text);
        if (d.regId) { verifyEntry(d.regId); scanner.pause(true); setTimeout(() => scanner.resume(), 3000); }
      } catch { handleVerifyResult(false, "Invalid QR Code format."); }
    }, () => {});
    return () => { scanner.clear().catch(() => {}); };
  }, []);

  const handleManualVerify = (e) => { e.preventDefault(); if (regIdInput.trim()) { verifyEntry(regIdInput.trim()); setRegIdInput(''); } };

  const verifyEntry = async (regId) => {
    const token = localStorage.getItem('adminToken');
    if (!token) { handleVerifyResult(false, "No admin token."); return; }
    try {
      const res = await fetch('/.netlify/functions/verifyAttendee', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ regId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      handleVerifyResult(true, `Verified: ${data.name}`);
      fetchAttendees();
    } catch (err) { handleVerifyResult(false, err.message); }
  };

  const handleVerifyResult = (ok, msg) => {
    setStatusType(ok ? 'success' : 'error'); setStatusMsg(msg);
    setTimeout(() => { setStatusMsg(null); setStatusType(null); }, 5000);
  };

  const handleClear = async (title) => {
    if (!confirm(`Clear attendance for "${title}"?`)) return;
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch('/.netlify/functions/clearEventAttendance', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ eventTitle: title })
      });
      if (!res.ok) throw new Error('Failed');
      fetchAttendees();
    } catch (err) { alert(err.message); }
  };

  const byEvent = attendees.reduce((a, x) => { (a[x.event_title] = a[x.event_title] || []).push(x); return a; }, {});

  return (
    <div className="space-y-5">
      <h1 className="text-xl sm:text-2xl font-bold text-white">Verify Entry</h1>

      {statusMsg && (
        <div className={`p-3 rounded-xl border text-sm ${statusType === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
          <p className="font-bold">{statusType === 'success' ? '✅ Valid' : '❌ Error'}</p>
          <p>{statusMsg}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white/5 border border-borderDark rounded-xl p-4 sm:p-5">
          <h2 className="text-sm sm:text-base font-bold text-white mb-3">Scan QR Code</h2>
          <div id="reader" className="w-full bg-black rounded-lg overflow-hidden border border-white/10"></div>
        </div>
        <div className="bg-white/5 border border-borderDark rounded-xl p-4 sm:p-5">
          <h2 className="text-sm sm:text-base font-bold text-white mb-3">Manual Entry</h2>
          <form onSubmit={handleManualVerify} className="flex flex-col sm:flex-row gap-3">
            <input type="text" placeholder="Enter REG-..." className="flex-1 bg-transparent border-b border-white/20 text-white p-2 text-sm focus:outline-none focus:border-white" value={regIdInput} onChange={e => setRegIdInput(e.target.value)} />
            <button type="submit" className="bg-white text-black px-5 py-2.5 rounded-full font-medium text-sm hover:bg-white/90">Verify</button>
          </form>
        </div>
      </div>

      <div className="bg-white/5 border border-borderDark rounded-xl p-4 sm:p-5">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="p-1.5 bg-green-500/20 rounded-lg"><Users className="w-4 h-4 text-green-400" /></div>
          <h2 className="text-sm sm:text-base font-bold text-white">Live Attendance</h2>
          <span className="ml-auto text-xs text-textSecondary bg-white/5 px-2 py-1 rounded-full border border-borderDark">{attendees.length} total</span>
        </div>

        {loadingAttendees ? <p className="text-textSecondary text-sm">Loading...</p>
        : attendees.length === 0 ? <p className="text-textSecondary text-center py-6 text-sm">No attendees yet.</p>
        : <div className="space-y-5">
            {Object.entries(byEvent).map(([title, people]) => (
              <div key={title}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h3 className="text-xs font-semibold text-accent uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
                    {title} <span className="text-textSecondary font-normal normal-case">({people.length})</span>
                  </h3>
                  <button onClick={() => handleClear(title)} className="flex items-center gap-1 text-xs text-red-400 hover:text-white hover:bg-red-500 bg-red-400/10 border border-red-400/20 px-2 py-1 rounded-lg">
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                </div>
                {/* Table on sm+, cards on mobile */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm text-left text-textSecondary">
                    <thead><tr className="text-xs uppercase text-textSecondary/60 border-b border-white/5">
                      <th className="py-2 px-3">#</th><th className="py-2 px-3">Name</th><th className="py-2 px-3">Email</th><th className="py-2 px-3">Reg ID</th>
                    </tr></thead>
                    <tbody>{people.map((a, i) => (
                      <tr key={a.id} className="border-b border-white/5 hover:bg-white/5">
                        <td className="py-2 px-3 text-textSecondary/60">{i+1}</td>
                        <td className="py-2 px-3 font-medium text-white">{a.full_name}</td>
                        <td className="py-2 px-3">{a.email}</td>
                        <td className="py-2 px-3 font-mono text-xs">{a.reg_id}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
                <div className="sm:hidden space-y-2">
                  {people.map((a, i) => (
                    <div key={a.id} className="bg-white/5 rounded-lg p-3 border border-white/5">
                      <div className="flex justify-between mb-1"><span className="font-medium text-white text-sm">{a.full_name}</span><span className="text-textSecondary/60 text-xs">#{i+1}</span></div>
                      <p className="text-xs text-textSecondary truncate">{a.email}</p>
                      <p className="text-xs font-mono text-textSecondary/70 mt-0.5">{a.reg_id}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        }
      </div>
    </div>
  );
}
