import { Calendar, MapPin } from 'lucide-react';

export default function EventCard({ event, onRegister }) {
  const dateObj = new Date(event.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  
  return (
    <div className="glass-panel rounded-2xl overflow-hidden flex flex-col group transition-transform hover:-translate-y-1 hover:shadow-2xl">
      <div className="h-40 sm:h-48 w-full overflow-hidden">
        <img 
          src={event.image_url} 
          alt={event.title} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="p-4 sm:p-6 flex flex-col flex-grow">
        <h3 className="text-lg sm:text-xl font-bold mb-1.5 sm:mb-2 text-white line-clamp-1">{event.title}</h3>
        <p className="text-xs sm:text-sm text-textSecondary mb-3 sm:mb-4 flex-grow line-clamp-2">{event.description}</p>
        
        <div className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-6 text-[11px] sm:text-sm text-gray-300">
          <div className="flex items-center space-x-2">
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>
        
        <button 
          onClick={onRegister}
          className="w-full py-2 sm:py-2.5 rounded-xl border border-white/20 text-white text-sm font-medium hover:bg-white hover:text-black transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50"
        >
          Register &rarr;
        </button>
      </div>
    </div>
  );
}
