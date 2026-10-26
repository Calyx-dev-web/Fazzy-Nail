import { Booking, Inquiry, NailService, GalleryItem, Review } from '../types';
import { INITIAL_SERVICES, INITIAL_GALLERY, INITIAL_REVIEWS } from '../data/initialData';
import { resolveImageUrl } from '../assets/images';

const DB_NAME = 'fazzynails_db';
const DB_VERSION = 1;

export const DB_CHANGE_EVENT = 'fazzynails_db_updated';

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
        store.createIndex('status', 'status', { unique: false });
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

// ----------------- BOOKINGS -----------------
export async function getBookings(): Promise<Booking[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve) => {
      const tx = db.transaction('bookings', 'readonly');
      const store = tx.objectStore('bookings');
      const request = store.getAll();
      request.onsuccess = () => {
        const items: Booking[] = request.result || [];
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        resolve(items);
      };
      request.onerror = () => resolve(getLocalStorageFallback<Booking>('fzn_bookings'));
    });
  } catch {
    return getLocalStorageFallback<Booking>('fzn_bookings');
  }
}

export async function addBooking(booking: Booking): Promise<Booking> {
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
    const existing = getLocalStorageFallback<Booking>('fzn_bookings');
    saveLocalStorageFallback('fzn_bookings', [booking, ...existing]);
  }
  notifyDataChanged('bookings');
  return booking;
}

export async function updateBookingStatus(id: string, status: Booking['status']): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('bookings', 'readwrite');
      const store = tx.objectStore('bookings');
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const data = getReq.result as Booking | undefined;
        if (data) {
          data.status = status;
          store.put(data);
          resolve();
        } else {
          resolve();
        }
      };
      getReq.onerror = () => reject(getReq.error);
    });
  } catch {
    const list = getLocalStorageFallback<Booking>('fzn_bookings');
    const updated = list.map(b => b.id === id ? { ...b, status } : b);
    saveLocalStorageFallback('fzn_bookings', updated);
  }
  notifyDataChanged('bookings');
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
    const list = getLocalStorageFallback<Booking>('fzn_bookings');
    saveLocalStorageFallback('fzn_bookings', list.filter(b => b.id !== id));
  }
  notifyDataChanged('bookings');
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
      request.onerror = () => resolve(getLocalStorageFallback<Inquiry>('fzn_inquiries'));
    });
  } catch {
    return getLocalStorageFallback<Inquiry>('fzn_inquiries');
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
    const existing = getLocalStorageFallback<Inquiry>('fzn_inquiries');
    saveLocalStorageFallback('fzn_inquiries', [inquiry, ...existing]);
  }
  notifyDataChanged('inquiries');
  return inquiry;
}

export async function updateInquiryStatus(id: string, status: Inquiry['status']): Promise<void> {
  try {
    const db = await openDatabase();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction('inquiries', 'readwrite');
      const store = tx.objectStore('inquiries');
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const data = getReq.result as Inquiry | undefined;
        if (data) {
          data.status = status;
          store.put(data);
          resolve();
        } else {
          resolve();
        }
      };
      getReq.onerror = () => reject(getReq.error);
    });
  } catch {
    const list = getLocalStorageFallback<Inquiry>('fzn_inquiries');
    const updated = list.map(q => q.id === id ? { ...q, status } : q);
    saveLocalStorageFallback('fzn_inquiries', updated);
  }
  notifyDataChanged('inquiries');
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
    const list = getLocalStorageFallback<Inquiry>('fzn_inquiries');
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
          // Preseed defaults
          await seedServices(INITIAL_SERVICES);
          items = INITIAL_SERVICES;
        }
        resolve(items);
      };
      request.onerror = () => resolve(INITIAL_SERVICES);
    });
  } catch {
    const stored = getLocalStorageFallback<NailService>('fzn_services');
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
    const existing = getLocalStorageFallback<NailService>('fzn_services');
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
    const list = getLocalStorageFallback<NailService>('fzn_services');
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
          // Preseed initial gallery
          await seedGallery(INITIAL_GALLERY);
          items = INITIAL_GALLERY;
        } else {
          items = items.map((item) => ({
            ...item,
            imageUrl: resolveImageUrl(item.imageUrl),
          }));
        }
        resolve(items);
      };
      request.onerror = () => resolve(INITIAL_GALLERY);
    });
  } catch {
    const stored = getLocalStorageFallback<GalleryItem>('fzn_gallery');
    return (stored.length > 0 ? stored : INITIAL_GALLERY).map((item) => ({
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
    const existing = getLocalStorageFallback<GalleryItem>('fzn_gallery');
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
    const list = getLocalStorageFallback<GalleryItem>('fzn_gallery');
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
        if (items.length === 0) {
          await seedReviews(INITIAL_REVIEWS);
          items = INITIAL_REVIEWS;
        }
        resolve(items);
      };
      request.onerror = () => resolve(INITIAL_REVIEWS);
    });
  } catch {
    const stored = getLocalStorageFallback<Review>('fzn_reviews');
    return stored.length > 0 ? stored : INITIAL_REVIEWS;
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
    const existing = getLocalStorageFallback<Review>('fzn_reviews');
    saveLocalStorageFallback('fzn_reviews', [review, ...existing]);
  }
  notifyDataChanged('reviews');
}

export async function seedReviews(items: Review[]): Promise<void> {
  try {
    const db = await openDatabase();
    const tx = db.transaction('reviews', 'readwrite');
    const store = tx.objectStore('reviews');
    for (const item of items) {
      store.put(item);
    }
  } catch {
    saveLocalStorageFallback('fzn_reviews', items);
  }
}

// ----------------- LOCALSTORAGE BACKUP UTILITIES -----------------
function getLocalStorageFallback<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveLocalStorageFallback<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // quota exceeded or private mode
  }
}

// Export full database JSON for admin backup
export async function exportAllData() {
  const [bookings, inquiries, services, gallery, reviews] = await Promise.all([
    getBookings(),
    getInquiries(),
    getServices(),
    getGallery(),
    getReviews(),
  ]);

  return {
    exportDate: new Date().toISOString(),
    business: 'Fazzynails',
    bookings,
    inquiries,
    services,
    gallery,
    reviews,
  };
}
