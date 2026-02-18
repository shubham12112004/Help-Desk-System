# 🏥 Hospital Help Desk System

A fully functional, production-ready Hospital Help Desk System built with React, Supabase, and OpenAI. Features role-based access control, real-time chat, AI-powered ticket management, file uploads, and comprehensive analytics.

## ✨ Features

### 🔐 Authentication & Authorization
- **Multiple Auth Methods**: Email/password and Google OAuth
- **Role-Based Access Control**: Citizen, Staff, Doctor, Admin
- **Secure Session Management**: Supabase Auth with PKCE flow

### 🎫 Ticket Management
- **Full CRUD Operations**: Create, read, update, and manage tickets
- **Priority Levels**: Low, Medium, High, Urgent, Critical
- **Status Workflow**: Open → Assigned → In Progress → Resolved → Closed
- **Category System**: Medical inquiry, appointments, billing, technical support, etc.
- **Department Routing**: Automatic routing to appropriate departments
- **SLA Tracking**: Monitor response times and resolution SLAs

### 🤖 AI Features (OpenAI Integration)
- **Auto Priority Detection**: AI analyzes ticket content and suggests priority level
- **Smart Department Routing**: AI recommends the best department for each ticket
- **Reply Suggestions**: AI generates professional response suggestions for staff
- **Ticket Summarization**: Automatic summary generation for quick overview

### 💬 Real-Time Chat
- **Live Communication**: Real-time ticket conversations using Supabase Realtime
- **Typing Indicators**: See when other users are typing
- **Role Badges**: Visual indicators for staff, doctors, and patients
- **Message History**: Complete conversation timeline

### 📎 File Management
- **Multiple File Upload**: Support for images, PDFs, and documents
- **Drag & Drop**: Easy file upload interface
- **Supabase Storage**: Secure file storage with access control
- **File Preview**: View uploaded images directly in the app
- **Size Limits**: 10MB per file, multiple files per ticket

### 📊 Admin Dashboard & Analytics
- **Real-Time Metrics**: Live ticket statistics and KPIs
- **Team Performance**: Track staff productivity and resolution rates
- **Category Distribution**: Visual breakdown of ticket categories
- **SLA Compliance**: Monitor SLA adherence and overdue tickets
- **Recent Activity**: Live feed of new tickets and updates

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first, works on all devices
- **Dark Mode Support**: Built-in theme switching
- **Accessibility**: WCAG compliant components
- **Smooth Animations**: Polished user experience
- **Toast Notifications**: Real-time feedback for all actions

## 🚀 Tech Stack

- **Frontend**: React 18, Vite
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **AI**: OpenAI API (GPT-3.5 Turbo)
- **UI Components**: Shadcn/ui, Radix UI
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Date Handling**: date-fns
- **State Management**: React Query (TanStack Query)
- **Routing**: React Router v6

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works)
- OpenAI API key (optional, for AI features)

## 🛠️ Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Help+Desk
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Supabase Setup

#### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned

#### Run Database Migrations
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase/migrations/20260217000000_hospital_system_complete.sql`
3. Paste and run the SQL script

This creates:
- User profiles table with roles
- Tickets table with full workflow
- Comments/chat table
- Attachments table
- Appointments table
- Notifications table
- SLA policies
- Row Level Security (RLS) policies
- Database triggers and functions
- Analytics views

#### Create Storage Bucket
1. Go to **Storage** in Supabase dashboard
2. The app will auto-create the bucket, or manually create a bucket named `ticket-attachments`
3. Set the bucket to **Private** (not public)
4. Configure file size limit: 10MB
5. Allow file types: images, PDFs, documents

#### Configure Authentication

**Email/Password Auth:**
1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. **Recommended**: Disable "Confirm email" for faster signup (especially on free tier)
   - This avoids email delivery timeouts
   - Can be enabled in production with custom SMTP

**Google OAuth Setup:**
1. Go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Create OAuth credentials in [Google Cloud Console](https://console.cloud.google.com):
   - Go to **APIs & Services** → **Credentials**
   - Create **OAuth 2.0 Client ID**
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Client Secret to Supabase
5. Save changes

### 4. Environment Variables

Create a `.env` file in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# OpenAI API Configuration (Optional)
VITE_OPENAI_API_KEY=sk-your-openai-key-here

# Application URL
VITE_APP_URL=http://localhost:5173
```

**Get Supabase Credentials:**
1. Go to Project Settings → API
2. Copy **Project URL** → Use as `VITE_SUPABASE_URL`
3. Copy **anon public** key → Use as `VITE_SUPABASE_ANON_KEY`

**Get OpenAI API Key (Optional):**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Create an API key
3. Add billing information (pay-as-you-go)
4. Copy the key to `.env`

> **Note**: AI features are optional. The app works without OpenAI, just without AI suggestions.

