import React from 'react';
import { BUSINESS_INFO, getWhatsAppUrl } from '../types';
import { Sparkles, Phone, MessageSquare, MapPin, Clock, Shield, ArrowUp, ExternalLink } from 'lucide-react';

interface FooterProps {
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
  onNavigate: (sectionId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenBooking, onOpenAdmin, onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-24 sm:pb-16 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-stone-800">
          {/* Col 1: Brand & Motto */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/assets/aistudio/image_d0ec8d5e.png"
                alt="Fazzynails Logo"
                className="w-12 h-12 rounded-full object-cover border-2 border-amber-300 shadow-md shrink-0"
              />
              <div>
                <span className="font-editorial text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
                  Fazzynails
                  <Sparkles className="w-4 h-4 text-rose-400" />
                </span>
                <span className="text-[10px] tracking-widest uppercase font-medium text-stone-400 block">
                  {BUSINESS_INFO.motto}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
              Agbani, Enugu’s premier boutique destination for flawless gel polish (₦3,000), sculpted luxury acrylics (₦15,000), and uncompromising salon sanitization.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href={BUSINESS_INFO.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <span>Facebook Page</span>
                <ExternalLink className="w-3 h-3 text-stone-400" />
              </a>

              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="lg:col-span-2 space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-stone-100 block">
              Navigation
            </span>
            <ul className="space-y-2 text-xs text-stone-400">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-white transition-colors cursor-pointer">
                  Home
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('services')} className="hover:text-white transition-colors cursor-pointer">
                  Nail Services
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('pricing')} className="hover:text-white transition-colors cursor-pointer">
                  Pricing Menu
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('gallery')} className="hover:text-white transition-colors cursor-pointer">
                  Lookbook Gallery
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('about')} className="hover:text-white transition-colors cursor-pointer">
                  About the Studio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('blog')} className="hover:text-white transition-colors cursor-pointer">
                  Nail Care Journal
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('reviews')} className="hover:text-white transition-colors cursor-pointer">
                  Client Reviews
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('contact')} className="hover:text-white transition-colors cursor-pointer">
                  Location & Contact
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Services & Core Pricing */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-stone-100 block">
              Popular Services
            </span>
            <ul className="space-y-2 text-xs text-stone-400">
              <li className="flex justify-between items-center pr-4">
                <span>Gel Polish Manicure</span>
                <span className="font-mono text-stone-200">₦3,000</span>
              </li>
              <li className="flex justify-between items-center pr-4">
                <span>Acrylic Full Set</span>
                <span className="font-mono text-stone-200">₦15,000</span>
              </li>
              <li className="flex justify-between items-center pr-4">
                <span>French Ombre Full Set</span>
                <span className="font-mono text-stone-200">₦18,000</span>
              </li>
              <li className="flex justify-between items-center pr-4">
                <span>BIAB Natural Overlay</span>
                <span className="font-mono text-stone-200">₦8,000</span>
              </li>
              <li className="flex justify-between items-center pr-4">
                <span>Luxury Spa Pedicure</span>
                <span className="font-mono text-stone-200">₦7,000</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Studio Contact & Hours */}
          <div className="lg:col-span-3 space-y-3">
            <span className="text-xs uppercase font-bold tracking-widest text-stone-100 block">
              Hours & Studio
            </span>
            <div className="space-y-2 text-xs text-stone-400">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-stone-300 font-medium">{BUSINESS_INFO.hours.weekdays}</p>
                  <p>{BUSINESS_INFO.hours.sunday}</p>
                </div>
              </div>

              <div className="flex items-start gap-2 pt-1">
                <MapPin className="w-4 h-4 text-stone-500 shrink-0 mt-0.5" />
                <span>{BUSINESS_INFO.address}</span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Phone className="w-4 h-4 text-stone-500 shrink-0" />
                <a href={`tel:${BUSINESS_INFO.phoneClean}`} className="hover:text-white font-mono">
                  {BUSINESS_INFO.phone}
                </a>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenBooking}
                className="w-full py-2 bg-stone-100 hover:bg-white text-stone-900 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Book Appointment Online
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Sub-footer */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} Fazzynails. All rights reserved. {BUSINESS_INFO.motto}.</p>

          <div className="flex items-center gap-6">
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Management</span>
            </button>

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1 text-stone-400 hover:text-stone-200 transition-colors cursor-pointer"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
