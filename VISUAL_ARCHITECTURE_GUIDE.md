# 🎨 VISUAL API & PACKAGE ARCHITECTURE

## 📊 SYSTEM ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────┐
│                     Hospital Help Desk System                       │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  Pages (React Router)                                       │   │
│  │  • Landing, Auth, Dashboard, Create Ticket, Emergency       │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  UI Components (Radix UI + Shadcn + Tailwind)              │   │
│  │  • Modals, Forms, Buttons, Cards, Charts                   │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  State Management (TanStack Query)                          │   │
│  │  • Server state caching, Auto-refetch, Background updates  │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                              ↓ API Calls
┌─────────────────────────────────────────────────────────────────────┐
│                        API INTEGRATION LAYER                        │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐            │
│  │  Supabase JS │  │ Razorpay SDK │  │  OpenAI API  │            │
│  │  Client      │  │              │  │  / Groq API  │            │
│  └──────────────┘  └──────────────┘  └──────────────┘            │
│         ↓                  ↓                  ↓                     │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         EXTERNAL SERVICES                           │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    🗄️  SUPABASE                              │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐            │  │
│  │  │ PostgreSQL │  │ Auth (JWT) │  │  Storage   │            │  │
│  │  │  Database  │  │            │  │ (Files)    │            │  │
│  │  └────────────┘  └────────────┘  └────────────┘            │  │
│  │  ┌────────────┐  ┌────────────┐                            │  │
│  │  │ Real-time  │  │ Row Level  │                            │  │
│  │  │ WebSockets │  │  Security  │                            │  │
│  │  └────────────┘  └────────────┘                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              💳  RAZORPAY PAYMENT GATEWAY                    │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐            │  │
│  │  │  UPI/QR    │  │   Cards    │  │ Net Banking│            │  │
│  │  └────────────┘  └────────────┘  └────────────┘            │  │
│  │  ┌────────────┐  ┌────────────┐                            │  │
│  │  │  Wallets   │  │  Payment   │                            │  │
│  │  │            │  │  Webhooks  │                            │  │
│  │  └────────────┘  └────────────┘                            │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │              🤖  AI SERVICES (Optional)                      │  │
│  │  ┌────────────┐  ┌────────────┐                            │  │
│  │  │  OpenAI    │  │   Groq     │                            │  │
│  │  │ GPT-3.5/4  │  │  (Faster)  │                            │  │
│  │  └────────────┘  └────────────┘                            │  │
│  │  • Chatbot  • Priority Detection  • Auto Replies          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │             🗺️   MAPBOX (Maps & Geolocation)                │  │
│  │  • Interactive maps  • Ambulance tracking  • GPS           │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 DATA FLOW DIAGRAM

### Example: Create Ticket Flow

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. USER ACTION                                                  │
│    Patient fills form and clicks "Submit Ticket"                │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2. REACT COMPONENT (CreateTicket.jsx)                          │
│    • Validates form with React Hook Form + Zod                  │
│    • Calls createTicket.mutateAsync()                          │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3. TANSTACK QUERY (useTickets hook)                            │
│    • Manages loading state                                      │
│    • Handles errors                                             │
│    • Caches result                                              │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4. SERVICE LAYER (tickets.js)                                  │
│    • Generates ticket number                                    │
│    • Calls Supabase JS client                                   │
│    • Uploads attachments if any                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5. SUPABASE API                                                 │
│    • Inserts ticket to PostgreSQL                               │
│    • Checks Row Level Security policies                         │
│    • Returns created ticket                                     │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6. REAL-TIME EVENT                                              │
│    • Database triggers INSERT event                             │
│    • WebSocket notification sent to all subscribers             │
│    • Admin dashboard updates automatically                      │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7. UI UPDATE                                                    │
│    • Success toast shown (Sonner)                               │
│    • User redirected to /tickets                                │
│    • Ticket appears in list                                     │
│    • Admin sees notification                                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 PACKAGE DEPENDENCY GRAPH

