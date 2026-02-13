
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
