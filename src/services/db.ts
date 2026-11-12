import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
} from 'firebase/firestore';
import { auth, db as firestoreDb } from '../firebase';
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

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo:
        auth?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = value;
    }
  }
  return clean as T;
}

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const idb = (event.target as IDBOpenDBRequest).result;

      if (!idb.objectStoreNames.contains('bookings')) {
        const store = idb.createObjectStore('bookings', { keyPath: 'id' });
        store.createIndex('createdAt', 'createdAt', { unique: false });
        store.createIndex('status', 'status', { unique: false });
      }

      if (!idb.objectStoreNames.contains('inquiries')) {
        const store = idb.createObjectStore('inquiries', { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }

      if (!idb.objectStoreNames.contains('services')) {
        idb.createObjectStore('services', { keyPath: 'id' });
      }

      if (!idb.objectStoreNames.contains('gallery')) {
        idb.createObjectStore('gallery', { keyPath: 'id' });
      }

      if (!idb.objectStoreNames.contains('reviews')) {
        idb.createObjectStore('reviews', { keyPath: 'id' });
      }

      if (!idb.objectStoreNames.contains('customers')) {
        idb.createObjectStore('customers', { keyPath: 'id' });
      }

      if (!idb.objectStoreNames.contains('invoices')) {
        idb.createObjectStore('invoices', { keyPath: 'id' });
      }

      if (!idb.objectStoreNames.contains('settings')) {
        idb.createObjectStore('settings', { keyPath: 'id' });
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

async function idbGetAll<T>(storeName: string): Promise<T[]> {
  const idb = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result as T[]) || []);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut<T>(storeName: string, item: T): Promise<void> {
  const idb = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function idbDelete(storeName: string, id: string): Promise<void> {
  const idb = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ----------------- BUSINESS SETTINGS -----------------
export async function getBusinessSettings(): Promise<BusinessSettings> {
  let localSettings = getLocalStorageFallbackSingle('fzn_settings', DEFAULT_BUSINESS_SETTINGS);
  try {
    const idb = await openDatabase();
    const idbResult = await new Promise<BusinessSettings | null>((resolve) => {
      const tx = idb.transaction('settings', 'readonly');
      const req = tx.objectStore('settings').get('main');
      req.onsuccess = () => resolve(req.result ? { ...DEFAULT_BUSINESS_SETTINGS, ...req.result } : null);
      req.onerror = () => resolve(null);
    });
    if (idbResult) localSettings = idbResult;
  } catch {
    // fallback to localStorage
  }

  if (firestoreDb) {
    try {
      const snap = await getDoc(doc(firestoreDb, 'settings', 'main'));
      if (snap.exists()) {
        const remote = snap.data() as Partial<BusinessSettings>;
        const merged: BusinessSettings = {
          ...DEFAULT_BUSINESS_SETTINGS,
          ...localSettings,
          ...remote,
          ownerPassword: localSettings.ownerPassword || DEFAULT_BUSINESS_SETTINGS.ownerPassword,
        };
        if (merged.ownerName === 'Favour Okeke') {
          merged.ownerName = DEFAULT_BUSINESS_SETTINGS.ownerName;
        }
        try {
          await idbPut('settings', { ...merged, id: 'main' });
        } catch {
          // ignore IDB mirror error
        }
        saveLocalStorageFallbackSingle('fzn_settings', merged);
        return merged;
      } else if (auth?.currentUser) {
        const { ownerPassword: _omitted, ...publicSafeSettings } = localSettings;
        await setDoc(doc(firestoreDb, 'settings', 'main'), stripUndefined(publicSafeSettings));
      }
    } catch (error) {
      console.warn('Firestore settings read fallback:', error);
    }
  }

  if (localSettings.ownerName === 'Favour Okeke') {
    localSettings = { ...localSettings, ownerName: DEFAULT_BUSINESS_SETTINGS.ownerName };
    saveLocalStorageFallbackSingle('fzn_settings', localSettings);
  }
  return localSettings;
}

export async function saveBusinessSettings(settings: BusinessSettings): Promise<void> {
  try {
    await idbPut('settings', { ...settings, id: 'main' });
  } catch {
    // ignore IDB error
  }
  saveLocalStorageFallbackSingle('fzn_settings', settings);

  if (auth?.currentUser && firestoreDb) {
    try {
      const { ownerPassword: _omitted, ...publicSafeSettings } = settings;
      await setDoc(doc(firestoreDb, 'settings', 'main'), stripUndefined(publicSafeSettings));
    } catch (error) {
      console.warn('Firestore settings sync skipped/denied:', error);
    }
  }

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
  if (auth?.currentUser && firestoreDb) {
    try {
      const snap = await getDocs(collection(firestoreDb, 'bookings'));
      let items = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Booking));
      if (items.length === 0) {
        let localItems: Booking[] = [];
        try {
          localItems = await idbGetAll<Booking>('bookings');
        } catch {
          localItems = getLocalStorageFallback<Booking>('fzn_bookings', INITIAL_BOOKINGS);
        }
        if (localItems.length > 0) {
          await seedBookings(localItems);
          items = localItems;
        }
      }
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      saveLocalStorageFallback('fzn_bookings', items);
      return items;
    } catch (error) {
      console.warn('Firestore bookings read notice:', error);
    }
  }

  try {
    let items = await idbGetAll<Booking>('bookings');
    items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return items;
  } catch {
    return getLocalStorageFallback<Booking>('fzn_bookings', INITIAL_BOOKINGS);
  }
}

export async function saveBooking(booking: Booking): Promise<Booking> {
  try {
    await idbPut('bookings', booking);
  } catch {
    const existing = getLocalStorageFallback<Booking>('fzn_bookings', INITIAL_BOOKINGS);
    const filtered = existing.filter((b) => b.id !== booking.id);
    saveLocalStorageFallback('fzn_bookings', [booking, ...filtered]);
  }

  if (firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, 'bookings', booking.id), stripUndefined({ ...booking }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `bookings/${booking.id}`);
    }
  }

  notifyDataChanged('bookings');
  return booking;
}

