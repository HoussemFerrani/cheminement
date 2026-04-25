# 🧠 Mental Health Connection Platform – Implementation Plan

> Focus: Build the full UI using Next.js before integrating with Supabase backend.

---

## 🏗️ Project Overview

**Goal:**
Design and develop a user-friendly web interface for a mental health connection platform that links clients and professionals, manages appointments and billing, and provides access to mental health education and content.

**Development Strategy:**

1. Build and validate all UI components and flows with **Next.js**.
2. Connect to Supabase for authentication, database, and storage integration.
3. Gradually wire UI to real backend logic and APIs.

---

## ⚙️ Tech Stack

- **Frontend Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + Shadcn/UI components
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Forms:** React Hook Form + Zod validation
- **Routing:** Next Navigation
- **State Management:** Zustand or Context API (for now)
- **Data Mocking (pre-integration):** local JSON / static mocks
- **Backend (later phase):** Supabase (auth, storage, db, edge functions)
- **Payments (later phase):** Stripe / Global Payments

---

## 📅 Development Phases

### **Phase 1 – UI Foundations**

**Goals:**
Create the base layout, theming, and navigation structure for the entire platform.

#### Tasks

- [ ] Initialize Next.js project with TypeScript
- [ ] Configure Tailwind CSS and Shadcn/UI
- [ ] Set up project folder structure:

```

/app
/client
/professional
/admin
/sentiers
/components
/lib
/styles
/mock

```

- [ ] Implement global layout (navbar, footer, responsive container)
- [ ] Add global theme (white / light gray / beige-blue palette)
- [ ] Create shared UI components:
- [ ] Button, Card, Modal, Dropdown, Tabs
- [ ] Form input components (TextInput, Select, TextArea, DatePicker)
- [ ] Alert / Toast notifications
- [ ] Build placeholder mock data (clients, professionals, sessions)

---

### **Phase 2 – Public Pages (Unauthenticated)**

**Goals:**
Build all marketing and entry-point pages to introduce the platform and encourage signup.

#### Tasks

- [ ] Homepage:
- [ ] Hero section (intro to mission & vision)
- [ ] Sections: “Why us”, “How it works”, “Our values”
- [ ] CTA buttons (“Find a professional”, “Join as professional”)
- [ ] About page (mission, story, team)
- [ ] Features page (platform benefits)
- [ ] FAQ page (clients and professionals)
- [ ] Contact page (form + static info)
- [ ] Footer with legal / privacy / social links
- [ ] Language toggle (English / French placeholder)

---

### **Phase 3 – Authentication & Onboarding UI**

**Goals:**
Design the full login, signup, and onboarding flows for clients and professionals.

#### Tasks

- [ ] Auth landing page (choose role: client or professional)
- [ ] Signup form (email, password, role)
- [ ] Login form
- [ ] Forgot password flow
- [ ] Email verification UI (mocked)
- [ ] Onboarding flow (stepper):
- **For clients:** issue, goals, approach preference, urgency, region
- **For professionals:** expertise, client types, accepted programs, availability
- [ ] Create success screen → redirect to dashboard
- [ ] Use mock JSON to simulate saved profiles

---

### **Phase 4 – Client Dashboard UI**

**Goals:**
Develop the full client-side interface for finding professionals, managing appointments, and accessing content.

#### Tasks

- [ ] Dashboard overview page (summary of appointments, resources)
- [ ] Profile page (editable fields)
- [ ] Professional search:
- [ ] Search filters (expertise, location, approach, availability)
- [ ] Professional cards (photo, name, expertise, short bio)
- [ ] “Book appointment” modal
- [ ] Appointment management:
- [ ] Upcoming appointments list
- [ ] Appointment details view
- [ ] Reschedule / cancel buttons (mocked)
- [ ] Resource center:
- [ ] Free articles/videos section
- [ ] Premium content preview (locked UI)
- [ ] Reflection tools (basic templates)
- [ ] Billing & receipts (UI placeholders)
- [ ] Notifications / reminders panel

---

### **Phase 5 – Professional Dashboard UI**

**Goals:**
Create the professional workspace to manage clients, sessions, payments, and content.

#### Tasks

