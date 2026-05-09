import { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RegisterModal({ event, onClose }) {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const token = localStorage.getItem('userToken');
    
    try {
      const res = await fetch('/.netlify/functions/registerAttendee', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          eventId: event.id,
          fullName: formData.name,
          email: formData.email,
          phone: formData.phone
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to register');
      
      setSuccess(true);
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      
      <div className="glass-panel relative w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl z-10 animate-in fade-in zoom-in duration-200 overflow-y-auto max-h-[95vh]">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!success ? (
          <>
            <div className="mb-6 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Register</h2>
              <p className="text-xs sm:text-sm text-textSecondary truncate">for {event.title}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              <div>
                <label className="block text-[10px] text-textSecondary uppercase tracking-wider mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="John Doe"
                  className="w-full bg-transparent border-b border-borderDark px-0 py-2 text-sm sm:text-base text-white focus:outline-none focus:border-white transition-colors placeholder:text-gray-700"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] text-textSecondary uppercase tracking-wider mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="john@example.com"
                  className="w-full bg-transparent border-b border-borderDark px-0 py-2 text-sm sm:text-base text-white focus:outline-none focus:border-white transition-colors placeholder:text-gray-700"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] text-textSecondary uppercase tracking-wider mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  required
                  placeholder="+91 0000000000"
                  className="w-full bg-transparent border-b border-borderDark px-0 py-2 text-sm sm:text-base text-white focus:outline-none focus:border-white transition-colors placeholder:text-gray-700"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full py-3 sm:py-3.5 mt-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 text-sm sm:text-base"
              >
                {isSubmitting ? 'Processing...' : 'Confirm Registration'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6 flex flex-col items-center">
            <CheckCircle2 className="w-14 h-14 sm:w-16 sm:h-16 text-green-400 mb-4 animate-bounce" />
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Request Submitted!</h2>
            <p className="text-xs sm:text-sm text-textSecondary mb-8">Your registration is pending admin approval.</p>
            
            <button 
              onClick={() => { onClose(); navigate('/profile'); }}
              className="w-full py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-colors border border-white/10 text-sm"
            >
              Go to My Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
