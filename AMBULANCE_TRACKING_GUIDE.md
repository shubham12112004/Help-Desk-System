# 🚑 Ambulance Tracking System - Setup Guide

## Overview

The Help Desk System now includes a comprehensive ambulance tracking system with real-time GPS location monitoring, route visualization, and automatic ETA calculations.

## ✨ Features Implemented

### Patient Features
- ✅ Request emergency ambulance with GPS location capture
- ✅ Real-time map showing patient and ambulance locations
- ✅ Live distance and ETA updates
- ✅ Route visualization between patient and ambulance
- ✅ Automatic location updates via Supabase Realtime

### Staff/Admin Features
- ✅ Central monitoring dashboard showing all active ambulances
- ✅ Accept and assign ambulances to requests
- ✅ Update ambulance location (manual or GPS)
- ✅ Auto-calculate distance and ETA
- ✅ Real-time sync across all users
- ✅ Interactive map with color-coded markers

---

## 📋 Setup Steps

### Step 1: Apply Database Migration

The location tracking columns need to be added to your database:

1. Run the helper script:
   ```powershell
   .\apply-ambulance-location-migration.ps1
   ```

2. This copies the SQL migration to your clipboard

3. Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Select your project
   - Click **SQL Editor** in left sidebar
   - Click **New query**
   - Press `Ctrl+V` to paste
   - Click **Run** or press `Ctrl+Enter`

4. Verify success - You should see "Success. No rows returned"

**What this adds:**
- `user_latitude`, `user_longitude` - Patient GPS coordinates
- `ambulance_latitude`, `ambulance_longitude` - Ambulance GPS coordinates
- `distance_km` - Calculated distance between patient and ambulance
- `eta_minutes` - Estimated time of arrival
- `last_location_update` - Timestamp of last location update

---

### Step 2: Get Mapbox API Token

Mapbox provides 50,000 free map loads per month - plenty for most applications.

