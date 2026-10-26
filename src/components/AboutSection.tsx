import React from 'react';
import { BUSINESS_INFO, getWhatsAppUrl } from '../types';
import { IMAGES } from '../assets/images';
import { Sparkles, ShieldCheck, Heart, Award, MessageSquare } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-16 sm:py-24 bg-[#FAF8F5] border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Studio Image Column */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative rounded-3xl overflow-hidden border border-stone-200 shadow-xl bg-white aspect-[4/3] sm:aspect-square">
              <img
                src={IMAGES.studio}
                alt="Fazzynails studio interior and clean sanitation station"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="text-[10px] tracking-widest uppercase font-semibold text-rose-300">
                  Agbani Enugu Atelier
                </span>
                <p className="font-editorial text-xl font-medium mt-0.5">
                  Private, Sterile & Relaxing Haven
                </p>
              </div>
            </div>
          </div>

          {/* About Text Column */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-50 border border-rose-200/60 rounded-full text-xs font-semibold text-rose-900">
              <Sparkles className="w-3.5 h-3.5 text-rose-600" />
              <span>About Fazzynails</span>
            </div>

            <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-stone-900 leading-tight">
              Passionate Nail Artistry Built on the Principle of Class.
            </h2>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Founded on the belief that <em>“Nails that speak class”</em> shouldn’t mean compromised nail health, Fazzynails provides bespoke nail enhancement services designed for women who cherish clean lines, durable longevity, and pristine cuticle work.
            </p>

            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              Unlike fast-paced mass walk-in salons where nail plates get thinned by aggressive e-filing, our appointment-only studio gives each client unhurried, undivided attention. We strictly use EMA (dental-grade) monomer, high-adhesion Japanese gel polish, and sterile single-use disposable files.
            </p>

            {/* 4 Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white border border-stone-200/80 space-y-1.5 shadow-xs">
                <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Hospital-Grade Sterilization</span>
                </div>
                <p className="text-xs text-stone-500">
                  All metal tools undergo ultrasonic cleansing and medical-grade autoclave sterilization.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-stone-200/80 space-y-1.5 shadow-xs">
                <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm">
                  <Award className="w-4 h-4 text-rose-600" />
                  <span>4+ Weeks Retention</span>
                </div>
                <p className="text-xs text-stone-500">
                  Engineered stress apex balance that stays strong through your active daily routines.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-stone-200/80 space-y-1.5 shadow-xs">
                <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Natural Nail Preservation</span>
                </div>
                <p className="text-xs text-stone-500">
                  Damage-free removal and vitamin cuticle hydration with every service.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white border border-stone-200/80 space-y-1.5 shadow-xs">
                <div className="flex items-center gap-2 text-stone-900 font-semibold text-sm">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  <span>Bespoke Design Freedom</span>
                </div>
                <p className="text-xs text-stone-500">
                  From subtle French ombre to 3D pearl charms, your creative vision comes alive.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center gap-4">
              <a
                href={getWhatsAppUrl("Hello Fazzynails, I'd like to ask a few questions about your nail studio services.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 text-xs sm:text-sm font-semibold text-emerald-950 bg-emerald-100 hover:bg-emerald-200 border border-emerald-300 rounded-xl transition-all"
              >
                <MessageSquare className="w-4 h-4 text-emerald-700" />
                <span>Talk to the Nail Artist on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
