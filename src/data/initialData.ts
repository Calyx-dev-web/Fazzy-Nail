import { NailService, GalleryItem, Review, BlogPost, Customer, Invoice, Booking } from '../types';

export const INITIAL_SERVICES: NailService[] = [
  {
    id: 'srv-gel-polish',
    name: 'Gel Polish Manicure',
    category: 'gel',
    price: 3000,
    duration: '45 mins',
    description: 'Flawless, chip-free high-shine gel polish on natural nails including cuticle grooming and hand oil treatment.',
    popular: true,
    isAvailable: true,
  },
  {
    id: 'srv-acrylic-fullset',
    name: 'Acrylic Full Set',
    category: 'acrylic',
    price: 15000,
    duration: '90 mins',
    description: 'Full luxury sculpted acrylic extensions tailored in your preferred shape (almond, coffin, square, stiletto) with standard gel color.',
    popular: true,
    isAvailable: true,
  },
  {
    id: 'srv-ombre-acrylic',
    name: 'French Ombre Acrylic Full Set',
    category: 'acrylic',
    price: 18000,
    duration: '105 mins',
    description: 'Seamless baby boomer pink-and-white gradient acrylic sculpting, finished with diamond gloss top coat.',
    popular: true,
    isAvailable: true,
  },
  {
    id: 'srv-biab-overlay',
    name: 'BIAB Builder Gel Overlay',
    category: 'biab',
    price: 8000,
    duration: '60 mins',
    description: 'Builder in a Bottle nail strengthening overlay to protect and grow weak natural nails with enduring strength.',
    popular: false,
    isAvailable: true,
  },
  {
    id: 'srv-luxury-pedicure',
    name: 'Luxury Spa Pedicure & Polish',
    category: 'care',
    price: 7000,
    duration: '60 mins',
    description: 'Exfoliating foot soak, dead skin buffing, rejuvenating mint scrub, soothing massage, and neat polish application.',
    popular: false,
    isAvailable: true,
  },
  {
    id: 'srv-nail-art-custom',
    name: 'Bespoke Nail Art & Chrome Accent',
    category: 'addons',
    price: 4000,
    duration: '30 mins',
    description: 'Hand-painted designs, chrome powder buffing, encapsulated foil, 3D charms, or Swarovski micro-crystals.',
    popular: false,
    isAvailable: true,
  },
  {
    id: 'srv-acrylic-refill',
    name: 'Acrylic Infill & Balance',
    category: 'acrylic',
    price: 10000,
    duration: '60 mins',
    description: 'Rebalance new nail growth, shape refinement, and fresh gel polish coat for up to 4 weeks retention.',
    popular: false,
    isAvailable: true,
  },
  {
    id: 'srv-soakoff-repair',
    name: 'Gentle Soak-Off & Nail Repair',
    category: 'care',
    price: 2500,
    duration: '30 mins',
    description: 'Safe, damage-free removal of acrylic or gel sets followed by keratin vitamin strengthener treatment.',
    popular: false,
    isAvailable: true,
  },
];

export const INITIAL_GALLERY: GalleryItem[] = [];

export const INITIAL_BOOKINGS: Booking[] = [];

export const INITIAL_CUSTOMERS: Customer[] = [];

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_REVIEWS: Review[] = [];

export const INITIAL_BLOG_POSTS: BlogPost[] = [];
