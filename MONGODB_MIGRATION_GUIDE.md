# 🔄 MongoDB Migration Guide

## ✅ What Has Been Done

### 1. MongoDB Models Created (Backend/models/)
- ✅ **AmbulanceRequest.js** - Patient ambulance requests with GPS tracking
- ✅ **MedicineRequest.js** - Pharmacy medicine requests  
- ✅ **Appointment.js** - Doctor appointments scheduling
- ✅ **TokenQueue.js** - Department token queue system
- ✅ **RoomAllocation.js** - Hospital room bed management
- ✅ **PatientMedicalRecord.js** - Medical records & health history
- ✅ **Billing.js** - Bills & payment tracking
- ✅ **Notification.js** (already existed)
- ✅ **Ticket.js** (already existed)
- ✅ **Profile.js** (already existed)

### 2. Backend API Created (Backend/controllers/ & routes/)
- ✅ **ambulanceController.js** + **ambulanceRoutes.js**
  - POST `/api/ambulance` - Create request
  - GET `/api/ambulance/my-requests` - Get patient requests
  - GET `/api/ambulance` - Get all (staff)
  - PUT `/api/ambulance/:id` - Update request (staff)

- ✅ **medicineController.js** + **medicineRoutes.js**
  - POST `/api/medicine` - Create request
  - GET `/api/medicine/my-requests` - Get patient requests
  - GET `/api/medicine` - Get all (pharmacy)
  - PUT `/api/medicine/:id` - Update request (pharmacy)

- ✅ **appointmentController.js** + **appointmentRoutes.js**
  - POST `/api/appointments` - Create appointment
  - GET `/api/appointments/my-appointments` - Get patient appointments
  - GET `/api/appointments` - Get all (staff)
  - PUT `/api/appointments/:id` - Update appointment
  - DELETE `/api/appointments/:id` - Cancel appointment

- ✅ **hospitalController.js** + **hospitalRoutes.js**
  - POST `/api/hospital/tokens` - Create token
  - GET `/api/hospital/tokens` - Get patient tokens
  - POST `/api/hospital/rooms` - Allocate room
  - GET `/api/hospital/rooms` - Get patient rooms
  - POST `/api/hospital/records` - Create medical record
  - GET `/api/hospital/records` - Get medical records
  - POST `/api/hospital/bills` - Create bill
  - GET `/api/hospital/bills` - Get patient bills

### 3. Frontend Service Wrapper Created
- ✅ **src/services/mongodbService.js** - Complete MongoDB API wrapper
- ✅ **src/services/hospital.mongodb.js** - Hybrid service (MongoDB + Supabase storage)

### 4. Backend Server Updated
- ✅ All new routes registered in `Backend/server.js`

---

## 🚀 How to Complete the Migration

### Step 1: Setup MongoDB Connection