### 5. Run the Application

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:5173`

## 👥 User Roles & Permissions

### Citizen (Default)
- Create tickets
- View own tickets
- Chat on own tickets
- Upload attachments
- Track ticket status

### Staff
- View all tickets
- Manage assigned tickets
- Chat with citizens
- Access AI reply suggestions
- Update ticket status and priority
- Access admin dashboard

### Doctor
- Same as Staff
- Access patient-related tickets
- Medical inquiry handling

### Admin
- All Staff permissions
- Full system access
- User management
- View team performance analytics
- Configure SLA policies
- Access complete admin dashboard

## 🎯 Usage Guide

### For Citizens

#### Creating a Ticket
1. Click **"Create Ticket"** from dashboard
2. Fill in:
   - Subject/Title
   - Description (detailed explanation)
   - Category (medical, billing, technical, etc.)
3. AI will automatically suggest:
   - Priority level
   - Best department
4. Upload supporting files (optional)
5. Click **"Submit Ticket"**

#### Tracking Tickets
- View all your tickets on the **Tickets** page
- Click any ticket to see details
- Chat with staff in real-time
- Get notifications on updates

### For Staff/Admin

#### Managing Tickets
1. Go to **Admin Dashboard** (`/admin`)
2. View real-time metrics and new tickets
3. Click on any ticket to:
   - Read full details
   - Chat with citizen
   - Get AI-powered reply suggestions
   - Update status and priority
   - Assign to team members

#### Using AI Features
- **Auto Priority**: System suggests priority when viewing tickets
- **Reply Suggestions**: Click suggested replies to use them
- **Department Routing**: Accept AI department recommendations

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Shadcn UI components
│   ├── AIComponents.jsx
│   ├── FileUpload.jsx
│   ├── RealtimeChat.jsx
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useAuth.jsx
│   ├── useTickets.js
│   └── useNotifications.js
├── pages/              # Route pages
│   ├── Auth.jsx
│   ├── Dashboard.jsx
│   ├── AdminDashboard.jsx
│   ├── Tickets.jsx
│   ├── TicketDetail.jsx
│   ├── CreateTicket.jsx
│   └── Settings.jsx
├── services/           # External service integrations
│   ├── openai.js       # OpenAI API integration
│   ├── storage.js      # Supabase Storage
│   └── realtime.js     # Realtime subscriptions
├── integrations/
│   └── supabase/
│       └── client.js   # Supabase client config
├── lib/                # Utilities and configurations
│   └── utils.js
└── App.jsx             # Main app component

supabase/
└── migrations/         # Database migrations
    └── 20260217000000_hospital_system_complete.sql
```

## 🔒 Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Authentication Required**: All routes protected
- **Role-Based Permissions**: Granular access control
- **Secure File Storage**: Private bucket with signed URLs
- **Input Validation**: Client and server-side validation
- **SQL Injection Protection**: Parameterized queries via Supabase
- **XSS Protection**: React's built-in escaping

## 📊 Database Schema

### Key Tables

**profiles**: User accounts with roles
**tickets**: Support tickets with full metadata
**ticket_comments**: Real-time chat messages
**ticket_attachments**: File uploads
**appointments**: Doctor appointments
**notifications**: Real-time user notifications
**sla_policies**: Service level agreements
**ticket_activity_log**: Audit trail

See `supabase/migrations/` for complete schema.

## 🎨 Customization

### Theme
- Edit `src/index.css` for color schemes
- Modify `tailwind.config.js` for design tokens
- Dark mode toggle in UI

### Ticket Categories
- Edit `src/lib/ticketConfig.js`
- Update category enums in database

### AI Prompts
- Customize in `src/services/openai.js`
- Adjust temperature and max tokens

## 🐛 Troubleshooting

### Issue: "Supabase ENV missing" Error
**Solution**: Check `.env` file has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

### Issue: 504 Gateway Timeout on Signup
**Solution**: Disable email confirmation in Supabase:
- Go to Authentication → Providers → Email
- Toggle OFF "Confirm email"
- Users will be created instantly

### Issue: Google OAuth Not Working
**Solution**: 
1. Check OAuth credentials in Google Console
2. Add correct redirect URI in Google Console
3. Verify credentials in Supabase dashboard

### Issue: AI Features Not Working
**Solution**:
- Verify `VITE_OPENAI_API_KEY` in `.env`
- Check OpenAI account has credits
- AI is optional - app works without it

### Issue: File Upload Fails
**Solution**:
1. Check storage bucket exists: `ticket-attachments`
2. Verify bucket is set to Private
3. Check file size (10MB limit)
4. Check RLS policies on `ticket_attachments` table

### Issue: Real-time Chat Not Updating
**Solution**:
- Check Supabase Realtime is enabled in project settings
- Verify RLS policies allow INSERT on `ticket_comments`
- Check browser console for WebSocket errors

## 🚀 Deployment

### Vercel (Recommended)

```bash
npm run build
# Deploy output folder
```

Configure environment variables in Vercel dashboard.

### Netlify

```bash
npm run build
# Deploy dist folder
```

Add `.env` variables in site settings.

### Manual Deployment

```bash
npm run build
# Serve the dist/ folder with any static hosting
```

## 📝 License

MIT License - feel free to use for personal or commercial projects.

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push and create a Pull Request

## 📧 Support

For issues and questions:
- Open a GitHub issue
- Check documentation above
- Review Supabase docs

## 🎉 Credits

Built with:
- [React](https://react.dev)
- [Supabase](https://supabase.com)
- [OpenAI](https://openai.com)
- [Shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

---

**Happy ticket managing! 🎫**