export async function addBooking(booking: Booking): Promise<Booking> {
  return saveBooking(booking);
}

export async function updateBookingStatus(id: string, status: Booking['status']): Promise<void> {
  const bookings = await getBookings();
  const target = bookings.find((b) => b.id === id);
  if (target) {
    target.status = status;
    await saveBooking(target);
  }
}

export async function deleteBooking(id: string): Promise<void> {
  try {
    await idbDelete('bookings', id);
  } catch {
    const list = getLocalStorageFallback<Booking>('fzn_bookings', INITIAL_BOOKINGS);
    saveLocalStorageFallback('fzn_bookings', list.filter((b) => b.id !== id));
  }

  if (auth?.currentUser && firestoreDb) {
    try {
      await deleteDoc(doc(firestoreDb, 'bookings', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `bookings/${id}`);
    }
  }

  notifyDataChanged('bookings');
}

export async function seedBookings(items: Booking[]): Promise<void> {
  for (const item of items) {
    try {
      await idbPut('bookings', item);
    } catch {
      // ignore
    }
    if (auth?.currentUser && firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'bookings', item.id), stripUndefined({ ...item }));
      } catch {
        // ignore
      }
    }
  }
}

// ----------------- INQUIRIES -----------------
export async function getInquiries(): Promise<Inquiry[]> {
  if (auth?.currentUser && firestoreDb) {
    try {
      const snap = await getDocs(collection(firestoreDb, 'inquiries'));
      let items = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Inquiry));
      if (items.length === 0) {
        let localItems: Inquiry[] = [];
        try {
          localItems = await idbGetAll<Inquiry>('inquiries');
        } catch {
          localItems = getLocalStorageFallback<Inquiry>('fzn_inquiries', []);
        }
        if (localItems.length > 0) {
          for (const item of localItems) {
            try {
              await setDoc(doc(firestoreDb, 'inquiries', item.id), stripUndefined({ ...item }));
            } catch {
              // ignore
            }
          }
          items = localItems;
        }
      }
      items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      saveLocalStorageFallback('fzn_inquiries', items);
      return items;
    } catch (error) {
      console.warn('Firestore inquiries read notice:', error);
    }
  }

  try {
    const items = await idbGetAll<Inquiry>('inquiries');
    items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return items;
  } catch {
    return getLocalStorageFallback<Inquiry>('fzn_inquiries', []);
  }
}