1. **Sign up for Mapbox:**
   - Go to [mapbox.com/signup](https://account.mapbox.com/auth/signup/)
   - Create a free account (no credit card required)

2. **Get your token:**
   - After signing in, go to [account.mapbox.com/access-tokens](https://account.mapbox.com/access-tokens/)
   - Copy your **Default public token**
   - It looks like: `pk.eyJ1IjoieW91ciB1c2VybmFtZSIsImEiOiJjbGJjZGVmIn0...`

3. **Add token to `.env` file:**
   - Open `.env` in your project root
   - Find the line: `VITE_MAPBOX_TOKEN=YOUR_MAPBOX_TOKEN_HERE`
   - Replace `YOUR_MAPBOX_TOKEN_HERE` with your actual token:
   ```dotenv
   VITE_MAPBOX_TOKEN=pk.eyJ1IjoieW91cnRva2VuaGVyZSIsImEiOiJjbGJjZH0...
   ```

4. **Restart dev server:**
   ```powershell
   npm run dev
   ```

**Important:** Never commit your `.env` file to git. It's already in `.gitignore`.

---

### Step 3: Add Monitoring Page to App

We need to add a route to access the admin monitoring dashboard:

**Update your routing (in `App.jsx` or wherever routes are defined):**

```jsx
import { AdminAmbulanceMonitor } from '@/components/AdminAmbulanceMonitor';

// Add this route (staff/admin only):
<Route 
  path="/ambulance-monitor" 
  element={
    <RoleBasedRoute requiredRole="staff">
      <AppLayout>
        <AdminAmbulanceMonitor />
      </AppLayout>
    </RoleBasedRoute>
  } 
/>
```

---

## 🎯 How to Use

### For Patients

1. **Request Ambulance:**
   - Go to Dashboard → Emergency Services → Ambulance
   - Click **"Request Ambulance Now"**
   - Fill in:
     - Emergency type (Accident, Chest Pain, etc.)
     - Location (address)
     - Click **"Use GPS"** button to capture exact coordinates
     - Contact number
   - Click **"Request Now"**

2. **Track Ambulance:**
   - Once staff assigns an ambulance, a map will appear
   - **Red marker** = Your location
   - **Blue pulsing marker** = Ambulance location
   - **Dashed line** = Route between you and ambulance
   - **Cards below map** show:
     - Distance in km
     - ETA in minutes
     - Ambulance status

3. **Real-time Updates:**
   - Map updates automatically when ambulance moves
   - No need to refresh page
   - Notifications for status changes

---

### For Staff/Admin

1. **Access Monitoring Dashboard:**
   - Go to `/ambulance-monitor` route
   - You'll see:
     - **Large map** showing all active ambulances
     - **Statistics cards** (Requested, Assigned, En Route, Arrived)
     - **Request list** on the right side

2. **Accept and Assign Ambulance:**
   - Click on any request in the list
   - Click **"Manage"** button
   - Fill in:
     - Status (Assigned, Dispatched, etc.)
     - Ambulance number (e.g., AMB-1234)
     - Driver name
     - Driver contact
     - Click **"Get Current Location"** to capture ambulance GPS
   - Distance and ETA will auto-calculate
   - Click **"Update Request"**

3. **Update Ambulance Location:**
   - Click **"Manage"** on any active request
   - Click **"Get Current Location"** button
   - Or manually enter latitude/longitude
   - Distance and ETA update automatically
   - Patient sees updated location immediately

4. **Monitor All Ambulances:**
   - **Red markers** = Patients waiting
   - **Blue pulsing markers** = Active ambulances
   - **Dashed lines** = Routes
   - Click any marker for details popup
   - Map auto-fits to show all active requests

---

## 🗺️ Map Features

### Patient View (AmbulanceMapView)
- Shows single ambulance tracking your request
- Updates every time staff updates ambulance location
- Clean, focused view with status cards

### Admin View (AdminAmbulanceMonitor)
- Shows ALL active ambulances on one map
- Color-coded by request status
- Clicking request in list highlights on map
- Real-time updates via Supabase Realtime
- Statistics dashboard

---

## 🔧 Technical Details

### Components Created

| Component | Purpose | Location |
|-----------|---------|----------|
| `AmbulanceMapView.jsx` | Patient's tracking map | `src/components/` |
| `AdminAmbulanceMonitor.jsx` | Staff monitoring dashboard | `src/components/` |
| `StaffAmbulanceActions.jsx` | Staff management dialog | `src/components/` |
| `AmbulanceCard.jsx` (updated) | Patient request interface | `src/components/` |

### Database Columns Added

```sql
user_latitude DECIMAL(10, 8)        -- Patient GPS latitude
user_longitude DECIMAL(11, 8)       -- Patient GPS longitude
ambulance_latitude DECIMAL(10, 8)   -- Ambulance GPS latitude
ambulance_longitude DECIMAL(11, 8)  -- Ambulance GPS longitude
distance_km DECIMAL(6, 2)           -- Calculated distance
eta_minutes INT                     -- Estimated time of arrival
last_location_update TIMESTAMPTZ    -- Last update timestamp
```

### How It Works

1. **Patient requests ambulance:**
   - Browser asks for location permission
   - GPS coordinates captured via navigator.geolocation
   - Coordinates saved with request in database

2. **Staff assigns ambulance:**
   - Staff opens request in admin panel
   - Clicks "Get Current Location" to capture ambulance GPS
   - System calculates distance using Haversine formula
   - ETA estimated based on 40 km/h average speed
   - All data saved to database

3. **Real-time updates:**
   - Supabase Realtime subscription watches ambulance_requests table
   - When staff updates location, all connected clients receive update
   - Maps re-render with new coordinates
   - No polling, no manual refresh needed

4. **Map rendering:**
   - Mapbox GL JS library for interactive maps
   - Custom markers with SVG icons
   - Route lines drawn using GeoJSON LineString
   - Auto-fit bounds to show all relevant markers

---

## 🎨 Customization

### Modify Average Speed for ETA

In `StaffAmbulanceActions.jsx`, line ~98:
```javascript
const avgSpeed = 40; // Change this (km/h)
```

### Change Marker Colors

In map components, search for marker creation:
```javascript
// For red patient marker:
fill="#ef4444"  // Change to any color

// For blue ambulance marker:
fill="#3895ff"  // Change to any color
```

### Adjust Map Zoom Levels

In map initialization:
```javascript
zoom: 13  // Higher = more zoomed in (1-20)
```

---

## 🐛 Troubleshooting

### Maps Not Loading

**Issue:** Blank gray box instead of map

**Solutions:**
1. Check `.env` file has correct Mapbox token
2. Restart dev server after adding token
3. Check browser console for API errors
4. Verify token at [mapbox.com/account](https://account.mapbox.com/access-tokens/)

### GPS Not Working

**Issue:** "Use GPS" button fails

**Solutions:**
1. Allow location permission in browser
2. Use HTTPS (localhost is okay for testing)
3. Check browser supports geolocation
4. Try in different browser (Chrome/Edge work best)

### Distance/ETA Not Calculating

**Issue:** Shows 0 km or blank ETA

**Solutions:**
1. Ensure both patient AND ambulance have GPS coordinates
2. Check database has all location columns
3. Verify migration was applied successfully
4. Look for errors in browser console

### Real-time Updates Not Working

**Issue:** Map doesn't update when location changes

**Solutions:**
1. Check Supabase Realtime is enabled in project
2. Verify subscription in browser dev tools (Network tab)
3. Look for WebSocket connection in console
4. Refresh page to re-establish connection

### Markers Not Showing

**Issue:** Map loads but no markers appear

**Solutions:**
1. Check requests have valid latitude/longitude values
2. Verify coordinates are in correct format (not null, not 0)
3. Look for JavaScript errors in console
4. Check marker creation code hasn't been modified

---

## 📊 Usage Statistics

Mapbox free tier includes:
- 50,000 map loads per month
- Unlimited users
- Full API access
- No credit card required

**Calculation:**
- Each page load = 1 map load
- If 100 users check map 5 times/day = 15,000/month
- Well within free tier limits

**When to upgrade:**
- Need more than 50k loads/month
- Want advanced features (3D, satellite imagery)
- Require commercial support

---

## 🔒 Security Notes

- GPS coordinates stored in database (secure)
- Only staff can update ambulance locations
- Patients can only see their own requests
- Admin/staff can see all requests (via RLS policies)
- Mapbox token is public (safe to expose in frontend)
- Never store sensitive info in map popups

---

## ⚡ Performance Tips

1. **Reduce updates:** Don't update ambulance location every second
2. **Limit map renders:** Debounce location updates
3. **Clean up markers:** Remove old markers when not needed
4. **Optimize queries:** Only fetch active requests (not completed)
5. **Use CDN:** Mapbox serves assets globally

---

## 🎓 Learning Resources

- [Mapbox GL JS Documentation](https://docs.mapbox.com/mapbox-gl-js/api/)
- [GeoJSON Format](https://geojson.org/)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)
- [Web Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)

---

## ✅ Testing Checklist

Before deploying to production:

- [ ] Applied database migration successfully
- [ ] Added Mapbox token to `.env`
- [ ] Tested patient ambulance request with GPS
- [ ] Tested staff accept and assign flow
- [ ] Verified real-time updates work
- [ ] Checked maps load on different devices
- [ ] Tested with multiple simultaneous requests
- [ ] Verified distance/ETA calculations accurate
- [ ] Tested GPS location capture works
- [ ] Confirmed admin monitoring dashboard accessible

---

## 🆘 Emergency Fallback

If maps stop working:

1. **Fallback to address only:**
   - System still works without GPS
   - Users can enter address manually
   - Staff can coordinate via phone

2. **Check status:**
   - [Mapbox Status Page](https://status.mapbox.com/)
   - [Supabase Status](https://status.supabase.com/)

3. **Quick fixes:**
   - Clear browser cache
   - Restart dev server
   - Check API token validity
   - Verify database connection

---

## 📱 Mobile Support

The tracking system is fully responsive:

- **Mobile browsers:** Full GPS support
- **Tablets:** Optimized touch controls
- **Desktop:** Mouse and keyboard navigation
- **PWA-ready:** Can be installed as app

---

## 🚀 Future Enhancements

Potential features to add:

- [ ] Push notifications for status updates
- [ ] SMS alerts with tracking link
- [ ] Voice directions for drivers
- [ ] Traffic-aware ETA calculation
- [ ] Historical route playback
- [ ] Driver mobile app
- [ ] QR code for quick access
- [ ] Multi-language support
- [ ] Accessibility improvements

---

## 📞 Support

If you encounter issues:

1. Check this guide first
2. Look at browser console errors
3. Verify all setup steps completed
4. Check Supabase and Mapbox dashboards
5. Review code comments in components

---

## 🎉 Congratulations!

You now have a fully functional ambulance tracking system with:
- ✅ Real-time GPS tracking
- ✅ Interactive maps
- ✅ Automatic distance/ETA calculation
- ✅ Staff management interface
- ✅ Admin monitoring dashboard
- ✅ Live updates via Supabase Realtime

**Next Steps:**
1. Apply the database migration
2. Add your Mapbox token
3. Test with a few requests
4. Show it to stakeholders! 🎊
