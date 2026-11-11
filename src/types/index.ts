export interface NailService {
  id: string;
  name: string;
  category: 'gel' | 'acrylic' | 'biab' | 'care' | 'addons';
  price: number; // in NGN
  duration: string;
  description: string;
  popular?: boolean;
  isAvailable: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'acrylic' | 'gel' | 'nailart' | 'minimal' | 'bridal';
  imageUrl: string;
  description: string;
  featured?: boolean;
  createdAt: string;
}

export interface Booking {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  serviceId: string;
  serviceName: string;
  price: number;
  date: string; // YYYY-MM-DD
  time: string; // e.g., "10:00 AM"
  nailShape: string;
  nailLength: string;
  notes?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface Inquiry {
  id: string;
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  timestamp: string;
  status: 'Unread' | 'Replied';
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  service: string;
  comment: string;
  date: string;
  verified: boolean;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  readTime: string;
  date: string;
  category: string;
  excerpt: string;
  content: string[];
  imageUrl: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes?: string;
  createdAt: string;
  totalSpent: number;
  appointmentCount: number;
  lastVisit?: string;
}

export interface Invoice {
  id: string; // e.g. "INV-1001"
  customerName: string;
  customerPhone: string;
  serviceDescription: string;
  amount: number;
  date: string; // YYYY-MM-DD
  status: 'Paid' | 'Unpaid';
  paymentMethod?: string;
}

export interface BusinessSettings {
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerPassword: string;
  motto: string;
  phone: string;
  phoneClean: string;
  whatsappRaw: string;
  whatsappUrl: string;
  facebookUrl: string;
  email: string;
  address: string;
  hours: string;
  logoUrl: string;
  profileImage: string;
  heroTitle: string;
  heroSubtitle: string;
  announcement: string;
}

export const DEFAULT_BUSINESS_SETTINGS: BusinessSettings = {
  name: 'Fazzy Nails',
  ownerName: 'Favour Okeke',
  ownerEmail: 'owner@fazzynails.com',
  ownerPassword: 'admin',
  motto: 'Nails that speak class',
  phone: '+234 907 281 7540',
  phoneClean: '+2349072817540',
  whatsappRaw: '2349072817540',
  whatsappUrl: 'https://wa.me/2349072817540',
  facebookUrl: 'https://www.facebook.com/share/1FNAEVytV5/',
  email: 'info@fazzynails.com',
  address: 'Studio Atelier, Agbani, Enugu State, Nigeria',
  hours: 'Mon–Sat: 9:00 AM – 7:00 PM | Sun: 1:00 PM – 6:00 PM',
  logoUrl: '/assets/aistudio/IMG_20261111_015106_390_dbe186d0.jpg',
  profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  heroTitle: 'Where Elegance Meets Perfection.',
  heroSubtitle: 'Step into a sanctuary of tailored luxury. From immaculate Gel Polish to long-wearing Sculpted Acrylics, every set is crafted with medical-grade hygiene and high-fashion finesse.',
  announcement: 'Same-Day Slots Available: Mon–Sat 9AM–7PM · Sunday 1PM–6PM',
};

export const BUSINESS_INFO = DEFAULT_BUSINESS_SETTINGS;

export const getWhatsAppUrl = (customText?: string, phoneRaw = DEFAULT_BUSINESS_SETTINGS.whatsappRaw) => {
  if (!customText) return `https://wa.me/${phoneRaw}`;
  return `https://wa.me/${phoneRaw}?text=${encodeURIComponent(customText)}`;
};