export async function addInquiry(inquiry: Inquiry): Promise<Inquiry> {
  try {
    await idbPut('inquiries', inquiry);
  } catch {
    const existing = getLocalStorageFallback<Inquiry>('fzn_inquiries', []);
    saveLocalStorageFallback('fzn_inquiries', [inquiry, ...existing]);
  }

  if (firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, 'inquiries', inquiry.id), stripUndefined({ ...inquiry }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `inquiries/${inquiry.id}`);
    }
  }

  notifyDataChanged('inquiries');
  return inquiry;
}

export async function updateInquiryStatus(id: string, status: Inquiry['status']): Promise<void> {
  const inquiries = await getInquiries();
  const target = inquiries.find((i) => i.id === id);
  if (target) {
    target.status = status;
    await addInquiry(target);
  }
}

export async function deleteInquiry(id: string): Promise<void> {
  try {
    await idbDelete('inquiries', id);
  } catch {
    const list = getLocalStorageFallback<Inquiry>('fzn_inquiries', []);
    saveLocalStorageFallback('fzn_inquiries', list.filter((q) => q.id !== id));
  }

  if (auth?.currentUser && firestoreDb) {
    try {
      await deleteDoc(doc(firestoreDb, 'inquiries', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `inquiries/${id}`);
    }
  }

  notifyDataChanged('inquiries');
}

// ----------------- SERVICES / PRICING -----------------
export async function getServices(): Promise<NailService[]> {
  if (firestoreDb) {
    try {
      const snap = await getDocs(collection(firestoreDb, 'services'));
      let items = snap.docs.map((d) => ({ ...d.data(), id: d.id } as NailService));
      if (items.length === 0) {
        if (auth?.currentUser) {
          await seedServices(INITIAL_SERVICES);
        }
        items = INITIAL_SERVICES;
      }
      saveLocalStorageFallback('fzn_services', items);
      return items;
    } catch (error) {
      console.warn('Firestore services read fallback:', error);
    }
  }

  try {
    let items = await idbGetAll<NailService>('services');
    if (items.length === 0) {
      await seedServices(INITIAL_SERVICES);
      items = INITIAL_SERVICES;
    }
    return items;
  } catch {
    const stored = getLocalStorageFallback<NailService>('fzn_services', INITIAL_SERVICES);
    return stored.length > 0 ? stored : INITIAL_SERVICES;
  }
}

export async function saveService(service: NailService): Promise<void> {
  try {
    await idbPut('services', service);
  } catch {
    const existing = getLocalStorageFallback<NailService>('fzn_services', INITIAL_SERVICES);
    const updated = existing.filter((s) => s.id !== service.id);
    saveLocalStorageFallback('fzn_services', [...updated, service]);
  }

  if (auth?.currentUser && firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, 'services', service.id), stripUndefined({ ...service }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `services/${service.id}`);
    }
  }

  notifyDataChanged('services');
}

export async function deleteService(id: string): Promise<void> {
  try {
    await idbDelete('services', id);
  } catch {
    const list = getLocalStorageFallback<NailService>('fzn_services', INITIAL_SERVICES);
    saveLocalStorageFallback('fzn_services', list.filter((s) => s.id !== id));
  }

  if (auth?.currentUser && firestoreDb) {
    try {
      await deleteDoc(doc(firestoreDb, 'services', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `services/${id}`);
    }
  }

  notifyDataChanged('services');
}

export async function seedServices(services: NailService[]): Promise<void> {
  for (const service of services) {
    try {
      await idbPut('services', service);
    } catch {
      // ignore
    }
    if (auth?.currentUser && firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'services', service.id), stripUndefined({ ...service }));
      } catch {
        // ignore
      }
    }
  }
}

