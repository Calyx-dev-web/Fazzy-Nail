# Fazzynails | Boutique Luxury Nail Tech Studio

> **"Nails that speak class."**  
> Luxury nail artistry, custom acrylic sculpting, BIAB overlays, and bespoke salon care located in Agbani, Enugu.

---

## 🌟 Highlights & Features

- **📱 Responsive Luxury Studio Experience**:
  - Immersive boutique aesthetic tailored for mobile, tablet, and desktop viewports.
  - Interactive Pricing & Services menu (Acrylic, Gel Polish, BIAB, Natural Care, Add-ons).
  - Filterable Nail Art Lookbook & Portfolio with high-res photography.
  - Direct 1-click WhatsApp booking pre-filled with selected nail service, date, and appointment time.
- **🛡️ Secure Admin Portal with 2FA Protection**:
  - Multi-Factor Authentication: Master PIN + rotating WhatsApp Verification Code simulation + emergency master bypass key (`FN-SEC-990142`).
  - Booking & Inquiry Management: Real-time status toggling (Pending, Confirmed, Completed, Cancelled).
  - Live Catalog & Pricing Editor: Edit existing prices, add new seasonal nail packages, or remove retired sets in real-time.
  - Lookbook Photo Uploader: Upload photos or enter image URLs to instantly update the customer-facing gallery.
  - Database Backup: 1-click JSON backup export of all appointments and catalog records.
- **⚡ Offline-First Architecture**:
  - Powered by client-side IndexedDB persistence — requires zero external database hosting fees or backend server daemons.
- **🚀 Dual Production Deployment Ready**:
  - **GitHub Pages**: Automated zero-config deployment via included GitHub Actions workflow.
  - **Hostinger**: Pre-packaged `hostinger-deploy.zip` with Apache & LiteSpeed `.htaccess` SPA router.

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler & Tooling**: Vite 8
- **Styling**: Tailwind CSS v4 + Cormorant Garamond & Plus Jakarta Sans typography
- **Icons**: Lucide React
- **Animations**: Motion
- **Storage**: IndexedDB (Browser client persistence)
- **CI/CD**: GitHub Actions

---

## 📦 How to Upload Directly to GitHub

### Method 1: Using Git Command Line (Recommended & Fastest)

If you have Git installed on your computer, run these commands from the project directory:

```bash
# 1. Initialize git (if not already done)
git init -b main

# 2. Add all project files
git add .

# 3. Create initial commit
git commit -m "feat: initial commit for Fazzynails boutique studio"

# 4. Link your new GitHub repository (replace with your repo URL)
git remote add origin https://github.com/<YOUR-USERNAME>/<YOUR-REPO-NAME>.git

# 5. Push code to GitHub
git push -u origin main
```

---

### Method 2: Using GitHub Web Interface (Drag & Drop)

1. Go to [github.com/new](https://github.com/new) and create a new repository (e.g., `fazzynails-studio`).
2. Do **not** check "Initialize this repository with a README".
3. On the repository page, click the **"uploading an existing file"** link.
4. Drag and drop your project files (excluding `node_modules` and `dist`).
5. Click **Commit changes**.

---

### Method 3: Using GitHub Desktop

1. Open **GitHub Desktop**.
2. Click **File** -> **Add Local Repository** (or press `Ctrl+O` / `Cmd+O`).
3. Select this project's folder.
4. Click **Publish repository** to push it to your GitHub account.

---

## 🌐 Free 1-Click Hosting on GitHub Pages

This repository includes a pre-configured automated GitHub Actions workflow (`.github/workflows/deploy.yml`).

To enable free live hosting on GitHub Pages:

1. Open your repository on GitHub.
2. Click **Settings** (tab at the top).
3. In the left sidebar, click **Pages** (under *Code and automation*).
4. Under **Build and deployment** -> **Source**, select **GitHub Actions**.
5. That's it! Every time you push to the `main` branch, GitHub will automatically build and publish your site at:
   ```
   https://<YOUR-USERNAME>.github.io/<YOUR-REPO-NAME>/
   ```

---

## 💻 Local Development

To run the application locally on your machine:

```bash
# Install dependencies
npm install

# Start local Vite development server (port 3000)
npm run dev

# Run TypeScript type check
npm run lint

# Build production bundle
npm run build

# Build ready-to-upload Hostinger package
npm run build:hostinger
```

---

## 📂 Project Structure

```text
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Pages CI/CD automation
├── public/
│   ├── .htaccess               # Hostinger Apache / LiteSpeed SPA rewrites & gzip
│   ├── _redirects              # Netlify / Cloudflare SPA fallback
│   └── assets/
│       └── aistudio/
│           └── image_d0ec8d5e.png # Official Fazzynails circular gold logo
├── scripts/
│   └── package-hostinger.js    # Automated Hostinger ZIP packager
├── src/
│   ├── components/
│   │   ├── AdminDashboard.tsx  # 2FA Admin panel, pricing editor & booking management
│   │   ├── AdminLoginModal.tsx # Multi-factor authentication login & recovery
│   │   ├── BookingModal.tsx    # Appointment scheduling modal & WhatsApp integration
│   │   ├── Footer.tsx          # Studio location, operating hours & contact details
│   │   ├── GallerySection.tsx  # Lookbook portfolio with category filters
│   │   ├── Header.tsx          # Brand header with logo & navigation
│   │   ├── HeroSection.tsx     # Hero banner with call-to-actions
│   │   ├── InquiriesModal.tsx  # Customer inquiry submission modal
│   │   └── ServicesSection.tsx # Service catalog with price list and booking buttons
│   ├── services/
│   │   └── db.ts               # IndexedDB local storage engine
│   ├── types/
│   │   └── index.ts            # Data models, prices, and business info
│   ├── utils/
│   │   └── format.ts           # Currency (NGN ₦) and date/time formatters
│   ├── App.tsx                 # Main application view & router
│   ├── index.css               # Global Tailwind CSS styles
│   └── main.tsx                # React DOM entry point
├── .gitignore                  # Git ignore rules for node_modules, dist, etc.
├── HOSTINGER_DEPLOYMENT_GUIDE.md # Hostinger cPanel / hPanel guide
├── index.html                  # HTML entry point with SEO metadata
├── package.json                # Project dependencies and npm scripts
├── tsconfig.json               # TypeScript configuration
└── vite.config.ts              # Vite configuration with relative base paths
```

---

## 📞 Studio Contact & Support

- **Business Name**: Fazzynails (Boutique Luxury Nail Tech Studio)
- **Location**: Agbani, Enugu State, Nigeria
- **WhatsApp / Phone**: [+234 907 281 7540](https://wa.me/2349072817540)
- **Facebook**: [facebook.com/share/1FNAEVytV5/](https://www.facebook.com/share/1FNAEVytV5/)
- **Emergency Admin Recovery Key**: `FN-SEC-990142`

---

## 📄 License

Private & Proprietary © Fazzynails Studio. All rights reserved.
