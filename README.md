# 🎫 Event Ticketing Platform

A full-stack college event ticketing platform with user authentication, event registration workflows, admin approval system, and QR code–based entry verification.

### 🌐 [Live Demo → eventticketinglive.netlify.app](https://eventticketinglive.netlify.app)

---

## ✨ Features

### For Users
- **Sign Up / Login** — Secure JWT-based authentication
- **Browse Events** — View all upcoming college events
- **Register for Events** — One-click registration with duplicate prevention
- **Profile Dashboard** — Track registration status (Pending → Approved / Declined)
- **QR Code** — Auto-generated QR code for approved registrations

### For Admins *(hidden route)*
- **Event Management** — Create, edit, and soft-delete events
- **Registration Approval** — Approve or decline incoming registrations
- **QR Code Scanner** — Scan attendee QR codes for real-time entry verification
- **Attendance Tracking** — View verified attendees and clear attendance records

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Tailwind CSS 4 |
| **Backend** | Netlify Serverless Functions (Node.js) |
| **Database** | TiDB Cloud (MySQL-compatible) |
| **Auth** | JWT + bcrypt |
| **QR** | qrcode.react, html5-qrcode |
| **Hosting** | Netlify |

---

## 📁 Project Structure

```
event-platform/
├── src/
│   ├── components/        # Navbar, EventCard, RegisterModal
│   ├── pages/             # Home, UserAuth, UserProfile, AdminLogin, AdminDashboard
│   ├── admin-tabs/        # EventsTab, RegistrationsTab, VerifyTab
│   ├── App.jsx            # Routing
│   └── main.jsx           # Entry point
├── netlify/functions/     # 15 serverless API endpoints
│   ├── db.js              # Connection pool + CORS config
│   ├── publicLogin.js     # User login
│   ├── publicSignup.js    # User signup
│   ├── adminLogin.js      # Admin login
│   ├── getEvents.js       # Fetch active events
│   ├── addEvent.js        # Create event (admin)
│   ├── deleteEvent.js     # Soft-delete event (admin)
│   ├── registerAttendee.js    # User event registration
│   ├── getRegistrations.js    # All registrations (admin)
│   ├── getUserRegistrations.js # User's own registrations
│   ├── updateRegistrationStatus.js # Approve/decline (admin)
│   ├── deleteRegistration.js  # Delete registration (admin)
│   ├── verifyAttendee.js      # QR scan verification (admin)
│   ├── getAttendees.js        # Verified attendees list
│   └── clearEventAttendance.js # Reset attendance (admin)
├── netlify.toml           # Build & redirect config
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [TiDB Cloud](https://tidbcloud.com) account (free tier works)

### Setup

```bash
# Clone the repo
git clone https://github.com/agni-007/Event-ticketing-app.git
cd Event-ticketing-app

# Install dependencies
npm install

# Create .env file with your database credentials
cp .env.example .env
# Edit .env with your TiDB connection details

# Initialize the database
node db-setup.js

# Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the project root:

```env
TIDB_HOST=your-tidb-host
TIDB_PORT=4000
TIDB_USER=your-username
TIDB_PASSWORD=your-password
TIDB_DATABASE=eventdb
JWT_SECRET=your-secret-key
```

---

## 🔐 Admin Access

The admin panel is accessible via a hidden route:
```
/admin2005
```

---

## 📄 License

MIT

---

Built with ❤️ for college events.
