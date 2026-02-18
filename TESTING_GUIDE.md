# MedDesk Testing Guide

## Quick Test Checklist

### ✅ Authentication & Cross-Tab Sync
- [ ] Sign up with email/password
- [ ] Login successfully
- [ ] Open app in new tab - should auto-login
- [ ] Logout in one tab - should logout in all tabs

### ✅ Ticket Creation (CRUD - Create)
- [ ] Navigate to Create Ticket page
- [ ] Fill in title and description
- [ ] AI suggestions appear after typing
- [ ] Accept AI priority suggestion
- [ ] Upload files (drag & drop or click)
- [ ] Preview files before submit
- [ ] Submit ticket successfully
- [ ] Redirect to tickets list

### ✅ Ticket List (CRUD - Read)
- [ ] View all tickets
- [ ] Search by title/ticket number
- [ ] Filter by status tabs
- [ ] Ticket cards show correct info
- [ ] Click ticket opens detail page
- [ ] As citizen: only see your tickets
- [ ] As staff: see all tickets

### ✅ Ticket Detail (CRUD - Read/Update)
- [ ] View full ticket information
- [ ] See creator and assignee info
- [ ] View all attachments
- [ ] Download attachment files
- [ ] Realtime chat loads
- [ ] Send message in chat
- [ ] Receive message instantly
- [ ] Change ticket status (staff only)
- [ ] Status updates reflect immediately

### ✅ Assignment Workflow (CRUD - Update)
- [ ] Click "Assign" button on ticket
- [ ] Assignment dialog opens
- [ ] See list of staff members
- [ ] Select a staff member
- [ ] Assign successfully
- [ ] Notification sent to assignee
- [ ] Assignee shows on ticket card
- [ ] Can reassign to different staff

### ✅ Realtime Chat
- [ ] Open ticket detail page
- [ ] Type message in chat
- [ ] Message appears instantly
- [ ] Other user sees typing indicator
- [ ] Messages show timestamps
- [ ] User avatars display
- [ ] Role badges visible
- [ ] AI reply suggestions (staff only)
- [ ] Accept AI suggestion

### ✅ File Upload & Storage
- [ ] Create ticket with file
- [ ] Multiple file upload
- [ ] File preview shows
- [ ] Files saved to Supabase Storage
- [ ] View attachments on ticket detail
- [ ] Download attachment
- [ ] Delete ticket doesn't break files

### ✅ Notifications
- [ ] Bell icon shows in sidebar
- [ ] Unread count badge displays
- [ ] Create ticket generates notification
- [ ] Assign ticket generates notification
- [ ] Comment on ticket generates notification
- [ ] Click notification opens ticket
- [ ] Mark notification as read
- [ ] Mark all as read
- [ ] Realtime notification updates

### ✅ Dashboard Analytics
- [ ] View stats cards
- [ ] Open tickets count correct
- [ ] In Progress count correct
- [ ] Resolved count correct
- [ ] Closed count correct
- [ ] Recent tickets list shows
- [ ] Staff sees active queue
- [ ] Urgent alerts count

### ✅ OpenAI AI Features
- [ ] Create ticket with description
- [ ] Wait 1-2 seconds for AI
- [ ] Priority badge shows (with confidence)
- [ ] Department suggestion shows
- [ ] Accept priority suggestion
- [ ] Accept department suggestion  
- [ ] AI suggestions accurate
- [ ] Open ticket as staff
- [ ] AI reply suggestions appear
- [ ] Copy suggestion to clipboard

### ✅ Role-Based Access
- [ ] Login as citizen
- [ ] Can only see own tickets
- [ ] Cannot assign tickets
- [ ] Cannot see admin dashboard
- [ ] Login as staff
- [ ] Can see all tickets
- [ ] Can assign tickets
- [ ] Can change status
- [ ] Can access admin dashboard

