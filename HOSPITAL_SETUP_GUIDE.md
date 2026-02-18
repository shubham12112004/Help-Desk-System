# Hospital Management System - Setup Guide

## 🚀 Quick Start

### Step 1: Apply Database Migration

1. **Open Supabase Dashboard**
   - Go to your Supabase project at https://supabase.com/dashboard
   - Navigate to **SQL Editor** from the left sidebar

2. **Run the Migration**
   - Copy the entire contents of `supabase/migrations/20260218000000_hospital_management_system.sql`
   - Paste it into the SQL Editor
   - Click **Run** to execute the migration

3. **Verify Tables Created**
   - Go to **Table Editor** in Supabase Dashboard
   - You should see the following new tables:
     - `token_queue`
     - `room_allocations`
     - `prescriptions`
     - `medicine_requests`
     - `lab_reports`
     - `appointments`
     - `ambulance_requests`
     - `billing`
     - `notifications`
     - `ai_chats`
     - `ai_messages`

4. **Check Row Level Security (RLS)**
   - All tables should have RLS enabled
   - Policies should be visible for patient, staff, and admin roles

5. **Enable Realtime**
   - Go to **Database > Replication** in Supabase
   - Ensure all new tables are checked for realtime
   - The migration already adds them to `supabase_realtime` publication

---

## ✅ What's Included

### 🗄️ Database Schema (11 New Tables)

1. **token_queue** - OPD token management
   - Auto-incrementing token numbers per department per day
   - Real-time queue status updates
   - Estimated wait time calculation

2. **room_allocations** - Hospital bed management
   - Room/bed assignments
   - Ward types (General, ICU, VIP, Emergency)
   - Assigned doctor and nurse tracking

3. **prescriptions** - Doctor prescriptions
   - Medicine details with dosage and schedule
   - Active/completed status tracking
   - Patient history

4. **medicine_requests** - Pharmacy requests
   - Linked to prescriptions
   - Delivery/pickup options
   - Status tracking with notifications

5. **lab_reports** - Test results management
   - PDF report storage in Supabase Storage
   - Status workflow (pending → in-progress → completed)
   - Doctor and patient access

6. **appointments** - Doctor appointment bookings
   - Date/time slot management
   - Department-based scheduling
   - Cancellation support

7. **ambulance_requests** - Emergency transport
   - Pickup/destination tracking
   - Emergency type classification
   - Driver assignment and status

8. **billing** - Payment management
   - Bill generation with unique numbers
   - Partial payment support
   - Invoice PDF storage

9. **notifications** - Real-time alerts
   - User-specific notifications
   - Type-based categorization
   - Read/unread status

10. **ai_chats** - AI chatbot conversations
    - Chat session management
    - Title auto-generation

11. **ai_messages** - Chat message history
    - User/assistant messages
    - Timestamp tracking

### 🔧 Services Layer (28+ Functions)

Located in `src/services/hospital.js`:

**Token Queue Services:**
- `createToken()` - Issue new OPD token
- `getPatientTokens()` - Get patient's token history
- `getCurrentToken()` - Get current serving token

**Room Allocation:**
- `getPatientRoom()` - Get current room allocation
- `createRoomAllocation()` - Assign room/bed

**Medicine & Pharmacy:**
- `getActivePrescriptions()` - Get active prescriptions
- `createMedicineRequest()` - Request medicine from pharmacy
- `getMedicineRequests()` - Track delivery status

**Lab Reports:**
- `getLabReports()` - Get patient's lab reports
- `uploadLabReport()` - Upload test results (staff)

**Appointments:**
- `createAppointment()` - Book doctor appointment
- `getUpcomingAppointments()` - View scheduled appointments
- `cancelAppointment()` - Cancel booking

**Ambulance:**
- `requestAmbulance()` - Emergency ambulance request
- `getAmbulanceRequests()` - Track ambulance status

**Billing:**
- `getPatientBills()` - View billing history
- `makePayment()` - Process payment

**Notifications:**
- `getNotifications()` - Get user notifications
- `markNotificationRead()` - Mark as read
- `markAllNotificationsRead()` - Bulk mark as read
- `createNotification()` - Create new notification

**AI Chatbot:**
- `createChat()` - Start new chat session
- `getChats()` - Get chat history
- `getChatMessages()` - Load chat messages
- `sendMessage()` - Send message to chat

**Realtime Subscriptions:**
- `subscribeToTokenQueue()` - Live token updates
- `subscribeToNotifications()` - Live notification alerts
- `subscribeToMedicineRequests()` - Live pharmacy status

### 🎨 UI Components Created

1. **PatientProfileCard** - Patient demographic display
2. **TokenQueueSystem** - Full OPD token management UI
3. **NotificationsDropdown** - Header notification bell with dropdown
4. **HospitalAIChatbot** - Floating AI assistant with quick actions

### 📱 Features Implemented

✅ **OPD Token Queue System**
- Department-wise queue management
- Real-time token number updates
- Estimated wait time display
- "Your turn" notifications

✅ **Smart Notifications**
- Real-time dropdown in header
- Type-based icons (🎟️ token, 💊 medicine, 📅 appointment, etc.)
- Mark as read/unread
- Action URL navigation

