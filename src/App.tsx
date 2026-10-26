import React, { useState, useEffect, useCallback } from 'react';
import {
  NailService,
  GalleryItem,
  Booking,
  Inquiry,
  Review,
} from './types';
import {
  getServices,
  getGallery,
  getBookings,
  getInquiries,
  getReviews,
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
import { AdminDashboard } from './components/AdminDashboard';
import { AdminAuthModal } from './components/AdminAuthModal';
import { FloatingContactBar } from './components/FloatingContactBar';
import { Footer } from './components/Footer';

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [preSelectedService, setPreSelectedService] = useState<NailService | null>(null);
  const [activeServiceCategory, setActiveServiceCategory] = useState<string>('all');

  // IndexedDB State
  const [services, setServices] = useState<NailService[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load all data from IndexedDB
  const refreshDatabase = useCallback(async () => {
    try {
      const [srvList, galList, bookList, inqList, revList] = await Promise.all([
        getServices(),
        getGallery(),
        getBookings(),
        getInquiries(),
        getReviews(),
      ]);

      setServices(srvList);
      setGalleryItems(galList);
      setBookings(bookList);
      setInquiries(inqList);
      setReviews(revList);
    } catch (err) {
      console.error('Error loading database:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDatabase();

    // Listen for custom database changes dispatched across components
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
    // Match appropriate service based on gallery category
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
    setCurrentPage(sectionId);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenAdmin = () => {
    const isAuth = typeof window !== 'undefined' && sessionStorage.getItem('fzn_admin_auth') === 'true';
    if (isAuth) {
      setIsAdminOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  const pendingBookingsCount = bookings.filter((b) => b.status === 'Pending').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-800 antialiased selection:bg-rose-200 selection:text-rose-950 font-sans">
      {/* Top Navbar adhering to the Top Bar contract */}
      <Navbar
        onOpenBooking={() => handleOpenBooking()}
        onOpenAdmin={handleOpenAdmin}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        pendingBookingsCount={pendingBookingsCount}
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
      />

      {/* Interactive Booking Flow Modal */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        services={services}
        preSelectedService={preSelectedService}
        onBookingCreated={() => refreshDatabase()}
      />

      {/* 2FA Security Authentication Modal */}
      <AdminAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthenticated={() => setIsAdminOpen(true)}
      />

      {/* Admin Management Dashboard */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onLogout={() => setIsAdminOpen(false)}
        bookings={bookings}
        inquiries={inquiries}
        services={services}
        galleryItems={galleryItems}
        onRefreshData={refreshDatabase}
      />

      {/* Floating Call & WhatsApp Bar (<15% mobile viewport) */}
      <FloatingContactBar
        onOpenBooking={() => handleOpenBooking()}
      />
    </div>
  );
}
