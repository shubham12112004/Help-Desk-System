# 🏥 Hospital Management System - Architecture & Components

## System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    🖥️ USER INTERFACE LAYER                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────── Dashboard ────────────────────────┐ │
│  │                                                            │ │
│  │  👤 Patient Profile  │  🎟️ Token Queue  │  🛏️ Room      │ │
│  │  💊 Medicine         │  🧪 Lab Reports  │  📅 Appt      │ │
│  │  🚑 Ambulance        │  💳 Billing      │  🔔 Notify    │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Header: 🔔 Notifications  👤 Profile  ⚙️ Settings   │ │ │
│  │  │ Sidebar: Links to all modules                         │ │ │
│  │  │ AI Chatbot: 💬 Floating button (always visible)      │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              ⚙️ APPLICATION SERVICES LAYER                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  hospital.js (28 Service Functions)                            │
│  ├─ Token Queue: createToken, getPatientTokens, getCurrentToken
│  ├─ Room: getPatientRoom, createRoomAllocation               │
│  ├─ Medicine: getActivePrescriptions, createMedicineRequest   │
│  ├─ Lab: getLabReports, uploadLabReport                       │
│  ├─ Appointments: createAppointment, cancelAppointment        │
│  ├─ Ambulance: requestAmbulance, getAmbulanceRequests        │
│  ├─ Billing: getPatientBills, makePayment                     │
│  ├─ Notifications: getNotifications, markRead, createNotif   │
│  ├─ AI Chat: createChat, sendMessage, getChatMessages        │
│  └─ Realtime: subscribeToTokenQueue, subscribeToNotifications│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│         🔗 SUPABASE CLIENT SDK (Realtime & API)                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ├─ Authentication (Email, Magic Link, OTP, OAuth)           │
│  ├─ Database Queries (Select, Insert, Update, Delete)        │
│  ├─ Realtime Subscriptions (Live Updates)                    │
│  ├─ Storage (File Uploads for Reports/Invoices)             │
│  └─ Row Level Security (RLS Policies)                        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│          🗄️ SUPABASE DATABASE & REALTIME                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Core Tables:                                                  │
│  ├─ 🔐 auth.users (User authentication)                       │
│  ├─ 👤 profiles (User profiles with patient data)             │
│  └─ 🎫 tickets (Help desk tickets)                            │
│                                                                 │
│  Hospital Tables:                                              │
│  ├─ 🎟️ token_queue (OPD tokens)                               │
│  ├─ 🛏️ room_allocations (Bed assignments)                     │
│  ├─ 💊 prescriptions (Doctor prescriptions)                   │
│  ├─ 📦 medicine_requests (Pharmacy requests)                  │
│  ├─ 🧪 lab_reports (Test results)                             │
│  ├─ 📅 appointments (Doctor appointments)                     │
│  ├─ 🚑 ambulance_requests (Emergency transport)               │
│  ├─ 💳 billing (Payment tracking)                             │
│  ├─ 🔔 notifications (Real-time alerts)                       │
│  ├─ 💬 ai_chats (Chat sessions)                               │
│  └─ 📝 ai_messages (Chat messages)                            │
│                                                                 │
│  Realtime: All tables published to supabase_realtime          │
│  RLS: 40+ security policies (patient/staff/admin access)     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Hierarchy

```
App.jsx
├─ Landing.jsx (Public Home Page)
├─ Auth.jsx (Login/Signup)
└─ ProtectedRoute
   └─ AppLayout
      ├─ ProfessionalHeader
      │  ├─ Search Bar
      │  ├─ NotificationsDropdown 🔔
      │  ├─ ThemeToggle
      │  └─ Profile Menu
      ├─ AppSidebar
      │  ├─ Dashboard Link
      │  ├─ Tickets Link
      │  ├─ Settings Link
      │  ├─ Analytics Link (Staff only)
      │  └─ Logout Button
      ├─ Main Content (Routes)
      │  ├─ Dashboard.jsx
      │  │  ├─ Stats Cards (Ticket Status)
      │  │  └─ Patient Modules (if patient):
      │  │     ├─ PatientProfileCard 👤
      │  │     ├─ TokenQueueSystem 🎟️
      │  │     ├─ RoomAllocationCard 🛏️
      │  │     ├─ MedicineCard 💊
      │  │     ├─ LabReportsCard 🧪
      │  │     ├─ AppointmentsCard 📅
      │  │     ├─ AmbulanceCard 🚑
      │  │     └─ BillingCard 💳
      │  ├─ Tickets.jsx (Ticket list)
      │  ├─ TicketDetail.jsx (Single ticket)
      │  ├─ CreateTicket.jsx (New ticket)
      │  ├─ Settings.jsx (User settings)
      │  ├─ HospitalAnalytics.jsx (Staff only)
      │  └─ StaffRoster.jsx (Staff only)
      ├─ HospitalAIChatbot 💬 (Floating)
      └─ Footer

Data Flow:
  User Action → Component → Service Function → Supabase → Database
                     ↓
              Real-time Subscription
                     ↓
              Update UI (React State)
```

