import {
  Booking,
  Inquiry,
  NailService,
  GalleryItem,
  Review,
  Customer,
  Invoice,
  BusinessSettings,
  DEFAULT_BUSINESS_SETTINGS,
} from '../types';
import {
  INITIAL_SERVICES,
  INITIAL_GALLERY,
  INITIAL_BOOKINGS,
  INITIAL_CUSTOMERS,
  INITIAL_INVOICES,
} from '../data/initialData';
import { resolveImageUrl } from '../assets/images';

const DB_NAME = 'fazzy_nails_owner_db';
const DB_VERSION = 2;

export const DB_CHANGE_EVENT = 'fazzy_nails_db_updated';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('bookings')) {
        const store = db.createObjectStore('bookings', { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }

      if (!db.objectStoreNames.contains('inquiries')) {
        const store = db.createObjectStore('inquiries', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!db.objectStoreNames.contains('services')) {
        db.createObjectStore('services', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('gallery')) {
        db.createObjectStore('gallery', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('reviews')) {
        db.createObjectStore('reviews', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('customers')) {
        db.createObjectStore('customers', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('invoices')) {
        db.createObjectStore('invoices', { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function notifyDataChanged(storeName: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(DB_CHANGE_EVENT, { detail: { store: storeName } }));
  }
}

// ----------------- BUSINESS SETTINGS -----------------
export async function getBusinessSettings(): Promise<BusinessSettings> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const req = store.get('main');
      req.onsuccess = () => {
        if (req.result) {
          resolve({ ...DEFAULT_BUSINESS_SETTINGS, ...req.result });
        } else {
          resolve(getLocalStorageFallbackSingle('fzn_settings', DEFAULT_BUSINESS_SETTINGS));
        }
      };
      req.onerror = () => resolve(getLocalStorageFallbackSingle('fzn_settings', DEFAULT_BUSINESS_SETTINGS));
    });
  } catch {
    return getLocalStorageFallbackSingle('fzn_settings', DEFAULT_BUSINESS_SETTINGS);
  }
}

export async function saveBusinessSettings(settings: BusinessSettings): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      const req = store.put({ ...settings, id: 'main' });
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    saveLocalStorageFallbackSingle('fzn_settings', settings);
  }
  saveLocalStorageFallbackSingle('fzn_settings', settings);
  notifyDataChanged('settings');
}

export async function resetAdminCredentials(): Promise<BusinessSettings> {
  const current = await getBusinessSettings();
  const updated: BusinessSettings = {
    ...current,
    ownerEmail: DEFAULT_BUSINESS_SETTINGS.ownerEmail,
    ownerPassword: DEFAULT_BUSINESS_SETTINGS.ownerPassword,
  };
  await saveBusinessSettings(updated);
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('fzn_owner_auth');
    sessionStorage.removeItem('fzn_owner_email');
    localStorage.removeItem('fzn_owner_auth_remember');
  }
  return updated;
}

// ----------------- BOOKINGS -----------------
export async function getBookings(): Promise<Booking[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction('bookings', 'readonly');
      const store = tx.objectStore('bookings');
      const request = store.getAll();
      request.onsuccess = async () => {
        let items: Booking[] = request.result || [];
        if (items.length === 0) {
          await seedBookings(INITIAL_BOOKINGS);
          items = INITIAL_BOOKINGS;
        }
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(items);
      };
      request.onerror = () => resolve(getLocalStorageFallback<Booking>('fzn_bookings', INITIAL_BOOKINGS));
    });
  } catch {
    return getLocalStorageFallback<Booking>('fzn_bookings', INITIAL_BOOKINGS);
  }
}

export async function saveBooking(booking: Booking): Promise<Booking> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('bookings', 'readwrite');
      const store = tx.objectStore('bookings');
      const request = store.put(booking);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const existing = getLocalStorageFallback<Booking>('fzn_bookings', INITIAL_BOOKINGS);
    const filtered = existing.filter(b => b.id !== booking.id);
    saveLocalStorageFallback('fzn_bookings', [booking, ...filtered]);
  }
  notifyDataChanged('bookings');
  return booking;
}