✅ **AI Chatbot Assistant**
- Floating button (bottom-right)
- Quick action buttons
- Context-aware responses
- Chat history persistence

✅ **Patient Dashboard**
- Profile card with health info
- Token queue integration
- Ticket stats
- Module cards

---

## 🔐 Security & Access Control

### Role-Based Access (RLS Policies)

**Patient Role (`citizen`):**
- ✅ View/create own tokens
- ✅ View own room allocation
- ✅ View own prescriptions and medicine requests
- ✅ View own lab reports
- ✅ Book/cancel own appointments
- ✅ Request ambulance
- ✅ View own billing
- ✅ Receive notifications
- ✅ Use AI chatbot

**Staff Role (`staff`, `doctor`, `nurse`):**
- ✅ All patient permissions
- ✅ View all tokens in their department
- ✅ Update token status
- ✅ Create/update prescriptions
- ✅ Upload lab reports
- ✅ Manage room allocations
- ✅ Send notifications

**Admin Role (`admin`):**
- ✅ Full access to all data
- ✅ Manage all modules
- ✅ System configuration

---

## 🛠️ Testing the System

### 1. Test Token Queue
```javascript
// From the dashboard
1. Select a department (e.g., "OPD General")
2. Click "Get Token"
3. You should see your token appear with a number
4. Watch for real-time updates as current token changes
```

### 2. Test Notifications
```javascript
// Notifications appear automatically when:
- Token status changes
- Medicine request is created/updated
- Appointment is booked
- Ambulance is requested/assigned
- Lab report is ready
```

### 3. Test AI Chatbot
```javascript
1. Click the floating chat button (bottom-right)
2. Try quick actions: "Book Appointment", "Check Token Status"
3. Or type: "I need medicine" / "Emergency help" / "Check my lab reports"
4. Bot responds with contextual guidance
```

### 4. Test Profile Card
```javascript
// Update your profile with patient data:
1. Go to Settings
2. Add: Blood group, age, contact number, emergency contact
3. View updated info on dashboard
```

---

## 📊 Real-time Features

All modules support **live updates**:

- **Token Queue**: Current token updates without refresh
- **Notifications**: New alerts appear instantly
- **Medicine Requests**: Delivery status changes in real-time
- **Room Allocation**: Live bed availability

---

## 🎨 UI/UX Enhancements

- **Gradient backgrounds** on cards
- **Hover animations** on interactive elements
- **Pulse animations** when it's your turn (token)
- **Type-based badges** for status indicators
- **Responsive design** for mobile/tablet/desktop
- **Dark mode support** throughout

---

## 🚨 Important Notes

1. **Migration is Safe**: The SQL migration only creates new tables and enhances existing ones. It does NOT drop any data.

2. **User Roles**: Make sure users have the correct role in their `user_metadata`:
   ```javascript
   {
     "role": "citizen" // or "staff", "admin", "doctor", "nurse"
   }
   ```

3. **Supabase Storage**: For lab reports and billing invoices, create these buckets:
   - `lab-reports` (public read for patients)
   - `invoices` (public read for patients)

4. **Realtime**: Ensure Supabase realtime is enabled for your project (check project settings).

---

## 📈 Next Steps

To extend the system further:

1. **Create Dedicated Module Pages**:
   - `/appointments` - Full appointment booking interface
   - `/medicine` - Prescription and pharmacy management
   - `/lab-reports` - Test results viewer
   - `/billing` - Payment history and invoices

2. **Add Staff Features**:
   - Token management dashboard for staff
   - Room allocation management panel
   - Prescription creation form for doctors

3. **Integrate OpenAI**:
   - Replace rule-based AI responses with GPT-4
   - Add intelligent ticket creation from chat
   - Auto-categorize and prioritize issues

4. **Analytics Dashboard**:
   - Token queue trends
   - Department workload charts
   - Patient satisfaction metrics

---

## 🐛 Troubleshooting

**Issue: Tables not appearing in Supabase**
- Solution: Check SQL Editor for error messages. Ensure migration ran completely.

**Issue: RLS preventing access**
- Solution: Verify user has correct `role` in `user_metadata`. Check policy names match role values.

**Issue: Realtime not working**
- Solution: Go to Database > Replication and enable all tables in `supabase_realtime` publication.

**Issue: Notifications not appearing**
- Solution: Check browser console for realtime connection errors. Verify Supabase API key is correct.

---

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Verify Supabase connection status
3. Review RLS policies in Supabase Dashboard
4. Check user roles in auth.users table

---

## 🎉 You're All Set!

Your hospital management system is now ready. Apply the database migration and start using the new features!

**Default View for Patients:**
1. Patient profile card (top)
2. Token queue system
3. Ticket stats
4. AI chatbot (floating button)
5. Notifications (header bell icon)

**Components Available:**
- `<PatientProfileCard />` - Patient info
- `<TokenQueueSystem />` - OPD tokens
- `<NotificationsDropdown />` - Alerts dropdown
- `<HospitalAIChatbot />` - AI assistant

Enjoy your new hospital management system! 🏥
