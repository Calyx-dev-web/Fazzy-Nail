import React, { useState } from 'react';
import { Phone, Calendar, Menu, X, Shield, Sparkles, MessageSquare } from 'lucide-react';
import { BUSINESS_INFO, getWhatsAppUrl } from '../types';
import { IMAGES } from '../assets/images';

interface NavbarProps {
  onOpenBooking: () => void;
  onOpenAdmin: () => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  pendingBookingsCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBooking,
  onOpenAdmin,
  currentPage,
  setCurrentPage,
  pendingBookingsCount = 0,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'pricing', label: 'Pricing' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'about', label: 'About' },
    { id: 'blog', label: 'Blog' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    setCurrentPage(id);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-stone-200/80 transition-all">
      {/* Emergency & Quick Notice Top Strip */}
      <div className="bg-stone-900 text-stone-200 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-medium text-stone-100">Same-Day Slots Available:</span>
            <span className="text-stone-300 hidden sm:inline">Mon–Sat 9AM–7PM · Sunday 1PM–6PM</span>
          </div>

          <div className="flex items-center gap-4 shrink-0 text-stone-300">
            <a
              href={getWhatsAppUrl("Hello Fazzynails, I need an emergency nail appointment slot!")}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-rose-300 transition-colors flex items-center gap-1.5 font-medium text-rose-200"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Emergency Slot WhatsApp</span>
            </a>
            <span className="text-stone-700 hidden sm:inline">|</span>
            <a
              href={`tel:${BUSINESS_INFO.phoneClean}`}
              className="hover:text-white transition-colors hidden sm:flex items-center gap-1 font-mono text-[11px]"
            >
              <Phone className="w-3 h-3 text-stone-400" />
              <span>{BUSINESS_INFO.phone}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation (Strict 3-zone contract) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-3 sm:gap-6 lg:gap-8">
        {/* Zone 1: Brand Logo & Wordmark */}
        <button
          onClick={() => handleNavClick('home')}
          className="text-left group flex items-center gap-2.5 sm:gap-3 shrink-0 cursor-pointer"
        >
          <img
            src={IMAGES.logo}
            alt="Fazzynails Logo"
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-amber-300 shadow-xs group-hover:scale-105 transition-transform shrink-0"
          />
          <div className="flex flex-col justify-center">
            <span className="font-editorial text-xl sm:text-2xl font-bold tracking-tight text-stone-900 flex items-center gap-1.5">
              Fazzynails
              <Sparkles className="w-3.5 h-3.5 text-rose-500 fill-rose-300/40" />
            </span>
            <span className="text-[10px] tracking-widest uppercase font-medium text-stone-500">
              {BUSINESS_INFO.motto}
            </span>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-stone-600">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`hover:text-stone-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer relative py-1 ${
                currentPage === item.id ? 'text-stone-950 font-semibold' : ''
              }`}
            >
              {item.label}
              {currentPage === item.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600 rounded-full" />
              )}
            </button>
          ))}
        </nav>

        {/* Zone 3: Primary Action + Admin Shortcut (2FA Secured) */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <button
            onClick={onOpenAdmin}
            title="Admin Management Panel (2FA Protected)"
            className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors relative cursor-pointer border border-stone-200/80 bg-white shadow-2xs"
            aria-label="Open Admin Dashboard (2FA Protected)"
          >
            <Shield className="w-4 h-4 text-stone-800" />
            {pendingBookingsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
            )}
            <span className="sr-only">Admin 2FA Security</span>
          </button>

          <a
            href={getWhatsAppUrl("Hello Fazzynails, I would like to book a session with you!")}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors whitespace-nowrap"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp</span>
          </a>

          <button
            onClick={onOpenBooking}
            className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 min-h-[38px] sm:min-h-[42px] text-xs sm:text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 active:scale-[0.98] rounded-lg shadow-sm transition-all whitespace-nowrap shrink cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-rose-300 shrink-0" />
            <span className="truncate">
              <span className="inline sm:hidden">Book</span>
              <span className="hidden sm:inline">Book Appointment</span>
            </span>
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-stone-700 hover:bg-stone-100 rounded-lg cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF8F5] border-b border-stone-200 px-4 pt-2 pb-6 space-y-2">
          <div className="grid grid-cols-2 gap-2 py-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-left px-3 py-2 text-sm rounded-md transition-colors cursor-pointer ${
                  currentPage === item.id
                    ? 'bg-stone-200 font-semibold text-stone-950'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="pt-3 border-t border-stone-200 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-medium text-stone-700 bg-stone-100 rounded-lg"
            >
              <Shield className="w-4 h-4 text-stone-600" />
              <span>Admin Management Dashboard</span>
            </button>
            
            <a
              href={getWhatsAppUrl("Hello Fazzynails, I need an emergency appointment slot!")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Emergency WhatsApp Chat</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
