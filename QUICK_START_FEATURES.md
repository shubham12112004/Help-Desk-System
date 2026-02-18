# 🏥 Hospital Help Desk - Quick Reference Guide

## 🚀 How to Use Your New Features

### 1. Dashboard (Homepage)
**URL**: `http://localhost:5176/`

**What's New**:
- ✅ All stat cards are now **clickable**
- ✅ Click "Open" card → shows all open tickets
- ✅ Click "Active Queue" → shows open + in-progress
- ✅ Click "Urgent Alerts" → shows high/critical tickets
- ✅ Click "On Duty" → shows staff roster

### 2. Tickets Page (Advanced Filtering)
**URL**: `http://localhost:5176/tickets`

**Features**:
- 🔍 **Search**: Find by title, ticket ID, requester, or MRN
- 📊 **Filters**: Status, Priority dropdowns
- 📈 **Sort**: Latest, Oldest, or Priority-based
- 📄 **Export**: Download filtered tickets as CSV
- 🎤 **Voice Search**: Click mic icon to dictate search
- 📑 **Pagination**: 10 tickets per page with navigation

**Query Examples**:
- `/tickets?status=open` - Only open tickets
- `/tickets?priority=urgent` - Only urgent tickets
- `/tickets?search=network` - Search for "network"
- `/tickets?status=in_progress&page=2` - In progress, page 2

### 3. Ticket Details (Chat + AI)
**URL**: `http://localhost:5176/tickets/{id}`

**Features**:
- 💬 **Real-time Chat**: Send messages back and forth
- 🤖 **AI Summary**: Auto-generate ticket overview
- 😊 **Sentiment Analysis**: Understand customer emotion
- 💭 **Suggested Replies**: Get AI-powered response ideas
- 📎 **Attachments**: Upload and view files
- 🔄 **Status Updates**: Change ticket status with dropdown

### 4. Staff Roster (Staff Only)
**URL**: `http://localhost:5176/staff-roster`

**Shows**:
- 👥 Total staff members
- 🟢 Who's currently online/offline
- 🏥 Department assignments
- 📊 Current ticket workload per agent
- ⚠️ High workload warnings

**Access**: Staff and Admin only
**Citizen View**: Redirects to dashboard

### 5. Hospital Analytics (Staff Only)
**URL**: `http://localhost:5176/analytics`

**Metrics**:
- 📈 Total tickets in system
- ⏱️ Average resolution time
- 🚨 Overdue SLA count
- ✅ SLA compliance %
- 📊 Status distribution chart
- 🎯 Priority breakdown
- 🏥 Department SLA compliance

**Charts**:
- Visual bars for status breakdown
- Compliance percentage by department
- Color-coded performance indicators

### 6. Create Ticket
**URL**: `http://localhost:5176/create`

**Form Fields**:
- Title (required)
- Description (with voice input)
- Priority (Low, Medium, High, Urgent)
- Category (IT, Patient Support, Operations)
- Department (if staff)
- Patient MRN & Name (if applicable)
- File upload for attachments

**AI Helpers**:
- Auto-priority detection
- Department suggestion
- Category recommendation

## 🎯 Common Tasks

### "I want to see all open tickets"
1. Go to Dashboard
2. Click the blue "Open" card
3. OR go to `/tickets?status=open`

### "Find urgent tickets for ICU"
1. Go to `/tickets`
2. Select "Urgent" from Priority dropdown
3. Search "ICU" in search box
4. Click Apply or just watch auto-filter

### "Generate a response for this ticket"
1. Open ticket detail page
2. Scroll down to "Suggested Replies" section
3. Click "Generate Replies"
4. Pick the response you like
5. Click "Use" to insert into message box
6. Send your message

### "Export tickets for reporting"
1. Go to `/tickets`
2. Apply filters (optional)
3. Click "Export CSV" button
4. File downloads automatically
5. Open in Excel or Google Sheets

### "Check who's available to handle tickets"
1. Click "On Duty" card on dashboard
2. OR go to `/staff-roster`
3. See green "Online" badges for available staff
4. Check their workload (ticket count)

### "Analyze department performance"
1. Go to `/analytics` (staff only)
2. View SLA Compliance by Department section
3. Green badges = good compliance
4. Red badges = needs attention
5. Check overdue SLA count