---

## Module Components Structure

### 1️⃣ PatientProfileCard
```
PatientProfileCard
├─ useAuth() → Get user info
├─ Load profile from Supabase
├─ Display grid with:
│  ├─ Avatar + Patient ID
│  ├─ Blood Group
│  ├─ Age & Gender
│  ├─ Contact Info
│  └─ Emergency Contact
└─ Update on profile change
```

### 2️⃣ TokenQueueSystem
```
TokenQueueSystem
├─ State: prescriptions, currentTokens, selectedDept
├─ Load all departments' token status
├─ Subscribe to real-time token updates
├─ UI Elements:
│  ├─ Department selector
│  ├─ "Get Token" button
│  ├─ My Tokens cards (today's)
│  └─ Department queue status grid
└─ Real-time: Updates current token display
```

### 3️⃣ RoomAllocationCard
```
RoomAllocationCard
├─ Load latest room allocation for patient
├─ Fetch doctor & nurse profiles
├─ Display:
│  ├─ Room number + Bed number
│  ├─ Ward type (General/ICU/VIP/Emergency)
│  ├─ Status (Admitted)
│  ├─ Doctor assigned
│  ├─ Nurse assigned
│  ├─ Admission date
│  └─ "Contact Doctor" button
└─ Refresh button for live updates
```

### 4️⃣ MedicineCard
```
MedicineCard
├─ Active Prescriptions Section:
│  ├─ Load from prescriptions table
│  ├─ Filter by status = "active"
│  ├─ Display medicine details
│  └─ "Request Medicine" button per prescription
├─ Medicine Request Dialog:
│  ├─ Picker for delivery/pickup
│  └─ Send request to pharmacy
└─ Delivery Status Section:
   ├─ Load medicine_requests
   ├─ Show delivery progress
   └─ Track status updates
```

### 5️⃣ LabReportsCard
```
LabReportsCard
├─ Load all lab reports for patient
├─ Display per report:
│  ├─ Test name + type
│  ├─ Test date + Result date
│  ├─ Status badge
│  ├─ Progress bar (pending/in-progress)
│  └─ "Download Report" button (if completed)
├─ Real-time status updates
└─ PDF download from Storage
```

### 6️⃣ AppointmentsCard
```
AppointmentsCard
├─ Book Appointment Dialog:
│  ├─ Department selector
│  ├─ Date picker (tomorrow+)
│  ├─ Time slot selector
│  ├─ Reason input (optional)
│  └─ "Book Now" button → createAppointment()
├─ Upcoming Appointments Section:
│  ├─ Load getUpcomingAppointments()
│  ├─ Display per appointment:
│  │  ├─ Department
│  │  ├─ Date + Time
│  │  ├─ Status badge
│  │  ├─ Doctor info (when assigned)
│  │  ├─ "Reschedule" button
│  │  └─ "Cancel" button
│  └─ Real-time status updates
└─ Confirmation notifications
```

### 7️⃣ AmbulanceCard
```
AmbulanceCard
├─ Request Ambulance Dialog:
│  ├─ Emergency type selector
│  ├─ Location input
│  ├─ Phone input
│  ├─ "Request Now" button → requestAmbulance()
│  └─ 911 warning message
├─ Request History Section:
│  ├─ Load getAmbulanceRequests()
│  ├─ Per request show:
│  │  ├─ Emergency type
│  │  ├─ Pickup location
│  │  ├─ Status (requested → dispatched → arrived)
│  │  ├─ Driver info
│  │  ├─ Ambulance number
│  │  └─ ETA
│  └─ Real-time location tracking
└─ Emergency contact number displayed
```

