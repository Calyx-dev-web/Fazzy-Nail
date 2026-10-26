import React from 'react';
import { BUSINESS_INFO, getWhatsAppUrl } from '../types';
import { Phone, MessageSquare, Calendar } from 'lucide-react';

interface FloatingContactBarProps {
  onOpenBooking: () => void;
}

export const FloatingContactBar: React.FC<FloatingContactBarProps> = ({ onOpenBooking }) => {
  return (
    <>
      {/* Desktop Floating WhatsApp Bubble */}
      <aside aria-label="Quick Actions" className="hidden sm:block fixed bottom-6 right-6 z-40">
        <a
          href={getWhatsAppUrl("Hello Fazzynails, I would like to book a nail appointment!")}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-full shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-white"
          title="Direct WhatsApp Chat"
        >
          <MessageSquare className="w-5 h-5 fill-white text-emerald-600" />
          <span className="pr-1">Chat on WhatsApp</span>
        </a>
      </aside>

      {/* Mobile Sticky Bar - strictly capped under 15% height */}
      <aside aria-label="Mobile Quick Actions" className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900/95 backdrop-blur-md border-t border-stone-800 px-3 py-2.5">
        <div className="grid grid-cols-3 gap-2">
          {/* Call button */}
          <a
            href={`tel:${BUSINESS_INFO.phoneClean}`}
            className="flex flex-col items-center justify-center py-1.5 px-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-[11px] font-medium transition-colors"
          >
            <Phone className="w-4 h-4 text-stone-300 mb-0.5" />
            <span>Call</span>
          </a>

          {/* WhatsApp Direct Link (Prompt 3) */}
          <a
            href={getWhatsAppUrl("Hello Fazzynails, I'd like to book an appointment or check availability!")}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-semibold transition-colors shadow-xs"
          >
            <MessageSquare className="w-4 h-4 text-white mb-0.5" />
            <span>WhatsApp</span>
          </a>

          {/* Book online */}
          <button
            onClick={onOpenBooking}
            className="flex flex-col items-center justify-center py-1.5 px-2 bg-rose-900 hover:bg-rose-950 text-white rounded-xl text-[11px] font-semibold transition-colors cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-rose-300 mb-0.5" />
            <span>Book Now</span>
          </button>
        </div>
      </aside>
    </>
  );
};