**Option A: MongoDB Atlas (Cloud - Recommended)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account (512 MB free tier)
3. Create cluster → Get connection string
4. Update `Backend/.env`:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/helpdeskDB?retryWrites=true&w=majority
   ```

**Option B: Local MongoDB**
1. Install MongoDB Community: https://www.mongodb.com/try/download/community
2. Start MongoDB service: `net start MongoDB`
3. Update `Backend/.env`:
   ```env
   LOCAL_MONGO_URI=mongodb://127.0.0.1:27017/helpdeskDB
   ```

### Step 2: Install Backend Dependencies
```bash
cd Backend
npm install
```

### Step 3: Start Backend Server
```bash
cd Backend
node server.js
```

You should see:
```
🔄 Attempting MongoDB Atlas connection...
✅ MongoDB Connected Successfully (Atlas)
Server running on port 5001
```

### Step 4: Update Frontend to Use MongoDB

**Option A: Quick Switch (Rename files)**
```bash
# From project root
cd src/services
ren hospital.js hospital.supabase.old.js
ren hospital.mongodb.js hospital.js
```

**Option manually Option B: Manual Update**
Open `src/services/hospital.js` and replace all content with content from `src/services/hospital.mongodb.js`

### Step 5: Verify Frontend Configuration
Check `.env` file has:
```env
VITE_API_URL=http://localhost:5001/api
```

### Step 6: Test the Migration

1. **Start Backend:**
   ```bash
   cd Backend
   node server.js
   ```

2. **Start Frontend:**
   ```bash
   npm run dev
   ```

3. **Test Features:**
   - ✅ Login/Signup (Supabase Auth)
   - ✅ Create ambulance request
   - ✅ Create appointment
   - ✅ Request medicine
   - ✅ Check notifications
   - ✅ View tickets

---

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                    │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Supabase Auth Only                                 │ │
│  │  - Login/Signup                                     │ │
│  │  - Session management                               │ │
│  │  - JWT tokens                                       │ │
│  └────────────────────────────────────────────────────┘ │
│                          ↓                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │  MongoDB API Service (mongodbService.js)            │ │
│  │  - Fetches data from Backend API                   │ │
│  │  - Sends Supabase JWT token in Authorization       │ │
│  └────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Express.js + MongoDB)              │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Middleware: requireSupabaseAuth.js                 │ │
│  │  - Verifies Supabase JWT token                      │ │
│  │  - Extracts user from token                         │ │
│  └────────────────────────────────────────────────────┘ │
│                          ↓                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Controllers handle requests                        │ │
│  │  - ambulanceController.js                           │ │
│  │  - medicineController.js                            │ │
│  │  - appointmentController.js                         │ │
│  │  - hospitalController.js                            │ │
│  └────────────────────────────────────────────────────┘ │
│                          ↓                               │
│  ┌────────────────────────────────────────────────────┐ │
│  │  MongoDB Models (Mongoose schemas)                  │ │
│  │  - AmbulanceRequest, MedicineRequest, etc.          │ │
│  └────────────────────────────────────────────────────┘ │
└───────────────────────────┬─────────────────────────────┘
                            │
                            ↓
                    ┌───────────────┐
                    │   MongoDB     │
                    │   Database    │
                    └───────────────┘
```

---

## 📝 What Still Uses Supabase

### 1. Authentication (Supabase Auth)
- User signup/login
- Session management
- JWT token generation
- Password reset

### 2. File Storage (Optional - if you want)
- Lab report uploads
- Ticket attachments
- Profile pictures

### 3. Realtime Subscriptions (Optional)
- Token queue updates
- Notification push updates
- Medicine request status changes

**Note:** You can migrate these to Socket.io or webhooks if you want full MongoDB separation.

---

## 🐛 Troubleshooting

### Error: "Failed to fetch" or "Network request failed"
- ✅ Check Backend server is running on port 5001
- ✅ Check `VITE_API_URL` in frontend `.env`
- ✅ Check CORS is enabled in Backend `server.js`

### Error: "MongoServerError: Authentication failed"
- ✅ Check MongoDB connection string has correct username/password
- ✅ Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for testing)

### Error: "User not authenticated"
- ✅ Check you're logged in with Supabase Auth
- ✅ Check `Authorization: Bearer <token>` header is being sent
- ✅ Check `requireSupabaseAuth` middleware is working

### Error: "Cannot find module"
- ✅ Run `npm install` in Backend folder
- ✅ Check all models are properly exported

---

## ✅ Final Checklist

Before deploying to production:

- [ ] MongoDB Atlas cluster created and connected
- [ ] All environment variables configured in Backend/.env
- [ ] Backend server starts without errors
- [ ] All API endpoints tested (use Postman or Thunder Client)
- [ ] Frontend can create ambulance requests
- [ ] Frontend can create appointments
- [ ] Frontend can request medicines
- [ ] Notifications are working
- [ ] Authentication flow is working
- [ ] Production MongoDB connection string added
- [ ] Backend deployed to Railway/Heroku/Render
- [ ] Frontend VITE_API_URL updated to production backend URL

---

## 🎉 Benefits of This Migration

✅ **No More SQL Errors** - MongoDB uses JSON, no SQL syntax issues  
✅ **Flexible Schema** - Can add fields without migrations  
✅ **Better Performance** - Optimized for JSON documents  
✅ **Easier Deployment** - MongoDB Atlas free tier available  
✅ **Better Scaling** - Horizontal scaling with sharding  
✅ **Simpler Queries** - No complex JOINs needed  

---

## 📞 Need Help?

If you encounter issues:
1. Check Backend console for error messages
2. Check Browser DevTools Network tab
3. Verify MongoDB connection with: `node Backend/test-start.js`
4. Check all .env files are properly configured

**MongoDB Migration Complete! 🚀**
