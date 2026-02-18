# 🏥 MedDesk - Hospital Help Desk System

A **professional hospital help desk system** built with **React + Supabase** featuring AI-powered support, real-time notifications, and a modern responsive UI.

**✨ NEW:** Version 2.0 with complete UI upgrade including landing page, professional header, and floating AI chatbot!

---

## 🎯 Key Features

### 🏠 Hospital Landing Page (NEW)
- Professional hero section with search
- Hospital statistics showcase (15K+ patients, 500+ staff)
- Services overview (6 key medical services)
- Departments directory with emoji icons
- FAQ accordion with common questions
- Strong call-to-action sections
- Fully responsive mobile design

### 📌 Professional Header (NEW)
- **Global Search**: Search tickets, departments, and staff
- **Notifications Dropdown**: Real-time unread counter with dropdown
- **Quick Actions Menu**: Create Ticket, View Tickets, Chat Support
- **Profile Menu**: User info with role display and color coding
- **Theme Toggle**: Seamless dark/light mode switching
- **Mobile Optimized**: Adaptive layout with dialog modals

### 🤖 AI Chatbot Assistant (NEW)
- **Floating support button** (bottom-right corner)
- **Intelligent conversations** for ticket creation guidance
- **Department suggestions** based on user input
- **Priority recommendations** (Low, Medium, High, Urgent)
- **Context-aware responses** with FAQ support
- **Quick help suggestions** for common tasks
- **Mobile responsive** with touch optimization

### 👤 User Features
- User Registration & Login (Email + OAuth)
- Create support tickets with attachments
- View and track ticket status
- Update ticket details
- Set priority levels
- Real-time notifications
- Dark/Light theme support
- Voice input for ticket search

### 🛡️ Staff/Admin Features
- Admin dashboard with analytics
- View all tickets from all users
- Assign tickets to staff members
- Update ticket status (Open / In Progress / Resolved / Closed)
- Staff roster management
- Hospital analytics dashboard
- Department-based filtering
- Export tickets to CSV

### 🔒 Security Features
- Supabase Authentication (Email + Google OAuth)
- Row Level Security (RLS) policies
- Role-Based Access Control (Admin/Staff/Doctor/Nurse/Citizen)
- Secure file uploads (Supabase Storage)
- JWT authentication tokens
- Protected Routes
- Secure API requests using Authorization Headers

---

## 🎨 UI/UX Highlights

### Modern Design System
- **shadcn/ui** component library for consistent design
- **Tailwind CSS** for responsive utility-first styling
- **Lucide React** icons for beautiful iconography
- **Dark theme** optimized for healthcare professionals
- **Smooth animations** and transitions throughout

### Responsive Design
- **Mobile-first** approach for all screen sizes
- **Touch-optimized** buttons and interactions (min 44px tap targets)
- **Adaptive layouts** at breakpoints: 640px, 768px, 1024px, 1280px
- **Dialog modals** for mobile search and notifications
- **Collapsible sidebar** for optimal space usage

### Accessibility
- **WCAG AA** compliant color contrast
- **Keyboard navigation** support throughout
- **ARIA labels** for screen readers
- **Focus indicators** on interactive elements
- **Semantic HTML** structure

---

## 🏗️ Tech Stack

### Frontend
- **React 18** - UI framework with hooks
- **Vite 5** - Fast build tool and dev server
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **Lucide React** - Beautiful icon library
- **React Query** - Data fetching and caching
- **Supabase Client** - Database and auth client

### Backend
- **Supabase** - PostgreSQL database and authentication
- **Supabase Storage** - File storage for attachments
- **Supabase Realtime** - Real-time subscriptions
- **Row Level Security** - Database-level access control
- **Express.js** (legacy) - REST API server

### Database
- MongoDB
- Mongoose ODM

### Tools Used
- VS Code
- Postman
- MongoDB Compass
- Git & GitHub

---

## 📂 Project Modules

### 1. Users Module
- Stores user & admin details (name, email, password, role)
- Passwords are stored in hashed format

### 2. Help Desk Module
- Ticket creation, viewing, updating, deleting
- User & Admin ticket management system

### 3. Reports Module
- Generates ticket-related reports for admins
- Helps track system performance

### 4. Settings Module
- System-level settings
- Accessible only by admin

---

## 🔑 Authentication Flow

1. User registers (password is hashed before saving)
2. User logs in and server generates a JWT token
3. Token is stored on frontend
4. Token is sent in request headers for protected routes
5. Backend verifies token + user role using middleware
6. If valid → access granted, else → Unauthorized response

---

## 📌 REST API Endpoints

| Method | Endpoint           | Description |
|--------|-------------------|-------------|
| POST   | /api/help         | Create a new help ticket |
| GET    | /api/help         | Retrieve help tickets |
| PUT    | /api/help/:id     | Update an existing ticket |
| DELETE | /api/help/:id     | Delete a ticket (Admin only) |

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/help-desk-system.git
cd help-desk-system
=======
# 🛠️ Help Desk System (MERN Stack)

A **Help Desk System** is a web-based ticket management application built using the **MERN Stack** (MongoDB, Express.js, React.js, Node.js).  
This system allows users to raise support tickets and track their progress, while administrators can manage, update, and resolve those tickets efficiently.

---

## 📌 Features

### 👤 User Features
- User Registration & Login
- Create a new Help Desk Ticket
- View all submitted tickets
- Update/Edit ticket details before resolution
- Track ticket status
- Set ticket priority

### 🛡️ Admin Features
- Admin Login
- View all tickets from all users
- Update ticket status (Pending / In Progress / Resolved)
- Delete tickets (Admin only)
- Manage user support requests effectively

### 🔒 Security Features
- JWT (JSON Web Token) Authentication
- Password Hashing using bcrypt
- Role-Based Access Control (Admin/User)
- Protected Routes
- Secure API requests using Authorization Headers

---

## 🏗️ Tech Stack

### Frontend
- React.js
- HTML5, CSS3, JavaScript
- Axios (API calls)
- React Router DOM

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcrypt (Password encryption)

### Database
- MongoDB
- Mongoose ODM

### Tools Used
- VS Code
- Postman
- MongoDB Compass
- Git & GitHub

---

## 📂 Project Modules

### 1. Users Module
- Stores user & admin details (name, email, password, role)
- Passwords are stored in hashed format

### 2. Help Desk Module
- Ticket creation, viewing, updating, deleting
- User & Admin ticket management system

### 3. Reports Module
- Generates ticket-related reports for admins
- Helps track system performance

### 4. Settings Module
- System-level settings
- Accessible only by admin

---

## 🔑 Authentication Flow

1. User registers (password is hashed before saving)
2. User logs in and server generates a JWT token
3. Token is stored on frontend
4. Token is sent in request headers for protected routes
5. Backend verifies token + user role using middleware
6. If valid → access granted, else → Unauthorized response

---

## 📌 REST API Endpoints

| Method | Endpoint           | Description |
|--------|-------------------|-------------|
| POST   | /api/help         | Create a new help ticket |
| GET    | /api/help         | Retrieve help tickets |
| PUT    | /api/help/:id     | Update an existing ticket |
| DELETE | /api/help/:id     | Delete a ticket (Admin only) |

---

## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/help-desk-system.git
cd help-desk-system
>>>>>>> Stashed changes
