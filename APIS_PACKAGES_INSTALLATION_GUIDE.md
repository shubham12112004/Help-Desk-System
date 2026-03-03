# 📚 HOSPITAL HELP DESK - APIs, PACKAGES & INSTALLATION GUIDE

## 🌐 APIs & INTEGRATIONS USED

### 1. **Supabase** (Primary Backend)
- **Purpose:** Database, Authentication, Real-time subscriptions, Storage
- **Website:** https://supabase.com
- **What it does:**
  - PostgreSQL database
  - User authentication & authorization
  - Row Level Security (RLS)
  - Real-time subscriptions via WebSockets
  - File storage for attachments
- **Configuration:** `.env` file
  ```env
  VITE_SUPABASE_URL=your-project-url
  VITE_SUPABASE_ANON_KEY=your-anon-key
  ```

### 2. **Razorpay** (Payment Gateway)
- **Purpose:** Process payments (UPI, Cards, Net Banking, Wallets)
- **Website:** https://razorpay.com
- **What it does:**
  - Accept online payments
  - UPI/Cards/Net Banking
  - PCI-DSS compliant
  - Payment tracking & webhooks
- **Configuration:** `.env` file
  ```env
  VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxx
  VITE_RAZORPAY_KEY_SECRET=your-secret-key
  ```

### 3. **OpenAI API** (AI Chatbot - Optional)
- **Purpose:** AI-powered features
- **Website:** https://openai.com
- **What it does:**
  - AI chatbot for patient queries
  - Ticket priority detection
  - Auto-reply suggestions
  - Smart categorization
- **Configuration:** `.env` file
  ```env
  VITE_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx
  ```

### 4. **Groq API** (Free AI Alternative - Optional)
- **Purpose:** Alternative to OpenAI for AI features
- **Website:** https://console.groq.com
- **What it does:**
  - Same features as OpenAI but FREE
  - Faster response times
  - Better for development
- **Configuration:** `.env` file
  ```env
  VITE_GROQ_API_KEY=your-groq-api-key
  VITE_CHATBOT_API_PROVIDER=groq
  ```

### 5. **Mapbox** (Maps & Geolocation)
- **Purpose:** Ambulance tracking & location services
- **What it does:**
  - Interactive maps
  - Real-time ambulance tracking
  - GPS location capture
  - Route calculation & ETA
- **Included:** Via CDN in HTML (no API key needed for basic use)

---

## 📦 PACKAGES & DEPENDENCIES EXPLAINED

### **Frontend Framework**

#### React 18.3.1
- Modern JavaScript library for building UIs
- Component-based architecture
- Fast virtual DOM
- **Used for:** All page components and UI

#### Vite 5.4.19
- Ultra-fast build tool
- Hot module replacement (HMR)
- Lightning-fast dev server
- **Used for:** Development server and production builds

---

### **UI Component Libraries**

#### Radix UI (@radix-ui/react-*)
- 25+ components (Dialog, Select, Tabs, etc.)
- Unstyled, accessible components
- Fully customizable
- **Used for:** Modals, dropdowns, forms, dialogs

#### Shadcn/ui (via components/)
- Built on top of Radix UI
- Pre-styled with Tailwind CSS
- Copy-paste components
- **Used for:** Buttons, cards, forms, layout

#### Tailwind CSS 3.4.17
- Utility-first CSS framework
- Responsive design
- Dark mode support
- **Used for:** All styling throughout the app

#### Lucide React (Icons)
- 1000+ beautiful icons
- Lightweight and customizable
- **Used for:** All icons (Ambulance, Ticket, etc.)

---

### **State Management & Data Fetching**

#### TanStack Query 5.83.0 (React Query)
- Server state management
- Automatic caching
- Background refetching
- **Used for:** API calls, data synchronization

#### React Hook Form 7.61.1
- Form validation and handling
- Less re-renders
- Easy integration with Zod
- **Used for:** All forms (Create Ticket, Request Ambulance, etc.)

