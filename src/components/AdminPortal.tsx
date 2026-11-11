import React, { useState, useEffect } from 'react';
import { updateEmail, updatePassword, verifyBeforeUpdateEmail } from 'firebase/auth';
import { auth } from '../firebase';
import {
  Booking,
  Inquiry,
  NailService,
  GalleryItem,
  Customer,
  Invoice,
  BusinessSettings,
  getWhatsAppUrl,
} from '../types';
import { formatPrice, formatDate, formatTime } from '../utils/format';
import { IMAGES, resolveImageUrl } from '../assets/images';
import {
  saveService,
  deleteService,
  saveGalleryItem,
  deleteGalleryItem,
  saveBooking,
  deleteBooking,
  saveCustomer,
  deleteCustomer,
  saveInvoice,
  deleteInvoice,
  saveBusinessSettings,
  exportAllData,
  clearAllDataAndResetApp,
} from '../services/db';
import {
  LayoutDashboard,
  Calendar,
  Sparkles,
  Scissors,
  Image as ImageIcon,
  Users,
  Receipt,
  Settings,
  LogOut,
  Plus,
  Search,
  Check,
  X,
  Trash2,
  Edit,
  ExternalLink,
  Phone,
  Mail,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Bell,
  Menu,
  ChevronRight,
  Upload,
  UserCheck,
  Sliders,
  Eye,
  FileText,
  Download,
  Filter,
} from 'lucide-react';

interface AdminPortalProps {
  onLogout: () => void;
  onViewWebsite: () => void;
  bookings: Booking[];
  inquiries: Inquiry[];
  services: NailService[];
  galleryItems: GalleryItem[];
  customers: Customer[];
  invoices: Invoice[];
  settings: BusinessSettings;
  onRefreshData: () => void;
}

type TabType =
  | 'overview'
  | 'bookings'
  | 'services'
  | 'gallery'
  | 'customers'
  | 'invoices'
  | 'settings';