export async function addBooking(booking: Booking): Promise<Booking> {
  return saveBooking(booking);
}

export async function updateBookingStatus(id: string, status: Booking['status']): Promise<void> {
  const bookings = await getBookings();
  const target = bookings.find(b => b.id === id);
  if (target) {
    target.status = status;
    await saveBooking(target);
  }
}

export async function deleteBooking(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('bookings', 'readwrite');
      const store = tx.objectStore('bookings');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const list = getLocalStorageFallback<Booking>('fzn_bookings', INITIAL_BOOKINGS);
    saveLocalStorageFallback('fzn_bookings', list.filter(b => b.id !== id));
  }
  notifyDataChanged('bookings');
}

export async function seedBookings(items: Booking[]): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction('bookings', 'readwrite');
    const store = tx.objectStore('bookings');
    for (const item of items) {
      store.put(item);
    }
  } catch {
    saveLocalStorageFallback('fzn_bookings', items);
  }
}

// ----------------- INQUIRIES -----------------
export async function getInquiries(): Promise<Inquiry[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction('inquiries', 'readonly');
      const store = tx.objectStore('inquiries');
      const request = store.getAll();
      request.onsuccess = () => {
        const items: Inquiry[] = request.result || [];
        items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        resolve(items);
      };
      request.onerror = () => resolve(getLocalStorageFallback<Inquiry>('fzn_inquiries', []));
    });
  } catch {
    return getLocalStorageFallback<Inquiry>('fzn_inquiries', []);
  }
}

export async function addInquiry(inquiry: Inquiry): Promise<Inquiry> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('inquiries', 'readwrite');
      const store = tx.objectStore('inquiries');
      const request = store.put(inquiry);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const existing = getLocalStorageFallback<Inquiry>('fzn_inquiries', []);
    saveLocalStorageFallback('fzn_inquiries', [inquiry, ...existing]);
  }
  notifyDataChanged('inquiries');
  return inquiry;
}

export async function updateInquiryStatus(id: string, status: Inquiry['status']): Promise<void> {
  const inquiries = await getInquiries();
  const target = inquiries.find(i => i.id === id);
  if (target) {
    target.status = status;
    await addInquiry(target);
  }
}

export async function deleteInquiry(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('inquiries', 'readwrite');
      const store = tx.objectStore('inquiries');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const list = getLocalStorageFallback<Inquiry>('fzn_inquiries', []);
    saveLocalStorageFallback('fzn_inquiries', list.filter(q => q.id !== id));
  }
  notifyDataChanged('inquiries');
}

// ----------------- SERVICES / PRICING -----------------
export async function getServices(): Promise<NailService[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction('services', 'readonly');
      const store = tx.objectStore('services');
      const request = store.getAll();
      request.onsuccess = async () => {
        let items: NailService[] = request.result || [];
        if (items.length === 0) {
          await seedServices(INITIAL_SERVICES);
          items = INITIAL_SERVICES;
        }
        resolve(items);
      };
      request.onerror = () => resolve(INITIAL_SERVICES);
    });
  } catch {
    const stored = getLocalStorageFallback<NailService>('fzn_services', INITIAL_SERVICES);
    return stored.length > 0 ? stored : INITIAL_SERVICES;
  }
}

export async function saveService(service: NailService): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('services', 'readwrite');
      const store = tx.objectStore('services');
      const request = store.put(service);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const existing = getLocalStorageFallback<NailService>('fzn_services', INITIAL_SERVICES);
    const updated = existing.filter(s => s.id !== service.id);
    saveLocalStorageFallback('fzn_services', [...updated, service]);
  }
  notifyDataChanged('services');
}

export async function deleteService(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('services', 'readwrite');
      const store = tx.objectStore('services');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const list = getLocalStorageFallback<NailService>('fzn_services', INITIAL_SERVICES);
    saveLocalStorageFallback('fzn_services', list.filter(s => s.id !== id));
  }
  notifyDataChanged('services');
}

export async function seedServices(services: NailService[]): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction('services', 'readwrite');
    const store = tx.objectStore('services');
    for (const service of services) {
      store.put(service);
    }
  } catch {
    saveLocalStorageFallback('fzn_services', services);
  }
}