#### Zod 3.25.76
- TypeScript-first schema validation
- Type-safe forms
- Error messages
- **Used for:** Form validation

---

### **Database & Backend**

#### @supabase/supabase-js 2.95.3
- JavaScript client for Supabase
- Real-time subscriptions
- Authentication
- Database queries
- **Used for:** All database operations

---

### **Payment Integration**

#### Razorpay SDK (via CDN)
- Payment gateway integration
- UPI, Cards, Wallets
- Loaded via script tag in HTML
- **Used for:** Processing bill payments

---

### **Maps & Location**

#### Mapbox GL 3.18.1
- Interactive maps
- Custom markers
- Route visualization
- **Used for:** Ambulance tracking map

#### @mapbox/mapbox-gl-directions 4.3.1
- Turn-by-turn directions
- Route calculation
- **Used for:** Ambulance routing

---

### **Date & Time**

#### date-fns 3.6.0
- Modern date utility library
- Lightweight (Moment alternative)
- **Used for:** Date formatting and calculations

#### moment 2.30.1
- Date manipulation library
- Timezone support
- **Used for:** Legacy date operations

---

### **Charts & Visualization**

#### Recharts 2.15.4
- React charting library
- Bar, Line, Pie charts
- Responsive charts
- **Used for:** Admin dashboard analytics

---

### **UI Utilities**

#### Sonner 1.7.4
- Beautiful toast notifications
- Position control
- Promise-based
- **Used for:** Success/error messages

#### Next Themes 0.3.0
- Dark mode support
- System theme detection
- **Used for:** Theme switching

#### class-variance-authority
- Dynamic class name composition
- Type-safe variants
- **Used for:** Component styling variations

#### clsx & tailwind-merge
- Conditional class names
- Merge Tailwind classes
- **Used for:** Dynamic styling

---

### **Routing**

#### React Router DOM 6.30.1
- Client-side routing
- Protected routes
- Navigation
- **Used for:** All page navigation

---

### **TypeScript & Build Tools**

#### TypeScript
- Type safety
- Better IDE support
- Fewer runtime errors
- **Used for:** Type definitions

#### Vite
- Build tool
- Dev server
- HMR (Hot Module Replacement)
- **Used for:** Development and production builds

---

## 📥 DOWNLOAD & INSTALLATION GUIDE

### **Prerequisites**

Before starting, install:
- **Node.js** (v18 or higher) - https://nodejs.org
- **Git** (optional) - https://git-scm.com
- **VS Code** (recommended) - https://code.visualstudio.com

---

### **Method 1: Download from Current Location**

If you're already in the project folder:

```bash
# You already have the project at:
C:\Users\raosh\Downloads\Help+Desk

# Just install dependencies:
npm install

# Start dev server:
npm run dev
```

---

### **Method 2: Clone from GitHub** (If hosted)

```bash
# Clone repository
git clone https://github.com/your-username/hospital-helpdesk.git

# Navigate to folder
cd hospital-helpdesk

# Install dependencies
npm install

# Copy environment file
copy .env.example .env

# Edit .env with your API keys

# Start development server
npm run dev
```

---

### **Method 3: Download as ZIP**

1. Compress the `Help+Desk` folder
2. Send to another computer
3. Extract the ZIP file
4. Open terminal in that folder
5. Run:
   ```bash
   npm install
   npm run dev
   ```

---

## ⚙️ COMPLETE SETUP STEPS

### **Step 1: Install Node.js**
```bash
# Check if installed:
node --version
npm --version

# Should show v18+ and v9+
```

Download from: https://nodejs.org

---

### **Step 2: Install Dependencies**

```bash
# Open terminal in project folder
cd "C:\Users\raosh\Downloads\Help+Desk"

# Install all packages (this downloads all dependencies)
npm install

# Wait 2-5 minutes (downloads ~200MB of packages)
```

