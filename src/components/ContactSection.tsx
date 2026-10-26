import React, { useState } from 'react';
import { BUSINESS_INFO, getWhatsAppUrl, Inquiry } from '../types';
import { addInquiry } from '../services/db';
import { Phone, MessageSquare, Clock, MapPin, Send, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

interface ContactSectionProps {
  onInquirySubmitted?: (inquiry: Inquiry) => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({ onInquirySubmitted }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Service Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedInquiry, setSubmittedInquiry] = useState<Inquiry | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) return;

    setIsSubmitting(true);
    const newInquiry: Inquiry = {
      id: `INQ-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || 'No email provided',
      subject,
      message: message.trim(),
      timestamp: new Date().toISOString(),
      status: 'Unread',
    };

    try {
      await addInquiry(newInquiry);
      setSubmittedInquiry(newInquiry);
      if (onInquirySubmitted) {
        onInquirySubmitted(newInquiry);
      }
    } catch (err) {
      console.error(err);
      setSubmittedInquiry(newInquiry);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmittedInquiry(null);
    setName('');
    setPhone('');
    setEmail('');
    setMessage('');
  };

  return (
    <section id="contact" className="py-16 sm:py-24 bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-12">
          <span className="text-xs uppercase font-semibold tracking-widest text-rose-700">
            Get In Touch
          </span>
          <h2 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-stone-900">
            Visit or Connect With Fazzynails
          </h2>
          <p className="text-stone-600 text-sm sm:text-base">
            Reach out for bookings, custom bridal nail inquiries, press-on orders, or emergency rush appointments.
          </p>
        </div>

        {/* 3 Contact Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Phone Call Card */}
          <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-stone-200/90 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center">
                <Phone className="w-5 h-5 text-rose-300" />
              </div>
              <h3 className="font-editorial text-xl font-bold text-stone-900">Call Directly</h3>
              <p className="text-xs text-stone-500">
                Direct studio line for booking checks and telephone inquiries.
              </p>
              <div className="font-mono text-base font-bold text-stone-900 pt-1">
                {BUSINESS_INFO.phone}
              </div>
            </div>

            <a
              href={`tel:${BUSINESS_INFO.phoneClean}`}
              className="w-full py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl text-center flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call +234 907 281 7540</span>
            </a>
          </div>

          {/* WhatsApp Direct Chat Card */}
          <div className="p-6 rounded-3xl bg-emerald-50/60 border border-emerald-200 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="font-editorial text-xl font-bold text-stone-900">WhatsApp Chat</h3>
              <p className="text-xs text-emerald-900/80">
                Fastest response time. Send nail reference photos and get immediate quotes.
              </p>
              <div className="font-mono text-xs text-emerald-800 font-semibold pt-1">
                wa.me/2349072817540
              </div>
            </div>

            <a
              href={getWhatsAppUrl("Hello Fazzynails, I'd like to make an inquiry!")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl text-center flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Open WhatsApp Chat</span>
            </a>
          </div>

          {/* Emergency & Hours Card */}
          <div className="p-6 rounded-3xl bg-rose-50/70 border border-rose-200 flex flex-col justify-between space-y-4">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-rose-900 text-white flex items-center justify-center">
                <Clock className="w-5 h-5 text-rose-300" />
              </div>
              <h3 className="font-editorial text-xl font-bold text-stone-900">Working Hours</h3>
              <div className="text-xs text-stone-700 space-y-1">
                <p><strong>Mon – Sat:</strong> 9:00 AM – 7:00 PM</p>
                <p><strong>Sunday:</strong> 1:00 PM – 6:00 PM</p>
                <p className="text-[11px] text-rose-900 font-medium pt-1">
                  Emergency out-of-hours slots available by WhatsApp request.
                </p>
              </div>
            </div>

            <a
              href={getWhatsAppUrl("Hello Fazzynails, I need an emergency/out-of-hours appointment slot!")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 px-4 bg-rose-900 hover:bg-rose-950 text-white text-xs font-semibold rounded-xl text-center flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Emergency Contact WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Main Grid: Form + Google Map */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Form Column */}
          <div className="lg:col-span-6 p-6 sm:p-8 rounded-3xl bg-[#FAF8F5] border border-stone-200/90 shadow-sm">
            <div className="mb-6 space-y-1">
              <h3 className="font-editorial text-2xl font-bold text-stone-900">
                Send an Online Inquiry
              </h3>
              <p className="text-xs text-stone-500">
                Submissions automatically notify the salon desk and save to our customer register.
              </p>
            </div>

            {submittedInquiry ? (
              <div className="p-6 rounded-2xl bg-white border border-stone-200 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="font-editorial text-2xl font-bold text-stone-900">
                  Message Sent Successfully!
                </h4>
                <p className="text-xs sm:text-sm text-stone-600">
                  Thank you, {submittedInquiry.name}. An email notification has been dispatched to Fazzynails, and your inquiry (Ref: {submittedInquiry.id}) is logged.
                </p>

                <div className="pt-2 flex flex-col gap-2">
                  <a
                    href={getWhatsAppUrl(`Hello Fazzynails, I just submitted an inquiry on your website: "${submittedInquiry.message}".`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send Copy to WhatsApp for Faster Reply</span>
                  </a>

                  <button
                    onClick={handleReset}
                    className="text-xs text-stone-500 hover:text-stone-800 underline py-2 cursor-pointer"
                  >
                    Send another message
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Bolanle Coker"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+234 907 281 7540"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900 font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1">
                      Topic / Service
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                    >
                      <option value="Gel Polish (₦3,000)">Gel Polish Manicure (₦3,000)</option>
                      <option value="Acrylic Full Set (₦15,000)">Acrylic Full Set (₦15,000)</option>
                      <option value="Bridal Nail Booking">Bridal & Event Nails</option>
                      <option value="Emergency Appointment">Emergency Appointment Request</option>
                      <option value="General Inquiry">General Question</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">
                    Your Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us what you need, your preferred appointment dates, or questions..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-rose-300" />
                  <span>{isSubmitting ? 'Sending Message...' : 'Submit Inquiry'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Google Map & Studio Location Column */}
          <div className="lg:col-span-6 space-y-4">
            <div className="p-6 rounded-3xl bg-[#FAF8F5] border border-stone-200/90 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-rose-700">
                    <MapPin className="w-4 h-4" />
                    <span>Studio Address</span>
                  </div>
                  <h4 className="font-editorial text-xl font-bold text-stone-900">
                    Agbani Enugu Atelier
                  </h4>
                  <p className="text-xs text-stone-600">
                    {BUSINESS_INFO.address}
                  </p>
                </div>

                <a
                  href="https://maps.google.com/?q=Agbani+Enugu+Nigeria"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg flex items-center gap-1"
                >
                  <span>Open in Maps</span>
                  <ExternalLink className="w-3 h-3 text-stone-400" />
                </a>
              </div>

              {/* Responsive Google Maps Embed Frame */}
              <div className="w-full h-72 rounded-2xl overflow-hidden border border-stone-200 shadow-inner bg-stone-200 relative">
                <iframe
                  title="Fazzynails Google Map Location"
                  src={BUSINESS_INFO.googleMapsEmbedUrl}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Social and Facebook Link (Prompt 1 requirement) */}
              <div className="p-4 rounded-xl bg-white border border-stone-200/80 flex items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-stone-900 block">
                    Follow Fazzynails on Facebook
                  </span>
                  <span className="text-xs text-stone-500">
                    Watch client videos, nail transformations & updates
                  </span>
                </div>

                <a
                  href={BUSINESS_INFO.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
                >
                  <span>Facebook</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