// ----------------- GALLERY -----------------
export async function getGallery(): Promise<GalleryItem[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction('gallery', 'readonly');
      const store = tx.objectStore('gallery');
      const request = store.getAll();
      request.onsuccess = async () => {
        let items: GalleryItem[] = request.result || [];
        if (items.length === 0) {
          await seedGallery(INITIAL_GALLERY);
          items = INITIAL_GALLERY;
        }
        items = items.map((item) => ({
          ...item,
          imageUrl: resolveImageUrl(item.imageUrl),
        }));
        resolve(items);
      };
      request.onerror = () => resolve(INITIAL_GALLERY);
    });
  } catch {
    const stored = getLocalStorageFallback<GalleryItem>('fzn_gallery', INITIAL_GALLERY);
    return stored.map((item) => ({
      ...item,
      imageUrl: resolveImageUrl(item.imageUrl),
    }));
  }
}

export async function saveGalleryItem(item: GalleryItem): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('gallery', 'readwrite');
      const store = tx.objectStore('gallery');
      const request = store.put(item);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const existing = getLocalStorageFallback<GalleryItem>('fzn_gallery', INITIAL_GALLERY);
    const updated = existing.filter(g => g.id !== item.id);
    saveLocalStorageFallback('fzn_gallery', [...updated, item]);
  }
  notifyDataChanged('gallery');
}

export async function deleteGalleryItem(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('gallery', 'readwrite');
      const store = tx.objectStore('gallery');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const list = getLocalStorageFallback<GalleryItem>('fzn_gallery', INITIAL_GALLERY);
    saveLocalStorageFallback('fzn_gallery', list.filter(g => g.id !== id));
  }
  notifyDataChanged('gallery');
}

export async function seedGallery(items: GalleryItem[]): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction('gallery', 'readwrite');
    const store = tx.objectStore('gallery');
    for (const item of items) {
      store.put(item);
    }
  } catch {
    saveLocalStorageFallback('fzn_gallery', items);
  }
}

// ----------------- CUSTOMERS -----------------
export async function getCustomers(): Promise<Customer[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction('customers', 'readonly');
      const store = tx.objectStore('customers');
      const request = store.getAll();
      request.onsuccess = async () => {
        let items: Customer[] = request.result || [];
        if (items.length === 0) {
          await seedCustomers(INITIAL_CUSTOMERS);
          items = INITIAL_CUSTOMERS;
        }
        resolve(items);
      };
      request.onerror = () => resolve(INITIAL_CUSTOMERS);
    });
  } catch {
    return getLocalStorageFallback<Customer>('fzn_customers', INITIAL_CUSTOMERS);
  }
}

export async function saveCustomer(customer: Customer): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('customers', 'readwrite');
      const store = tx.objectStore('customers');
      const request = store.put(customer);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const existing = getLocalStorageFallback<Customer>('fzn_customers', INITIAL_CUSTOMERS);
    const updated = existing.filter(c => c.id !== customer.id);
    saveLocalStorageFallback('fzn_customers', [...updated, customer]);
  }
  notifyDataChanged('customers');
}

export async function deleteCustomer(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('customers', 'readwrite');
      const store = tx.objectStore('customers');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const list = getLocalStorageFallback<Customer>('fzn_customers', INITIAL_CUSTOMERS);
    saveLocalStorageFallback('fzn_customers', list.filter(c => c.id !== id));
  }
  notifyDataChanged('customers');
}

export async function seedCustomers(items: Customer[]): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction('customers', 'readwrite');
    const store = tx.objectStore('customers');
    for (const item of items) {
      store.put(item);
    }
  } catch {
    saveLocalStorageFallback('fzn_customers', items);
  }
}

// ----------------- INVOICES -----------------
export async function getInvoices(): Promise<Invoice[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction('invoices', 'readonly');
      const store = tx.objectStore('invoices');
      const request = store.getAll();
      request.onsuccess = async () => {
        let items: Invoice[] = request.result || [];
        if (items.length === 0) {
          await seedInvoices(INITIAL_INVOICES);
          items = INITIAL_INVOICES;
        }
        resolve(items);
      };
      request.onerror = () => resolve(INITIAL_INVOICES);
    });
  } catch {
    return getLocalStorageFallback<Invoice>('fzn_invoices', INITIAL_INVOICES);
  }
}

