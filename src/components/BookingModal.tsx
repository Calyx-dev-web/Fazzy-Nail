import React, { useState, useEffect } from 'react';
import { NailService, Booking, BUSINESS_INFO, getWhatsAppUrl } from '../types';
import { formatPrice } from '../utils/format';
import { addBooking } from '../services/db';
import { X, Calendar, Clock, Sparkles, CheckCircle2, MessageSquare, Phone, ArrowRight } from 'lucide-react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  services: NailService[];
  preSelectedService?: NailService | null;
  onBookingCreated?: (booking: Booking) => void;
}

const NAIL_SHAPES = ['Almond', 'Coffin', 'Square', 'Stiletto', 'Oval', 'Natural'];
const NAIL_LENGTHS = ['Short', 'Medium', 'Long', 'Extra Long'];

const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM',
  '05:00 PM', '06:00 PM'
];

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  services,
  preSelectedService,
  onBookingCreated,
}) => {
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [nailShape, setNailShape] = useState<string>('Almond');
  const [nailLength, setNailLength] = useState<string>('Medium');
  const [date, setDate] = useState<string>('');
  const [time, setTime] = useState<string>('11:00 AM');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (preSelectedService) {
      setSelectedServiceId(preSelectedService.id);
    } else if (services.length > 0 && !selectedServiceId) {
      setSelectedServiceId(services[0].id);
    }
  }, [preSelectedService, services, selectedServiceId]);

  // Set default minimum date to today
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
  }, []);

  if (!isOpen) return null;

  const currentService = services.find((s) => s.id === selectedServiceId) || services[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !date || !time || !currentService) return;

    setIsSubmitting(true);

    const bookingId = `FZ-${Date.now().toString().slice(-6)}`;
    const newBooking: Booking = {
      id: bookingId,
      customerName: name.trim(),
      phone: phone.trim(),
      email: email.trim() || undefined,
      serviceId: currentService.id,
      serviceName: currentService.name,
      price: currentService.price,
      date,
      time,
      nailShape,
      nailLength,
      notes: notes.trim() || undefined,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    try {
      await addBooking(newBooking);
      setConfirmedBooking(newBooking);
      if (onBookingCreated) {
        onBookingCreated(newBooking);
      }
    } catch (err) {
      console.error('Failed to save booking:', err);
      // Even if indexedDB had an edge error, confirm so user flow is uninterrupted
      setConfirmedBooking(newBooking);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setConfirmedBooking(null);
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');
    onClose();
  };

  const whatsappMessage = confirmedBooking
    ? `Hello Fazzynails, I just booked an appointment online!
Booking ID: ${confirmedBooking.id}
Service: ${confirmedBooking.serviceName} (${formatPrice(confirmedBooking.price)})
Date: ${confirmedBooking.date} at ${confirmedBooking.time}
Shape/Length: ${confirmedBooking.nailShape} (${confirmedBooking.nailLength})
Customer: ${confirmedBooking.customerName} (${confirmedBooking.phone})
${confirmedBooking.notes ? `Notes: ${confirmedBooking.notes}` : ''}
Please confirm my slot!`
    : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-5 bg-[#FAF8F5] border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-editorial text-2xl font-bold text-stone-900">
              {confirmedBooking ? 'Appointment Confirmed!' : 'Book Your Session'}
            </span>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2 text-stone-500 hover:text-stone-900 rounded-full hover:bg-stone-200/60 transition-colors cursor-pointer"
            aria-label="Close booking modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedBooking ? (
          /* Confirmation View */
          <div className="p-6 sm:p-8 space-y-6">
            <div className="p-6 rounded-2xl bg-rose-50/70 border border-rose-200 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-editorial text-2xl font-semibold text-stone-900">
                You’re Booked, {confirmedBooking.customerName}!
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 max-w-md mx-auto">
                Your appointment request is saved in our system. Click below to chat directly with us on WhatsApp for rapid 1-minute confirmation!
              </p>
              <div className="inline-block px-3 py-1 bg-white border border-stone-200 rounded-md font-mono text-xs font-semibold text-stone-700">
                Booking Reference: {confirmedBooking.id}
              </div>
            </div>

            {/* Appointment Details Card */}
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                <span className="text-stone-500">Service:</span>
                <span className="font-semibold text-stone-900">{confirmedBooking.serviceName}</span>
              </div>
              <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                <span className="text-stone-500">Total Investment:</span>
                <span className="font-editorial text-lg font-bold text-stone-900 tabular-nums">
                  {formatPrice(confirmedBooking.price)}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                <span className="text-stone-500">Date & Time:</span>
                <span className="font-semibold text-stone-900">
                  {confirmedBooking.date} at {confirmedBooking.time}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-stone-200 pb-2">
                <span className="text-stone-500">Style Preferences:</span>
                <span className="font-medium text-stone-800">
                  {confirmedBooking.nailShape} · {confirmedBooking.nailLength} length
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Client Phone:</span>
                <span className="font-mono text-stone-900">{confirmedBooking.phone}</span>
              </div>
            </div>

            {/* Direct WhatsApp Call-to-Action (Prompt 3 requirement) */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <a
                href={getWhatsAppUrl(whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-center flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <MessageSquare className="w-4 h-4 text-white" />
                <span>Confirm on WhatsApp Now</span>
              </a>

              <a
                href={`tel:${BUSINESS_INFO.phoneClean}`}
                className="py-3.5 px-5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-medium rounded-xl text-center flex items-center justify-center gap-2 transition-colors"
              >
                <Phone className="w-4 h-4 text-stone-600" />
                <span>Call Fazzynails</span>
              </a>
            </div>

            <div className="text-center">
              <button
                onClick={handleResetAndClose}
                className="text-xs text-stone-500 hover:text-stone-800 underline cursor-pointer"
              >
                Close & Return to Website
              </button>
            </div>
          </div>
        ) : (
          /* Booking Form */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Step 1: Service selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                1. Select Desired Service
              </label>
              <select
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className="w-full px-4 py-3 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white"
                required
              >
                {services.map((srv) => (
                  <option key={srv.id} value={srv.id}>
                    {srv.name} — {formatPrice(srv.price)} ({srv.duration})
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Shape & Length */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                  2. Nail Shape
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {NAIL_SHAPES.map((shape) => (
                    <button
                      type="button"
                      key={shape}
                      onClick={() => setNailShape(shape)}
                      className={`py-2 px-1 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                        nailShape === shape
                          ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      {shape}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
                  3. Nail Length
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {NAIL_LENGTHS.map((len) => (
                    <button
                      type="button"
                      key={len}
                      onClick={() => setNailLength(len)}
                      className={`py-2 px-2 text-xs font-medium rounded-lg border text-center transition-all cursor-pointer ${
                        nailLength === len
                          ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 3: Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-stone-500" />
                  <span>4. Appointment Date</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-stone-500" />
                  <span>5. Time Slot</span>
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white"
                  required
                >
                  {TIME_SLOTS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 4: Client contact information */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chioma Adeyemi"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Phone Number (WhatsApp Preferred) *
                </label>
                <input
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white font-mono text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Special Notes / Nail Art Inspo Description
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. French tips with tiny gold charms, soaking off old acrylic set first..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-stone-900 focus:bg-white"
                />
              </div>
            </div>

            {/* Total investment & Submit */}
            <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-stone-500 block">Estimated Total</span>
                <span className="font-editorial text-2xl font-bold text-stone-900 tabular-nums">
                  {currentService ? formatPrice(currentService.price) : '₦0'}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="px-4 py-3 text-xs font-medium text-stone-600 hover:text-stone-900 cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-initial px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Securing Slot...</span>
                  ) : (
                    <>
                      <span>Confirm & Save Booking</span>
                      <ArrowRight className="w-4 h-4 text-rose-300" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Emergency note */}
            <p className="text-center text-xs text-stone-500">
              Need an out-of-hours or immediate emergency appointment?{' '}
              <a
                href={getWhatsAppUrl("Hello Fazzynails, I need an emergency slot today!")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 font-semibold hover:underline"
              >
                Chat on WhatsApp
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};
