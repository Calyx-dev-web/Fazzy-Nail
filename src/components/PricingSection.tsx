import React from 'react';
import { NailService, getWhatsAppUrl } from '../types';
import { formatPrice } from '../utils/format';
import { Check, MessageSquare, Calendar, Sparkles } from 'lucide-react';

interface PricingSectionProps {
  services: NailService[];
  onOpenBooking: () => void;
  onSelectService: (service: NailService) => void;
}

export const PricingSection: React.FC<PricingSectionProps> = ({
  services,
  onOpenBooking,
  onSelectService,
}) => {
  const popularServices = services.filter((s) => s.popular);
  const otherServices = services.filter((s) => !s.popular);

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-[#FAF8F5] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-12">
          <span className="text-xs uppercase font-semibold tracking-widest text-rose-700">
            Transparent Pricing
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-stone-900">
            Investment In Your Elegance
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            No hidden charges. No rushed jobs. High-grade professional monomers, non-toxic prep, and true salon mastery.
          </p>
        </div>

        {/* Featured Top Tier Deals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-4xl mx-auto">
          {popularServices.map((service) => (
            <div
              key={service.id}
              className="relative p-8 rounded-3xl bg-white border-2 border-stone-900 shadow-xl flex flex-col justify-between"
            >
              <div className="absolute -top-3.5 right-6 px-3 py-1 bg-stone-900 text-stone-100 text-[10px] uppercase font-bold tracking-widest rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-rose-400" />
                <span>Most Requested</span>
              </div>

              <div>
                <span className="text-xs font-semibold tracking-wider text-rose-700 uppercase">
                  {service.category.toUpperCase()} MASTERCLASS
                </span>
                <h3 className="font-editorial text-2xl font-bold text-stone-900 mt-1 mb-2">
                  {service.name}
                </h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="font-editorial text-4xl font-extrabold text-stone-900 tabular-nums">
                    {formatPrice(service.price)}
                  </span>
                  <span className="text-xs text-stone-500">· {service.duration}</span>
                </div>
                <p className="text-stone-600 text-sm leading-relaxed mb-6">
                  {service.description}
                </p>

                <ul className="space-y-2.5 text-xs text-stone-700 mb-8">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Dry e-file precision cuticle grooming included</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Premium salon dehydrator & acid-free primer</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Diamond high-gloss non-yellowing top coat</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>7-day free repair guarantee on accidental chips</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => onSelectService(service)}
                  className="flex-1 py-3 text-xs sm:text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-rose-300" />
                  <span>Book This Set</span>
                </button>

                <a
                  href={getWhatsAppUrl(`Hello Fazzynails, I want to book ${service.name} for ${formatPrice(service.price)}.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl transition-colors"
                  title="Inquire on WhatsApp"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Full Price Table List */}
        <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="p-5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
            <h3 className="font-editorial text-lg font-semibold text-stone-900">
              Complete Treatment & Add-On Rate Card
            </h3>
            <span className="text-xs text-stone-500">All prices in Nigerian Naira (₦)</span>
          </div>

          <div className="divide-y divide-stone-100">
            {otherServices.map((service) => (
              <div
                key={service.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-stone-50/60 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium text-stone-900 text-sm sm:text-base">
                      {service.name}
                    </h4>
                    <span className="text-[11px] text-stone-400 capitalize">({service.duration})</span>
                  </div>
                  <p className="text-xs text-stone-500 max-w-xl">
                    {service.description}
                  </p>
                </div>

                <div className="flex items-center gap-4 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                  <span className="font-editorial text-xl font-bold text-stone-900 tabular-nums">
                    {formatPrice(service.price)}
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={getWhatsAppUrl(`Hello Fazzynails, I'd like to book ${service.name} (${formatPrice(service.price)}).`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100"
                      title="WhatsApp Inquire"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => onSelectService(service)}
                      className="px-3 py-1.5 text-xs font-medium text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors cursor-pointer"
                    >
                      Book
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency slot banner */}
        <div className="mt-8 max-w-4xl mx-auto p-4 rounded-xl bg-rose-50/80 border border-rose-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-rose-950 uppercase tracking-wider">
              Emergency & Last-Minute Walk-In Slots
            </span>
            <p className="text-xs text-rose-900/80">
              Need your nails done urgently before a flight, event, or photoshoot? Reach us directly on WhatsApp.
            </p>
          </div>
          <a
            href={getWhatsAppUrl("Hello Fazzynails, I need an emergency last-minute appointment today!")}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-xs font-bold text-white bg-rose-900 hover:bg-rose-950 rounded-lg transition-all shadow-xs flex items-center gap-2 whitespace-nowrap"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Emergency WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
};
