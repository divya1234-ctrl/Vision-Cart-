# VisionCart — AI Visual Shopping Assistant & Chrome Extension

VisionCart is a visual search engine and Chrome Extension (Manifest V3) that lets shoppers find exact products, compare prices, and explore alternatives across **Meesho**, **Amazon**, **Flipkart**, **Myntra**, and **Ajio** directly from any shopping image.

---

## Features

- 📸 **Hover Visual Search**: Hover over any product photo on Meesho, Amazon, Flipkart, Myntra, or Ajio to reveal the floating VisionCart search button.
- 🖱️ **Right-Click Context Menu**: Right-click any image on the web and select *"Find product with VisionCart"*.
- ⚡ **1-Click Multi-Store Comparator**: Launches deep visual queries across Meesho, Amazon, Flipkart, Myntra, and Ajio in separate tabs simultaneously.
- 👗 **Multi-Object Separation**: Detects multiple items in single outfit images (e.g. Kurta, Dupatta, Jhumkas, Footwear).
- 🏷️ **Cross-Store Price Benchmarking**: Compares prices between wholesale (Meesho ₹349–₹699) and retail marketplaces.
- 🛡️ **Dual Execution Modes**:
  1. **Deployed Backend Mode**: Uses your deployed server running Google Gemini Vision API.
  2. **100% Serverless Direct Mode**: Simply enter your free Gemini API key into the Chrome Extension popup—zero backend server needed!

---

## 🚀 How to Deploy on GitHub

### Step 1: Push Code to GitHub

If you exported this project or cloned it locally:

```bash
git init
git add .
git commit -m "Initial commit of VisionCart"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/visioncart.git
git push -u origin main
```

*(Alternatively, in Google AI Studio, click the **Export to GitHub** option in the top settings menu).*

---

## 🌐 How to Deploy the Backend (Free on Render, Railway, or Cloud Run)

### Option A: Deploy on Render.com (Recommended Free Hosting)

1. Go to [Render.com](https://render.com/) and create a free account.
2. Click **New +** → **Web Service**.
3. Connect your GitHub repository `visioncart`.
4. Configure the service:
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
5. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
   - `NODE_ENV`: `production`
6. Click **Deploy Web Service**.
7. Copy your new live service URL (e.g. `https://visioncart.onrender.com`).

---

## 🧩 How to Install the Chrome Extension

1. Download the extension ZIP by clicking **Download Extension (.zip)** in the app, or use the `/extension` directory from your cloned repository.
2. Open Chrome, Edge, or Brave and navigate to:
   ```text
   chrome://extensions
   ```
3. Toggle ON **Developer mode** in the top right corner.
4. Click **Load unpacked** in the top left.
5. Select the `extension` folder.
6. The **VisionCart** icon will now appear in your browser extension bar!

---

## ⚙️ Configuring the Extension (2 Ways)

Click the VisionCart puzzle icon in your browser toolbar to open the settings popup:

### Method 1: Using your Deployed Backend (GitHub / Render / Cloud Run)
- Enter your deployed URL in **Backend Server URL** (e.g. `https://visioncart.onrender.com` or `http://localhost:3000`).
- Click **Save Extension Settings**.

### Method 2: 100% Serverless Direct Mode (No server required!)
- Enter your free Gemini API Key in **Direct Gemini API Key**.
- Click **Save Extension Settings**.
- The extension will now analyze product photos on Meesho directly via Gemini 2.5 Flash without needing any backend server running!

---

## 🛍️ Using on Meesho & E-Commerce Websites

1. Open [Meesho.com](https://www.meesho.com/) (or Amazon, Flipkart, Myntra, Ajio).
2. Browse any category (Kurtas, Sarees, T-Shirts, Shoes, Watches, Bags).
3. **Hover** your mouse over any product photo:
   - A golden **VisionCart** button appears at the top right of the photo.
   - Click it to slide open the in-page results drawer!
4. Or **Right-Click** any photo and select **"Find product with VisionCart"**.
5. Inside the drawer:
   - View visual attributes (Color, Pattern, Style, Material).
   - Click **"Compare All 5 Stores in 1 Click"** to find matching items on Meesho, Amazon, Flipkart, Myntra, and Ajio.
   - Inspect wholesale and retail price benchmarks.

---

## 💻 Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env
# Add your GEMINI_API_KEY inside .env

# 3. Start local development server (binds to http://localhost:3000)
npm run dev

# 4. Build for production
npm run build

# 5. Run production build
npm start
```

---

## 📁 Repository Structure

```text
├── extension/             # Chrome Extension (Manifest V3)
│   ├── manifest.json      # Extension permissions and declarative configuration
│   ├── background.js      # Service worker: CORS-free image fetcher & search router
│   ├── content.js         # Injected script: Hover badges & in-page shopping drawer
│   ├── content.css        # Scoped drawer styles matching Meesho/Amazon UI
│   ├── popup.html         # Extension toolbar popup interface & settings
│   └── popup.js           # Settings persistence (Server URL / Gemini Key)
├── server/
│   ├── ai/geminiClient.ts # Gemini 2.5 Flash Vision API integration
│   ├── routes/apiRouter.ts# Visual search, catalog, and extension zip generator
│   └── services/          # Real-world store link generators & price benchmarking
├── src/                   # React 19 Frontend Web Application
│   ├── App.tsx            # Main visual search dashboard & image upload hub
│   └── components/        # Interactive drawer, store simulator, camera, results
├── server.ts              # Express + Vite SSR entry point
└── package.json           # Scripts and dependencies
```