// ----------------- GALLERY -----------------
export async function getGallery(): Promise<GalleryItem[]> {
  if (firestoreDb) {
    try {
      const snap = await getDocs(collection(firestoreDb, 'gallery'));
      let items = snap.docs.map((d) => ({ ...d.data(), id: d.id } as GalleryItem));
      if (items.length === 0) {
        let localItems: GalleryItem[] = [];
        try {
          localItems = await idbGetAll<GalleryItem>('gallery');
        } catch {
          localItems = getLocalStorageFallback<GalleryItem>('fzn_gallery', INITIAL_GALLERY);
        }
        const toSeed = localItems.length > 0 ? localItems : INITIAL_GALLERY;
        if (auth?.currentUser && toSeed.length > 0) {
          await seedGallery(toSeed);
        }
        items = toSeed;
      }
      items = items.map((item) => ({
        ...item,
        imageUrl: resolveImageUrl(item.imageUrl),
      }));
      saveLocalStorageFallback('fzn_gallery', items);
      return items;
    } catch (error) {
      console.warn('Firestore gallery read fallback:', error);
    }
  }

  try {
    let items = await idbGetAll<GalleryItem>('gallery');
    if (items.length === 0) {
      await seedGallery(INITIAL_GALLERY);
      items = INITIAL_GALLERY;
    }
    return items.map((item) => ({
      ...item,
      imageUrl: resolveImageUrl(item.imageUrl),
    }));
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
    await idbPut('gallery', item);
  } catch {
    const existing = getLocalStorageFallback<GalleryItem>('fzn_gallery', INITIAL_GALLERY);
    const updated = existing.filter((g) => g.id !== item.id);
    saveLocalStorageFallback('fzn_gallery', [...updated, item]);
  }

  if (auth?.currentUser && firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, 'gallery', item.id), stripUndefined({ ...item }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `gallery/${item.id}`);
    }
  }

  notifyDataChanged('gallery');
}

export async function deleteGalleryItem(id: string): Promise<void> {
  try {
    await idbDelete('gallery', id);
  } catch {
    const list = getLocalStorageFallback<GalleryItem>('fzn_gallery', INITIAL_GALLERY);
    saveLocalStorageFallback('fzn_gallery', list.filter((g) => g.id !== id));
  }

  if (auth?.currentUser && firestoreDb) {
    try {
      await deleteDoc(doc(firestoreDb, 'gallery', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `gallery/${id}`);
    }
  }

  notifyDataChanged('gallery');
}

export async function seedGallery(items: GalleryItem[]): Promise<void> {
  for (const item of items) {
    try {
      await idbPut('gallery', item);
    } catch {
      // ignore
    }
    if (auth?.currentUser && firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'gallery', item.id), stripUndefined({ ...item }));
      } catch {
        // ignore
      }
    }
  }
}

// ----------------- CUSTOMERS -----------------
export async function getCustomers(): Promise<Customer[]> {
  if (auth?.currentUser && firestoreDb) {
    try {
      const snap = await getDocs(collection(firestoreDb, 'customers'));
      let items = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Customer));
      if (items.length === 0) {
        let localItems: Customer[] = [];
        try {
          localItems = await idbGetAll<Customer>('customers');
        } catch {
          localItems = getLocalStorageFallback<Customer>('fzn_customers', INITIAL_CUSTOMERS);
        }
        if (localItems.length > 0) {
          await seedCustomers(localItems);
          items = localItems;
        }
      }
      saveLocalStorageFallback('fzn_customers', items);
      return items;
    } catch (error) {
      console.warn('Firestore customers read notice:', error);
    }
  }

  try {
    return await idbGetAll<Customer>('customers');
  } catch {
    return getLocalStorageFallback<Customer>('fzn_customers', INITIAL_CUSTOMERS);
  }
}

export async function saveCustomer(customer: Customer): Promise<void> {
  try {
    await idbPut('customers', customer);
  } catch {
    const existing = getLocalStorageFallback<Customer>('fzn_customers', INITIAL_CUSTOMERS);
    const updated = existing.filter((c) => c.id !== customer.id);
    saveLocalStorageFallback('fzn_customers', [...updated, customer]);
  }

  if (auth?.currentUser && firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, 'customers', customer.id), stripUndefined({ ...customer }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `customers/${customer.id}`);
    }
  }

  notifyDataChanged('customers');
}

export async function deleteCustomer(id: string): Promise<void> {
  try {
    await idbDelete('customers', id);
  } catch {
    const list = getLocalStorageFallback<Customer>('fzn_customers', INITIAL_CUSTOMERS);
    saveLocalStorageFallback('fzn_customers', list.filter((c) => c.id !== id));
  }

  if (auth?.currentUser && firestoreDb) {
    try {
      await deleteDoc(doc(firestoreDb, 'customers', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `customers/${id}`);
    }
  }

  notifyDataChanged('customers');
}

export async function seedCustomers(items: Customer[]): Promise<void> {
  for (const item of items) {
    try {
      await idbPut('customers', item);
    } catch {
      // ignore
    }
    if (auth?.currentUser && firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'customers', item.id), stripUndefined({ ...item }));
      } catch {
        // ignore
      }
    }
  }
}