### 8️⃣ BillingCard
```
BillingCard
├─ Summary Cards:
│  ├─ Total Billed (all bills sum)
│  ├─ Pending Amount (unpaid sum)
│  └─ Bills Count
├─ Bills List Section:
│  ├─ Load getPatientBills()
│  ├─ Per bill show:
│  │  ├─ Bill number
│  │  ├─ Amount breakdown (total, paid, pending)
│  │  ├─ Status badge
│  │  ├─ Payment progress bar
│  │  ├─ "Download Receipt" button
│  │  └─ "Pay Now" button (if pending)
├─ Payment Dialog:
│  ├─ Payment amount input
│  ├─ Payment method selector
│  ├─ Secure payment notice
│  └─ "Pay Now" button → makePayment()
└─ Transaction confirmation
```

### 9️⃣ NotificationsDropdown
```
NotificationsDropdown
├─ Bell icon in header
├─ Badge shows unread count
├─ Click to open dropdown:
│  ├─ "Mark all as read" button
│  ├─ Notifications list (limit 50)
│  ├─ Per notification:
│  │  ├─ Icon (based on type)
│  │  ├─ Title
│  │  ├─ Message
│  │  ├─ Time ago
│  │  ├─ Unread indicator
│  │  └─ Click to navigate to source
│  ├─ Real-time new notifications
│  └─ "View all" link
└─ Subscribe to real-time notifications
```

### 🔟 HospitalAIChatbot
```
HospitalAIChatbot
├─ Floating button (bottom-right)
├─ Click to open chat window:
│  ├─ Quick action buttons:
│  │  ├─ "Book Appointment"
│  │  ├─ "Check Token Status"
│  │  ├─ "Medicine Request"
│  │  ├─ "Emergency Help"
│  │  └─ "Room Info"
│  ├─ Chat message area
│  ├─ Message input
│  ├─ Send button
│  └─ Chat history
├─ Load chat history → getChatMessages()
├─ Real-time message updates
└─ Context-aware responses
```

---

## Data Flow Examples

### Example 1: Get OPD Token
```
User Action: Selects "OPD General" and clicks "Get Token"
    ↓
Component: TokenQueueSystem.jsx
    ↓
Service: createToken(userId, "OPD General")
    ↓
Database: INSERT into token_queue
    ↓
Response: { token_number: 42, estimated_wait: 10 }
    ↓
UI Update: Show "Your Token: #42, Current: #40, Wait: 10 min"
    ↓
Realtime: Subscribe to department's current token updates
    ↓
Real-time Update: When current token changes, UI updates instantly
```

### Example 2: Request Medicine
```
User Action: Finds prescription, clicks "Request Medicine"
    ↓
Dialog Opens: Shows prescription details
    ↓
User Confirms: Clicks "Request Now"
    ↓
Service: createMedicineRequest(prescriptionId, "delivery", deliveryAddress)
    ↓
Database: 
  - INSERT into medicine_requests
  - CREATE notification for pharmacy
  - CREATE notification for patient
    ↓
Response: Success confirmation
    ↓
UI Update: 
  - Add to "Delivery Status" section
  - Show status "pending"
  - Toast: "Medicine request placed!"
    ↓
Realtime: Subscribe to request status changes
    ↓
Live Updates: As pharmacy updates status, UI reflects changes
  - pending → in_transit → delivered
```

### Example 3: Make Payment
```
User Action: Views bill, clicks "Pay Now"
    ↓
Dialog Opens: Shows bill details and payment form
    ↓
User Enters: Amount and payment method
    ↓
Validation: Amount ≤ Pending amount
    ↓
Service: makePayment(billId, amount)
    ↓
Database:
  - INSERT payment record
  - UPDATE billing.paid_amount
  - UPDATE billing.pending_amount
  - UPDATE billing.status
  - CREATE notification for patient
    ↓
Response: Success with receipt
    ↓
UI Update:
  - Progress bar increases
  - Status changes (pending → partial → paid)
  - Toast: "Payment processed successfully!"
  - Receipt PDF generated
    ↓
Email: Receipt sent to patient email
```