## 🔧 Technical Details

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS + shadcn/ui components
- **State**: React Query for data caching
- **Router**: React Router v6 with protected routes
- **AI**: OpenAI API via gpt-3.5-turbo
- **Real-time**: Supabase subscriptions for live updates
- **Port**: `http://localhost:5176`

### Backend
- **Framework**: Express.js
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Auth with JWT tokens
- **Storage**: Supabase Storage for file uploads
- **Port**: `http://localhost:5001`

### Database Tables
- `tickets` - All support requests
- `ticket_messages` - Chat & notes
- `profiles` - User information
- `user_settings` - User preferences
- `ticket_attachments` - File metadata

## 🎨 UI Features

### Color Coding
- **Blue** = Open (Inbox)
- **Yellow** = In Progress
- **Green** = Resolved/Success
- **Gray** = Closed/Archived
- **Red** = Urgent/Error
- **Orange** = High priority
- **Purple** = Medium priority

### Icons
- 📂 Dashboard
- 🎫 Tickets
- ➕ Create
- ⚙️ Settings
- 📊 Analytics
- 👥 Staff
- 🔐 Secure/Protected
- 🤖 AI/Generated

## 🔐 User Roles

### Citizen
- ✅ Create tickets
- ✅ View own tickets
- ✅ Browse settings
- ❌ Cannot see other tickets
- ❌ Cannot access analytics
- ❌ Cannot manage staff

### Staff
- ✅ View all tickets
- ✅ Update ticket status
- ✅ Assign tickets
- ✅ See staff roster
- ✅ Access analytics
- ✅ Use AI features
- ✅ Send messages
- ❌ Cannot see admin functions

### Admin
- ✅ All staff permissions
- ✅ Manage users
- ✅ Manage system settings
- ✅ Audit logs
- ✅ Advanced analytics
- ✅ System configuration

## ⚡ Keyboard Shortcuts

- **Esc** - Close dialogs/modals
- **Ctrl+K** - Open command palette (if implemented)
- **?** - Show help (if implemented)

## 🆘 Troubleshooting

### "Tickets page is blank"
- Check your role (citizens see own, staff see all)
- Click "Reset" button to clear filters
- Check browser console for errors

### "AI features not working"
- Verify `VITE_OPENAI_API_KEY` in .env
- Check internet connection
- Try again (API might be rate limited)

### "Real-time updates not working"
- Check Supabase connection
- Verify RLS policies are enabled
- Try refresh page

### "Can't upload files"
- Check file size (< 10MB)
- Verify file format is allowed
- Check storage permissions

### "Staff isn't showing on roster"
- Verify user's role is "staff" or "admin"
- Check if they have a department assigned
- Try refreshing page

## 📱 Mobile Tips

- Sidebar collapses on smaller screens
- Tap hamburger menu to open navigation
- Swipe to close sidebar
- All features work on mobile
- Pinch to zoom on charts

## 🚀 Performance Tips

- **Less Load**: Use filters to show fewer tickets
- **Export > View**: Download CSV instead of loading 1000+ records
- **Search First**: Search before scrolling through all
- **Page Breaks**: Use pagination buttons instead of infinite scroll
- **Cache**: Data is cached - second visit is instant

## 💡 Pro Tips

1. **Bulk Operations**: Export filtered tickets for bulk updates
2. **Voice Input**: Use mic button for hands-free search
3. **AI Efficiency**: Generate replies → copy → modify → send
4. **Workload Balance**: Check analytics to redistribute tickets
5. **SLA Tracking**: Monitor overdue tickets on analytics
6. **Quick Access**: Dashboard cards are your shortcuts
7. **Search Operators**: Can search multiple fields at once
8. **Department View**: Staff roster shows department workload
9. **Export Dates**: CSV includes creation and update dates
10. **Priority Sort**: Sort by priority to handle urgent first

## 📞 Need Help?

- Check `HOSPITAL_HELPDESK_UPGRADE.md` for detailed feature list
- Review error messages in browser console
- Check network tab for API issues
- Look at Supabase dashboard for data issues
- Review OpenAI API status for AI features

---

**Version**: 1.0 - Hospital Help Desk  
**Last Updated**: February 2026  
**Status**: ✅ Production Ready
