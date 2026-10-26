import React, { useState } from 'react';
import { NailService, getWhatsAppUrl } from '../types';
import { formatPrice } from '../utils/format';
import { Clock, Sparkles, MessageSquare, ArrowRight } from 'lucide-react';

interface ServicesSectionProps {
  services: NailService[];
  onSelectService: (service: NailService) => void;
  activeCategory?: string;
  setActiveCategory?: (category: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({
  services,
  onSelectService,
  activeCategory: propCategory,
  setActiveCategory: propSetCategory,
}) => {
  const [internalCategory, setInternalCategory] = useState<string>('all');
  
  const selectedCategory = propCategory !== undefined ? propCategory : internalCategory;
  const setSelectedCategory = propSetCategory || setInternalCategory;

  const categories = [
    { id: 'all', label: 'All Services' },
    { id: 'gel', label: 'Gel Polish' },
    { id: 'acrylic', label: 'Acrylic Sets' },
    { id: 'biab', label: 'BIAB & Natural' },
    { id: 'care', label: 'Pedicure & Spa' },
    { id: 'addons', label: 'Custom Art & Fixes' },
  ];

  const filteredServices = services.filter((s) => {
    if (!s.isAvailable) return false;
    if (selectedCategory === 'all') return true;
    return s.category === selectedCategory;
  });

  return (
    <section id="services" className="py-16 sm:py-24 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-12">
          <span className="text-xs uppercase font-semibold tracking-widest text-rose-700">
            Artistry & Care
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-stone-900">
            Curated Nail Services
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            Every set is customized to complement your hands, natural nail plate, and personal style with enduring class.
          </p>

          {/* Category Filter Tabs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-stone-100/80 rounded-2xl max-w-xl mx-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="group p-6 rounded-2xl bg-[#FAF8F5] border border-stone-200/90 hover:border-rose-300 transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-editorial text-xl font-semibold text-stone-900 group-hover:text-rose-950 transition-colors">
                    {service.name}
                  </h3>
                  <div className="text-right shrink-0">
                    <span className="font-editorial text-2xl font-bold text-stone-900 block tabular-nums">
                      {formatPrice(service.price)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-stone-500 mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{service.duration}</span>
                  </span>
                  <span>·</span>
                  <span className="capitalize">{service.category}</span>
                  {service.popular && (
                    <>
                      <span>·</span>
                      <span className="text-rose-700 font-medium inline-flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-rose-500" /> Client Favorite
                      </span>
                    </>
                  )}
                </div>

                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-6">
                  {service.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-stone-200/70 flex items-center justify-between gap-2">
                <a
                  href={getWhatsAppUrl(`Hello Fazzynails, I would like to inquire about the ${service.name} (${formatPrice(service.price)}).`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1.5"
                  title="Ask questions via WhatsApp"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                  <span>WhatsApp</span>
                </a>

                <button
                  onClick={() => onSelectService(service)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Book Slot</span>
                  <ArrowRight className="w-3.5 h-3.5 text-stone-300" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom consultation notice */}
        <div className="mt-12 p-6 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="font-editorial text-lg font-semibold text-stone-900">
              Have a custom Pinterest nail photo or bridal request?
            </h4>
            <p className="text-xs sm:text-sm text-stone-600">
              Send us your inspiration image on WhatsApp for an instant price quote and time estimation.
            </p>
          </div>
          <a
            href={getWhatsAppUrl("Hello Fazzynails, I have a photo inspiration I'd like to get done. Can you give me a quote?")}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-xs flex items-center gap-2 whitespace-nowrap"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Send Inspiration Image</span>
          </a>
        </div>
      </div>
    </section>
  );
};
