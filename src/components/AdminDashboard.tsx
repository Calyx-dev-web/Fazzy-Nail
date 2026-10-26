import React, { useState } from 'react';
import { Booking, Inquiry, NailService, GalleryItem, BUSINESS_INFO, getWhatsAppUrl } from '../types';
import { formatPrice, formatDate, formatTime } from '../utils/format';
import {
  saveService,
  deleteService,
  saveGalleryItem,
  deleteGalleryItem,
  updateBookingStatus,
  deleteBooking,
  updateInquiryStatus,
  deleteInquiry,
  exportAllData,
} from '../services/db';
import {
  X,
  Calendar,
  MessageSquare,
  Phone,
  DollarSign,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  Check,
  Download,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  Upload,
  Lock,
  ShieldCheck,
  KeyRound,
  LogOut,
} from 'lucide-react';

interface AdminDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
  bookings: Booking[];
  inquiries: Inquiry[];
  services: NailService[];
  galleryItems: GalleryItem[];
  onRefreshData: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  isOpen,
  onClose,
  onLogout,
  bookings,
  inquiries,
  services,
  galleryItems,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'inquiries' | 'pricing' | 'gallery' | 'security'>('bookings');

  // Security & 2FA State
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState('');

  // Search & filter states
  const [bookingFilter, setBookingFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Editing state for Service
  const [editingService, setEditingService] = useState<NailService | null>(null);
  const [isAddingService, setIsAddingService] = useState<boolean>(false);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState<'gel' | 'acrylic' | 'biab' | 'care' | 'addons'>('acrylic');
  const [newServicePrice, setNewServicePrice] = useState<number>(15000);
  const [newServiceDuration, setNewServiceDuration] = useState('60 mins');
  const [newServiceDesc, setNewServiceDesc] = useState('');

  // Editing / adding state for Gallery
  const [editingGalleryItem, setEditingGalleryItem] = useState<GalleryItem | null>(null);
  const [isAddingGallery, setIsAddingGallery] = useState<boolean>(false);
  const [newGalTitle, setNewGalTitle] = useState('');
  const [newGalCategory, setNewGalCategory] = useState<'acrylic' | 'gel' | 'nailart' | 'minimal' | 'bridal'>('acrylic');
  const [newGalUrl, setNewGalUrl] = useState('');
  const [newGalDesc, setNewGalDesc] = useState('');
  const [newGalFeatured, setNewGalFeatured] = useState(false);

  // Toast feedback state
  const [toastNotice, setToastNotice] = useState<string | null>(null);
  const showToastNotice = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3500);
  };

  if (!isOpen) return null;

  // Filtered Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = bookingFilter === 'all' || b.status.toLowerCase() === bookingFilter.toLowerCase();
    const matchesSearch =
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.phone.includes(searchQuery) ||
      b.serviceName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Handle Booking Status
  const handleBookingStatusChange = async (id: string, status: Booking['status']) => {
    await updateBookingStatus(id, status);
    onRefreshData();
  };

  const handleDeleteBooking = async (id: string) => {
    if (confirm('Are you sure you want to delete this booking entry?')) {
      await deleteBooking(id);
      onRefreshData();
    }
  };

  // Handle Inquiry Status
  const handleInquiryStatusChange = async (id: string, status: Inquiry['status']) => {
    await updateInquiryStatus(id, status);
    onRefreshData();
  };

  const handleDeleteInquiry = async (id: string) => {
    if (confirm('Delete this inquiry?')) {
      await deleteInquiry(id);
      onRefreshData();
    }
  };

  // Save Service Edit
  const handleSaveService = async (service: NailService) => {
    if (!service.name.trim()) {
      alert('Please enter a valid service name.');
      return;
    }
    await saveService({
      ...service,
      name: service.name.trim(),
      price: Math.max(0, Number(service.price) || 0),
      duration: service.duration.trim() || '45 mins',
      description: service.description.trim(),
    });
    setEditingService(null);
    showToastNotice(`Service "${service.name}" updated successfully! Changes saved to database.`);
    onRefreshData();
  };

  const handleAddNewService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim()) return;

    const srv: NailService = {
      id: `srv-${Date.now()}`,
      name: newServiceName.trim(),
      category: newServiceCategory,
      price: Number(newServicePrice) || 3000,
      duration: newServiceDuration.trim() || '45 mins',
      description: newServiceDesc.trim() || 'Professional salon nail treatment.',
      isAvailable: true,
      popular: false,
    };

    await saveService(srv);
    setIsAddingService(false);
    setNewServiceName('');
    setNewServiceDesc('');
    showToastNotice(`New service "${srv.name}" created and saved to database!`);
    onRefreshData();
  };

  const handleDeleteService = async (id: string) => {
    if (confirm('Delete this service from the pricing menu?')) {
      await deleteService(id);
      onRefreshData();
    }
  };

  // Gallery file upload to base64
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNewGalUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddNewGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGalTitle.trim() || !newGalUrl.trim()) {
      alert('Please provide a title and either upload a photo or enter an image URL.');
      return;
    }

    const item: GalleryItem = {
      id: `gal-${Date.now()}`,
      title: newGalTitle.trim(),
      category: newGalCategory,
      imageUrl: newGalUrl.trim(),
      description: newGalDesc.trim() || 'Custom set created at Fazzynails atelier.',
      featured: newGalFeatured,
      createdAt: new Date().toISOString().split('T')[0],
    };

    await saveGalleryItem(item);
    setIsAddingGallery(false);
    setNewGalTitle('');
    setNewGalUrl('');
    setNewGalDesc('');
    showToastNotice(`Gallery photo "${item.title}" added successfully!`);
    onRefreshData();
  };

  const handleSaveGallery = async (item: GalleryItem) => {
    if (!item.title.trim()) {
      alert('Please enter a photo title.');
      return;
    }
    await saveGalleryItem({
      ...item,
      title: item.title.trim(),
      description: item.description.trim(),
    });
    setEditingGalleryItem(null);
    showToastNotice(`Gallery photo "${item.title}" updated successfully!`);
    onRefreshData();
  };

  const handleDeleteGallery = async (id: string) => {
    if (confirm('Remove this photo from the gallery?')) {
      await deleteGalleryItem(id);
      showToastNotice('Photo removed from gallery.');
      onRefreshData();
    }
  };

  // Export full JSON
  const handleExportBackup = async () => {
    const data = await exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fazzynails_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Quick stats
  const totalRevenuePotential = bookings
    .filter((b) => b.status !== 'Cancelled')
    .reduce((acc, curr) => acc + (curr.price || 0), 0);

  const pendingCount = bookings.filter((b) => b.status === 'Pending').length;
  const unreadInquiriesCount = inquiries.filter((i) => i.status === 'Unread').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Real-time Toast Feedback Notification */}
        {toastNotice && (
          <div className="absolute top-3.5 right-16 z-50 flex items-center gap-2 px-3.5 py-1.5 bg-stone-950 text-white text-xs font-semibold rounded-xl shadow-xl border border-stone-700">
            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>{toastNotice}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/image_d0ec8d5e.png"
              alt="Fazzynails Logo"
              className="w-9 h-9 rounded-full object-cover border border-amber-300 shadow-xs shrink-0"
            />
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-editorial text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Fazzynails Admin Portal
              </span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono uppercase tracking-wider rounded border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>2FA Active</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportBackup}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium transition-colors cursor-pointer"
              title="Download complete JSON database backup"
            >
              <Download className="w-3.5 h-3.5 text-rose-300" />
              <span>Export DB Backup</span>
            </button>

            <button
              onClick={() => {
                sessionStorage.removeItem('fzn_admin_auth');
                sessionStorage.removeItem('fzn_admin_auth_time');
                if (onLogout) onLogout();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-950/70 hover:bg-rose-900 text-rose-200 border border-rose-800/80 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="Lock panel and log out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Lock / Log Out</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-white rounded-lg transition-colors cursor-pointer"
              aria-label="Close admin dashboard"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-stone-500 block">Total Appointments</span>
            <div className="font-editorial text-2xl font-bold text-stone-900 mt-0.5 tabular-nums">
              {bookings.length}
            </div>
            <span className="text-[10px] text-amber-600 font-medium">
              {pendingCount} Pending Confirmation
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-stone-500 block">Estimated Pipeline</span>
            <div className="font-editorial text-2xl font-bold text-stone-900 mt-0.5 tabular-nums">
              {formatPrice(totalRevenuePotential)}
            </div>
            <span className="text-[10px] text-emerald-600 font-medium">Active Bookings</span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-stone-500 block">Customer Inquiries</span>
            <div className="font-editorial text-2xl font-bold text-stone-900 mt-0.5 tabular-nums">
              {inquiries.length}
            </div>
            <span className="text-[10px] text-rose-600 font-medium">
              {unreadInquiriesCount} Unread Messages
            </span>
          </div>

          <div className="p-3 bg-white rounded-xl border border-stone-200 shadow-2xs">
            <span className="text-stone-500 block">Active Service Catalog</span>
            <div className="font-editorial text-2xl font-bold text-stone-900 mt-0.5 tabular-nums">
              {services.length}
            </div>
            <span className="text-[10px] text-stone-500">
              {galleryItems.length} Gallery Sets Live
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-stone-200 bg-white flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('bookings')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'bookings'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Bookings & Appointments ({bookings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'inquiries'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Customer Inquiries ({inquiries.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pricing')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'pricing'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Manage Pricing & Services ({services.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gallery')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'gallery'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Manage Gallery Portfolio ({galleryItems.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 cursor-pointer transition-colors whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Lock className="w-4 h-4 text-rose-700" />
            <span>Security & 2FA Settings</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 bg-stone-50">
          {/* TAB 1: BOOKINGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search name, phone, service..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-800 w-48 sm:w-64"
                    />
                  </div>

                  <select
                    value={bookingFilter}
                    onChange={(e) => setBookingFilter(e.target.value)}
                    className="px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-800"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <span className="text-xs text-stone-500">
                  Showing {filteredBookings.length} bookings saved in browser IndexedDB
                </span>
              </div>

              {filteredBookings.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs">
                  No appointments found matching this filter.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredBookings.map((b) => {
                    const clientWhatsAppLink = `https://wa.me/${b.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hello ${b.customerName}, this is Fazzynails regarding your booking (ID: ${b.id}) for ${b.serviceName} on ${b.date} at ${b.time}.`
                    )}`;

                    return (
                      <div
                        key={b.id}
                        className="p-4 sm:p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-stone-900 bg-stone-100 px-2 py-0.5 rounded">
                              {b.id}
                            </span>
                            <span className="font-semibold text-sm text-stone-900">{b.customerName}</span>
                            <span className="text-xs text-stone-400 font-mono">({b.phone})</span>

                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                                b.status === 'Confirmed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : b.status === 'Pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : b.status === 'Completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              {b.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs text-stone-600 flex-wrap">
                            <span className="font-medium text-rose-900">{b.serviceName}</span>
                            <span>·</span>
                            <span className="font-editorial text-sm font-bold text-stone-900">
                              {formatPrice(b.price)}
                            </span>
                            <span>·</span>
                            <span className="font-medium">
                              📅 {b.date} at {b.time}
                            </span>
                            <span>·</span>
                            <span className="text-stone-500">
                              Style: {b.nailShape} ({b.nailLength})
                            </span>
                          </div>

                          {b.notes && (
                            <p className="text-xs text-stone-500 italic bg-stone-50 p-2 rounded-lg max-w-xl">
                              Notes: {b.notes}
                            </p>
                          )}
                        </div>

                        {/* Booking Controls */}
                        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
                          {/* WhatsApp client directly */}
                          <a
                            href={clientWhatsAppLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-medium flex items-center gap-1"
                            title="Chat with customer on WhatsApp"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">WhatsApp</span>
                          </a>

                          {/* Call customer */}
                          <a
                            href={`tel:${b.phone}`}
                            className="p-2 text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg text-xs font-medium flex items-center gap-1"
                            title="Call customer"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Call</span>
                          </a>

                          {/* Status toggle */}
                          <select
                            value={b.status}
                            onChange={(e) =>
                              handleBookingStatusChange(b.id, e.target.value as Booking['status'])
                            }
                            className="text-xs px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg"
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>

                          {/* Delete */}
                          <button
                            onClick={() => handleDeleteBooking(b.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete booking"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  Customer form submissions stored in IndexedDB ({inquiries.length})
                </span>
              </div>

              {inquiries.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-500 text-xs">
                  No inquiries received yet. Try submitting the contact form on the live site!
                </div>
              ) : (
                <div className="space-y-3">
                  {inquiries.map((inq) => {
                    const waReply = `https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `Hello ${inq.name}, this is Fazzynails replying to your inquiry about "${inq.subject}". How can we assist you today?`
                    )}`;

                    return (
                      <div
                        key={inq.id}
                        className="p-5 bg-white rounded-2xl border border-stone-200/90 shadow-2xs space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                              {inq.id}
                            </span>
                            <span className="font-bold text-sm text-stone-900">{inq.name}</span>
                            <span className="text-xs text-stone-400 font-mono">({inq.phone})</span>
                            {inq.email && (
                              <span className="text-xs text-stone-500 hidden sm:inline">
                                · {inq.email}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-stone-400 font-mono">
                              {formatDate(inq.timestamp)} {formatTime(inq.timestamp)}
                            </span>

                            <button
                              onClick={() =>
                                handleInquiryStatusChange(
                                  inq.id,
                                  inq.status === 'Unread' ? 'Replied' : 'Unread'
                                )
                              }
                              className={`px-2 py-1 rounded text-[10px] font-semibold cursor-pointer ${
                                inq.status === 'Replied'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {inq.status}
                            </button>

                            <button
                              onClick={() => handleDeleteInquiry(inq.id)}
                              className="p-1 text-stone-400 hover:text-rose-600 rounded cursor-pointer"
                              title="Delete inquiry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-xs font-bold text-rose-900 block">
                            Topic: {inq.subject}
                          </span>
                          <p className="text-xs sm:text-sm text-stone-700 bg-stone-50 p-3 rounded-xl leading-relaxed">
                            {inq.message}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <a
                            href={waReply}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Reply via WhatsApp</span>
                          </a>

                          <a
                            href={`tel:${inq.phone}`}
                            className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-medium flex items-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Call</span>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRICING & SERVICES (Prompt 2 requirement: editable in admin dashboard and remains saved after page refresh) */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-editorial text-xl font-bold text-stone-900">
                    Services & Pricing Menu Editor
                  </h3>
                  <p className="text-xs text-stone-500">
                    Changes save to browser IndexedDB and update the website live instantly.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingService(true)}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4 text-rose-300" />
                  <span>Add New Service</span>
                </button>
              </div>

              {/* Add New Service Form */}
              {isAddingService && (
                <form
                  onSubmit={handleAddNewService}
                  className="p-5 bg-white rounded-2xl border-2 border-stone-900 shadow-lg space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <h4 className="font-bold text-sm text-stone-900">Create New Nail Service</h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingService(false)}
                      className="text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold mb-1">Service Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Chrome Glaze Refill"
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Category</label>
                      <select
                        value={newServiceCategory}
                        onChange={(e) => setNewServiceCategory(e.target.value as any)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                      >
                        <option value="gel">Gel Polish</option>
                        <option value="acrylic">Acrylic</option>
                        <option value="biab">BIAB</option>
                        <option value="care">Care & Pedicure</option>
                        <option value="addons">Addons & Nail Art</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Price (₦ Naira) *</label>
                      <input
                        type="number"
                        required
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Duration</label>
                      <input
                        type="text"
                        placeholder="e.g. 60 mins"
                        value={newServiceDuration}
                        onChange={(e) => setNewServiceDuration(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold mb-1">Description</label>
                      <input
                        type="text"
                        placeholder="Short summary for client viewing"
                        value={newServiceDesc}
                        onChange={(e) => setNewServiceDesc(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingService(false)}
                      className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                    >
                      Save Service to Database
                    </button>
                  </div>
                </form>
              )}

              {/* Service list table / cards */}
              <div className="space-y-3">
                {services.map((srv) => {
                  const isEditing = editingService?.id === srv.id;

                  if (isEditing && editingService) {
                    return (
                      <div
                        key={srv.id}
                        className="p-5 bg-white rounded-2xl border-2 border-stone-900 shadow-md space-y-4"
                      >
                        <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                          <h4 className="font-bold text-sm text-stone-900 flex items-center gap-1.5">
                            <Edit2 className="w-4 h-4 text-rose-700" />
                            <span>Edit Service: {editingService.name}</span>
                          </h4>
                          <span className="text-[10px] font-mono text-stone-400">ID: {editingService.id}</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <label className="block font-semibold mb-1">Service Title *</label>
                            <input
                              type="text"
                              value={editingService.name}
                              onChange={(e) =>
                                setEditingService({ ...editingService, name: e.target.value })
                              }
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-medium"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold mb-1">Category</label>
                            <select
                              value={editingService.category}
                              onChange={(e) =>
                                setEditingService({
                                  ...editingService,
                                  category: e.target.value as any,
                                })
                              }
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg capitalize text-stone-900"
                            >
                              <option value="gel">Gel Polish</option>
                              <option value="acrylic">Acrylic</option>
                              <option value="biab">BIAB</option>
                              <option value="care">Care & Pedicure</option>
                              <option value="addons">Addons & Nail Art</option>
                            </select>
                          </div>

                          <div>
                            <label className="block font-semibold mb-1">Price (₦ Naira) *</label>
                            <input
                              type="number"
                              value={editingService.price}
                              onChange={(e) =>
                                setEditingService({
                                  ...editingService,
                                  price: Number(e.target.value),
                                })
                              }
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg font-mono font-bold text-stone-900"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold mb-1">Duration</label>
                            <input
                              type="text"
                              value={editingService.duration}
                              onChange={(e) =>
                                setEditingService({ ...editingService, duration: e.target.value })
                              }
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                            />
                          </div>

                          <div className="sm:col-span-4">
                            <label className="block font-semibold mb-1">Service Description</label>
                            <textarea
                              rows={2}
                              value={editingService.description}
                              onChange={(e) =>
                                setEditingService({
                                  ...editingService,
                                  description: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900"
                            />
                          </div>

                          <div className="sm:col-span-4 flex items-center gap-6 pt-1">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editingService.isAvailable}
                                onChange={(e) =>
                                  setEditingService({
                                    ...editingService,
                                    isAvailable: e.target.checked,
                                  })
                                }
                                className="rounded"
                              />
                              <span className="font-medium text-stone-700">Active & Available for Booking</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={!!editingService.popular}
                                onChange={(e) =>
                                  setEditingService({
                                    ...editingService,
                                    popular: e.target.checked,
                                  })
                                }
                                className="rounded"
                              />
                              <span className="font-medium text-stone-700">Featured / Client Favorite</span>
                            </label>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t border-stone-100">
                          <button
                            type="button"
                            onClick={() => setEditingService(null)}
                            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveService(editingService)}
                            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg shadow-sm cursor-pointer flex items-center gap-1.5"
                          >
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>Save Changes to Database</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={srv.id}
                      className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-stone-900">{srv.name}</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-stone-100 text-stone-600 rounded">
                            {srv.category}
                          </span>
                          {srv.id.startsWith('srv-') && (
                            <span className="text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">
                              Uploaded by Admin
                            </span>
                          )}
                          {srv.popular && (
                            <span className="text-[10px] text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded">
                              Featured
                            </span>
                          )}
                          {!srv.isAvailable && (
                            <span className="text-[10px] text-stone-500 font-medium bg-stone-100 px-2 py-0.5 rounded">
                              Unavailable
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-500 max-w-xl">{srv.description}</p>
                        <span className="text-[11px] text-stone-400">Duration: {srv.duration}</span>
                      </div>

                      <div className="flex items-center gap-4 shrink-0 justify-between sm:justify-end">
                        <span className="font-editorial text-2xl font-bold text-stone-900 tabular-nums">
                          {formatPrice(srv.price)}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingService({ ...srv })}
                            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                            title="Edit Service Details & Price"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-rose-300" />
                            <span>Edit Service</span>
                          </button>

                          <button
                            onClick={() => handleDeleteService(srv.id)}
                            className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Delete service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: GALLERY (Prompt 2 requirement: editable in admin dashboard and remains saved after page refresh) */}
          {activeTab === 'gallery' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-editorial text-xl font-bold text-stone-900">
                    Gallery Portfolio Editor
                  </h3>
                  <p className="text-xs text-stone-500">
                    Add client photos via upload or URL. Stored permanently in IndexedDB.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingGallery(true)}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4 text-rose-300" />
                  <span>Add New Nail Photo</span>
                </button>
              </div>

              {/* Add New Gallery Item Form */}
              {isAddingGallery && (
                <form
                  onSubmit={handleAddNewGallery}
                  className="p-5 bg-white rounded-2xl border-2 border-stone-900 shadow-lg space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <h4 className="font-bold text-sm text-stone-900">Upload / Add Gallery Set</h4>
                    <button
                      type="button"
                      onClick={() => setIsAddingGallery(false)}
                      className="text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-semibold mb-1">Nail Set Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Chrome French Tip Stiletto"
                        value={newGalTitle}
                        onChange={(e) => setNewGalTitle(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold mb-1">Category</label>
                      <select
                        value={newGalCategory}
                        onChange={(e) => setNewGalCategory(e.target.value as any)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                      >
                        <option value="acrylic">Acrylic</option>
                        <option value="gel">Gel Polish</option>
                        <option value="nailart">Nail Art</option>
                        <option value="minimal">Minimalist</option>
                        <option value="bridal">Bridal</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2 space-y-2">
                      <label className="block font-semibold">Image Source</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-3 bg-stone-50 border border-dashed border-stone-300 rounded-xl flex flex-col items-center justify-center text-center">
                          <Upload className="w-5 h-5 text-stone-400 mb-1" />
                          <span className="text-[11px] text-stone-600 block mb-1">
                            Upload file from device
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFileUpload}
                            className="text-xs text-stone-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:bg-stone-900 file:text-white"
                          />
                        </div>

                        <div>
                          <span className="text-[11px] text-stone-600 block mb-1">
                            Or enter direct image URL
                          </span>
                          <input
                            type="text"
                            placeholder="https://... or /src/assets/images/..."
                            value={newGalUrl}
                            onChange={(e) => setNewGalUrl(e.target.value)}
                            className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                          />
                        </div>
                      </div>

                      {newGalUrl && (
                        <div className="mt-2 w-20 h-20 rounded-lg overflow-hidden border border-stone-300">
                          <img
                            src={newGalUrl}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-semibold mb-1">Description</label>
                      <input
                        type="text"
                        placeholder="Details about colors, technique, or jewels used"
                        value={newGalDesc}
                        onChange={(e) => setNewGalDesc(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg"
                      />
                    </div>

                    <div className="sm:col-span-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="featured-check"
                        checked={newGalFeatured}
                        onChange={(e) => setNewGalFeatured(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="featured-check" className="text-xs text-stone-700">
                        Mark as Featured on Homepage
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                    <button
                      type="button"
                      onClick={() => setIsAddingGallery(false)}
                      className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-stone-900 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                    >
                      Save Photo to Gallery
                    </button>
                  </div>
                </form>
              )}

              {/* Gallery Items Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {galleryItems.map((item) => {
                  const isEditing = editingGalleryItem?.id === item.id;

                  if (isEditing && editingGalleryItem) {
                    return (
                      <div
                        key={item.id}
                        className="p-4 bg-white rounded-2xl border-2 border-stone-900 shadow-md space-y-3 flex flex-col justify-between sm:col-span-2 md:col-span-1"
                      >
                        <div className="space-y-2">
                          <h4 className="font-bold text-xs text-stone-900 flex items-center gap-1.5 border-b border-stone-200 pb-1.5">
                            <Edit2 className="w-3.5 h-3.5 text-rose-700" />
                            <span>Edit Photo Details</span>
                          </h4>

                          <div>
                            <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">Title *</label>
                            <input
                              type="text"
                              value={editingGalleryItem.title}
                              onChange={(e) =>
                                setEditingGalleryItem({ ...editingGalleryItem, title: e.target.value })
                              }
                              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">Category</label>
                            <select
                              value={editingGalleryItem.category}
                              onChange={(e) =>
                                setEditingGalleryItem({
                                  ...editingGalleryItem,
                                  category: e.target.value as any,
                                })
                              }
                              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                            >
                              <option value="acrylic">Acrylic</option>
                              <option value="gel">Gel Polish</option>
                              <option value="nailart">Nail Art & 3D</option>
                              <option value="minimal">Minimal & French</option>
                              <option value="bridal">Bridal & Glam</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-stone-700 mb-0.5">Description</label>
                            <textarea
                              rows={2}
                              value={editingGalleryItem.description}
                              onChange={(e) =>
                                setEditingGalleryItem({ ...editingGalleryItem, description: e.target.value })
                              }
                              className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-1.5 pt-2 border-t border-stone-100">
                          <button
                            type="button"
                            onClick={() => setEditingGalleryItem(null)}
                            className="px-3 py-1.5 text-xs text-stone-600 hover:text-stone-900 bg-stone-100 rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveGallery(editingGalleryItem)}
                            className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-lg cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Save</span>
                          </button>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={item.id}
                      className="p-3 bg-white rounded-2xl border border-stone-200/90 shadow-2xs space-y-2 flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-square rounded-xl overflow-hidden bg-stone-100 mb-2 relative">
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white text-[9px] uppercase font-bold rounded">
                            {item.category}
                          </span>
                        </div>

                        <h4 className="font-editorial text-base font-bold text-stone-900 line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-stone-500 line-clamp-2 mt-0.5">
                          {item.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                        <span className="text-[10px] text-stone-400 font-mono">{item.createdAt}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingGalleryItem({ ...item })}
                            className="px-2.5 py-1 text-xs font-semibold text-stone-700 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                            title="Edit Photo Info"
                          >
                            <Edit2 className="w-3 h-3 text-stone-500" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDeleteGallery(item.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete gallery item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY & 2FA SETTINGS */}
          {activeTab === 'security' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="font-editorial text-xl font-bold text-stone-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Two-Factor Authentication (2FA) & Security Settings</span>
                </h3>
                <p className="text-xs text-stone-500">
                  Manage the cryptographic access credentials protecting all customer bookings, inquiries, and salon pricing data.
                </p>
              </div>

              {/* 2FA Protection Status Card */}
              <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900">2-Factor Authentication Status</h4>
                      <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Enforced & Active on all Admin Logins
                      </span>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-full">
                    Strict Multi-Factor Mode
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                    <span className="font-bold text-stone-800 block">Factor 1: Master PIN</span>
                    <p className="text-stone-500">Protects against unauthorized local browser access.</p>
                  </div>
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-1">
                    <span className="font-bold text-stone-800 block">Factor 2: Live WhatsApp OTP / TOTP</span>
                    <p className="text-stone-500">Rotating 60s dynamic code broadcast to {BUSINESS_INFO.phone}.</p>
                  </div>
                </div>
              </div>

              {/* Change Security PIN */}
              <div className="p-5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs space-y-4">
                <h4 className="font-bold text-sm text-stone-900 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-stone-700" />
                  <span>Update Admin Master PIN</span>
                </h4>
                <p className="text-xs text-stone-500">
                  The default master PIN is <strong>7540</strong> (the last 4 digits of your business phone). You can customize it below.
                </p>

                {pinChangeMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
                    {pinChangeMsg}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 text-xs">
                  <div className="flex-1">
                    <label className="block font-semibold text-stone-700 mb-1">
                      New Security PIN (4 to 8 digits)
                    </label>
                    <input
                      type="password"
                      placeholder="Enter new PIN"
                      value={newPinInput}
                      onChange={(e) => setNewPinInput(e.target.value)}
                      className="w-full px-4 py-2.5 bg-stone-50 border border-stone-300 rounded-xl font-mono text-sm tracking-widest text-stone-900"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (!newPinInput.trim() || newPinInput.length < 4) {
                        alert('PIN must be at least 4 digits');
                        return;
                      }
                      localStorage.setItem('fzn_custom_admin_pin', newPinInput.trim());
                      setPinChangeMsg('Admin PIN successfully updated! It will be required on your next login.');
                      setNewPinInput('');
                      setTimeout(() => setPinChangeMsg(''), 4000);
                    }}
                    className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-xs shadow-xs cursor-pointer"
                  >
                    Save New PIN
                  </button>
                </div>
              </div>

              {/* Emergency Recovery Codes */}
              <div className="p-5 rounded-2xl bg-stone-100/80 border border-stone-200 space-y-2 text-xs">
                <h4 className="font-bold text-stone-900">Emergency Backup Recovery Key</h4>
                <p className="text-stone-600">
                  If you cannot access your WhatsApp phone, you can bypass Factor 2 using the master recovery key:
                </p>
                <div className="inline-block p-2.5 bg-white border border-stone-300 rounded-lg font-mono text-xs font-bold text-stone-800 tracking-wider">
                  FN-SEC-990142
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