export async function saveInvoice(invoice: Invoice): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('invoices', 'readwrite');
      const store = tx.objectStore('invoices');
      const request = store.put(invoice);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const existing = getLocalStorageFallback<Invoice>('fzn_invoices', INITIAL_INVOICES);
    const updated = existing.filter(i => i.id !== invoice.id);
    saveLocalStorageFallback('fzn_invoices', [...updated, invoice]);
  }
  notifyDataChanged('invoices');
}

export async function deleteInvoice(id: string): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('invoices', 'readwrite');
      const store = tx.objectStore('invoices');
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const list = getLocalStorageFallback<Invoice>('fzn_invoices', INITIAL_INVOICES);
    saveLocalStorageFallback('fzn_invoices', list.filter(i => i.id !== id));
  }
  notifyDataChanged('invoices');
}

export async function seedInvoices(items: Invoice[]): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction('invoices', 'readwrite');
    const store = tx.objectStore('invoices');
    for (const item of items) {
      store.put(item);
    }
  } catch {
    saveLocalStorageFallback('fzn_invoices', items);
  }
}

// ----------------- REVIEWS -----------------
export async function getReviews(): Promise<Review[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction('reviews', 'readonly');
      const store = tx.objectStore('reviews');
      const request = store.getAll();
      request.onsuccess = async () => {
        let items: Review[] = request.result || [];
        resolve(items);
      };
      request.onerror = () => resolve([]);
    });
  } catch {
    return getLocalStorageFallback<Review>('fzn_reviews', []);
  }
}

export async function addReview(review: Review): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('reviews', 'readwrite');
      const store = tx.objectStore('reviews');
      const request = store.put(review);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch {
    const existing = getLocalStorageFallback<Review>('fzn_reviews', []);
    saveLocalStorageFallback('fzn_reviews', [review, ...existing]);
  }
  notifyDataChanged('reviews');
}

// ----------------- LOCALSTORAGE FALLBACK HELPERS -----------------
function getLocalStorageFallback<T>(key: string, defaultVal: T[]): T[] {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function saveLocalStorageFallback<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // quota exceeded
  }
}

function getLocalStorageFallbackSingle<T>(key: string, defaultVal: T): T {
  if (typeof window === 'undefined') return defaultVal;
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function saveLocalStorageFallbackSingle<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // quota
  }
}

export async function exportAllData() {
  const [bookings, inquiries, services, gallery, customers, invoices, settings] = await Promise.all([
    getBookings(),
    getInquiries(),
    getServices(),
    getGallery(),
    getCustomers(),
    getInvoices(),
    getBusinessSettings(),
  ]);

  return {
    exportDate: new Date().toISOString(),
    business: settings.name,
    settings,
    bookings,
    inquiries,
    services,
    gallery,
    customers,
    invoices,
  };
}

export async function clearAllDataAndResetApp(): Promise<void> {
  try {
    const db = await openDatabase();
    const stores = ['bookings', 'inquiries', 'services', 'gallery', 'reviews', 'customers', 'invoices', 'settings'];
    const tx = db.transaction(stores, 'readwrite');
    for (const storeName of stores) {
      tx.objectStore(storeName).clear();
    }
    await new Promise<void>((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // Ignore IDB errors
  }

  if (typeof window !== 'undefined') {
    localStorage.removeItem('fzn_bookings');
    localStorage.removeItem('fzn_inquiries');
    localStorage.removeItem('fzn_services');
    localStorage.removeItem('fzn_gallery');
    localStorage.removeItem('fzn_customers');
    localStorage.removeItem('fzn_invoices');
    localStorage.removeItem('fzn_settings');
    localStorage.removeItem('fzn_reviews');
  }

  // Reseed clean default services
  await seedServices(INITIAL_SERVICES);
  notifyDataChanged('all');
}

