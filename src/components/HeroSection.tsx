import React from 'react';
import { Calendar, Phone, Sparkles, Star, Clock, CheckCircle2, MessageSquare } from 'lucide-react';
import { BUSINESS_INFO, getWhatsAppUrl } from '../types';
import { IMAGES } from '../assets/images';

interface HeroSectionProps {
  onOpenBooking: () => void;
  onSelectServiceCategory: (cat: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenBooking, onSelectServiceCategory }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-stone-200">
      {/* Background soft ambient accents */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-200/30 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Editorial Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            {/* Classy kicker */}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 border border-rose-200/60 rounded-full text-xs font-medium text-rose-900">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>Boutique Luxury Nail Tech Studio . Agbani Enugu</span>
            </div>

            {/* Headline with Motto */}
            <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-stone-900 leading-[1.12] text-balance">
              Where Elegance Meets Perfection.{' '}
              <span className="italic text-rose-900 block font-normal mt-1">
                “{BUSINESS_INFO.motto}”
              </span>
            </h1>

            <p className="text-base sm:text-lg text-stone-600 max-w-2xl leading-relaxed">
              Step into a sanctuary of tailored luxury. From immaculate <strong>Gel Polish (₦3,000)</strong> to long-wearing, damage-free <strong>Sculpted Acrylics (₦15,000)</strong>, every set is crafted with medical-grade hygiene and high-fashion finesse.
            </p>

            {/* Price anchors / marquee highlight cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => onSelectServiceCategory('gel')}
                className="text-left p-3.5 bg-white border border-stone-200 hover:border-rose-300 rounded-xl transition-all shadow-xs group cursor-pointer"
              >
                <span className="text-[11px] font-semibold tracking-wider text-rose-700 uppercase block">Gel Polish</span>
                <span className="font-editorial text-2xl font-bold text-stone-900 block mt-0.5">₦3,000</span>
                <span className="text-xs text-stone-500 mt-1 block">Chip-free glossy finish</span>
              </button>

              <button
                onClick={() => onSelectServiceCategory('acrylic')}
                className="text-left p-3.5 bg-white border border-stone-200 hover:border-rose-300 rounded-xl transition-all shadow-xs group cursor-pointer"
              >
                <span className="text-[11px] font-semibold tracking-wider text-rose-700 uppercase block">Acrylic Set</span>
                <span className="font-editorial text-2xl font-bold text-stone-900 block mt-0.5">₦15,000</span>
                <span className="text-xs text-stone-500 mt-1 block">Sculpted 4+ wk strength</span>
              </button>

              <button
                onClick={() => onSelectServiceCategory('biab')}
                className="col-span-2 sm:col-span-1 text-left p-3.5 bg-white border border-stone-200 hover:border-rose-300 rounded-xl transition-all shadow-xs group cursor-pointer"
              >
                <span className="text-[11px] font-semibold tracking-wider text-rose-700 uppercase block">BIAB Overlay</span>
                <span className="font-editorial text-2xl font-bold text-stone-900 block mt-0.5">₦8,000</span>
                <span className="text-xs text-stone-500 mt-1 block">Natural nail rehab</span>
              </button>
            </div>

            {/* CTAs: Booking, WhatsApp, Call & Emergency */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={onOpenBooking}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 active:scale-[0.98] rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-rose-300" />
                <span>Book Service Online</span>
              </button>

              <a
                href={getWhatsAppUrl("Hello Fazzynails, I want to book a nail session with you!")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl transition-all shadow-xs"
              >
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                <span>Chat on WhatsApp</span>
              </a>

              <a
                href={`tel:${BUSINESS_INFO.phoneClean}`}
                className="inline-flex items-center justify-center gap-2 px-4 py-3.5 text-sm font-medium text-stone-800 bg-white hover:bg-stone-50 border border-stone-200 rounded-xl transition-all shadow-xs"
              >
                <Phone className="w-4 h-4 text-stone-600" />
                <span className="font-mono text-xs">{BUSINESS_INFO.phone}</span>
              </a>
            </div>

            {/* Trust Markers */}
            <div className="pt-4 border-t border-stone-200/80 flex flex-wrap items-center gap-6 text-xs text-stone-600">
              <div className="flex items-center gap-1.5">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="font-semibold text-stone-900">4.9 / 5.0</span>
                <span className="text-stone-400">·</span>
                <span>350+ Happy Clients</span>
              </div>

              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Autoclave Sterilized Tools</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-rose-600" />
                <span>Emergency Slots Available</span>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Asset */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Outer decorative ring */}
              <div className="relative rounded-3xl overflow-hidden border border-stone-200/90 shadow-2xl bg-white aspect-[4/3] lg:aspect-[5/6]">
                <img
                  src={IMAGES.hero}
                  alt="Fazzynails luxury manicure and acrylic nail artistry"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
                
                {/* Visual Scrim for crisp text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

                {/* Floating overlay chip on image */}
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-white/95 backdrop-blur-md border border-white/40 shadow-lg flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase font-bold tracking-widest text-rose-700">
                      Signature Quality
                    </div>
                    <div className="font-editorial text-lg font-semibold text-stone-900">
                      Bespoke Acrylics & Gel
                    </div>
                    <div className="text-xs text-stone-500">
                      Lasts 4+ weeks with zero chipping
                    </div>
                  </div>

                  <a
                    href={getWhatsAppUrl("Hello Fazzynails, I'd like to book an emergency nail set!")}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-transform active:scale-95 shadow-sm flex items-center gap-1 text-xs font-semibold"
                    title="WhatsApp Emergency Inquiries"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Emergency</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
