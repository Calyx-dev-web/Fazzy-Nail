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

export const BUSINESS_INFO = {
  name: 'Fazzynails',
  motto: 'Nails that speak class',
  phone: '+234 907 281 7540',
  phoneClean: '+2349072817540',
  whatsappRaw: '2349072817540',
  whatsappUrl: 'https://wa.me/2349072817540',
  facebookUrl: 'https://www.facebook.com/share/1FNAEVytV5/',
  email: 'info@fazzynails.com',
  address: 'Studio Atelier, Agbani, Enugu State, Nigeria',
  googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31707.97022137021!2d7.53!3d6.31!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1044bb7fb3404555%3A0x6b63c9b7bbdf2693!2sAgbani%2C%20Enugu!5e0!3m2!1sen!2sng!4v1714000000000!5m2!1sen!2sng',
  hours: {
    weekdays: 'Monday – Saturday: 9:00 AM – 7:00 PM',
    sunday: 'Sunday: 1:00 PM – 6:00 PM',
    emergency: 'Emergency & VIP Out-of-Hours Slots available via WhatsApp',
  },
};

export const getWhatsAppUrl = (customText?: string) => {
  if (!customText) return BUSINESS_INFO.whatsappUrl;
  return `https://wa.me/${BUSINESS_INFO.whatsappRaw}?text=${encodeURIComponent(customText)}`;
};
