# 🧪 Manual Button Testing Guide

**Server Status**: ✅ Running on http://localhost:5174/  
**Total Buttons**: 103 across 26 components  
**Build Status**: ✅ Verified (0 errors)

---

## 📋 Before You Start

1. **Open Browser**: http://localhost:5174/
2. **Open DevTools**: Press `F12`
3. **Go to Console tab** to watch for errors
4. **Keep Network tab open** to see requests
5. **Mark each test** as ✓ or ✗ as you complete

---

## 🎯 TEST FLOWS (In Order of Priority)

### FLOW 1: Sign Up & Create Ticket
**Status**: 🔴 NOT TESTED YET  
**Expected**: Complete in 5 minutes  
**Critical for**: Core functionality

![Steps](https://via.placeholder.com/300x200)

1. **Navigate to Auth Page**
   - ✓ Click "Get Started" on landing page
   - ✓ Should navigate to `/auth`
   - ✓ Check console for errors

2. **Sign Up**
   - ✓ Click "Sign Up" tab
   - ✓ Enter email (e.g., `patient123@test.com`)
   - ✓ Enter password (e.g., `Test123!`)
   - ✓ Enter name (e.g., `John Doe`)
   - ✓ Check "I agree" checkbox
   - ✓ Click "Create Account" button
   - ✓ Watch for error messages or success notification
   - ✓ Should redirect to `/auth` or `/dashboard`

3. **If Email Verification Required**
   - ✓ Check your email for magic link
   - ✓ Click the link to verify
   - ✓ Should redirect to login

4. **Create Ticket**
   - ✓ Navigate to `/create` (or click "Create Ticket")
   - ✓ Fill in ticket form:
     - Title: `Test Ticket`
     - Description: `Testing ticket creation`
     - Department: Select one
     - Priority: Select one
   - ✓ Click "Submit" button
   - ✓ Should see success message
   - ✓ Should redirect to `/tickets`

5. **Verify in Tickets List**
   - ✓ Should see your ticket in the list
   - ✓ Click on ticket to open detail
   - ✓ All fields should display correctly
   - ✓ Status should show properly

**Result**: _____ (PASS/FAIL)  
**Errors**: _____

---

### FLOW 2: Emergency Ambulance Request
**Status**: 🔴 NOT TESTED YET  
**Expected**: Complete in 10 minutes  
**Critical for**: Emergency functionality

1. **Navigate to Emergency**
   - ✓ Click "Emergency" in sidebar
   - ✓ Should navigate to `/emergency`

2. **Request Ambulance**
   - ✓ Click "Request Ambulance Now" button
   - ✓ Dialog/form should open
   - ✓ Select emergency type (dropdown)
   - ✓ Multiple emergency types should be available
   - ✓ Enter details/notes (if required)

3. **Capture Location (GPS)**
   - ✓ Click "Use GPS" or "Capture Location" button
   - ✓ Browser should ask for location permission
   - ✓ Click "Allow"
   - ✓ Location should be captured (Latitude, Longitude)
   - ✓ Coordinates should display in form

4. **Submit Request**
   - ✓ Click "Request Now" or "Submit" button
   - ✓ Should see loading indicator
   - ✓ Should see success message
   - ✓ Ambulance should appear in request history
   - ✓ If map exists, ambulance location should show on map

5. **Track Ambulance Live** (If Staff)
   - ✓ Staff should see ambulance on map
   - ✓ Location should update in real-time
   - ✓ ETA should be calculated
   - ✓ Status should update (En Route → Arrived)

**Result**: _____ (PASS/FAIL)  
**Errors**: _____  
**Additional Notes**: Requires Mapbox token for full functionality

---

### FLOW 3: Book Appointment
**Status**: 🔴 NOT TESTED YET  
**Expected**: Complete in 8 minutes  
**Critical for**: Medical services

1. **Navigate to Appointments**
   - ✓ Click "Book Appointment" or navigate to `/appointments`
   - ✓ Page should load appointment list and booking interface

2. **Book New Appointment**
   - ✓ Click "Book New Appointment" or "+" button
   - ✓ Booking dialog/form should open
   - ✓ Should be able to select:
     - Doctor (from dropdown)
     - Date (date picker)
     - Time (time picker)
     - Reason for visit (text input or dropdown)

3. **Submit Booking**
   - ✓ Click "Book" or "Confirm" button
   - ✓ Should see success message
   - ✓ Appointment should appear in list
   - ✓ Status should be "Scheduled" or "Confirmed"
   - ✓ Date/time should be selected correctly

4. **Manage Appointment**
   - ✓ Hover over appointment card
   - ✓ Click "Reschedule" button
     - Should open reschedule dialog
     - Can change date/time
     - Click "Update" to save
   - ✓ Click "Cancel" button
     - Should ask for confirmation
     - Click "Confirm Cancel"
     - Status should change to "Cancelled"

5. **Verify Notifications**
   - ✓ Check notification bell
   - ✓ Should see appointment confirmation
   - ✓ Should see reminder (if enabled)

**Result**: _____ (PASS/FAIL)  
**Errors**: _____

---

### FLOW 4: Hospital Services
**Status**: 🔴 NOT TESTED YET  
**Expected**: Complete in 12 minutes  
**Critical for**: All primary services

#### 4A: Token Queue System
1. **Navigate to Token Queue**
   - ✓ Click "Get Token" or navigate to `/token-queue`

2. **Get Token**
   - ✓ Select department from dropdown
   - ✓ Click "Get Token" button
   - ✓ Should see token number
   - ✓ Should see queue position
   - ✓ Should see estimated wait time

3. **Track Position**
   - ✓ Current position should update (without refresh)
   - ✓ ETA should count down
   - ✓ When called, status should change

#### 4B: Pharmacy Services
1. **Navigate to Pharmacy**
   - ✓ Click "Pharmacy" or navigate to `/pharmacy`

2. **Request Medicine**
   - ✓ Click "Request Medicine" button
   - ✓ Form should open with fields:
     - Medicine name (autocomplete/dropdown)
     - Quantity
     - Dosage/Instructions
     - Notes

3. **Submit Request**
   - ✓ Click "Request" button
   - ✓ Should see success message
   - ✓ Request should appear in "My Requests"
   - ✓ Status should be "Pending" → "Ready" → "Collected"

4. **Track Status**
   - ✓ Status should update in real-time
   - ✓ When ready, should see "Pick Up" button
   - ✓ Click "Collect" when medication is picked up

#### 4C: Lab Tests
1. **Navigate to Lab Tests**
   - ✓ Click "Lab Tests" or navigate to `/lab-tests`

2. **View Available Tests**
   - ✓ List of tests should display
   - ✓ Each test should show:
     - Test name
     - Test details
     - Price (if applicable)

3. **Request Test**
   - ✓ Click "Request" button on test
   - ✓ Form should open with details
   - ✓ Click "Confirm" to request
   - ✓ Test should appear in "My Tests"

4. **View Reports**
   - ✓ When ready, "View Report" button appears
   - ✓ Click "View Report"
   - ✓ PDF/Report should open
   - ✓ Click "Download" button
   - ✓ File should download

#### 4D: Billing
1. **Navigate to Billing**
   - ✓ Click "Billing" or navigate to `/billing`

2. **View Bills**
   - ✓ List of bills should display
   - ✓ Each bill shows:
     - Description
     - Amount
     - Date
     - Status (Paid/Pending)

3. **Make Payment**
   - ✓ Click "Pay Now" button on pending bill
   - ✓ Payment dialog should open
   - ✓ Payment gateway should load
   - ✓ Click "Pay" button
   - ✓ Confirm payment
   - ✓ Status should change to "Paid"
   - ✓ Receipt should be available

**Result**: _____ (PASS/FAIL)  
**Errors**: _____

---

## 🔘 Individual Button Tests

### 1. Navigation Buttons
| Button | Location | Expected | Result |
|--------|----------|----------|--------|
| Get Started | Landing | Navigates to `/auth` | _____ |
| Dashboard | Sidebar | Navigates to `/dashboard` | _____ |
| Tickets | Sidebar | Navigates to `/tickets` | _____ |
| Settings | Sidebar | Navigates to `/settings` | _____ |
| Ambulance | Sidebar | Navigates to `/emergency` | _____ |
| Admin | Sidebar | Navigates to `/admin` | _____ |
| Appointments | Sidebar | Navigates to `/appointments` | _____ |
| Medical | Sidebar | Navigates to `/medical` | _____ |
| Pharmacy | Sidebar | Navigates to `/pharmacy` | _____ |
| Lab Tests | Sidebar | Navigates to `/lab-tests` | _____ |
| Token Queue | Sidebar | Navigates to `/token-queue` | _____ |
| Logout | Header | Logs out user, navigates to `/auth` | _____ |

### 2. Form Buttons
| Button | Location | Expected | Result |
|--------|----------|----------|--------|
| Save Settings | Settings | Saves user settings | _____ |
| Change Password | Settings | Opens password change dialog | _____ |
| Export Data | Settings | Downloads JSON file | _____ |
| Delete Account | Settings | Asks confirmation then deletes | _____ |
| Submit (Create Ticket) | Create | Creates ticket, redirects | _____ |
| Update Status | Ticket Detail | Updates ticket status | _____ |
| Add Comment | Ticket Detail | Adds comment to ticket | _____ |
| Assign | Ticket Detail | Assigns ticket to staff | _____ |
| Save Filter | List Pages | Saves filter preferences | _____ |
| Clear All | Search | Clears all filters | _____ |

### 3. Action Buttons
| Button | Location | Expected | Result |
|--------|----------|----------|--------|
| Request Ambulance | Emergency | Opens request dialog | _____ |
| Use GPS | Emergency | Captures location | _____ |
| Book Appointment | Appointments | Opens booking form | _____ |
| Reschedule | Appointments | Opens reschedule form | _____ |
| Cancel | Appointments | Asks confirmation, cancels | _____ |
| Request Medicine | Pharmacy | Opens request form | _____ |
| Request Test | Lab | Opens test request form | _____ |
| Make Payment | Billing | Opens payment gateway | _____ |
| View Report | Lab | Opens/downloads report | _____ |
| Accept Assignment | Appointments | Confirms doctor acceptance | _____ |

### 4. Modal/Dialog Buttons
| Button | Location | Expected | Result |
|--------|----------|----------|--------|
| Close | All Dialogs | Closes dialog | _____ |
| Cancel | All Dialogs | Closes w/o saving | _____ |
| Confirm | All Dialogs | Confirms and saves | _____ |
| OK | All Alerts | Closes alert | _____ |

### 5. UI Interaction Buttons
| Button | Location | Expected | Result |
|--------|----------|----------|--------|
| Theme Toggle | Header | Switches light/dark | _____ |
| Notifications Bell | Header | Opens notifications | _____ |
| Search | Header | Opens search dialog | _____ |
| Profile Menu | Header | Opens user menu | _____ |
| Notification Close | Notification | Dismisses notification | _____ |
| Mark as Read | Notifications | Marks notification as read | _____ |
| Delete Notification | Notifications | Deletes notification | _____ |

### 6. Voice Input
| Button | Location | Expected | Result |
|--------|----------|----------|--------|
| Mic (Title) | Create Ticket | Records title | _____ |
| Mic (Description) | Create Ticket | Records description  | _____ |
| Mic (Search) | Tickets | Voice search | _____ |
| Mic (Notes) | Appointments | Voice notes | _____ |

---

## 📊 Real-Time Features Test

### 🔄 Notifications
- [ ] Open app in two different tabs/windows
- [ ] In Tab 1: Create a ticket
- [ ] In Tab 2: Should see notification instantly
- [ ] Click notification: Should open ticket
- [ ] Mark as read: Status should update

### 🗺️ Ambulance Tracking
- [ ] Staff: Request ambulance update from admin
- [ ] Patient: Should see location update on map
- [ ] Location should change every few seconds
- [ ] No page refresh needed

### 💬 Chat Messages
- [ ] Open chat in two tabs
- [ ] Send message from Tab 1
- [ ] Receive in Tab 2 instantly
- [ ] Typing indicator should work
- [ ] File upload should work

### 📋 Ticket Status Updates
- [ ] Staff: Update ticket status
- [ ] Patient: See status change without refresh
- [ ] Timeline should update
- [ ] Notification should appear

---

## ⚠️ Known Issues to Check

- [ ] **Maps not loading**
  - Fix: Add `VITE_MAPBOX_TOKEN` to `.env`
  - Command: Add your Mapbox token

- [ ] **Ai features unavailable**
  - Fix: Add `VITE_OPENAI_API_KEY` to `.env`
  - Command: Add your OpenAI API key

- [ ] **Notifications not working**
  - Fix: Enable Realtime in Supabase project settings
  - Go to: Supabase → Project → Realtime → Enable

- [ ] **Database operations failing**
  - Fix: Verify Supabase connection in Settings
  - Should show "Connected" status

- [ ] **Voice input not working**
  - Fix: Allow microphone permission
  - Policy: https://microphone-permission-site.com

---

## 🐛 Debugging Checklist

When a button doesn't work:

### Step 1: Check Console
```
Press F12 > Console tab
Look for red error messages
Note the exact error
```

### Step 2: Check Network
```
Press F12 > Network tab
Click the button
Look for failed requests (red)
Note the response
```

### Step 3: Check Backend
```
If error mentions "404" or "500":
- Endpoint doesn't exist
- Server error occurred
Check: Backend server logs
```

### Step 4: Check Database
```
If error mentions "database" or "query":
- Check Supabase connection
- Verify migrations applied
- Check table permissions
```

### Step 5: Report Issue
Report with:
- Button name
- What you clicked
- What happened (or didn't happen)
- Error message from console
- Network response

---

## ✅ Completion Checklist

### Authentication
- [ ] Sign up works
- [ ] Email verification works
- [ ] Sign in works
- [ ] Logout works
- [ ] Forgot password works (if implemented)
- [ ] Google OAuth works (if token configured)

### Dashboard
- [ ] All service cards load
- [ ] Navigation to each service works
- [ ] Quick stats display correctly
- [ ] Recent tickets show
- [ ] Quick actions available

### Tickets
- [ ] Create ticket works
- [ ] View ticket list works
- [ ] Search/filter works
- [ ] Open ticket detail works
- [ ] Update status works
- [ ] Add comment works
- [ ] Delete ticket works (if allowed)

### Emergency
- [ ] Request ambulance works
- [ ] GPS capture works
- [ ] Location shows on map
- [ ] Real-time tracking works
- [ ] Staff can assign

### Appointments
- [ ] Book appointment works
- [ ] View appointments works
- [ ] Reschedule works
- [ ] Cancel works
- [ ] Get notifications

### Medical Services
- [ ] Request medicine works
- [ ] View medicine requests works
- [ ] Mark as collected works
- [ ] Request lab test works
- [ ] Download report works

### Settings
- [ ] View settings works
- [ ] Save settings works
- [ ] Change password works
- [ ] Export data works
- [ ] Theme toggle works

### Admin Features
- [ ] View all information
- [ ] Assign ambulances
- [ ] Manage staff
- [ ] View analytics
- [ ] Manage users

### Real-Time
- [ ] Notifications appear instantly
- [ ] Ambulance tracking updates
- [ ] Chat messages sync
- [ ] Status updates appear

---

## 📝 Testing Notes

**Date**: _________  
**Tester**: _________  
**System**: Windows / Mac / Linux  
**Browser**: _________  
**Browser Version**: _________

### Summary
- Total Buttons Tested: _____ / 103
- Passed: _____
- Failed: _____
- Blocked: _____ (due to missing config)

### Critical Issues Found
1. _________
2. _________
3. _________

### Non-Critical Issues
1. _________
2. _________

### Performance Notes
- App load time: _____ seconds
- Button response time: _____ ms
- Slowest operation: _________

### Recommendations
1. _________
2. _________

---

## 🚀 Next Steps

1. **If all tests pass**: ✅ System is ready for production
2. **If some tests fail**: 📋 Document issues and create bug tickets
3. **If critical tests fail**: 🛑 Don't deploy, fix issues first
4. **If external API tests fail**: 🔧 Add required environment variables

---

## 📞 Support

If buttons aren't working:

1. **Check DevTools Console (F12)**
2. **Check Network tab for failed requests**
3. **Verify environment variables (.env)**
4. **Check Supabase connection status**
5. **Review error messages carefully**

**Remember**: Most button issues are due to:
- Missing environment variables (33%)
- Database connection issues (25%)
- Permission/auth issues (20%)
- Missing migrations (15%)
- Other bugs (7%)

Good luck with testing! 🎉