This installs ALL packages listed in `package.json`:
- React, Vite, Tailwind
- Supabase client
- All UI components
- All utilities

---

### **Step 3: Configure Environment Variables**

```bash
# Create .env file (if doesn't exist)
copy .env.example .env

# Edit .env file with your API keys
```

**Required variables:**
```env
# Supabase (REQUIRED)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Razorpay (for payments)
VITE_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxx
VITE_RAZORPAY_KEY_SECRET=your-secret

# OpenAI (optional - for AI features)
VITE_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxx

# OR Groq (optional - free alternative)
VITE_GROQ_API_KEY=your-groq-key
VITE_CHATBOT_API_PROVIDER=groq
```

---

### **Step 4: Start Development Server**

```bash
# Start dev server
npm run dev

# Server starts at: http://localhost:5175
```

Open browser: http://localhost:5175

---

### **Step 5: Build for Production**

```bash
# Create production build
npm run build

# Files created in: dist/

# Preview production build
npm run preview
```

---

## 🚀 NPM SCRIPTS EXPLAINED

```json
{
  "dev": "vite",                    // Start development server
  "build": "vite build",            // Build for production
  "build:dev": "vite build --mode development", // Build dev version
  "lint": "eslint .",               // Check code quality
  "preview": "vite preview",        // Preview production build
  "test": "vitest run",             // Run tests once
  "test:watch": "vitest"            // Run tests in watch mode
}
```

**Usage:**
```bash
npm run dev       # Development
npm run build     # Production build
npm run lint      # Check code issues
npm run test      # Run tests
```

---

## 📦 PACKAGE BREAKDOWN BY SIZE

### Large Packages (>5MB)
- **React + React DOM**: Core framework (~1MB)
- **@supabase/supabase-js**: Database client (~500KB)
- **Mapbox GL**: Maps library (~800KB)
- **Recharts**: Charts (~600KB)
- **All Radix UI components**: Combined (~2MB)

### Medium Packages (1-5MB)
- **TanStack Query**: State management
- **React Router**: Navigation
- **React Hook Form**: Form handling
- **Tailwind CSS**: Styling framework

### Small Packages (<1MB)
- **Lucide Icons**: Icons
- **date-fns**: Date utilities
- **Sonner**: Toast notifications
- **Zod**: Schema validation

**Total Download Size:** ~200-300 MB (during npm install)
**Production Bundle:** ~2-3 MB (after build)

---

## 🔧 BACKEND DEPENDENCIES (Optional)

If using the Backend folder (Express server):

```json
{
  "express": "Web server framework",
  "mongoose": "MongoDB database ORM",
  "nodemailer": "Send emails",
  "cors": "Cross-origin requests",
  "dotenv": "Environment variables"
}
```

**Install backend:**
```bash
cd Backend
npm install
node server.js
```

---

## 🌟 KEY FEATURES BY PACKAGE

| Feature | Package Used | Purpose |
|---------|-------------|---------|
| **Create Ticket** | React Hook Form, Zod | Form validation |
| **Real-time Updates** | Supabase JS | WebSocket subscriptions |
| **Payment Processing** | Razorpay SDK | Accept payments |
| **Maps & Tracking** | Mapbox GL | Ambulance location |
| **AI Chatbot** | OpenAI API / Groq | Smart responses |
| **Notifications** | Sonner | Toast messages |
| **Charts/Analytics** | Recharts | Data visualization |
| **Authentication** | Supabase Auth | Login/Signup |
| **File Upload** | Supabase Storage | Attachments |
| **Routing** | React Router | Navigation |

---

## 🗂️ PROJECT STRUCTURE

```
Help+Desk/
├── src/
│   ├── components/       # UI components
│   ├── pages/           # Route pages
│   ├── services/        # API integrations
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities
│   └── integrations/    # Supabase config
├── Backend/             # Optional Express server
├── public/              # Static files
├── supabase/            # Database migrations
├── package.json         # Dependencies list
├── .env                 # API keys (create this)
├── .env.example         # Template
├── vite.config.js       # Vite configuration
└── tailwind.config.js   # Tailwind configuration
```