- [ ] Dashboard overview (client count, revenue summary, sessions)
- [ ] Schedule view (calendar component with mock data)
- [ ] Client list page:
- [ ] Filter by active / waiting / completed
- [ ] Client details sidebar
- [ ] Session tracking:
- [ ] Attendance status (present / absent / rescheduled)
- [ ] Notes input area
- [ ] Earnings tab:
- [ ] List of payments (mock)
- [ ] “Request payout” button (UI only)
- [ ] Content tab:
- [ ] Upload UI (video, article, program)
- [ ] Content list (status: draft / published)
- [ ] Profile settings (availability, rates, preferences)

---

### **Phase 6 – SENTIERS (School / Child Branch)**

**Goals:**
Build a dedicated section for the school/child mental health branch.

#### Tasks

- [ ] “Sentiers” landing page (overview of child & school services)
- [ ] Role selection: school / parent / child professional
- [ ] Evaluation form templates (mock)
- [ ] Packages page (evaluations, interventions, analysis)
- [ ] Progress tracking dashboard (mocked data)
- [ ] Parent info page (guidance + education resources)

---

### **Phase 7 – Admin Dashboard UI**

**Goals:**
Develop administrative tools to manage users, sessions, and platform content.

#### Tasks

- [ ] Admin login page (UI only)
- [ ] Dashboard overview (metrics placeholders)
- [ ] Client management:
- [ ] List of all clients
- [ ] Edit / deactivate client profile
- [ ] Professional management:
- [ ] List of professionals (filters by expertise, availability)
- [ ] Approve / reject requests
- [ ] Appointment management:
- [ ] Table of sessions with status
- [ ] Edit or cancel appointment (mock)
- [ ] Payment management (mocked transaction table)
- [ ] Content moderation UI
- [ ] CMS-style editor for homepage content

---

### **Phase 8 – UI Polish & Global UX Enhancements**

**Goals:**
Ensure design consistency, responsiveness, accessibility, and performance.

#### Tasks

- [ ] Apply consistent typography, spacing, and color tokens
- [ ] Add loading states and skeletons for all lists
- [ ] Add dark mode toggle (optional)
- [ ] Handle responsive design (mobile, tablet, desktop)
- [ ] Add animations with Framer Motion (page transitions, modals)
- [ ] Add breadcrumbs and improved navigation
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] SEO setup (metadata, OpenGraph, sitemap)

---

### **Phase 9 – Supabase Integration (Backend Phase)**

**Goals:**
Integrate real data, authentication, and database logic into the existing UI.

#### Tasks

- [ ] Connect Supabase client to Next.js
- [ ] Implement real user authentication (sign up / sign in / password reset)
- [ ] Store and retrieve profile data (client & professional)
- [ ] Sync appointments and availability from Supabase tables
- [ ] Implement role-based routing and authorization
- [ ] Persist payments, receipts, and content metadata
- [ ] Integrate Supabase storage for file uploads (profile pics, resources)
- [ ] Replace all mock data calls with Supabase queries
- [ ] Create admin role and permissions
- [ ] Configure row-level security policies

---

## 🧩 UI Component Inventory

| Category       | Components                                             |
| -------------- | ------------------------------------------------------ |
| **Navigation** | Navbar, Sidebar, Footer, Breadcrumbs                   |
| **Auth**       | LoginForm, SignupForm, RoleSelector, Stepper           |
| **Dashboard**  | StatsCard, DataTable, Tabs, ChartCard                  |
| **Forms**      | Input, Select, Switch, DatePicker, TextArea            |
| **Modals**     | AppointmentModal, ProfileEditModal, ContentUploadModal |
| **Feedback**   | Toast, Alert, EmptyState, Skeleton                     |
| **Content**    | ArticleCard, VideoCard, ResourceGrid                   |
| **Scheduling** | CalendarView, TimeSlotSelector                         |
| **Admin**      | UserTable, ContentEditor, DashboardMetrics             |

---

## 📦 Folder Structure (Recommended)

```

/app
/(public)
/home
/about
/contact
/(auth)
/login
/signup
/client
/dashboard
/appointments
/resources
/professional
/dashboard
/clients
/earnings
/content
/admin
/dashboard
/users
/payments
/sentiers
/overview
/packages
/progress
/components
/ui
/forms
/dashboard
/layout
/mock
clients.json
professionals.json
sessions.json

```
