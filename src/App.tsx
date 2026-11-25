import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { MotionConfig } from 'motion/react';
import { ArrowLeft, ArrowRight, Sparkles, Tag, Image as ImageIcon, Heart, BookOpen, Star, MapPin } from 'lucide-react';
import { auth } from './firebase';
import {
  NailService,
  GalleryItem,
  Booking,
  Inquiry,
  Review,
  Customer,
  Invoice,
  BusinessSettings,
  DEFAULT_BUSINESS_SETTINGS,
} from './types';
import {
  getServices,
  getGallery,
  getBookings,
  getInquiries,
  getReviews,
  getCustomers,
  getInvoices,
  getBusinessSettings,
  DB_CHANGE_EVENT,
} from './services/db';

import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ServicesSection } from './components/ServicesSection';
import { PricingSection } from './components/PricingSection';
import { BookingModal } from './components/BookingModal';
import { GallerySection } from './components/GallerySection';
import { AboutSection } from './components/AboutSection';
import { BlogSection } from './components/BlogSection';
import { ContactSection } from './components/ContactSection';
import { ReviewsSection } from './components/ReviewsSection';
import { AdminPortal } from './components/AdminPortal';
import { AdminLoginPage } from './components/AdminLoginPage';
import { FloatingContactBar } from './components/FloatingContactBar';
import { Footer } from './components/Footer';
import { ScrollReveal } from './components/ScrollReveal';

type PublicPage =
  | 'home'
  | 'services'
  | 'pricing'
  | 'gallery'
  | 'about'
  | 'blog'
  | 'reviews'
  | 'contact';

const PUBLIC_PAGES: PublicPage[] = [
  'home',
  'services',
  'pricing',
  'gallery',
  'about',
  'blog',
  'reviews',
  'contact',
];

const PAGE_DIRECTORY: {
  id: Exclude<PublicPage, 'home'>;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'services',
    label: 'Services',
    subtitle: 'Gel polish, sculpted acrylics, BIAB & spa care',
    icon: Sparkles,
  },
  {
    id: 'pricing',
    label: 'Pricing',
    subtitle: 'Transparent studio rates & treatment guarantees',
    icon: Tag,
  },
  {
    id: 'gallery',
    label: 'Gallery',
    subtitle: 'Curated lookbook of finished client sets',
    icon: ImageIcon,
  },
  {
    id: 'about',
    label: 'About',
    subtitle: 'Studio story, hygiene & quality standards',
    icon: Heart,
  },
  {
    id: 'blog',
    label: 'Blog',
    subtitle: 'Aftercare tips & nail health journal',
    icon: BookOpen,
  },
  {
    id: 'reviews',
    label: 'Reviews',
    subtitle: 'Verified client testimonials & ratings',
    icon: Star,
  },
  {
    id: 'contact',
    label: 'Contact',
    subtitle: 'Studio address, hours & direct inquiries',
    icon: MapPin,
  },
];

function getNormalizedBasePath(): string {
  const raw = import.meta.env.BASE_URL || '/';
  if (raw === './' || raw === '.') return '/';
  return raw.endsWith('/') ? raw : `${raw}/`;
}

