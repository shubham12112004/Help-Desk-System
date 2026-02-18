# Settings System Implementation

This document describes the comprehensive settings system that has been implemented for the Help Desk System.

## Overview

The settings system allows users to manage their profile, notifications, display preferences, security, and privacy settings through both the frontend and backend APIs.

## Components

### 1. Database Migration
**File**: `supabase/migrations/20260218000000_add_user_settings.sql`

Creates a `user_settings` table with the following features:
- Notification preferences (email, push, SMS)
- Notification types (tickets, appointments, SLA warnings)
- Display preferences (theme, language, date/time format)
- Dashboard preferences (view mode, items per page)
- Privacy settings (profile visibility, online status)
- Email digests (daily, weekly)
- Row Level Security (RLS) policies
- Automatic timestamp updates

### 2. Frontend Services
**File**: `src/services/settings.js`

Provides functions for:
- `getUserSettings()` - Get user settings
- `updateUserSettings(settings)` - Update settings
- `updateUserProfile(profileData)` - Update profile
- `updateUserPassword(newPassword)` - Change password
- `updateUserEmail(newEmail)` - Change email
- `getNotificationPreferences()` - Get notification settings
- `updateNotificationPreferences(preferences)` - Update notifications
- `deactivateUserAccount()` - Deactivate account
- `exportUserData()` - Export user data (GDPR compliance)

### 3. Settings Page UI
**File**: `src/pages/Settings.jsx`

Features 5 tabs with comprehensive settings:

#### Profile Tab
- Full name, email, phone
- Department, address
- Emergency contact information

#### Notifications Tab
- Notification channels (email, push, SMS)
- Notification types (tickets, appointments, SLA)
- Email digests (daily, weekly)

#### Display Tab
- Theme (light, dark, system)
- Language selection
- Date and time format
- Dashboard view preferences
- Items per page
- Sound settings

#### Security Tab
- Password change
- Account information display
- Account creation date

#### Privacy Tab
- Profile visibility settings
- Online status control
- Data export (GDPR compliance)
- Account deactivation

### 4. Backend API
**Files**: 
- `Backend/controllers/settingsController.js`
- `Backend/routes/settingsRoutes.js`

API Endpoints:
- `GET /api/user/settings` - Get user settings
- `PUT /api/user/settings` - Update user settings
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/export` - Export user data
- `POST /api/user/deactivate` - Deactivate account

All endpoints require Bearer token authentication.

## Setup Instructions

### 1. Apply Database Migration

Run the migration to create the user_settings table:

```bash
# If using Supabase CLI
supabase db push

# Or apply manually through Supabase Dashboard
# Go to SQL Editor and run the migration file
```

### 2. Install Backend Dependencies

```bash
cd Backend
npm install
```

This will install the `@supabase/supabase-js` package required for the backend.

### 3. Set Environment Variables

Ensure your `.env` file (or Backend/.env) has:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# Or
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start the Application

```bash
# Frontend (from root)
npm run dev

# Backend (from Backend folder)
cd Backend
npm run dev
```

## Testing

1. **Login** to the application with a valid user account
2. Navigate to **Settings** page from the sidebar
3. Test each tab:
   - **Profile**: Update your information and save
   - **Notifications**: Toggle notification preferences
   - **Display**: Change theme, language, and format preferences
   - **Security**: Change your password
   - **Privacy**: Export your data or test account deactivation (careful!)

## Default Settings

When a user accesses settings for the first time, default values are automatically created:

```javascript
{
  email_notifications: true,
  push_notifications: true,
  sms_notifications: false,
  notify_ticket_created: true,
  notify_ticket_assigned: true,
  notify_ticket_updated: true,
  notify_ticket_commented: true,
  notify_appointment_reminder: true,
  notify_sla_warning: true,
  theme: 'system',
  language: 'en',
  date_format: 'MM/DD/YYYY',
  time_format: '12h',
  default_dashboard_view: 'grid',
  tickets_per_page: 10,
  profile_visible: true,
  show_online_status: true,
  daily_digest: false,
  weekly_summary: true,
  enable_sound: true
}
```

## Security Features

1. **Row Level Security (RLS)**: Users can only access their own settings
2. **Token Authentication**: All backend API calls require valid JWT tokens
3. **Input Validation**: Read-only fields are removed from updates
4. **Admin Access**: Admins can view all user settings (but not modify)

## GDPR Compliance

The system includes GDPR-compliant features:
- **Data Export**: Users can download all their data in JSON format
- **Account Deactivation**: Users can deactivate their accounts (soft delete)
- **Privacy Controls**: Users control profile visibility and online status

## Future Enhancements

Potential improvements:
- Two-factor authentication
- Session management (view active sessions, logout all)
- Notification scheduling (quiet hours)
- Advanced privacy controls
- Data retention policies
- Account deletion (hard delete) with confirmation
- Theme customization (custom colors)
- Email verification for email changes
- Password strength requirements
- Activity log/audit trail

## Troubleshooting

### Settings Not Loading
- Check that the migration has been applied
- Verify Supabase credentials in environment variables
- Check browser console for errors

### Updates Not Saving
- Ensure user is authenticated
- Check network tab for API errors
- Verify RLS policies are enabled

### Backend API Errors
- Install @supabase/supabase-js: `cd Backend && npm install`
- Check environment variables are set
- Verify token is being sent in Authorization header

## API Usage Examples

### Get User Settings
```javascript
const response = await fetch('http://localhost:5001/api/user/settings', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
const { settings } = await response.json();
```

### Update Settings
```javascript
const response = await fetch('http://localhost:5001/api/user/settings', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    theme: 'dark',
    email_notifications: false
  })
});
```

### Export User Data
```javascript
const response = await fetch('http://localhost:5001/api/user/export', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});
const userData = await response.json();
```

## License

Part of the Help Desk System - All rights reserved
