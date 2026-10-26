# Hostinger Deployment Guide for Fazzynails

Your website has been prepared and built in a **100% deployment-ready format** optimized specifically for **Hostinger Web Hosting (hPanel & cPanel)**.

---

## 📦 What Has Been Prepared

1. **`hostinger-deploy.zip`**:
   - A pre-packaged, compressed archive ready to be uploaded straight to Hostinger.
2. **`dist/` directory**:
   - Contains all compiled production HTML, CSS, JavaScript, icons, images, and the official Fazzynails circular gold logo.
3. **`public/.htaccess` & `dist/.htaccess`**:
   - Pre-configured for Hostinger's Apache and LiteSpeed web servers.
   - Includes **Single Page Application (SPA) URL rewriting** (prevents 404 errors on page reload), **Gzip compression**, browser caching, and security headers.
4. **Vite Base Path (`./`)**:
   - Assets are configured with relative root paths so the site works immediately whether hosted on a main domain (`fazzynails.com`), subdomain, or subdirectory.

---

## 🚀 Step-by-Step Instructions: Deploy to Hostinger

### Method 1: Using Hostinger File Manager (Recommended – Takes 2 Minutes)

1. **Log in to Hostinger hPanel**:
   - Go to [https://hpanel.hostinger.com](https://hpanel.hostinger.com) and log in.
2. **Open File Manager**:
   - In your Hostinger dashboard, select your website/domain and click **File Manager** (under *Files*).
3. **Navigate to `public_html`**:
   - Double-click on the `public_html` directory (this is your website root).
   - *(Optional)* If there is a default `default.php` or placeholder file, you can delete it.
4. **Upload `hostinger-deploy.zip`**:
   - Click the **Upload** button (icon with an arrow pointing up in the top right menu).
   - Select the `hostinger-deploy.zip` file from your project folder.
5. **Extract the ZIP**:
   - Right-click `hostinger-deploy.zip` in Hostinger File Manager and select **Extract**.
   - Set the destination folder to `public_html` (or `.`).
   - Click **Extract**.
6. **Done!**:
   - The files (`index.html`, `.htaccess`, `assets/`, etc.) are now live in `public_html`.
   - You can safely delete `hostinger-deploy.zip` from File Manager.
   - Visit your domain in your browser!

---

### Method 2: Manual Folder Upload (Without ZIP)

If you prefer not using the ZIP file:
1. Open Hostinger **File Manager** -> `public_html`.
2. Upload all the contents inside the **`dist/`** folder directly into `public_html`:
   - `index.html`
   - `.htaccess`
   - `assets/` folder
   - `_redirects`
3. Verify that `index.html` is located directly in `public_html/index.html` (not inside a subfolder named `dist`).

---

### Method 3: Upload via FTP (FileZilla / Cyberduck)

1. Retrieve your FTP credentials from Hostinger hPanel under **FTP Accounts**.
2. Connect using FileZilla:
   - **Host**: your domain or Hostinger server IP
   - **Username**: your FTP username
   - **Port**: 21
3. Open `public_html` on the remote server.
4. Upload all files from your local `dist/` directory into `public_html`.

---

## 🛡️ Admin Portal & 2FA on Hostinger

- **Admin Access**:
  - Click the Shield icon in the top navigation bar or the footer.
- **Passcode**:
  - Enter the administrator security passcode.
- **2FA Verification**:
  - Enter the 6-digit Time-Based Verification Code or use the direct 1-click **Send 2FA to WhatsApp** button.
- **Emergency Master Recovery Key**:
  - `FN-SEC-990142`
- **Data Persistence**:
  - All customer appointments, messages, rate changes, and lookbook gallery photos are saved directly in browser IndexedDB.

---

## 🔁 How to Rebuild for Hostinger in the Future

Whenever you make code or design updates, simply run:
```bash
npm run build:hostinger
```
This will automatically recompile Vite assets and regenerate `hostinger-deploy.zip`.