---

## Real-time Subscription Architecture

```
Component Mount
    ↓
Subscribe to Real-time Channel
    ↓
Supabase Realtime Server
    ├─ Listens for database changes
    ├─ Broadcasts to all subscribed clients
    └─ Sends updates in real-time
    ↓
Component Listener
    ├─ Receives event (INSERT/UPDATE/DELETE)
    ├─ Updates local state
    ├─ Re-renders UI
    └─ Shows live data instantly

Channels:
├─ token_queue:department=* (Token updates per department)
├─ notifications:user_id=* (User-specific notifications)
├─ medicine_requests:patient_id=* (Medicine delivery tracking)
├─ ai_messages:chat_id=* (Chat messages)
└─ Custom channels for each module
```

---

## Security Architecture (RLS Policies)

```
Database Tables
    ↓
Row Level Security (RLS) Enabled
    ↓
Policies Applied:
├─ Patient Role (citizen)
│  ├─ Can view/create own records
│  ├─ Cannot see other patients' data
│  └─ Cannot modify staff records
├─ Staff Role (staff/doctor/nurse)
│  ├─ Can view assigned patients
│  ├─ Can create/update patient records
│  └─ Cannot delete records
└─ Admin Role (admin)
   ├─ Full access to all data
   ├─ Can manage system settings
   └─ Can view analytics

Enforcement:
├─ Supabase checks user role in user_metadata
├─ Queries automatically filtered by policies
├─ Unauthorized queries rejected at database level
└─ No data leakage even if frontend is compromised
```

---

## Performance Optimization

```
Caching Strategy:
├─ Profile data cached at login
├─ Prescriptions refetched on demand
├─ Token status updates via realtime (no polling)
├─ Notifications streamed (not queried)
└─ UI state managed locally

Queries Optimized:
├─ SELECT only needed columns
├─ Limit: 50 items per query
├─ Index on: patient_id, status, created_at
├─ Pagination for large datasets
└─ Avoid N+1 queries (use joins)

Rendering Optimized:
├─ Lazy loading for tabs
├─ Skeleton loaders while loading
├─ Memoized components
├─ Virtual scrolling for long lists
└─ Code splitting per module
```

---

## Technology Stack

| Layer | Tech |
|-------|------|
| **Frontend** | React 18 + Vite 5.4.21 |
| **Routing** | React Router v6 |
| **UI Components** | shadcn/ui + Tailwind CSS |
| **Icons** | Lucide React |
| **Database** | Supabase (PostgreSQL) |
| **Auth** | Supabase Auth (Email, Magic Link, OTP, OAuth) |
| **Realtime** | Supabase Realtime (WebSocket) |
| **Storage** | Supabase Storage (for PDFs) |
| **State Mgmt** | React Context (Auth) + Hooks |
| **Notifications** | Toast (sonner) |
| **Forms** | Native HTML + Dialogs |
| **Dev Server** | Vite (HMR at 5173) |
| **Build** | Vite Bundle |

---

## Deployment Architecture (Ready for Production)

```
                    👥 Users
                     ↓
            ┌─────────────────┐
            │  CDN / Static   │
            │  (Vercel/Netlify)
            └────────┬────────┘
                     ↓
         ┌───────────────────────┐
         │  Vite SPA (React)     │
         │  - Index.html         │
         │  - Bundle.js          │
         │  - Styles.css         │
         │  - Assets             │
         └───────────┬───────────┘
                     ↓
        ┌────────────────────────┐
        │ Supabase Backend       │
        │ ├─ Authentication      │
        │ ├─ API (PostgREST)     │
        │ ├─ Realtime (WebSocket)│
        │ ├─ Storage (S3)        │
        │ └─ Database (PostgreSQL)
        └────────────────────────┘
                     ↓
         ┌───────────────────────┐
         │  PostgreSQL Database  │
         │  - Users              │
         │  - Hospital data      │
         │  - Transactions       │
         └───────────────────────┘
```

---

**System Status:** ✅ Complete & Production Ready
**All 10 Modules:** ✅ Fully Integrated
**Real-time Features:** ✅ Enabled
**Security:** ✅ RLS Policies Applied
**Performance:** ✅ Optimized

🚀 **Ready to Deploy!**