---

## 📊 DEPENDENCY TREE (Simplified)

```
Hospital Help Desk App
│
├── React (UI Framework)
│   ├── React Router (Navigation)
│   ├── React Hook Form (Forms)
│   └── React Query (Data fetching)
│
├── Supabase (Backend)
│   ├── Database (PostgreSQL)
│   ├── Authentication
│   ├── Real-time
│   └── Storage
│
├── UI Libraries
│   ├── Radix UI (Components)
│   ├── Tailwind CSS (Styling)
│   └── Lucide Icons
│
├── Payment
│   └── Razorpay SDK
│
├── Maps
│   └── Mapbox GL
│
├── AI (Optional)
│   ├── OpenAI API
│   └── Groq API
│
└── Build Tools
    ├── Vite (Dev server)
    ├── TypeScript
    └── ESLint
```

---

## ⚡ QUICK START COMMANDS

```bash
# 1. Navigate to project
cd "C:\Users\raosh\Downloads\Help+Desk"

# 2. Install everything
npm install

# 3. Create .env file with your API keys
copy .env.example .env

# 4. Start development
npm run dev

# 5. Open browser
# http://localhost:5175
```

---

## 🔍 VERIFY INSTALLATION

After `npm install`, check:

```bash
# Check node_modules folder exists
ls node_modules

# Should see hundreds of folders

# Check package-lock.json created
ls package-lock.json

# Start dev server (should work)
npm run dev
```

**Success indicators:**
- ✅ node_modules folder created (500+ MB)
- ✅ package-lock.json generated
- ✅ Dev server starts without errors
- ✅ Browser opens at http://localhost:5175
- ✅ No red errors in terminal

---

## 🐛 TROUBLESHOOTING DOWNLOADS

### Error: "Cannot find module"
```bash
# Delete and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Error: "Network error"
```bash
# Use different registry
npm install --registry=https://registry.npmjs.org/
```

### Error: "EACCES permission denied"
```bash
# Run as administrator (Windows)
# Or use sudo (Mac/Linux)
```

### Slow download speed
```bash
# Use Yarn instead
npm install -g yarn
yarn install
```

---

## 📖 DOCUMENTATION LINKS

| Package | Documentation |
|---------|--------------|
| React | https://react.dev |
| Vite | https://vitejs.dev |
| Tailwind CSS | https://tailwindcss.com |
| Supabase | https://supabase.com/docs |
| React Query | https://tanstack.com/query |
| React Router | https://reactrouter.com |
| Radix UI | https://radix-ui.com |
| Razorpay | https://razorpay.com/docs |
| Mapbox | https://docs.mapbox.com |
| OpenAI | https://platform.openai.com/docs |

---

## 💡 TIPS FOR NEW DEVELOPERS

1. **Start with package.json** - Understand dependencies
2. **Check .env.example** - Know what keys you need
3. **Read service files** - See how APIs are used
4. **Explore components/** - Understand UI structure
5. **Check pages/** - See main routes

---

## ✅ INSTALLATION CHECKLIST

- [ ] Node.js v18+ installed
- [ ] Project folder downloaded/cloned
- [ ] Opened terminal in project folder
- [ ] Ran `npm install`
- [ ] Created `.env` file
- [ ] Added Supabase URL and key
- [ ] (Optional) Added Razorpay keys
- [ ] (Optional) Added OpenAI/Groq key
- [ ] Ran `npm run dev`
- [ ] Browser opened at localhost:5175
- [ ] No errors in terminal/console

**If all checked → Ready to develop! 🚀**

---

**Total Packages:** 60+ dependencies + 20+ dev dependencies
**Download Size:** ~200-300 MB
**Installation Time:** 2-5 minutes (on good internet)
**Disk Space:** ~500 MB after installation