### ✅ UI & Responsiveness
- [ ] App works on desktop
- [ ] App works on tablet
- [ ] App works on mobile
- [ ] Sidebar collapses on mobile
- [ ] Dark/light theme toggle
- [ ] Search works
- [ ] Voice search works (mic button)
- [ ] Animations smooth
- [ ] Loading states show
- [ ] Error messages clear

### ✅ Production Build
- [ ] `npm run build` succeeds
- [ ] No console errors
- [ ] All features work in production
- [ ] Realtime works in production
- [ ] File upload works
- [ ] AI features work

## Test Users

### Create These Test Accounts

1. **Citizen/Patient** 
   - Email: citizen@test.com
   - Role: citizen
   - Can create tickets, view own tickets

2. **Staff Member**
   - Email: staff@test.com
   - Role: staff
   - Can view all tickets, assign, update

3. **Doctor**
   - Email: doctor@test.com
   - Role: doctor
   - Can view all tickets, assign, update

4. **Administrator**
   - Email: admin@test.com
   - Role: admin
   - Full access to everything

### Set Roles in Supabase

1. Go to Supabase Dashboard
2. Navigate to Table Editor → profiles
3. Find user by email
4. Edit role column
5. Save changes

## Common Test Scenarios

### Scenario 1: Citizen Creates Ticket
1. Login as citizen
2. Create new ticket
3. Upload photo
4. Submit ticket
5. View in tickets list
6. Open ticket detail
7. Add comment
8. Wait for staff response

### Scenario 2: Staff Handles Ticket
1. Login as staff
2. View all tickets
3. Filter by "Open"
4. Click unassigned ticket
5. Assign to yourself
6. Change status to "In Progress"
7. Use AI reply suggestion
8. Send message to citizen
9. Mark as "Resolved"

### Scenario 3: Cross-Tab Sync
1. Login in Tab 1
2. Open app in Tab 2
3. Should be auto-logged in
4. Create ticket in Tab 1
5. Should appear in Tab 2
6. Logout in Tab 1
7. Should logout in Tab 2

### Scenario 4: Realtime Chat
1. Login as staff in Browser 1
2. Login as citizen in Browser 2
3. Open same ticket in both
4. Send message from citizen
5. Should appear instantly for staff
6. Staff sees typing indicator
7. Staff sends reply
8. Citizen sees reply instantly

### Scenario 5: AI Assistant
1. Create ticket as citizen
2. Title: "Emergency - Patient bleeding"
3. Description: "Patient fell and is bleeding heavily"
4. Wait for AI analysis
5. Should suggest "Urgent" or "Critical" priority
6. Should suggest "Emergency" department
7. Accept suggestions
8. Submit ticket

## Performance Tests

### Load Test
- [ ] Create 50+ tickets
- [ ] List loads quickly
- [ ] Search is fast
- [ ] Filter is responsive
- [ ] No memory leaks

### Network Test
- [ ] Works on slow 3G
- [ ] Offline detection
- [ ] Reconnection handling
- [ ] File upload on slow network

## Security Tests

### Authentication
- [ ] Cannot access app without login
- [ ] Protected routes redirect to login
- [ ] Invalid credentials rejected
- [ ] Session expires after time

### Authorization
- [ ] Citizen cannot see other tickets
- [ ] Citizen cannot assign tickets
- [ ] Cannot access other user's files
- [ ] RLS policies enforced

## Bug Reports

If you find issues:
1. Note the steps to reproduce
2. Check console for errors
3. Verify environment variables set
4. Check Supabase RLS policies
5. Verify OpenAI API key is valid

## Success Criteria

✅ All checkboxes above should be checked
✅ No console errors
✅ Build succeeds (`npm run build`)
✅ All realtime features work
✅ AI features respond correctly
✅ File uploads succeed
✅ Cross-tab sync works
✅ Notifications deliver
✅ Mobile responsive

## Need Help?

Check these files for implementation:
- Services: `src/services/`
- Components: `src/components/`
- Pages: `src/pages/`
- Hooks: `src/hooks/`
- Database: `supabase/migrations/`

Your MedDesk system is fully functional! 🎉