```
App Root (main.jsx)
│
├─ React 18
│  ├─ react-dom
│  └─ react-router-dom (Navigation)
│
├─ Query Client Provider (TanStack Query)
│  ├─ useQuery (Data fetching)
│  ├─ useMutation (Data updates)
│  └─ QueryCache (Caching)
│
├─ Auth Provider (Supabase Auth)
│  ├─ useAuth hook
│  ├─ ProtectedRoute
│  └─ JWT token management
│
├─ Theme Provider (next-themes)
│  └─ Dark/Light mode
│
├─ Supabase Client (@supabase/supabase-js)
│  ├─ Database queries
│  ├─ Real-time subscriptions
│  ├─ File storage
│  └─ Authentication
│
├─ UI Components Layer
│  ├─ Radix UI (Primitives)
│  │  ├─ Dialog, Select, Tabs
│  │  └─ Dropdown, Popover, etc.
│  │
│  ├─ Shadcn Components (Styled)
│  │  ├─ Button, Card, Input
│  │  └─ Form, Table, etc.
│  │
│  ├─ Tailwind CSS (Styling)
│  │  └─ tailwind-merge, clsx
│  │
│  └─ Lucide React (Icons)
│
├─ Form Management
│  ├─ React Hook Form
│  └─ Zod (Validation)
│
├─ Charts & Visualization
│  └─ Recharts
│
├─ Notifications
│  └─ Sonner (Toasts)
│
├─ Date Handling
│  ├─ date-fns
│  └─ moment
│
├─ Maps
│  ├─ mapbox-gl
│  └─ @mapbox/mapbox-gl-directions
│
└─ External APIs (via fetch)
   ├─ Razorpay SDK (window.Razorpay)
   ├─ OpenAI API (fetch calls)
   └─ Groq API (fetch calls)
```

---

## 🔌 API INTEGRATION DETAILS

### 1. Supabase Integration

```javascript
// Client initialization
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)

// Usage examples:
// Database
await supabase.from('tickets').insert(data)
await supabase.from('tickets').select('*')
await supabase.from('tickets').update(data).eq('id', id)

// Auth
await supabase.auth.signUp({ email, password })
await supabase.auth.signIn({ email, password })
await supabase.auth.getUser()

// Real-time
supabase
  .channel('tickets-channel')
  .on('postgres_changes', 
      { event: 'INSERT', table: 'tickets' },
      (payload) => console.log('New ticket!', payload)
  )
  .subscribe()

// Storage
await supabase.storage
  .from('attachments')
  .upload(path, file)
```

### 2. Razorpay Integration

```javascript
// Load SDK (in HTML)
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>

// Initialize payment
const options = {
  key: RAZORPAY_KEY_ID,
  amount: amountInPaise,
  currency: 'INR',
  name: 'MedDesk Hospital',
  description: 'Payment for Bill',
  handler: function(response) {
    // Success callback
    console.log(response.razorpay_payment_id)
  }
}

const rzp = new Razorpay(options)
rzp.open()
```

### 3. OpenAI Integration

```javascript
// API call
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'gpt-3.5-turbo',
    messages: [
      { role: 'system', content: 'You are a helpful medical assistant' },
      { role: 'user', content: 'What are the symptoms of flu?' }
    ]
  })
})

const data = await response.json()
const reply = data.choices[0].message.content
```

### 4. Groq Integration (Similar to OpenAI)

```javascript
// API call (faster, free)
const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${GROQ_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'mixtral-8x7b-32768',
    messages: [...]
  })
})
```

---

## 🎯 PACKAGE SELECTION RATIONALE

### Why React?
- ✅ Most popular frontend framework
- ✅ Large ecosystem
- ✅ Great for complex UIs
- ✅ Virtual DOM for performance

### Why Vite (not Create React App)?
- ✅ 10x faster dev server
- ✅ Lightning-fast HMR
- ✅ Better build optimization
- ✅ Native ES modules

