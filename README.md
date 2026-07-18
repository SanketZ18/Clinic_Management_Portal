# 🏥 Homeo Scribe Pro — Clinic Management System

A full-stack, production-grade clinic management platform for homeopathic doctors — built with **React JS** (Vite) + **Spring Boot** + **MongoDB Atlas**.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Java 17+
- Maven 3.8+
- MongoDB Atlas account (already configured)

---

### 1. Start the Backend (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

Backend starts on **http://localhost:8080**

### 2. Start the Frontend (React Vite)

```bash
cd frontend
npm install
npm run dev
```

Frontend starts on **http://localhost:5173**

---

## 🗂️ Project Structure

```
Clinic Management/
├── backend/                          # Spring Boot 3.2 application
│   └── src/main/java/com/homeoscribe/
│       ├── config/
│       │   └── SecurityConfig.java   # JWT + CORS + Security rules
│       ├── controller/
│       │   ├── AuthController.java   # /api/auth/*
│       │   ├── DoctorController.java # /api/doctor/*
│       │   └── ContactController.java# /api/contact
│       ├── dto/
│       │   ├── request/              # RegisterRequest, LoginRequest, etc.
│       │   └── response/             # AuthResponse, DoctorProfileResponse
│       ├── filter/
│       │   ├── JwtAuthFilter.java    # JWT token validation
│       │   └── RateLimitFilter.java  # IP-based rate limiting
│       ├── model/
│       │   ├── Doctor.java           # Doctor MongoDB document
│       │   └── RefreshToken.java     # Refresh token document
│       ├── repository/
│       │   ├── DoctorRepository.java
│       │   └── RefreshTokenRepository.java
│       ├── service/
│       │   ├── AuthService.java      # Register/Login/Logout/Refresh
│       │   ├── DoctorService.java    # Profile management
│       │   ├── JwtService.java       # JWT generation/validation
│       │   ├── RefreshTokenService.java # Refresh token lifecycle
│       │   └── CustomUserDetailsService.java
│       └── exception/                # Global exception handler
│
└── frontend/                         # React + Vite application
    └── src/
        ├── components/
        │   ├── Navbar.jsx            # Sticky navigation bar
        │   ├── Footer.jsx            # Site footer
        │   ├── DashboardLayout.jsx   # Protected dashboard with sidebar
        │   └── ProtectedRoute.jsx    # Auth guard component
        ├── context/
        │   └── AuthContext.jsx       # Global auth state + API calls
        ├── pages/
        │   ├── Home.jsx              # Landing page with animations
        │   ├── About.jsx             # About Dr. Salunkhe & platform
        │   ├── Contact.jsx           # Contact form → backend
        │   ├── Auth.jsx              # Login + Registration forms
        │   └── dashboard/
        │       ├── Inquiry.jsx       # Patient case-taking & prescription
        │       ├── DailyRegister.jsx # Today's patient log (localStorage)
        │       ├── DayReport.jsx     # Printable daily clinic report
        │       ├── Research.jsx      # Homeopathic remedy research feed
        │       └── Profile.jsx       # Doctor profile & settings
        └── services/
            └── api.js                # Axios with JWT auto-refresh
```

---

## 🔐 Security Architecture

| Feature | Implementation |
|---|---|
| Authentication | JWT Bearer tokens (15-min access tokens) |
| Session Refresh | httpOnly cookie refresh tokens (7-day rotation) |
| Password Hashing | BCrypt (cost factor 12) |
| Rate Limiting | IP-based (10 req/sec per IP) |
| CORS | Strict allowlist (`localhost:5173` in dev) |
| Security Headers | X-Frame-Options, Referrer-Policy, Content-Type-Options |
| Token Refresh | Automatic rotation on 401 (no user action needed) |

---

## 🌐 API Endpoints

### Public (No Auth Required)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new doctor |
| POST | `/api/auth/login` | Login and get tokens |
| POST | `/api/auth/refresh` | Refresh access token (cookie) |
| POST | `/api/auth/logout` | Revoke refresh token |
| POST | `/api/contact` | Submit contact inquiry |

### Protected (JWT Required)
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/doctor/profile` | Get logged-in doctor profile |
| PUT | `/api/doctor/profile` | Update profile details + signature |
| PUT | `/api/doctor/profile/password` | Change password |

---

## 🗄️ Database Design (MongoDB Atlas)

### Doctors Collection
```json
{
  "doctorId": "uuid",
  "fullName": "Dr. Akaram Bapurao Salunkhe",
  "qualification": "BHMS, MD (Hom)",
  "clinicName": "Anubhuti Homeopathy Clinic",
  "clinicAddress": "...",
  "phone": "9876543210",
  "email": "doctor@example.com",
  "licenseNumber": "MH-12345",
  "passwordHash": "bcrypt hash",
  "signatureBase64": "data:image/png;base64,...",
  "isActive": true,
  "subscriptionPlan": "FREE",
  "subscriptionExpiry": null,
  "createdAt": "2024-01-01T00:00:00",
  "lastLoginAt": "2024-01-02T10:00:00"
}
```

### RefreshTokens Collection
```json
{
  "token": "uuid-token",
  "doctorId": "doctor-mongo-id",
  "expiresAt": "2024-01-08T00:00:00",
  "revoked": false
}
```

> ⚠️ **Patient data is NOT stored in MongoDB** — as per requirement. All patient session data lives in browser `localStorage` and is cleared daily.

---

## 📋 Features

### Public Website
- ✅ Animated home page (Framer Motion)
- ✅ About Dr. Salunkhe & clinic
- ✅ Contact form (persisted via backend)

### Doctor Dashboard (Protected)
- ✅ **Patient Inquiry** — Full homeopathic case-taking form, rubric selection, remedy+potency selection, digital prescription PDF (no server save)
- ✅ **Daily Register** — Today's patient log from localStorage, live search, statistics
- ✅ **Day Report** — Printable daily clinic ledger with letterhead
- ✅ **Research Feed** — Homeopathic remedy guides & case-taking articles
- ✅ **Profile Settings** — Update clinic details, upload digital signature, change password

### Security & UX
- ✅ JWT access token auto-refresh (silent, no user interruption)
- ✅ Session restoration from localStorage on page reload
- ✅ Session expiry redirect to login
- ✅ Toast notifications for all actions
- ✅ Form validation on both client and server

---

## 💳 Subscription Model

Currently, registration is **FREE** for all doctors.  
Future paid tier: **₹500/month** (payment integration to be added).

The subscription plan field (`subscriptionPlan`) is already built into the database and profile responses, ready for Razorpay/Stripe integration.

---

## 🔧 Configuration

### Backend (`backend/src/main/resources/application.yml`)
```yaml
spring.data.mongodb.uri: <MongoDB Atlas connection string>
jwt.secret: <your-secret-key>
jwt.access-token-expiration: 900000     # 15 minutes
jwt.refresh-token-expiration: 604800000 # 7 days
cors.allowed-origins: http://localhost:5173
```

### Frontend (Vite proxy)
The frontend proxies all `/api/*` calls to `http://localhost:8080` — no CORS issues in development.