export const AdminPortal: React.FC<AdminPortalProps> = ({
  onLogout,
  onViewWebsite,
  bookings,
  inquiries,
  services,
  galleryItems,
  customers,
  invoices,
  settings,
  onRefreshData,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Global search input in header
  const [globalSearch, setGlobalSearch] = useState('');

  // Modals state
  const [activeModal, setActiveModal] = useState<
    'addBooking' | 'addService' | 'addGallery' | 'addCustomer' | 'addInvoice' | 'editBooking' | 'editService' | 'editGallery' | 'editCustomer' | null
  >(null);

  // Selected item for edits
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedService, setSelectedService] = useState<NailService | null>(null);
  const [selectedGallery, setSelectedGallery] = useState<GalleryItem | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form states for NEW items
  // New Booking
  const [nbName, setNbName] = useState('');
  const [nbPhone, setNbPhone] = useState('');
  const [nbServiceId, setNbServiceId] = useState('');
  const [nbDate, setNbDate] = useState('');
  const [nbTime, setNbTime] = useState('11:00 AM');
  const [nbShape, setNbShape] = useState('Almond');
  const [nbLength, setNbLength] = useState('Medium');
  const [nbNotes, setNbNotes] = useState('');

  // New Service
  const [nsName, setNsName] = useState('');
  const [nsCategory, setNsCategory] = useState<'gel' | 'acrylic' | 'biab' | 'care' | 'addons'>('acrylic');
  const [nsPrice, setNsPrice] = useState(15000);
  const [nsDuration, setNsDuration] = useState('60 mins');
  const [nsDesc, setNsDesc] = useState('');

  // New Gallery
  const [ngTitle, setNgTitle] = useState('');
  const [ngCategory, setNgCategory] = useState<'acrylic' | 'gel' | 'nailart' | 'minimal' | 'bridal'>('acrylic');
  const [ngUrl, setNgUrl] = useState('');
  const [ngDesc, setNgDesc] = useState('');
  const [ngFeatured, setNgFeatured] = useState(true);

  // New Customer
  const [ncName, setNcName] = useState('');
  const [ncPhone, setNcPhone] = useState('');
  const [ncEmail, setNcEmail] = useState('');
  const [ncNotes, setNcNotes] = useState('');

  // New Invoice
  const [niCustomerName, setNiCustomerName] = useState('');
  const [niPhone, setNiPhone] = useState('');
  const [niDesc, setNiDesc] = useState('');
  const [niAmount, setNiAmount] = useState(15000);
  const [niStatus, setNiStatus] = useState<'Paid' | 'Unpaid'>('Paid');

  // Edit Service Form State
  const [esName, setEsName] = useState('');
  const [esCategory, setEsCategory] = useState<'gel' | 'acrylic' | 'biab' | 'care' | 'addons'>('acrylic');
  const [esPrice, setEsPrice] = useState(15000);
  const [esDuration, setEsDuration] = useState('60 mins');
  const [esDesc, setEsDesc] = useState('');
  const [esAvailable, setEsAvailable] = useState(true);

  // Edit Gallery Form State
  const [egTitle, setEgTitle] = useState('');
  const [egCategory, setEgCategory] = useState<'acrylic' | 'gel' | 'nailart' | 'minimal' | 'bridal'>('acrylic');
  const [egUrl, setEgUrl] = useState('');
  const [egDesc, setEgDesc] = useState('');
  const [egFeatured, setEgFeatured] = useState(true);

  // Edit Booking Form State
  const [ebName, setEbName] = useState('');
  const [ebPhone, setEbPhone] = useState('');
  const [ebServiceName, setEbServiceName] = useState('');
  const [ebPrice, setEbPrice] = useState(15000);
  const [ebDate, setEbDate] = useState('');
  const [ebTime, setEbTime] = useState('');
  const [ebStatus, setEbStatus] = useState<Booking['status']>('Confirmed');

  // Edit Customer Form State
  const [ecName, setEcName] = useState('');
  const [ecPhone, setEcPhone] = useState('');
  const [ecEmail, setEcEmail] = useState('');
  const [ecNotes, setEcNotes] = useState('');
  const [ecSpent, setEcSpent] = useState(0);

  // Sync selected item state into edit form inputs
  useEffect(() => {
    if (selectedService) {
      setEsName(selectedService.name || '');
      setEsCategory(selectedService.category || 'acrylic');
      setEsPrice(selectedService.price || 0);
      setEsDuration(selectedService.duration || '60 mins');
      setEsDesc(selectedService.description || '');
      setEsAvailable(selectedService.isAvailable !== false);
    }
  }, [selectedService]);

  useEffect(() => {
    if (selectedGallery) {
      setEgTitle(selectedGallery.title || '');
      setEgCategory(selectedGallery.category || 'acrylic');
      setEgUrl(selectedGallery.imageUrl || '');
      setEgDesc(selectedGallery.description || '');
      setEgFeatured(selectedGallery.featured !== false);
    }
  }, [selectedGallery]);

  useEffect(() => {
    if (selectedBooking) {
      setEbName(selectedBooking.customerName || '');
      setEbPhone(selectedBooking.phone || '');
      setEbServiceName(selectedBooking.serviceName || '');
      setEbPrice(selectedBooking.price || 0);
      setEbDate(selectedBooking.date || '');
      setEbTime(selectedBooking.time || '');
      setEbStatus(selectedBooking.status || 'Confirmed');
    }
  }, [selectedBooking]);

  useEffect(() => {
    if (selectedCustomer) {
      setEcName(selectedCustomer.name || '');
      setEcPhone(selectedCustomer.phone || '');
      setEcEmail(selectedCustomer.email || '');
      setEcNotes(selectedCustomer.notes || '');
      setEcSpent(selectedCustomer.totalSpent || 0);
    }
  }, [selectedCustomer]);

  // Business Settings Edit state
  const [editSettings, setEditSettings] = useState<BusinessSettings>({
    ...settings,
    ownerEmail: auth.currentUser?.email || settings.ownerEmail,
  });

  useEffect(() => {
    setEditSettings({
      ...settings,
      ownerEmail: auth.currentUser?.email || settings.ownerEmail,
    });
  }, [settings]);

  useEffect(() => {
    if (services.length > 0 && !nbServiceId) {
      setNbServiceId(services[0].id);
    }
  }, [services, nbServiceId]);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3500);
  };

  // Helper Stats
  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter((b) => b.status === 'Pending').length;
  const confirmedBookings = bookings.filter((b) => b.status === 'Confirmed').length;
  const completedBookings = bookings.filter((b) => b.status === 'Completed').length;
  const totalCustomers = customers.length;
  const totalRevenue = invoices
    .filter((i) => i.status === 'Paid')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  // Filtered collections based on tab search & filters
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>('all');
  const [bookingFilterDate, setBookingFilterDate] = useState<string>('');

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = bookingFilterStatus === 'all' || b.status.toLowerCase() === bookingFilterStatus.toLowerCase();
    const matchesDate = !bookingFilterDate || b.date === bookingFilterDate;
    const matchesSearch =
      b.customerName.toLowerCase().includes(globalSearch.toLowerCase()) ||
      b.phone.includes(globalSearch) ||
      b.serviceName.toLowerCase().includes(globalSearch.toLowerCase());
    return matchesStatus && matchesDate && matchesSearch;
  });

  const filteredCustomers = customers.filter((c) => {
    return (
      c.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
      c.phone.includes(globalSearch) ||
      c.email.toLowerCase().includes(globalSearch.toLowerCase())
    );
  });

  const filteredInvoices = invoices.filter((i) => {
    return (
      i.customerName.toLowerCase().includes(globalSearch.toLowerCase()) ||
      i.id.toLowerCase().includes(globalSearch.toLowerCase()) ||
      i.serviceDescription.toLowerCase().includes(globalSearch.toLowerCase())
    );
  });

  // Action Handlers
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetService = services.find((s) => s.id === nbServiceId) || services[0];
    const newB: Booking = {
      id: `FZ-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: nbName.trim(),
      phone: nbPhone.trim(),
      serviceId: targetService ? targetService.id : 'srv-1',
      serviceName: targetService ? targetService.name : 'Nail Service',
      price: targetService ? targetService.price : 15000,
      date: nbDate || new Date().toISOString().split('T')[0],
      time: nbTime,
      nailShape: nbShape,
      nailLength: nbLength,
      notes: nbNotes.trim() || undefined,
      status: 'Confirmed',
      createdAt: new Date().toISOString(),
    };

    await saveBooking(newB);
    setActiveModal(null);
    setNbName('');
    setNbPhone('');
    setNbNotes('');
    showToast(`New booking ${newB.id} for ${newB.customerName} created successfully!`);
    onRefreshData();
  };

  const handleCreateService = async (e: React.FormEvent) => {
    e.preventDefault();
    const newS: NailService = {
      id: `srv-${Date.now()}`,
      name: nsName.trim(),
      category: nsCategory,
      price: Number(nsPrice) || 3000,
      duration: nsDuration.trim() || '45 mins',
      description: nsDesc.trim() || 'Luxury nail service.',
      isAvailable: true,
      popular: false,
    };
    await saveService(newS);
    setActiveModal(null);
    setNsName('');
    setNsDesc('');
    showToast(`Service "${newS.name}" added to price menu!`);
    onRefreshData();
  };

  const handleCreateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    const newG: GalleryItem = {
      id: `gal-${Date.now()}`,
      title: ngTitle.trim(),
      category: ngCategory,
      imageUrl: ngUrl.trim() || IMAGES.hero,
      description: ngDesc.trim() || 'Luxury set created at Fazzy Nails studio.',
      featured: ngFeatured,
      createdAt: new Date().toISOString().split('T')[0],
    };
    await saveGalleryItem(newG);
    setActiveModal(null);
    setNgTitle('');
    setNgUrl('');
    setNgDesc('');
    showToast(`Nail work photo "${newG.title}" published to gallery!`);
    onRefreshData();
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    const newC: Customer = {
      id: `cust-${Date.now()}`,
      name: ncName.trim(),
      phone: ncPhone.trim(),
      email: ncEmail.trim() || 'client@fazzynails.com',
      notes: ncNotes.trim() || undefined,
      createdAt: new Date().toISOString().split('T')[0],
      totalSpent: 0,
      appointmentCount: 1,
    };
    await saveCustomer(newC);
    setActiveModal(null);
    setNcName('');
    setNcPhone('');
    setNcEmail('');
    setNcNotes('');
    showToast(`Customer "${newC.name}" added to directory!`);
    onRefreshData();
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const newI: Invoice = {
      id: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: niCustomerName.trim(),
      customerPhone: niPhone.trim(),
      serviceDescription: niDesc.trim() || 'Nail Treatment Session',
      amount: Number(niAmount) || 15000,
      date: new Date().toISOString().split('T')[0],
      status: niStatus,
      paymentMethod: 'Bank Transfer',
    };
    await saveInvoice(newI);
    setActiveModal(null);
    setNiCustomerName('');
    setNiPhone('');
    setNiDesc('');
    showToast(`Invoice ${newI.id} created!`);
    onRefreshData();
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;
    const updated: NailService = {
      ...selectedService,
      name: esName.trim(),
      category: esCategory,
      price: Number(esPrice) || 0,
      duration: esDuration.trim(),
      description: esDesc.trim(),
      isAvailable: esAvailable,
    };
    await saveService(updated);
    setActiveModal(null);
    setSelectedService(null);
    showToast(`Service "${updated.name}" updated (Price: ₦${updated.price.toLocaleString()})!`);
    onRefreshData();
  };

  const handleUpdateGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGallery) return;
    const updated: GalleryItem = {
      ...selectedGallery,
      title: egTitle.trim(),
      category: egCategory,
      imageUrl: egUrl.trim(),
      description: egDesc.trim(),
      featured: egFeatured,
    };
    await saveGalleryItem(updated);
    setActiveModal(null);
    setSelectedGallery(null);
    showToast(`Gallery photo "${updated.title}" updated!`);
    onRefreshData();
  };

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBooking) return;
    const updated: Booking = {
      ...selectedBooking,
      customerName: ebName.trim(),
      phone: ebPhone.trim(),
      serviceName: ebServiceName.trim(),
      price: Number(ebPrice) || 0,
      date: ebDate,
      time: ebTime,
      status: ebStatus,
    };
    await saveBooking(updated);
    setActiveModal(null);
    setSelectedBooking(null);
    showToast(`Booking ${updated.id} updated!`);
    onRefreshData();
  };

  const handleUpdateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    const updated: Customer = {
      ...selectedCustomer,
      name: ecName.trim(),
      phone: ecPhone.trim(),
      email: ecEmail.trim(),
      notes: ecNotes.trim(),
      totalSpent: Number(ecSpent) || 0,
    };
    await saveCustomer(updated);
    setActiveModal(null);
    setSelectedCustomer(null);
    showToast(`Customer ${updated.name} updated!`);
    onRefreshData();
  };

  const handleResetAppToCleanState = async () => {
    if (confirm('Are you sure you want to reset the app to a completely clean state? This will clear test bookings, invoices, and gallery items.')) {
      await clearAllDataAndResetApp();
      showToast('App reset to clean state! All dummy test data cleared.');
      onRefreshData();
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentUser = auth.currentUser;
    const nextEmail = (editSettings.ownerEmail || '').trim();
    const nextPassword = editSettings.ownerPassword || '';
    let emailVerificationPending = false;

    if (currentUser) {
      try {
        if (nextEmail && nextEmail !== currentUser.email) {
          try {
            await updateEmail(currentUser, nextEmail);
          } catch (emailErr: any) {
            if (emailErr?.code === 'auth/operation-not-allowed') {
              await verifyBeforeUpdateEmail(currentUser, nextEmail);
              emailVerificationPending = true;
            } else {
              throw emailErr;
            }
          }
        }

        if (nextPassword && nextPassword !== settings.ownerPassword) {
          await updatePassword(currentUser, nextPassword);
        }
      } catch (err: any) {
        const code = err?.code || '';
        if (code === 'auth/requires-recent-login') {
          showToast('For security, please log out and log back in before changing your login email or password.');
        } else if (code === 'auth/weak-password') {
          showToast('New password must be at least 6 characters long.');
        } else if (code === 'auth/invalid-email') {
          showToast('Please enter a valid Owner Admin Email address.');
        } else if (code === 'auth/email-already-in-use') {
          showToast('That email address is already in use by another account.');
        } else {
          showToast('Could not update login credentials. Please try again.');
        }
        return;
      }
    }

    await saveBusinessSettings({
      ...editSettings,
      ownerEmail: nextEmail || editSettings.ownerEmail,
      ownerPassword: nextPassword,
    });

    if (emailVerificationPending) {
      showToast(`Settings saved! Check ${nextEmail} to confirm your new admin email.`);
    } else {
      showToast('Fazzy Nails business settings & login credentials updated!');
    }
    onRefreshData();
  };

  const handleImageFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setter(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExportBackupFile = async () => {
    const data = await exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fazzy_nails_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#F8F3EC] text-[#30231F] flex flex-col font-sans selection:bg-[#B76E79]/20">
      {/* Toast Notice */}
      {toastNotice && (
        <div className="fixed top-5 right-5 z-50 px-4 py-3 bg-[#30231F] text-[#FFFCF8] text-xs font-semibold rounded-2xl shadow-2xl border border-[#B88746] flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-[#B88746] shrink-0" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Main Full-Page Portal Layout */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* SANDWICH NAVIGATION DRAWER PANEL */}
        {menuOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-[#30231F]/60 backdrop-blur-xs transition-opacity"
            />

            {/* Slide-over Sandwich Panel */}
            <aside className="relative w-72 max-w-[85vw] bg-[#30231F] text-[#FFFCF8] flex flex-col shrink-0 z-10 shadow-2xl h-full">
              {/* Brand Lockup & Close */}
              <div className="p-4 border-b border-[#88766F]/30 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <img
                    src={settings.logoUrl || IMAGES.logo}
                    alt="Fazzy Nails Logo"
                    className="w-10 h-10 rounded-full object-cover border-2 border-[#B88746] shrink-0"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="font-editorial text-lg font-bold text-[#FFFCF8] truncate leading-tight">
                      {settings.name}
                    </span>
                    <span className="text-[10px] uppercase tracking-widest text-[#B88746] truncate font-medium">
                      Owner Portal
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-1.5 text-[#88766F] hover:text-[#FFFCF8] hover:bg-[#88766F]/20 rounded-xl transition-colors cursor-pointer"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
                <button
                  onClick={() => {
                    setActiveTab('overview');
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'overview'
                      ? 'bg-gradient-to-r from-[#B88746] to-[#A07032] text-[#FFFCF8] shadow-md'
                      : 'text-[#88766F] hover:text-[#FFFCF8] hover:bg-[#88766F]/20'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4 shrink-0" />
                  <span>Dashboard Overview</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('bookings');
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'bookings'
                      ? 'bg-gradient-to-r from-[#B88746] to-[#A07032] text-[#FFFCF8] shadow-md'
                      : 'text-[#88766F] hover:text-[#FFFCF8] hover:bg-[#88766F]/20'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>Bookings</span>
                  </div>
                  {pendingBookings > 0 && (
                    <span className="px-2 py-0.5 bg-[#B76E79] text-[#FFFCF8] text-[10px] font-bold rounded-full">
                      {pendingBookings}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => {
                    setActiveTab('services');
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'services'
                      ? 'bg-gradient-to-r from-[#B88746] to-[#A07032] text-[#FFFCF8] shadow-md'
                      : 'text-[#88766F] hover:text-[#FFFCF8] hover:bg-[#88766F]/20'
                  }`}
                >
                  <Scissors className="w-4 h-4 shrink-0" />
                  <span>Services & Prices</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('gallery');
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'gallery'
                      ? 'bg-gradient-to-r from-[#B88746] to-[#A07032] text-[#FFFCF8] shadow-md'
                      : 'text-[#88766F] hover:text-[#FFFCF8] hover:bg-[#88766F]/20'
                  }`}
                >
                  <ImageIcon className="w-4 h-4 shrink-0" />
                  <span>Nail Portfolio Gallery</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('customers');
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'customers'
                      ? 'bg-gradient-to-r from-[#B88746] to-[#A07032] text-[#FFFCF8] shadow-md'
                      : 'text-[#88766F] hover:text-[#FFFCF8] hover:bg-[#88766F]/20'
                  }`}
                >
                  <Users className="w-4 h-4 shrink-0" />
                  <span>Customer Directory</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('invoices');
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'invoices'
                      ? 'bg-gradient-to-r from-[#B88746] to-[#A07032] text-[#FFFCF8] shadow-md'
                      : 'text-[#88766F] hover:text-[#FFFCF8] hover:bg-[#88766F]/20'
                  }`}
                >
                  <Receipt className="w-4 h-4 shrink-0" />
                  <span>Invoices & Revenue</span>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('settings');
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === 'settings'
                      ? 'bg-gradient-to-r from-[#B88746] to-[#A07032] text-[#FFFCF8] shadow-md'
                      : 'text-[#88766F] hover:text-[#FFFCF8] hover:bg-[#88766F]/20'
                  }`}
                >
                  <Settings className="w-4 h-4 shrink-0" />
                  <span>Website & Profile Control</span>
                </button>
              </nav>

              {/* Drawer Footer Controls */}
              <div className="p-3 border-t border-[#88766F]/30 space-y-2">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onViewWebsite();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-[#88766F]/20 hover:bg-[#B88746] text-[#FFFCF8] rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 text-[#B88746] shrink-0" />
                  <span>View Live Website</span>
                </button>

                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-rose-950/40 hover:bg-rose-900 text-rose-200 rounded-xl text-xs font-semibold transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Log Out Portal</span>
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* MAIN BODY AREA */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#F8F3EC]">
          {/* PORTAL HEADER BAR */}
          <header className="bg-[#FFFCF8] border-b border-[#E8D8C7] px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between gap-3 sm:gap-4 shrink-0 shadow-2xs">
            {/* Left: Sandwich Menu Button, Logo & Personalized Welcome */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <button
                onClick={() => setMenuOpen(true)}
                className="p-2.5 bg-[#F8F3EC] hover:bg-[#E8D8C7] text-[#30231F] rounded-xl border border-[#E8D8C7] transition-colors cursor-pointer shrink-0 relative"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
                {pendingBookings > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#B76E79] rounded-full" />
                )}
              </button>

              <img
                src={settings.logoUrl || IMAGES.logo}
                alt="Fazzy Nails Logo"
                className="w-9 h-9 rounded-full object-cover border-2 border-[#B88746] shrink-0 hidden sm:block"
              />

              <div>
                <h2 className="font-editorial text-xl sm:text-2xl font-bold text-[#30231F] leading-tight">
                  Welcome back, {settings.ownerName} ✦
                </h2>
                <p className="text-xs text-[#88766F] font-medium hidden sm:block">
                  Fazzy Nails Studio Owner Portal · {settings.address}
                </p>
              </div>

              {/* Global Search */}
              <div className="relative hidden lg:block max-w-xs w-full ml-auto">
                <Search className="w-4 h-4 text-[#88766F] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search bookings, clients, invoices..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-xs text-[#30231F] focus:outline-none focus:ring-2 focus:ring-[#B88746]"
                />
              </div>
            </div>

            {/* Right: Quick Actions & Owner Menu */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Quick Action Button */}
              <div className="relative">
                <button
                  onClick={() => setActiveModal('addBooking')}
                  className="px-4 py-2.5 bg-gradient-to-r from-[#B88746] to-[#A07032] hover:opacity-95 text-[#FFFCF8] text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#FFFCF8]" />
                  <span className="hidden sm:inline">Add Booking</span>
                </button>
              </div>

              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2.5 bg-[#F8F3EC] hover:bg-[#E8D8C7] text-[#30231F] rounded-xl relative transition-colors cursor-pointer border border-[#E8D8C7]"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {pendingBookings > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#B76E79] text-white font-bold text-[9px] rounded-full flex items-center justify-center">
                      {pendingBookings}
                    </span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#FFFCF8] border border-[#E8D8C7] rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-3">
                    <div className="flex items-center justify-between border-b border-[#E8D8C7] pb-2 font-bold text-[#30231F]">
                      <span>Notifications ({pendingBookings})</span>
                      <button
                        onClick={() => setNotificationsOpen(false)}
                        className="text-[#88766F] hover:text-[#30231F]"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {pendingBookings === 0 ? (
                      <p className="text-[#88766F] text-center py-2">No pending booking alerts!</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {bookings
                          .filter((b) => b.status === 'Pending')
                          .map((b) => (
                            <div
                              key={b.id}
                              onClick={() => {
                                setActiveTab('bookings');
                                setNotificationsOpen(false);
                              }}
                              className="p-2.5 bg-[#F8F3EC] rounded-xl cursor-pointer hover:bg-[#E8D8C7]/50 transition-colors"
                            >
                              <div className="font-bold text-[#30231F]">{b.customerName}</div>
                              <div className="text-[11px] text-[#88766F]">
                                {b.serviceName} · {b.date} at {b.time}
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Export Backup */}
              <button
                onClick={handleExportBackupFile}
                className="hidden sm:flex p-2.5 bg-[#F8F3EC] hover:bg-[#E8D8C7] text-[#30231F] rounded-xl transition-colors cursor-pointer border border-[#E8D8C7]"
                title="Download full database backup JSON"
              >
                <Download className="w-4 h-4 text-[#B88746]" />
              </button>

              {/* Owner Avatar (Click to upload new profile picture) */}
              <div className="flex items-center gap-2 pl-2 border-l border-[#E8D8C7]">
                <label
                  className="relative group cursor-pointer block"
                  title="Click to upload a new profile picture"
                >
                  <img
                    src={resolveImageUrl(editSettings.profileImage || settings.profileImage || IMAGES.logo)}
                    alt={settings.ownerName}
                    className="w-9 h-9 rounded-full object-cover border-2 border-[#B88746] group-hover:opacity-80 transition-opacity"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageFileUpload(e, async (url) => {
                        const updated = { ...editSettings, profileImage: url };
                        setEditSettings(updated);
                        await saveBusinessSettings(updated);
                        showToast('Admin profile image updated!');
                        onRefreshData();
                      })
                    }
                  />
                </label>
              </div>
            </div>
          </header>

          {/* MAIN TAB CONTENT SCROLL AREA */}
          <main className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* ================= 1. OVERVIEW TAB ================= */}
            {activeTab === 'overview' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                {/* 6 Metric Stat Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="bg-[#FFFCF8] p-5 rounded-2xl border border-[#E8D8C7] shadow-xs space-y-1">
                    <span className="text-xs font-semibold text-[#88766F]">Total Bookings</span>
                    <div className="font-editorial text-3xl font-bold text-[#30231F] tabular-nums">
                      {totalBookings}
                    </div>
                    <span className="text-[10px] text-[#B88746] font-semibold block">All appointments</span>
                  </div>

                  <div className="bg-[#FFFCF8] p-5 rounded-2xl border border-[#E8D8C7] shadow-xs space-y-1">
                    <span className="text-xs font-semibold text-[#88766F]">Pending</span>
                    <div className="font-editorial text-3xl font-bold text-[#B76E79] tabular-nums">
                      {pendingBookings}
                    </div>
                    <span className="text-[10px] text-[#B76E79] font-semibold block">Awaiting confirmation</span>
                  </div>

                  <div className="bg-[#FFFCF8] p-5 rounded-2xl border border-[#E8D8C7] shadow-xs space-y-1">
                    <span className="text-xs font-semibold text-[#88766F]">Confirmed</span>
                    <div className="font-editorial text-3xl font-bold text-[#B88746] tabular-nums">
                      {confirmedBookings}
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold block">Scheduled sessions</span>
                  </div>

                  <div className="bg-[#FFFCF8] p-5 rounded-2xl border border-[#E8D8C7] shadow-xs space-y-1">
                    <span className="text-xs font-semibold text-[#88766F]">Completed</span>
                    <div className="font-editorial text-3xl font-bold text-emerald-800 tabular-nums">
                      {completedBookings}
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold block">Finished sets</span>
                  </div>

                  <div className="bg-[#FFFCF8] p-5 rounded-2xl border border-[#E8D8C7] shadow-xs space-y-1">
                    <span className="text-xs font-semibold text-[#88766F]">Total Clients</span>
                    <div className="font-editorial text-3xl font-bold text-[#30231F] tabular-nums">
                      {totalCustomers}
                    </div>
                    <span className="text-[10px] text-[#88766F] block">Registered directory</span>
                  </div>

                  <div className="bg-[#FFFCF8] p-5 rounded-2xl border border-[#E8D8C7] shadow-xs space-y-1">
                    <span className="text-xs font-semibold text-[#88766F]">Total Revenue</span>
                    <div className="font-editorial text-2xl font-bold text-[#30231F] tabular-nums">
                      {formatPrice(totalRevenue)}
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold block">Paid Invoices</span>
                  </div>
                </div>

                {/* Quick Actions Row */}
                <div className="bg-[#FFFCF8] p-5 rounded-2xl border border-[#E8D8C7] shadow-xs flex flex-wrap items-center justify-between gap-3">
                  <span className="font-editorial text-base font-bold text-[#30231F]">
                    Fazzy Nails Owner Quick Actions:
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setActiveModal('addBooking')}
                      className="px-3.5 py-2 bg-[#30231F] hover:bg-[#B88746] text-[#FFFCF8] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#B88746]" />
                      <span>Add Booking</span>
                    </button>

                    <button
                      onClick={() => setActiveModal('addService')}
                      className="px-3.5 py-2 bg-[#F8F3EC] hover:bg-[#E8D8C7] text-[#30231F] border border-[#E8D8C7] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#B88746]" />
                      <span>Add Service</span>
                    </button>

                    <button
                      onClick={() => setActiveModal('addGallery')}
                      className="px-3.5 py-2 bg-[#F8F3EC] hover:bg-[#E8D8C7] text-[#30231F] border border-[#E8D8C7] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#B88746]" />
                      <span>Add Gallery Image</span>
                    </button>

                    <button
                      onClick={() => setActiveModal('addCustomer')}
                      className="px-3.5 py-2 bg-[#F8F3EC] hover:bg-[#E8D8C7] text-[#30231F] border border-[#E8D8C7] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#B88746]" />
                      <span>Add Customer</span>
                    </button>
                  </div>
                </div>

                {/* Grid 2: Recent Activity & Monthly Revenue Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: Upcoming Appointments & Activity */}
                  <div className="lg:col-span-7 bg-[#FFFCF8] p-6 rounded-3xl border border-[#E8D8C7] shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#E8D8C7] pb-3">
                      <h3 className="font-editorial text-lg font-bold text-[#30231F]">
                        Upcoming Appointments & Activity
                      </h3>
                      <button
                        onClick={() => setActiveTab('bookings')}
                        className="text-xs font-semibold text-[#B88746] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View All</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      {bookings.slice(0, 4).map((b) => (
                        <div
                          key={b.id}
                          className="p-4 bg-[#F8F3EC] rounded-2xl border border-[#E8D8C7] flex items-center justify-between gap-3 hover:border-[#B88746] transition-all"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[#30231F]">{b.customerName}</span>
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                  b.status === 'Confirmed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : b.status === 'Pending'
                                    ? 'bg-rose-100 text-[#B76E79]'
                                    : 'bg-stone-200 text-stone-700'
                                }`}
                              >
                                {b.status}
                              </span>
                            </div>
                            <div className="text-xs text-[#88766F] flex items-center gap-2">
                              <span>{b.serviceName}</span>
                              <span>·</span>
                              <span className="font-mono text-[#30231F]">{formatPrice(b.price)}</span>
                              <span>·</span>
                              <span>{b.date} at {b.time}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              setSelectedBooking(b);
                              setActiveModal('editBooking');
                            }}
                            className="p-2 text-[#88766F] hover:text-[#B88746] hover:bg-[#E8D8C7]/50 rounded-xl transition-colors cursor-pointer"
                            title="Edit booking"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Monthly Revenue Chart & Popular Treatments */}
                  <div className="lg:col-span-5 space-y-6">
                    {/* Revenue Bar Preview */}
                    <div className="bg-[#FFFCF8] p-6 rounded-3xl border border-[#E8D8C7] shadow-xs space-y-4">
                      <div className="flex items-center justify-between border-b border-[#E8D8C7] pb-3">
                        <h3 className="font-editorial text-lg font-bold text-[#30231F]">
                          Monthly Revenue Overview
                        </h3>
                        <span className="text-xs text-[#88766F] font-mono">NGN (₦)</span>
                      </div>

                      <div className="space-y-3 pt-2">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>Acrylic Sculpting Sets</span>
                            <span className="font-mono">₦ 185,000</span>
                          </div>
                          <div className="w-full h-2 bg-[#F8F3EC] rounded-full overflow-hidden">
                            <div className="h-full bg-[#B88746] w-[85%]" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>Gel Polish Manicures</span>
                            <span className="font-mono">₦ 92,000</span>
                          </div>
                          <div className="w-full h-2 bg-[#F8F3EC] rounded-full overflow-hidden">
                            <div className="h-full bg-[#B76E79] w-[55%]" />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs font-semibold">
                            <span>BIAB Overlays & Pedicures</span>
                            <span className="font-mono">₦ 68,000</span>
                          </div>
                          <div className="w-full h-2 bg-[#F8F3EC] rounded-full overflow-hidden">
                            <div className="h-full bg-[#30231F] w-[40%]" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Popular Treatments Card */}
                    <div className="bg-[#FFFCF8] p-6 rounded-3xl border border-[#E8D8C7] shadow-xs space-y-3">
                      <h3 className="font-editorial text-lg font-bold text-[#30231F] border-b border-[#E8D8C7] pb-2">
                        Popular Treatments
                      </h3>
                      <div className="divide-y divide-[#E8D8C7]/50 text-xs">
                        {services.slice(0, 3).map((s) => (
                          <div key={s.id} className="py-2.5 flex justify-between items-center">
                            <div>
                              <div className="font-bold text-[#30231F]">{s.name}</div>
                              <div className="text-[11px] text-[#88766F]">{s.duration}</div>
                            </div>
                            <span className="font-mono font-bold text-[#B88746]">
                              {formatPrice(s.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= 2. BOOKINGS TAB ================= */}
            {activeTab === 'bookings' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#FFFCF8] p-5 rounded-3xl border border-[#E8D8C7]">
                  <div>
                    <h3 className="font-editorial text-2xl font-bold text-[#30231F]">
                      Bookings & Appointments
                    </h3>
                    <p className="text-xs text-[#88766F]">
                      Full management control over all customer appointment requests and scheduling.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveModal('addBooking')}
                    className="px-4 py-2.5 bg-[#30231F] hover:bg-[#B88746] text-[#FFFCF8] text-xs font-bold uppercase tracking-wider rounded-2xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#B88746]" />
                    <span>Create New Booking</span>
                  </button>
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FFFCF8] p-4 rounded-2xl border border-[#E8D8C7]">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#88766F]">
                      <Filter className="w-3.5 h-3.5 text-[#B88746]" />
                      <span>Status:</span>
                    </div>
                    <select
                      value={bookingFilterStatus}
                      onChange={(e) => setBookingFilterStatus(e.target.value)}
                      className="px-3 py-1.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-xs text-[#30231F] font-medium"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <div className="flex items-center gap-1.5 text-xs font-semibold text-[#88766F] ml-2">
                      <Calendar className="w-3.5 h-3.5 text-[#B88746]" />
                      <span>Date:</span>
                    </div>
                    <input
                      type="date"
                      value={bookingFilterDate}
                      onChange={(e) => setBookingFilterDate(e.target.value)}
                      className="px-3 py-1.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-xs text-[#30231F]"
                    />
                    {bookingFilterDate && (
                      <button
                        onClick={() => setBookingFilterDate('')}
                        className="text-xs text-[#B76E79] hover:underline"
                      >
                        Clear date
                      </button>
                    )}
                  </div>

                  <span className="text-xs text-[#88766F] font-medium">
                    Showing {filteredBookings.length} bookings
                  </span>
                </div>

                {/* Table Card */}
                <div className="bg-[#FFFCF8] rounded-3xl border border-[#E8D8C7] shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8F3EC] border-b border-[#E8D8C7] text-[#30231F] font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-3.5 px-4">Booking ID</th>
                          <th className="py-3.5 px-4">Customer Name</th>
                          <th className="py-3.5 px-4">Phone Number</th>
                          <th className="py-3.5 px-4">Selected Service</th>
                          <th className="py-3.5 px-4">Date & Time</th>
                          <th className="py-3.5 px-4">Price</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8D8C7]/60">
                        {filteredBookings.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="text-center py-10 text-[#88766F]">
                              No bookings found matching filters.
                            </td>
                          </tr>
                        ) : (
                          filteredBookings.map((b) => (
                            <tr key={b.id} className="hover:bg-[#F8F3EC]/50 transition-colors">
                              <td className="py-3.5 px-4 font-mono font-bold text-[#30231F]">
                                {b.id}
                              </td>
                              <td className="py-3.5 px-4 font-semibold text-[#30231F]">
                                {b.customerName}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-[#88766F]">
                                {b.phone}
                              </td>
                              <td className="py-3.5 px-4 text-[#30231F] font-medium">
                                {b.serviceName}
                              </td>
                              <td className="py-3.5 px-4 text-[#88766F]">
                                {b.date} at {b.time}
                              </td>
                              <td className="py-3.5 px-4 font-mono font-bold text-[#B88746]">
                                {formatPrice(b.price)}
                              </td>
                              <td className="py-3.5 px-4">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    b.status === 'Confirmed'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : b.status === 'Pending'
                                      ? 'bg-rose-100 text-[#B76E79]'
                                      : b.status === 'Completed'
                                      ? 'bg-amber-100 text-[#B88746]'
                                      : 'bg-stone-200 text-stone-700'
                                  }`}
                                >
                                  {b.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={async () => {
                                      const next =
                                        b.status === 'Pending'
                                          ? 'Confirmed'
                                          : b.status === 'Confirmed'
                                          ? 'Completed'
                                          : 'Pending';
                                      await saveBooking({ ...b, status: next });
                                      onRefreshData();
                                      showToast(`Booking ${b.id} marked as ${next}`);
                                    }}
                                    className="px-2 py-1 bg-[#F8F3EC] hover:bg-[#E8D8C7] text-[#30231F] rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                                  >
                                    Cycle Status
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedBooking(b);
                                      setActiveModal('editBooking');
                                    }}
                                    className="p-1.5 text-[#88766F] hover:text-[#B88746] rounded-lg cursor-pointer"
                                    title="Edit booking"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={async () => {
                                      if (confirm(`Delete booking ${b.id}?`)) {
                                        await deleteBooking(b.id);
                                        onRefreshData();
                                        showToast(`Booking ${b.id} deleted`);
                                      }
                                    }}
                                    className="p-1.5 text-[#B76E79] hover:bg-rose-50 rounded-lg cursor-pointer"
                                    title="Delete booking"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ================= 3. SERVICES TAB ================= */}
            {activeTab === 'services' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#FFFCF8] p-5 rounded-3xl border border-[#E8D8C7]">
                  <div>
                    <h3 className="font-editorial text-2xl font-bold text-[#30231F]">
                      Services & Pricing Management
                    </h3>
                    <p className="text-xs text-[#88766F]">
                      Add, update, or remove treatments, prices, treatment durations, and availability live.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveModal('addService')}
                    className="px-4 py-2.5 bg-[#30231F] hover:bg-[#B88746] text-[#FFFCF8] text-xs font-bold uppercase tracking-wider rounded-2xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#B88746]" />
                    <span>Add New Service</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {services.map((s) => (
                    <div
                      key={s.id}
                      className="bg-[#FFFCF8] p-6 rounded-3xl border border-[#E8D8C7] shadow-xs flex flex-col justify-between hover:border-[#B88746] transition-all space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-editorial text-xl font-bold text-[#30231F]">
                            {s.name}
                          </h4>
                          <span className="font-editorial text-xl font-bold text-[#B88746] shrink-0 tabular-nums">
                            {formatPrice(s.price)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-[#88766F]">
                          <span className="px-2 py-0.5 bg-[#F8F3EC] rounded-md font-medium capitalize">
                            {s.category}
                          </span>
                          <span>·</span>
                          <span>{s.duration}</span>
                          {!s.isAvailable && (
                            <span className="px-2 py-0.5 bg-stone-200 text-stone-700 text-[10px] font-bold rounded uppercase">
                              Unavailable
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-[#88766F] leading-relaxed">
                          {s.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#E8D8C7]/60 flex items-center justify-between gap-2">
                        <button
                          onClick={async () => {
                            await saveService({ ...s, isAvailable: !s.isAvailable });
                            onRefreshData();
                            showToast(`Availability updated for ${s.name}`);
                          }}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-xl cursor-pointer ${
                            s.isAvailable
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-stone-200 text-stone-700'
                          }`}
                        >
                          {s.isAvailable ? 'Active & Available' : 'Hidden'}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedService(s);
                              setActiveModal('editService');
                            }}
                            className="p-2 text-[#88766F] hover:text-[#B88746] rounded-xl cursor-pointer"
                            title="Edit service details"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={async () => {
                              if (confirm(`Delete service "${s.name}"?`)) {
                                await deleteService(s.id);
                                onRefreshData();
                                showToast(`Service "${s.name}" deleted.`);
                              }
                            }}
                            className="p-2 text-[#B76E79] hover:bg-rose-50 rounded-xl cursor-pointer"
                            title="Delete service"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= 4. GALLERY TAB ================= */}
            {activeTab === 'gallery' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#FFFCF8] p-5 rounded-3xl border border-[#E8D8C7]">
                  <div>
                    <h3 className="font-editorial text-2xl font-bold text-[#30231F]">
                      Gallery & Portfolio Management
                    </h3>
                    <p className="text-xs text-[#88766F]">
                      Upload, edit, categorize, and organize nail-work photos published on the website.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveModal('addGallery')}
                    className="px-4 py-2.5 bg-[#30231F] hover:bg-[#B88746] text-[#FFFCF8] text-xs font-bold uppercase tracking-wider rounded-2xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#B88746]" />
                    <span>Upload New Photo</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {galleryItems.map((g) => (
                    <div
                      key={g.id}
                      className="bg-[#FFFCF8] rounded-3xl border border-[#E8D8C7] overflow-hidden shadow-xs flex flex-col justify-between hover:border-[#B88746] transition-all"
                    >
                      <div className="relative aspect-square bg-[#F8F3EC] overflow-hidden">
                        <img
                          src={resolveImageUrl(g.imageUrl)}
                          alt={g.title}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute top-3 left-3 px-2.5 py-0.5 bg-[#30231F]/80 text-[#FFFCF8] text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-xs">
                          {g.category}
                        </span>
                      </div>

                      <div className="p-4 space-y-2">
                        <h4 className="font-editorial text-lg font-bold text-[#30231F]">
                          {g.title}
                        </h4>
                        <p className="text-xs text-[#88766F] line-clamp-2 leading-relaxed">
                          {g.description}
                        </p>

                        <div className="pt-2 border-t border-[#E8D8C7]/60 flex items-center justify-between gap-2 text-xs">
                          <span className="text-[10px] text-[#88766F]">{g.createdAt}</span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setSelectedGallery(g);
                                setActiveModal('editGallery');
                              }}
                              className="p-1.5 text-[#88766F] hover:text-[#B88746] rounded-lg cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`Remove photo "${g.title}"?`)) {
                                  await deleteGalleryItem(g.id);
                                  onRefreshData();
                                  showToast('Photo removed from gallery');
                                }
                              }}
                              className="p-1.5 text-[#B76E79] hover:bg-rose-50 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ================= 5. CUSTOMERS TAB ================= */}
            {activeTab === 'customers' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#FFFCF8] p-5 rounded-3xl border border-[#E8D8C7]">
                  <div>
                    <h3 className="font-editorial text-2xl font-bold text-[#30231F]">
                      Customer Directory
                    </h3>
                    <p className="text-xs text-[#88766F]">
                      View appointment histories, total spending, contact details, and client notes.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveModal('addCustomer')}
                    className="px-4 py-2.5 bg-[#30231F] hover:bg-[#B88746] text-[#FFFCF8] text-xs font-bold uppercase tracking-wider rounded-2xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#B88746]" />
                    <span>Add New Customer</span>
                  </button>
                </div>

                <div className="bg-[#FFFCF8] rounded-3xl border border-[#E8D8C7] shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8F3EC] border-b border-[#E8D8C7] text-[#30231F] font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-3.5 px-4">Customer Name</th>
                          <th className="py-3.5 px-4">Phone Number</th>
                          <th className="py-3.5 px-4">Email</th>
                          <th className="py-3.5 px-4">Appointments</th>
                          <th className="py-3.5 px-4">Total Spent</th>
                          <th className="py-3.5 px-4">Client Notes</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8D8C7]/60">
                        {filteredCustomers.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-10 text-[#88766F]">
                              No customers found.
                            </td>
                          </tr>
                        ) : (
                          filteredCustomers.map((c) => (
                            <tr key={c.id} className="hover:bg-[#F8F3EC]/50 transition-colors">
                              <td className="py-3.5 px-4 font-bold text-[#30231F]">{c.name}</td>
                              <td className="py-3.5 px-4 font-mono text-[#88766F]">{c.phone}</td>
                              <td className="py-3.5 px-4 text-[#88766F]">{c.email}</td>
                              <td className="py-3.5 px-4 font-bold text-[#30231F]">{c.appointmentCount}</td>
                              <td className="py-3.5 px-4 font-mono font-bold text-[#B88746]">
                                {formatPrice(c.totalSpent)}
                              </td>
                              <td className="py-3.5 px-4 text-[#88766F] max-w-xs truncate">
                                {c.notes || '—'}
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <a
                                    href={getWhatsAppUrl(`Hello ${c.name}, this is Fazzy Nails!`, c.phone.replace(/[^0-9]/g, ''))}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-xs"
                                    title="WhatsApp client"
                                  >
                                    WhatsApp
                                  </a>
                                  <button
                                    onClick={async () => {
                                      if (confirm(`Delete customer ${c.name}?`)) {
                                        await deleteCustomer(c.id);
                                        onRefreshData();
                                        showToast(`Customer ${c.name} deleted.`);
                                      }
                                    }}
                                    className="p-1.5 text-[#B76E79] hover:bg-rose-50 rounded-lg cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ================= 6. INVOICES TAB ================= */}
            {activeTab === 'invoices' && (
              <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#FFFCF8] p-5 rounded-3xl border border-[#E8D8C7]">
                  <div>
                    <h3 className="font-editorial text-2xl font-bold text-[#30231F]">
                      Invoices & Financial Management
                    </h3>
                    <p className="text-xs text-[#88766F]">
                      Track payment statuses (Paid/Unpaid), amounts, and payment methods.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveModal('addInvoice')}
                    className="px-4 py-2.5 bg-[#30231F] hover:bg-[#B88746] text-[#FFFCF8] text-xs font-bold uppercase tracking-wider rounded-2xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#B88746]" />
                    <span>Create Invoice</span>
                  </button>
                </div>

                <div className="bg-[#FFFCF8] rounded-3xl border border-[#E8D8C7] shadow-xs overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8F3EC] border-b border-[#E8D8C7] text-[#30231F] font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="py-3.5 px-4">Invoice #</th>
                          <th className="py-3.5 px-4">Customer Name</th>
                          <th className="py-3.5 px-4">Service Description</th>
                          <th className="py-3.5 px-4">Date</th>
                          <th className="py-3.5 px-4">Amount</th>
                          <th className="py-3.5 px-4">Payment Status</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E8D8C7]/60">
                        {filteredInvoices.map((i) => (
                          <tr key={i.id} className="hover:bg-[#F8F3EC]/50 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-[#30231F]">{i.id}</td>
                            <td className="py-3.5 px-4 font-semibold text-[#30231F]">{i.customerName}</td>
                            <td className="py-3.5 px-4 text-[#88766F]">{i.serviceDescription}</td>
                            <td className="py-3.5 px-4 font-mono text-[#88766F]">{i.date}</td>
                            <td className="py-3.5 px-4 font-mono font-bold text-[#B88746]">
                              {formatPrice(i.amount)}
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                  i.status === 'Paid'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-[#B76E79]'
                                }`}
                              >
                                {i.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={async () => {
                                    const nextStatus = i.status === 'Paid' ? 'Unpaid' : 'Paid';
                                    await saveInvoice({ ...i, status: nextStatus });
                                    onRefreshData();
                                    showToast(`Invoice ${i.id} status changed to ${nextStatus}`);
                                  }}
                                  className="px-2 py-1 bg-[#F8F3EC] hover:bg-[#E8D8C7] text-[#30231F] rounded-lg text-[10px] font-semibold cursor-pointer"
                                >
                                  Toggle Status
                                </button>
                                <button
                                  onClick={async () => {
                                    if (confirm(`Delete invoice ${i.id}?`)) {
                                      await deleteInvoice(i.id);
                                      onRefreshData();
                                      showToast(`Invoice ${i.id} deleted`);
                                    }
                                  }}
                                  className="p-1.5 text-[#B76E79] hover:bg-rose-50 rounded-lg cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ================= 7. SETTINGS / WEBSITE CONTROL TAB ================= */}
            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-4xl mx-auto">
                <div className="bg-[#FFFCF8] p-6 rounded-3xl border border-[#E8D8C7] shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-editorial text-2xl font-bold text-[#30231F]">
                      Website Content & Business Profile Settings
                    </h3>
                    <span className="px-3 py-1 bg-[#F8F3EC] border border-[#E8D8C7] text-[#B88746] text-xs font-bold rounded-full">
                      Total Website Control
                    </span>
                  </div>
                  <p className="text-xs text-[#88766F]">
                    Modify business contact details, slogan, hero banners, top announcements, or profile images without writing code.
                  </p>
                </div>

                <form onSubmit={handleSaveSettings} className="bg-[#FFFCF8] p-6 rounded-3xl border border-[#E8D8C7] shadow-xs space-y-6">
                  {/* Branding & Logo */}
                  <div className="space-y-4">
                    <h4 className="font-editorial text-lg font-bold text-[#30231F] border-b border-[#E8D8C7] pb-2">
                      1. Brand Identity & Logo
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-semibold mb-1">Business Name</label>
                        <input
                          type="text"
                          value={editSettings.name}
                          onChange={(e) => setEditSettings({ ...editSettings, name: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F] font-semibold"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1">Brand Motto / Slogan</label>
                        <input
                          type="text"
                          value={editSettings.motto}
                          onChange={(e) => setEditSettings({ ...editSettings, motto: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1">Logo Image File or URL</label>
                        <div className="flex items-center gap-2">
                          <img
                            src={resolveImageUrl(editSettings.logoUrl || IMAGES.logo)}
                            alt="Logo preview"
                            className="w-10 h-10 rounded-full object-cover border border-[#B88746] shrink-0 bg-[#F8F3EC]"
                          />
                          <input
                            type="text"
                            value={editSettings.logoUrl}
                            onChange={(e) => setEditSettings({ ...editSettings, logoUrl: e.target.value })}
                            className="flex-1 px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F] text-xs font-mono min-w-0"
                          />
                          <label className="px-3 py-2.5 bg-[#30231F] hover:bg-[#B88746] text-white text-xs rounded-xl cursor-pointer shrink-0 flex items-center gap-1 transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleImageFileUpload(e, async (url) => {
                                  const updated = { ...editSettings, logoUrl: url };
                                  setEditSettings(updated);
                                  await saveBusinessSettings(updated);
                                  showToast('Logo image updated! Changes reflect live across the website.');
                                  onRefreshData();
                                })
                              }
                            />
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold mb-1">Owner Display Name</label>
                        <input
                          type="text"
                          value={editSettings.ownerName}
                          onChange={(e) => setEditSettings({ ...editSettings, ownerName: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-semibold mb-1">Owner Profile Image (File or URL)</label>
                        <div className="flex items-center gap-2">
                          <img
                            src={resolveImageUrl(editSettings.profileImage || IMAGES.logo)}
                            alt="Profile preview"
                            className="w-10 h-10 rounded-full object-cover border border-[#B88746] shrink-0 bg-[#F8F3EC]"
                          />
                          <input
                            type="text"
                            value={editSettings.profileImage}
                            onChange={(e) => setEditSettings({ ...editSettings, profileImage: e.target.value })}
                            className="flex-1 px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F] text-xs font-mono min-w-0"
                          />
                          <label className="px-3 py-2.5 bg-[#30231F] hover:bg-[#B88746] text-white text-xs rounded-xl cursor-pointer shrink-0 flex items-center gap-1 transition-colors">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                handleImageFileUpload(e, async (url) => {
                                  const updated = { ...editSettings, profileImage: url };
                                  setEditSettings(updated);
                                  await saveBusinessSettings(updated);
                                  showToast('Admin profile image updated!');
                                  onRefreshData();
                                })
                              }
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Admin Login Credentials Section */}
                  <div className="space-y-4 pt-4 border-t border-[#E8D8C7]">
                    <h4 className="font-editorial text-lg font-bold text-[#30231F] border-b border-[#E8D8C7] pb-2">
                      Admin Portal Login Credentials (Email & Password)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-semibold mb-1">Owner Admin Email</label>
                        <input
                          type="email"
                          value={editSettings.ownerEmail ?? auth.currentUser?.email ?? ''}
                          onChange={(e) => setEditSettings({ ...editSettings, ownerEmail: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1">New Owner Password</label>
                        <input
                          type="text"
                          placeholder="Enter new admin password"
                          value={editSettings.ownerPassword ?? ''}
                          onChange={(e) => setEditSettings({ ...editSettings, ownerPassword: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F] font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Contact & Location */}
                  <div className="space-y-4 pt-4 border-t border-[#E8D8C7]">
                    <h4 className="font-editorial text-lg font-bold text-[#30231F] border-b border-[#E8D8C7] pb-2">
                      2. Studio Contact & Location Info
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-semibold mb-1">Phone Number (Formatted)</label>
                        <input
                          type="text"
                          value={editSettings.phone}
                          onChange={(e) => setEditSettings({ ...editSettings, phone: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1">WhatsApp Raw Digits</label>
                        <input
                          type="text"
                          value={editSettings.whatsappRaw}
                          onChange={(e) => setEditSettings({ ...editSettings, whatsappRaw: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F] font-mono"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1">Email Address</label>
                        <input
                          type="email"
                          value={editSettings.email}
                          onChange={(e) => setEditSettings({ ...editSettings, email: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1">Studio Address</label>
                        <input
                          type="text"
                          value={editSettings.address}
                          onChange={(e) => setEditSettings({ ...editSettings, address: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block font-semibold mb-1">Opening Hours</label>
                        <input
                          type="text"
                          value={editSettings.hours}
                          onChange={(e) => setEditSettings({ ...editSettings, hours: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Public Hero Content */}
                  <div className="space-y-4 pt-4 border-t border-[#E8D8C7]">
                    <h4 className="font-editorial text-lg font-bold text-[#30231F] border-b border-[#E8D8C7] pb-2">
                      3. Public Website Banners & Hero Content
                    </h4>
                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block font-semibold mb-1">Announcement Top Bar</label>
                        <input
                          type="text"
                          value={editSettings.announcement}
                          onChange={(e) => setEditSettings({ ...editSettings, announcement: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1">Hero Main Title</label>
                        <input
                          type="text"
                          value={editSettings.heroTitle}
                          onChange={(e) => setEditSettings({ ...editSettings, heroTitle: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F] font-bold"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold mb-1">Hero Subtitle</label>
                        <textarea
                          rows={2}
                          value={editSettings.heroSubtitle}
                          onChange={(e) => setEditSettings({ ...editSettings, heroSubtitle: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E8D8C7] flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-3.5 bg-gradient-to-r from-[#B88746] to-[#A07032] hover:opacity-95 text-[#FFFCF8] text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Check className="w-4 h-4 text-[#FFFCF8]" />
                      <span>Save & Apply Settings Live</span>
                    </button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ================= MODALS FOR QUICK ACTIONS ================= */}
      {/* 1. Add Booking Modal */}
      {activeModal === 'addBooking' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#30231F]/70 backdrop-blur-xs">
          <div className="bg-[#FFFCF8] w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-[#E8D8C7] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#E8D8C7] pb-3">
              <h3 className="font-editorial text-xl font-bold text-[#30231F]">Create New Booking</h3>
              <button onClick={() => setActiveModal(null)} className="text-[#88766F] hover:text-[#30231F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBooking} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chioma Adeyemi"
                  value={nbName}
                  onChange={(e) => setNbName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Phone Number (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  placeholder="+234 800 000 0000"
                  value={nbPhone}
                  onChange={(e) => setNbPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Selected Nail Service *</label>
                <select
                  value={nbServiceId}
                  onChange={(e) => setNbServiceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {formatPrice(s.price)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Appointment Date *</label>
                  <input
                    type="date"
                    required
                    value={nbDate}
                    onChange={(e) => setNbDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Time Slot *</label>
                  <input
                    type="text"
                    required
                    value={nbTime}
                    onChange={(e) => setNbTime(e.target.value)}
                    placeholder="11:00 AM"
                    className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Special Notes / Shape</label>
                <input
                  type="text"
                  placeholder="e.g. Almond shape with gold line art"
                  value={nbNotes}
                  onChange={(e) => setNbNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8D8C7]">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 text-[#88766F] hover:text-[#30231F] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#30231F] hover:bg-[#B88746] text-[#FFFCF8] font-bold uppercase rounded-xl shadow-xs"
                >
                  Save Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Service Modal */}
      {activeModal === 'addService' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#30231F]/70 backdrop-blur-xs">
          <div className="bg-[#FFFCF8] w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-[#E8D8C7] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8D8C7] pb-3">
              <h3 className="font-editorial text-xl font-bold text-[#30231F]">Add New Nail Service</h3>
              <button onClick={() => setActiveModal(null)} className="text-[#88766F] hover:text-[#30231F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateService} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ombre Acrylic Full Set"
                  value={nsName}
                  onChange={(e) => setNsName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={nsCategory}
                    onChange={(e) => setNsCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                  >
                    <option value="gel">Gel Polish</option>
                    <option value="acrylic">Acrylic</option>
                    <option value="biab">BIAB</option>
                    <option value="care">Pedicure & Care</option>
                    <option value="addons">Nail Art Addons</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Price (₦ Naira) *</label>
                  <input
                    type="number"
                    required
                    value={nsPrice}
                    onChange={(e) => setNsPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Duration</label>
                <input
                  type="text"
                  placeholder="e.g. 60 mins"
                  value={nsDuration}
                  onChange={(e) => setNsDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Short service overview for clients"
                  value={nsDesc}
                  onChange={(e) => setNsDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8D8C7]">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 text-[#88766F] hover:text-[#30231F] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#30231F] hover:bg-[#B88746] text-[#FFFCF8] font-bold uppercase rounded-xl shadow-xs"
                >
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Gallery Image Modal */}
      {activeModal === 'addGallery' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#30231F]/70 backdrop-blur-xs">
          <div className="bg-[#FFFCF8] w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-[#E8D8C7] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8D8C7] pb-3">
              <h3 className="font-editorial text-xl font-bold text-[#30231F]">Upload Nail Work Photo</h3>
              <button onClick={() => setActiveModal(null)} className="text-[#88766F] hover:text-[#30231F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGallery} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Photo Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gold Chrome Almond Extensions"
                  value={ngTitle}
                  onChange={(e) => setNgTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={ngCategory}
                    onChange={(e) => setNgCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                  >
                    <option value="acrylic">Acrylic Sculpting</option>
                    <option value="gel">Gel Polish</option>
                    <option value="nailart">Nail Art</option>
                    <option value="minimal">Minimalist</option>
                    <option value="bridal">Bridal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">Image Upload / URL *</label>
                  <input
                    type="text"
                    required
                    placeholder="https://images.unsplash..."
                    value={ngUrl}
                    onChange={(e) => setNgUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F] font-mono text-[11px]"
                  />
                  <label className="mt-1 text-[10px] text-[#B88746] font-semibold cursor-pointer block hover:underline">
                    Or select image from computer...
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileUpload(e, setNgUrl)}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Photo Description</label>
                <textarea
                  rows={2}
                  placeholder="Details about shape, products, or technique used..."
                  value={ngDesc}
                  onChange={(e) => setNgDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8D8C7]">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 text-[#88766F] hover:text-[#30231F] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#30231F] hover:bg-[#B88746] text-[#FFFCF8] font-bold uppercase rounded-xl shadow-xs"
                >
                  Publish Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Add Customer Modal */}
      {activeModal === 'addCustomer' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#30231F]/70 backdrop-blur-xs">
          <div className="bg-[#FFFCF8] w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-[#E8D8C7] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8D8C7] pb-3">
              <h3 className="font-editorial text-xl font-bold text-[#30231F]">Add Customer Record</h3>
              <button onClick={() => setActiveModal(null)} className="text-[#88766F] hover:text-[#30231F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Customer Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adaora Nnaji"
                  value={ncName}
                  onChange={(e) => setNcName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Phone Number (WhatsApp) *</label>
                <input
                  type="tel"
                  required
                  placeholder="+234 800 000 0000"
                  value={ncPhone}
                  onChange={(e) => setNcPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="adaora@example.com"
                  value={ncEmail}
                  onChange={(e) => setNcEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Client Preferences / Notes</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Loves almond shape, allergic to harsh acetone..."
                  value={ncNotes}
                  onChange={(e) => setNcNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8D8C7]">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 text-[#88766F] hover:text-[#30231F] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#30231F] hover:bg-[#B88746] text-[#FFFCF8] font-bold uppercase rounded-xl shadow-xs"
                >
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Add Invoice Modal */}
      {activeModal === 'addInvoice' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#30231F]/70 backdrop-blur-xs">
          <div className="bg-[#FFFCF8] w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-[#E8D8C7] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8D8C7] pb-3">
              <h3 className="font-editorial text-xl font-bold text-[#30231F]">Generate Invoice</h3>
              <button onClick={() => setActiveModal(null)} className="text-[#88766F] hover:text-[#30231F]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Blessing Eze"
                  value={niCustomerName}
                  onChange={(e) => setNiCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="+234 800 000 0000"
                  value={niPhone}
                  onChange={(e) => setNiPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F] font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Service Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acrylic Full Set + Chrome Accent"
                  value={niDesc}
                  onChange={(e) => setNiDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Amount (₦) *</label>
                  <input
                    type="number"
                    required
                    value={niAmount}
                    onChange={(e) => setNiAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F] font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Payment Status</label>
                  <select
                    value={niStatus}
                    onChange={(e) => setNiStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8D8C7]">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 text-[#88766F] hover:text-[#30231F] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#30231F] hover:bg-[#B88746] text-[#FFFCF8] font-bold uppercase rounded-xl shadow-xs"
                >
                  Create Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Edit Service Modal */}
      {activeModal === 'editService' && selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#30231F]/70 backdrop-blur-xs">
          <div className="bg-[#FFFCF8] w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-[#E8D8C7] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8D8C7] pb-3">
              <h3 className="font-editorial text-xl font-bold text-[#30231F]">
                Edit Nail Service & Price
              </h3>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedService(null);
                }}
                className="text-[#88766F] hover:text-[#30231F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateService} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#30231F]">Service Name *</label>
                <input
                  type="text"
                  required
                  value={esName}
                  onChange={(e) => setEsName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F] font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#30231F]">Category</label>
                  <select
                    value={esCategory}
                    onChange={(e) => setEsCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                  >
                    <option value="gel">Gel Polish</option>
                    <option value="acrylic">Acrylic</option>
                    <option value="biab">BIAB</option>
                    <option value="care">Pedicure & Care</option>
                    <option value="addons">Nail Art Addons</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#30231F]">
                    Editable Price (₦ Naira) *
                  </label>
                  <input
                    type="number"
                    required
                    value={esPrice}
                    onChange={(e) => setEsPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F] font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#30231F]">Treatment Duration</label>
                <input
                  type="text"
                  value={esDuration}
                  onChange={(e) => setEsDuration(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#30231F]">Service Description</label>
                <textarea
                  rows={2}
                  value={esDesc}
                  onChange={(e) => setEsDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chkServiceAvail"
                  checked={esAvailable}
                  onChange={(e) => setEsAvailable(e.target.checked)}
                  className="rounded border-[#E8D8C7] text-[#B88746] focus:ring-[#B88746]"
                />
                <label htmlFor="chkServiceAvail" className="font-semibold text-[#30231F] cursor-pointer">
                  Service active and visible on live website
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8D8C7]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    setSelectedService(null);
                  }}
                  className="px-4 py-2.5 text-[#88766F] hover:text-[#30231F] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#B88746] hover:bg-[#30231F] text-[#FFFCF8] font-bold uppercase rounded-xl shadow-xs transition-colors"
                >
                  Save Service Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Edit Gallery Image Modal */}
      {activeModal === 'editGallery' && selectedGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#30231F]/70 backdrop-blur-xs">
          <div className="bg-[#FFFCF8] w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-[#E8D8C7] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8D8C7] pb-3">
              <h3 className="font-editorial text-xl font-bold text-[#30231F]">
                Edit Portfolio Photo
              </h3>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedGallery(null);
                }}
                className="text-[#88766F] hover:text-[#30231F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateGallery} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#30231F]">Photo Title *</label>
                <input
                  type="text"
                  required
                  value={egTitle}
                  onChange={(e) => setEgTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#30231F]">Category</label>
                  <select
                    value={egCategory}
                    onChange={(e) => setEgCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                  >
                    <option value="acrylic">Acrylic Sculpting</option>
                    <option value="gel">Gel Polish</option>
                    <option value="nailart">Nail Art</option>
                    <option value="minimal">Minimalist</option>
                    <option value="bridal">Bridal</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#30231F]">Image URL / Upload *</label>
                  <input
                    type="text"
                    required
                    value={egUrl}
                    onChange={(e) => setEgUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F] font-mono text-[11px]"
                  />
                  <label className="mt-1 text-[10px] text-[#B88746] font-semibold cursor-pointer block hover:underline">
                    Or select new image from computer...
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageFileUpload(e, setEgUrl)}
                    />
                  </label>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#30231F]">Description</label>
                <textarea
                  rows={2}
                  value={egDesc}
                  onChange={(e) => setEgDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="chkGalleryFeatured"
                  checked={egFeatured}
                  onChange={(e) => setEgFeatured(e.target.checked)}
                  className="rounded border-[#E8D8C7] text-[#B88746] focus:ring-[#B88746]"
                />
                <label htmlFor="chkGalleryFeatured" className="font-semibold text-[#30231F] cursor-pointer">
                  Highlight on public gallery section
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8D8C7]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    setSelectedGallery(null);
                  }}
                  className="px-4 py-2.5 text-[#88766F] hover:text-[#30231F] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#B88746] hover:bg-[#30231F] text-[#FFFCF8] font-bold uppercase rounded-xl shadow-xs transition-colors"
                >
                  Save Image Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Edit Booking Modal */}
      {activeModal === 'editBooking' && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#30231F]/70 backdrop-blur-xs">
          <div className="bg-[#FFFCF8] w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-[#E8D8C7] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8D8C7] pb-3">
              <h3 className="font-editorial text-xl font-bold text-[#30231F]">
                Edit Booking {selectedBooking.id}
              </h3>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedBooking(null);
                }}
                className="text-[#88766F] hover:text-[#30231F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateBooking} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#30231F]">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={ebName}
                  onChange={(e) => setEbName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#30231F]">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={ebPhone}
                    onChange={(e) => setEbPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#30231F]">Service Name</label>
                  <input
                    type="text"
                    required
                    value={ebServiceName}
                    onChange={(e) => setEbServiceName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#30231F]">Price (₦)</label>
                  <input
                    type="number"
                    required
                    value={ebPrice}
                    onChange={(e) => setEbPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F] font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#30231F]">Date</label>
                  <input
                    type="date"
                    required
                    value={ebDate}
                    onChange={(e) => setEbDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#30231F]">Time</label>
                  <input
                    type="text"
                    required
                    value={ebTime}
                    onChange={(e) => setEbTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#30231F]">Booking Status</label>
                <select
                  value={ebStatus}
                  onChange={(e) => setEbStatus(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F] font-semibold"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8D8C7]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    setSelectedBooking(null);
                  }}
                  className="px-4 py-2.5 text-[#88766F] hover:text-[#30231F] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#B88746] hover:bg-[#30231F] text-[#FFFCF8] font-bold uppercase rounded-xl shadow-xs transition-colors"
                >
                  Save Booking Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Edit Customer Modal */}
      {activeModal === 'editCustomer' && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#30231F]/70 backdrop-blur-xs">
          <div className="bg-[#FFFCF8] w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-[#E8D8C7] shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E8D8C7] pb-3">
              <h3 className="font-editorial text-xl font-bold text-[#30231F]">
                Edit Customer File
              </h3>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setSelectedCustomer(null);
                }}
                className="text-[#88766F] hover:text-[#30231F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCustomer} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-[#30231F]">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={ecName}
                  onChange={(e) => setEcName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1 text-[#30231F]">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={ecPhone}
                    onChange={(e) => setEcPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F] font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-[#30231F]">Email Address</label>
                  <input
                    type="email"
                    value={ecEmail}
                    onChange={(e) => setEcEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#30231F]">Client Notes</label>
                <textarea
                  rows={2}
                  value={ecNotes}
                  onChange={(e) => setEcNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F]"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-[#30231F]">Total Spent (₦)</label>
                <input
                  type="number"
                  value={ecSpent}
                  onChange={(e) => setEcSpent(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-[#F8F3EC] border border-[#E8D8C7] rounded-xl text-[#30231F] font-mono font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#E8D8C7]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveModal(null);
                    setSelectedCustomer(null);
                  }}
                  className="px-4 py-2.5 text-[#88766F] hover:text-[#30231F] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#B88746] hover:bg-[#30231F] text-[#FFFCF8] font-bold uppercase rounded-xl shadow-xs transition-colors"
                >
                  Save Customer Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
