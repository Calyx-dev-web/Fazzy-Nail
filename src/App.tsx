import React, { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
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
import { ReviewsSection } from './components/ReviewsSection';
import { BlogSection } from './components/BlogSection';
import { ContactSection } from './components/ContactSection';
import { AdminPortal } from './components/AdminPortal';
import { AdminLoginPage } from './components/AdminLoginPage';
import { FloatingContactBar } from './components/FloatingContactBar';
import { Footer } from './components/Footer';

export default function App() {
  const [viewMode, setViewMode] = useState<'public' | 'admin_login' | 'admin_portal'>('public');
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [preSelectedService, setPreSelectedService] = useState<NailService | null>(null);
  const [activeServiceCategory, setActiveServiceCategory] = useState<string>('all');

  // IndexedDB State
  const [settings, setSettings] = useState<BusinessSettings>(DEFAULT_BUSINESS_SETTINGS);
  const [services, setServices] = useState<NailService[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(auth.currentUser);

  // Listen to Firebase Auth state and URL pathname/hash for /Admin routing
  useEffect(() => {
    const syncAdminRoute = (currentUser: User | null) => {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const isAdminRoute =
        pathname.includes('/admin') || hash === '#admin' || hash === '#/admin';

      if (isAdminRoute) {
        setViewMode(currentUser ? 'admin_portal' : 'admin_login');
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      syncAdminRoute(user);
    });

    const handleRouteChange = () => syncAdminRoute(auth.currentUser);
    window.addEventListener('hashchange', handleRouteChange);
    window.addEventListener('popstate', handleRouteChange);

    return () => {
      unsubscribe();
      window.removeEventListener('hashchange', handleRouteChange);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, []);

  // Load all data from IndexedDB
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
  }, [refreshDatabase]);

  // Handlers
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
    const element = document.getElementById('services');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigate = (sectionId: string) => {
    if (viewMode !== 'public') {
      setViewMode('public');
    }
    setCurrentPage(sectionId);
    setTimeout(() => {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  const handleOpenAdmin = () => {
    setViewMode(firebaseUser || auth.currentUser ? 'admin_portal' : 'admin_login');
  };

  const handleLogout = async () => {
    await signOut(auth);
    setViewMode('admin_login');
  };

  const pendingBookingsCount = bookings.filter((b) => b.status === 'Pending').length;

  // 1. FULL PAGE ADMIN LOGIN VIEW
  if (viewMode === 'admin_login') {
    return (
      <AdminLoginPage
        onLoginSuccess={() => setViewMode('admin_portal')}
        onBackToSite={() => setViewMode('public')}
        logoUrl={settings.logoUrl}
      />
    );
  }

  // 2. FULL PAGE ADMIN PORTAL VIEW
  if (viewMode === 'admin_portal') {
    return (
      <AdminPortal
        onLogout={handleLogout}
        onViewWebsite={() => setViewMode('public')}
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

  // 3. PUBLIC WEBSITE VIEW
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-800 antialiased selection:bg-rose-200 selection:text-rose-950 font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        onOpenAdmin={handleOpenAdmin}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pendingBookingsCount={pendingBookingsCount}
        logoUrl={settings.logoUrl}
      />

      {/* Main Page Content Flow */}
      <main className="flex-1">
        {/* 1. Home / Hero */}
        <div id="home">
          <HeroSection
            onOpenBooking={() => handleOpenBooking()}
            onSelectServiceCategory={handleSelectServiceCategory}
          />
        </div>

        {/* 2. Services Section */}
        <ServicesSection
          services={services}
          onSelectService={(srv) => handleOpenBooking(srv)}
          activeCategory={activeServiceCategory}
          setActiveCategory={setActiveServiceCategory}
        />

        {/* 3. Pricing Section */}
        <PricingSection
          services={services}
          onOpenBooking={() => handleOpenBooking()}
          onSelectService={(srv) => handleOpenBooking(srv)}
        />

        {/* 4. Gallery Section */}
        <GallerySection
          galleryItems={galleryItems}
          onBookLook={handleBookFromGallery}
        />

        {/* 5. About Section */}
        <AboutSection />

        {/* 6. Blog Section */}
        <BlogSection />

        {/* 7. Reviews Section */}
        <ReviewsSection
          reviews={reviews}
          onReviewAdded={() => refreshDatabase()}
        />

        {/* 8. Contact & Location Section */}
        <ContactSection
          onInquirySubmitted={() => refreshDatabase()}
        />
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
  );
}