### Why Supabase (not Firebase)?
- ✅ Open source
- ✅ PostgreSQL (full SQL)
- ✅ Better for complex queries
- ✅ Built-in real-time
- ✅ Row Level Security

### Why TanStack Query (not Redux)?
- ✅ Purpose-built for server state
- ✅ Automatic caching
- ✅ Background refetching
- ✅ Less boilerplate

### Why Tailwind CSS (not Bootstrap)?
- ✅ Utility-first approach
- ✅ No unused CSS
- ✅ Customizable
- ✅ Better performance

### Why Radix UI (not Material UI)?
- ✅ Unstyled (full control)
- ✅ Accessibility built-in
- ✅ Smaller bundle size
- ✅ Modern approach

### Why Razorpay (not Stripe)?
- ✅ Better for India
- ✅ UPI integration
- ✅ Local payment methods
- ✅ Lower fees

---

## 📊 BUNDLE SIZE ANALYSIS

```
Production Build Analysis:

Main Bundle:
├─ React + React DOM ............ 140 KB
├─ Supabase Client .............. 90 KB
├─ TanStack Query ............... 45 KB
├─ React Router ................. 30 KB
├─ Radix UI Components .......... 200 KB
├─ Mapbox GL .................... 600 KB
├─ Recharts ..................... 180 KB
├─ Other utilities .............. 100 KB
└─ App code ..................... 400 KB
                                ─────────
Total (before compression):     ~1.8 MB
Total (gzipped):               ~500 KB

Lazy-loaded chunks:
├─ Admin Dashboard .............. 150 KB
├─ Charts/Analytics ............. 120 KB
├─ Maps (on-demand) ............. 200 KB
└─ AI Features (optional) ....... 80 KB
```

---

## 🔐 SECURITY ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                          │
└─────────────────────────────────────────────────────────────┘

1. Frontend Validation
   ├─ React Hook Form (input validation)
   ├─ Zod schemas (type checking)
   └─ Client-side checks

2. Authentication Layer
   ├─ Supabase Auth (JWT tokens)
   ├─ Protected routes
   └─ Session management

3. Authorization Layer
   ├─ Row Level Security (RLS)
   ├─ Role-based permissions
   └─ User-specific data access

4. Database Security
   ├─ PostgreSQL prepared statements
   ├─ SQL injection prevention
   └─ Encrypted connections

5. Payment Security
   ├─ PCI-DSS compliant (Razorpay)
   ├─ No card data stored
   └─ Secure payment IDs only

6. API Security
   ├─ Environment variables (.env)
   ├─ CORS configuration
   └─ Rate limiting
```

---

## 🚀 PERFORMANCE OPTIMIZATIONS

```
1. Code Splitting
   └─ Dynamic imports for heavy components

2. Lazy Loading
   └─ React.lazy() for routes

3. Image Optimization
   └─ Compressed images in public/

4. Caching Strategy
   └─ TanStack Query automatic caching

5. Real-time Updates
   └─ WebSocket instead of polling

6. Bundle Optimization
   └─ Vite tree-shaking

7. CDN Usage
   └─ Razorpay SDK from CDN
```

---

## 📋 INSTALLATION CHECKLIST WITH VERIFICATION

```bash
# Step 1: Check Node.js
node --version  # Should show v18+
npm --version   # Should show v9+
✅ Node.js installed

# Step 2: Install dependencies
npm install
# Wait 2-5 minutes
✅ Packages downloaded (check node_modules/ exists)

# Step 3: Create .env
copy .env.example .env
# Edit with your keys
✅ Environment configured

# Step 4: Start server
npm run dev
# Should start at localhost:5175
✅ Dev server running

# Step 5: Open browser
http://localhost:5175
✅ App loads without errors

# Step 6: Check console
F12 → Console tab
# Should see no red errors
✅ No console errors

# Step 7: Test navigation
Click around the app
✅ Navigation works

# Step 8: Test features
Create ticket, request ambulance, etc.
✅ Features work
```

---

**Complete guide created! Ready to use 🚀**
