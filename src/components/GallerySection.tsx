import React, { useState } from 'react';
import { GalleryItem, getWhatsAppUrl } from '../types';
import { Sparkles, X, MessageSquare, Calendar, ZoomIn } from 'lucide-react';

interface GallerySectionProps {
  galleryItems: GalleryItem[];
  onBookLook: (item: GalleryItem) => void;
}

export const GallerySection: React.FC<GallerySectionProps> = ({ galleryItems, onBookLook }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const filterTabs = [
    { id: 'all', label: 'All Sets' },
    { id: 'acrylic', label: 'Acrylic Sculpting' },
    { id: 'gel', label: 'Gel Polish' },
    { id: 'minimal', label: 'Minimalist Class' },
    { id: 'bridal', label: 'Bridal & Studio' },
  ];

  const filteredItems = galleryItems.filter((item) => {
    if (selectedFilter === 'all') return true;
    return item.category === selectedFilter;
  });

  return (
    <section id="gallery" className="py-16 sm:py-24 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-12">
          <span className="text-xs uppercase font-semibold tracking-widest text-rose-700">
            Portfolio of Masterpieces
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-stone-900">
            Nail Sets That Speak Class
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            Every set in our gallery was hand-crafted at Fazzynails. Crisp edges, durable apex structures, and lustrous glass finishes.
          </p>

          {/* Filter Pills */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-1.5 p-1.5 bg-stone-100/80 rounded-2xl max-w-lg mx-auto">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  selectedFilter === tab.id
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col"
            >
              <div
                className="relative aspect-[4/3] sm:aspect-square overflow-hidden cursor-pointer"
                onClick={() => setActiveItem(item)}
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                />
                
                {/* Overlay hover effect */}
                <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="p-2.5 bg-white/90 text-stone-900 rounded-full shadow-md backdrop-blur-xs">
                    <ZoomIn className="w-4 h-4" />
                  </span>
                </div>

                {item.featured && (
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-white/95 backdrop-blur-xs text-stone-900 text-[10px] uppercase font-bold tracking-wider rounded-md shadow-xs">
                    Featured
                  </span>
                )}
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between bg-white">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-rose-700 font-semibold block mb-1">
                    {item.category}
                  </span>
                  <h3 className="font-editorial text-lg font-semibold text-stone-900 leading-snug line-clamp-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-stone-500 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onBookLook(item)}
                    className="text-xs font-semibold text-stone-900 hover:text-rose-700 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Book This Style</span>
                  </button>

                  <a
                    href={getWhatsAppUrl(`Hello Fazzynails, I love this look in your gallery: ${item.title}. Can I book this?`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                    title="Send to WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 text-stone-500 text-sm">
            No gallery items found in this category. You can add more in the Admin Dashboard!
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-sm">
          <div className="relative max-w-3xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl border border-stone-800">
            <button
              onClick={() => setActiveItem(null)}
              className="absolute top-4 right-4 z-10 p-2 text-stone-700 bg-white/80 hover:bg-white rounded-full transition-colors cursor-pointer"
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="relative aspect-square bg-stone-950 flex items-center justify-center">
                <img
                  src={activeItem.imageUrl}
                  alt={activeItem.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 sm:p-8 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <span className="text-xs uppercase tracking-widest text-rose-700 font-bold">
                      {activeItem.category} SET
                    </span>
                    <h3 className="font-editorial text-2xl font-bold text-stone-900 mt-1">
                      {activeItem.title}
                    </h3>
                  </div>

                  <p className="text-sm text-stone-600 leading-relaxed">
                    {activeItem.description}
                  </p>

                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 space-y-1">
                    <div className="font-semibold text-stone-800 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                      <span>Fazzynails Craftsmanship:</span>
                    </div>
                    <p>Designed with reinforced apex, precision cuticle sealing, and chip-resistant shine.</p>
                  </div>
                </div>

                <div className="space-y-3 pt-6 border-t border-stone-100">
                  <button
                    onClick={() => {
                      const item = activeItem;
                      setActiveItem(null);
                      onBookLook(item);
                    }}
                    className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition-all shadow-sm"
                  >
                    <Calendar className="w-4 h-4 text-rose-300" />
                    <span>Book This Specific Set</span>
                  </button>

                  <a
                    href={getWhatsAppUrl(`Hello Fazzynails, I want this exact set from your gallery: "${activeItem.title}". Can we schedule?`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Inquire Set on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
