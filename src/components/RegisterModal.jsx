import { useState } from 'react';
import { X, CheckCircle2, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function RegisterModal({ event, onClose }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/.netlify/functions/registerAttendee', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register');
      
      setSuccessData(data);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="glass-panel relative w-full max-w-md rounded-2xl p-8 shadow-2xl z-10 animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!successData ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-1">Register</h2>
              <p className="text-sm text-textSecondary">for {event.title}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <input 
                  type="text" 
                  required
                  placeholder="Full Name"
                  className="w-full bg-transparent border-b border-borderDark px-0 py-2 text-white focus:outline-none focus:border-white transition-colors placeholder:text-gray-600"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <input 
                  type="email" 
                  required
                  placeholder="Email Address"
                  className="w-full bg-transparent border-b border-borderDark px-0 py-2 text-white focus:outline-none focus:border-white transition-colors placeholder:text-gray-600"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <input 
                  type="tel" 
                  required
                  placeholder="Phone Number"
                  className="w-full bg-transparent border-b border-borderDark px-0 py-2 text-white focus:outline-none focus:border-white transition-colors placeholder:text-gray-600"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3 mt-8 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Registration'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4 flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-green-400 mb-4 animate-bounce" />
            <h2 className="text-2xl font-bold text-white mb-2">You're In!</h2>
            <p className="text-sm text-textSecondary mb-6">Present this QR code at the entrance</p>
            
            <div className="bg-white p-4 rounded-xl mb-6">
              <QRCodeSVG value={successData.qrData} size={160} />
            </div>
            
            <div className="space-y-1 mb-6 text-sm text-gray-300">
              <p>Registration ID: <span className="font-mono text-white">{successData.regId}</span></p>
              <p>Client ID: <span className="font-mono text-white">{successData.clientId}</span></p>
            </div>
            
            <button className="flex items-center space-x-2 text-sm text-accent hover:text-white transition-colors px-4 py-2 rounded-lg border border-borderDark hover:bg-surface">
              <Download className="w-4 h-4" />
              <span>Save Details</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
