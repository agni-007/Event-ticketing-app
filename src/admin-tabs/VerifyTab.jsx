import { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function VerifyTab() {
  const [regIdInput, setRegIdInput] = useState('');
  const [statusMsg, setStatusMsg] = useState(null);
  const [statusType, setStatusType] = useState(null); // 'success' or 'error'

  useEffect(() => {
    // Initialize QR Scanner
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: {width: 250, height: 250} }, false);
    
    scanner.render((decodedText) => {
      // Handle the scan result
      try {
        const data = JSON.parse(decodedText);
        if (data.regId) {
          verifyEntry(data.regId);
          scanner.pause(true); // pause after successful read
          setTimeout(() => scanner.resume(), 3000); // resume after 3 seconds
        }
      } catch (e) {
        // Not JSON or invalid format
        handleVerifyResult(false, "Invalid QR Code format.");
      }
    }, (error) => {
      // parse error, ignore
    });

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear html5QrcodeScanner. ", error));
    };
  }, []);

  const handleManualVerify = (e) => {
    e.preventDefault();
    if (regIdInput.trim()) {
      verifyEntry(regIdInput.trim());
      setRegIdInput('');
    }
  };

  const verifyEntry = async (regId) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      handleVerifyResult(false, "No admin token. Please log in.");
      return;
    }

    try {
      const res = await fetch('/.netlify/functions/verifyAttendee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ regId })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }
      
      handleVerifyResult(true, `Success! Verified entry for: ${data.name}`);
    } catch (err) {
      handleVerifyResult(false, err.message);
    }
  };

  const handleVerifyResult = (success, message) => {
    setStatusType(success ? 'success' : 'error');
    setStatusMsg(message);
    setTimeout(() => {
      setStatusMsg(null);
      setStatusType(null);
    }, 5000);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-white">Verify Entry</h1>

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

        {/* Manual Entry */}
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

          {/* Status Message */}
          {statusMsg && (
            <div className={`p-4 rounded-xl border ${statusType === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              <p className="font-bold">{statusType === 'success' ? '✅ Valid' : '❌ Error'}</p>
              <p>{statusMsg}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