function parseLocationRoute(): { isAdmin: boolean; page: PublicPage } {
  if (typeof window === 'undefined') {
    return { isAdmin: false, page: 'home' };
  }

  const pathname = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  if (pathname.includes('/admin') || hash === '#admin' || hash === '#/admin') {
    return { isAdmin: true, page: 'home' };
  }

  const hashClean = hash.replace(/^#\/?/, '').split('?')[0];
  if (PUBLIC_PAGES.includes(hashClean as PublicPage)) {
    return { isAdmin: false, page: hashClean as PublicPage };
  }

  const basePath = getNormalizedBasePath().toLowerCase();
  let relativePath = pathname;
  if (basePath !== '/' && relativePath.startsWith(basePath)) {
    relativePath = relativePath.slice(basePath.length);
  }
  const firstSegment = relativePath.replace(/^\/+|\/+$/g, '').split('/')[0];

  if (PUBLIC_PAGES.includes(firstSegment as PublicPage)) {
    return { isAdmin: false, page: firstSegment as PublicPage };
  }

  return { isAdmin: false, page: 'home' };
}

function buildPageUrl(page: PublicPage): string {
  const basePath = getNormalizedBasePath();
  if (page === 'home') return basePath;
  return `${basePath}${page}`;
}

export default function App() {
  const initialRoute = parseLocationRoute();
  const [viewMode, setViewMode] = useState<'public' | 'admin_login' | 'admin_portal'>(
    initialRoute.isAdmin ? (auth?.currentUser ? 'admin_portal' : 'admin_login') : 'public'
  );
  const [currentPage, setCurrentPage] = useState<PublicPage>(initialRoute.page);
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [preSelectedService, setPreSelectedService] = useState<NailService | null>(null);
  const [activeServiceCategory, setActiveServiceCategory] = useState<string>('all');

  // Database State
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_BUSINESS_SETTINGS);
  const [services, setServices] = useState<NailService[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(auth?.currentUser ?? null);

  // Listen to Firebase Auth state and URL pathname/hash changes
  useEffect(() => {
    const syncRouteFromLocation = (currentUser: User | null) => {
      const parsed = parseLocationRoute();
      if (parsed.isAdmin) {
        setViewMode(currentUser ? 'admin_portal' : 'admin_login');
      } else {
        setViewMode('public');
        setCurrentPage(parsed.page);
      }
    };

    if (!auth) {
      syncRouteFromLocation(null);
      const handleRouteChange = () => syncRouteFromLocation(null);
      window.addEventListener('hashchange', handleRouteChange);
      window.addEventListener('popstate', handleRouteChange);
      return () => {
        window.removeEventListener('hashchange', handleRouteChange);
        window.removeEventListener('popstate', handleRouteChange);
      };
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      const parsed = parseLocationRoute();
      if (parsed.isAdmin) {
        setViewMode(user ? 'admin_portal' : 'admin_login');
      }
    });

    const handleRouteChange = () => syncRouteFromLocation(auth?.currentUser ?? null);
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      unsubscribe();
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Load all data from Firestore / IndexedDB
  const refreshDatabase = useCallback(async () => {
    try {
      const [sett, srvList, galList, bookList, inqList, revList, custDb, invDb] = await Promise.all([
        getBusinessSettings(),
        getServices(),
        getGallery(),
        getBookings(),
        getInquiries(),
        getReviews(),
        getCustomers(),
        getInvoices(),
      ]);

      setSettings(sett);
      setServices(srvList);
      setGalleryItems(galList);
      setBookings(bookList);
      setInquiries(inqList);
      setReviews(revList);
      setCustomers(custDb);
      setInvoices(invDb);
    } catch (err) {
      console.error('Error loading database:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDatabase();

    const handleDbChange = () => {
      refreshDatabase();
    };

    window.addEventListener(DB_CHANGE_EVENT, handleDbChange);
    return () => {
      window.removeEventListener(DB_CHANGE_EVENT, handleDbChange);
    };
  }, [refreshDatabase, firebaseUser]);

  // Handlers
  const handleNavigate = (sectionId: string) => {
    const targetPage: PublicPage = PUBLIC_PAGES.includes(sectionId as PublicPage)
      ? (sectionId as PublicPage)
      : 'home';

    if (viewMode !== 'public') {
      setViewMode('public');
    }
    setCurrentPage(targetPage);

    const targetUrl = buildPageUrl(targetPage);
    if (window.location.pathname !== targetUrl || window.location.hash) {
      window.history.pushState({ page: targetPage }, '', targetUrl);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenBooking = (service?: NailService) => {
    if (service) {
      setPreSelectedService(service);
    } else {
      setPreSelectedService(null);
    }
    setIsBookingOpen(true);
  };

  const handleBookFromGallery = (item: GalleryItem) => {
    let matched = services.find((s) => s.category === item.category);
    if (!matched) {
      matched = item.category === 'acrylic' ? services[1] : services[0];
    }
    setPreSelectedService(matched || null);
    setIsBookingOpen(true);
  };

  const handleSelectServiceCategory = (cat: string) => {
    setActiveServiceCategory(cat);
    handleNavigate('services');
  };

  const handleOpenAdmin = () => {
    setViewMode(firebaseUser || auth?.currentUser ? 'admin_portal' : 'admin_login');
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    }
    setViewMode('admin_login');
  };

  const pendingBookingsCount = bookings.filter((b) => b.status === 'Pending').length;
  const currentRouteMeta = PAGE_DIRECTORY.find((item) => item.id === currentPage);

  // 1. FULL PAGE ADMIN LOGIN VIEW
  if (viewMode === 'admin_login') {
    return (
      <AdminLoginPage
        onLoginSuccess={() => setViewMode('admin_portal')}
        onBackToSite={() => handleNavigate('home')}
        logoUrl={settings.logoUrl}
      />
    );
  }

  // 2. FULL PAGE ADMIN PORTAL VIEW
  if (viewMode === 'admin_portal') {
    return (
      <AdminPortal
        onLogout={handleLogout}
        onViewWebsite={() => handleNavigate('home')}
        bookings={bookings}
        inquiries={inquiries}
        services={services}
        galleryItems={galleryItems}
        customers={customers}
        invoices={invoices}
        settings={settings}
        onRefreshData={refreshDatabase}
      />
    );
  }

  // 3. PUBLIC WEBSITE VIEW (Routed Clean Multi-Page Experience)
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-800 antialiased selection:bg-rose-200 selection:text-rose-950 font-sans">
        {/* Top Navbar */}
        <Navbar
          onOpenBooking={() => handleOpenBooking()}
          onOpenAdmin={handleOpenAdmin}
          currentPage={currentPage}
          onNavigate={handleNavigate}
          pendingBookingsCount={pendingBookingsCount}
          logoUrl={settings.logoUrl}
        />

        {/* Main Routed Content */}
        <main className="flex-1">
          {currentPage === 'home' ? (
            <>
              <HeroSection
                onOpenBooking={() => handleOpenBooking()}
                onSelectServiceCategory={handleSelectServiceCategory}
              />

              {/* Clean Studio Directory Links */}
              <section className="py-12 sm:py-16 bg-white border-b border-stone-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <ScrollReveal className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
                    <div>
                      <span className="text-xs uppercase font-semibold tracking-widest text-rose-700">
                        Explore Studio
                      </span>
                      <h2 className="font-editorial text-2xl sm:text-3xl font-medium text-stone-900 mt-1">
                        Everything Fazzynails, Simple &amp; Clear
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-stone-500">
                      Select any page below to browse details cleanly.
                    </p>
                  </ScrollReveal>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {PAGE_DIRECTORY.map((route, idx) => {
                      const Icon = route.icon;
                      return (
                        <ScrollReveal key={route.id} delay={Math.min(idx * 0.06, 0.35)}>
                          <button
                            onClick={() => handleNavigate(route.id)}
                            className="w-full h-full group text-left p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200/90 hover:border-rose-300 hover:bg-white transition-all shadow-xs hover:shadow-md flex flex-col justify-between gap-4 cursor-pointer"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-rose-700 group-hover:bg-stone-900 group-hover:text-rose-200 group-hover:border-stone-900 transition-colors">
                                <Icon className="w-4 h-4" />
                              </div>
                              <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-stone-900 group-hover:translate-x-0.5 transition-all" />
                            </div>

                            <div>
                              <h3 className="font-editorial text-xl font-semibold text-stone-900">
                                {route.label}
                              </h3>
                              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                                {route.subtitle}
                              </p>
                            </div>
                          </button>
                        </ScrollReveal>
                      );
                    })}
                  </div>
                </div>
              </section>
            </>
          ) : (
            <>
              {/* Clean Breadcrumb Bar for Routed Pages */}
              <div className="bg-[#FAF8F5] border-b border-stone-200/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4 text-xs">
                  <button
                    onClick={() => handleNavigate('home')}
                    className="inline-flex items-center gap-1.5 font-semibold text-stone-700 hover:text-stone-950 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Home</span>
                  </button>

                  <div className="flex items-center gap-2 text-stone-500">
                    <button
                      onClick={() => handleNavigate('home')}
                      className="hover:text-stone-900 cursor-pointer"
                    >
                      Home
                    </button>
                    <span>/</span>
                    <span className="font-semibold text-rose-800">
                      {currentRouteMeta?.label || currentPage}
                    </span>
                  </div>
                </div>
              </div>

              {currentPage === 'services' && (
                <ServicesSection
                  services={services}
                  onSelectService={(srv) => handleOpenBooking(srv)}
                  activeCategory={activeServiceCategory}
                  setActiveCategory={setActiveServiceCategory}
                />
              )}

              {currentPage === 'pricing' && (
                <PricingSection
                  services={services}
                  onOpenBooking={() => handleOpenBooking()}
                  onSelectService={(srv) => handleOpenBooking(srv)}
                />
              )}

              {currentPage === 'gallery' && (
                <GallerySection
                  galleryItems={galleryItems}
                  onBookLook={handleBookFromGallery}
                />
              )}

              {currentPage === 'about' && (
                <AboutSection aboutImage={settings.aboutImage} />
              )}

              {currentPage === 'blog' && <BlogSection />}

              {currentPage === 'reviews' && (
                <ReviewsSection
                  reviews={reviews}
                  onReviewAdded={() => refreshDatabase()}
                />
              )}

              {currentPage === 'contact' && (
                <ContactSection
                  onInquirySubmitted={() => refreshDatabase()}
                />
              )}
            </>
          )}
        </main>

        {/* Footer */}
        <Footer
          onOpenBooking={() => handleOpenBooking()}
          onOpenAdmin={handleOpenAdmin}
          onNavigate={handleNavigate}
          logoUrl={settings.logoUrl}
        />

        {/* Interactive Booking Flow Modal */}
        <BookingModal
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          services={services}
          preSelectedService={preSelectedService}
          onBookingCreated={() => refreshDatabase()}
        />

        {/* Floating Call & WhatsApp Bar */}
        <FloatingContactBar
          onOpenBooking={() => handleOpenBooking()}
        />
      </div>
    </MotionConfig>
  );
}