// ----------------- INVOICES -----------------
export async function getInvoices(): Promise<Invoice[]> {
  if (auth?.currentUser && firestoreDb) {
    try {
      const snap = await getDocs(collection(firestoreDb, 'invoices'));
      let items = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Invoice));
      if (items.length === 0) {
        let localItems: Invoice[] = [];
        try {
          localItems = await idbGetAll<Invoice>('invoices');
        } catch {
          localItems = getLocalStorageFallback<Invoice>('fzn_invoices', INITIAL_INVOICES);
        }
        if (localItems.length > 0) {
          await seedInvoices(localItems);
          items = localItems;
        }
      }
      saveLocalStorageFallback('fzn_invoices', items);
      return items;
    } catch (error) {
      console.warn('Firestore invoices read notice:', error);
    }
  }

  try {
    return await idbGetAll<Invoice>('invoices');
  } catch {
    return getLocalStorageFallback<Invoice>('fzn_invoices', INITIAL_INVOICES);
  }
}

export async function saveInvoice(invoice: Invoice): Promise<void> {
  try {
    await idbPut('invoices', invoice);
  } catch {
    const existing = getLocalStorageFallback<Invoice>('fzn_invoices', INITIAL_INVOICES);
    const updated = existing.filter((i) => i.id !== invoice.id);
    saveLocalStorageFallback('fzn_invoices', [...updated, invoice]);
  }

  if (auth?.currentUser && firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, 'invoices', invoice.id), stripUndefined({ ...invoice }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `invoices/${invoice.id}`);
    }
  }

  notifyDataChanged('invoices');
}

export async function deleteInvoice(id: string): Promise<void> {
  try {
    await idbDelete('invoices', id);
  } catch {
    const list = getLocalStorageFallback<Invoice>('fzn_invoices', INITIAL_INVOICES);
    saveLocalStorageFallback('fzn_invoices', list.filter((i) => i.id !== id));
  }

  if (auth?.currentUser && firestoreDb) {
    try {
      await deleteDoc(doc(firestoreDb, 'invoices', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `invoices/${id}`);
    }
  }

  notifyDataChanged('invoices');
}

export async function seedInvoices(items: Invoice[]): Promise<void> {
  for (const item of items) {
    try {
      await idbPut('invoices', item);
    } catch {
      // ignore
    }
    if (auth?.currentUser && firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'invoices', item.id), stripUndefined({ ...item }));
      } catch {
        // ignore
      }
    }
  }
}

// ----------------- REVIEWS -----------------
export async function getReviews(): Promise<Review[]> {
  if (firestoreDb) {
    try {
      const snap = await getDocs(collection(firestoreDb, 'reviews'));
      const items = snap.docs.map((d) => ({ ...d.data(), id: d.id } as Review));
      saveLocalStorageFallback('fzn_reviews', items);
      return items;
    } catch (error) {
      console.warn('Firestore reviews read fallback:', error);
    }
  }

  try {
    return await idbGetAll<Review>('reviews');
  } catch {
    return getLocalStorageFallback<Review>('fzn_reviews', []);
  }
}

export async function addReview(review: Review): Promise<void> {
  try {
    await idbPut('reviews', review);
  } catch {
    const existing = getLocalStorageFallback<Review>('fzn_reviews', []);
    saveLocalStorageFallback('fzn_reviews', [review, ...existing]);
  }

  if (firestoreDb) {
    try {
      await setDoc(doc(firestoreDb, 'reviews', review.id), stripUndefined({ ...review }));
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `reviews/${review.id}`);
    }
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
  if (auth?.currentUser && firestoreDb) {
    const collectionsToClear = ['bookings', 'inquiries', 'services', 'gallery', 'reviews', 'customers', 'invoices'];
    for (const colName of collectionsToClear) {
      try {
        const snap = await getDocs(collection(firestoreDb, colName));
        for (const d of snap.docs) {
          await deleteDoc(doc(firestoreDb, colName, d.id));
        }
      } catch (error) {
        console.warn(`Failed clearing Firestore collection ${colName}:`, error);
      }
    }
  }

  try {
    const idb = await openDatabase();
    const stores = ['bookings', 'inquiries', 'services', 'gallery', 'reviews', 'customers', 'invoices', 'settings'];
    const tx = idb.transaction(stores, 'readwrite');
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

  await seedServices(INITIAL_SERVICES);
  notifyDataChanged('all');
}
