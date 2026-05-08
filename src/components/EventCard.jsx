import { Calendar, MapPin } from 'lucide-react';

export default function EventCard({ event, onRegister }) {
  const dateObj = new Date(event.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col group transition-transform hover:-translate-y-1 hover:shadow-2xl">
      <div className="h-48 w-full overflow-hidden">
        <img 
          src={event.image_url} 
          alt={event.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold mb-2 text-white">{event.title}</h3>
        <p className="text-sm text-textSecondary mb-4 flex-grow line-clamp-2">{event.description}</p>
        
        <div className="space-y-2 mb-6 text-sm text-gray-300">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-accent" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-accent" />
            <span>{event.venue}</span>
          </div>
        </div>
        
        <button 
          onClick={onRegister}
          className="w-full py-2.5 rounded-xl border border-white/20 text-white font-medium hover:bg-white hover:text-black transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          Register &rarr;
        </button>
      </div>
    </div>
  );
}
