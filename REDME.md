# RND TECHNOSOFT CRM

A full-stack CRM built with Next.js 14 (App Router), Express, MySQL, and Clerk for auth.

---

## Project Structure

```
/
├── frontend/          ← Next.js app  (crm/ folder)
│   ├── app/
│   │   ├── (dashboard)/   ← All post-login pages
│   │   └── ...
│   ├── components/
│   └── middleware.ts
│
└── backend/           ← Express API
    ├── controllers/
    ├── routes/
    ├── middleware/
    ├── config/
    └── schema.sql
```

---

## 1. Database Setup

Run the schema once on your MySQL instance:

```bash
mysql -u root -p < backend/schema.sql
```

This creates all 16 tables and seeds the integrations + company settings rows.

---

## 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in .env with your MySQL credentials and Clerk keys
npm run dev
```

**Required packages** (if not already installed):
```bash
npm install express @clerk/express mysql2 cors helmet morgan express-rate-limit dotenv svix
```

The API runs on `http://localhost:5000`.

---

## 3. Frontend Setup

```bash
cd frontend   # (your Next.js project root)
npm install
cp .env.example .env.local
# Fill in .env.local with your Clerk publishable key and API URL
npm run dev
```

The app runs on `http://localhost:3000`.

---

## 4. Clerk Webhook

In your Clerk dashboard, create a webhook pointing to:
```
https://yourdomain.com/api/webhook/clerk
```

Enable these events:
- `user.created`
- `user.updated`
- `user.deleted`

This keeps your local `users` table in sync with Clerk.

---

## 5. File Integration Into Your Existing Project

### Frontend files to add/replace:

| File | Action |
|------|--------|
| `app/(dashboard)/layout.jsx` + `.module.css` | Add — dashboard shell |
| `app/(dashboard)/dashboard/page.jsx` | Add — dashboard home |
| `app/(dashboard)/leads/*` | Add — leads list, detail, new form |
| `app/(dashboard)/tasks/*` | Add — kanban + new form |
| `app/(dashboard)/reminders/` | Add |
| `app/(dashboard)/meetings/` | Add |
| `app/(dashboard)/notes/` | Add |
| `app/(dashboard)/chat/` | Add |
| `app/(dashboard)/calendar/` | Add |
| `app/(dashboard)/customers/` | Add |
| `app/(dashboard)/invoice/*` | Add |
| `app/(dashboard)/storage/` | Add |
| `app/(dashboard)/reports/` | Add |
| `app/(dashboard)/hr/*` | Add |
| `app/(dashboard)/hr-ops/*` | Add |
| `app/(dashboard)/settings/*` | Add |
| `app/(dashboard)/add-package/` | Replace existing standalone page |
| `app/(dashboard)/cart/` | Replace existing standalone page |
| `app/(dashboard)/search/` | Add |
| `components/Sidebar/` | Add |
| `components/DashboardTopbar/` | Add |
| `components/ThemeToggle/` | Add (or keep existing) |
| `middleware.ts` | Replace |

### Backend files to add:

| File | Action |
|------|--------|
| `controllers/leadController.js` | Replace existing |
| `controllers/taskController.js` | Replace existing |
| `controllers/reminderController.js` | Add |
| `controllers/meetingController.js` | Add |
| `controllers/noteController.js` | Add |
| `controllers/customerController.js` | Add |
| `controllers/invoiceController.js` | Add |
| `controllers/chatController.js` | Add |
| `controllers/hrController.js` | Add |
| `controllers/hrOpsController.js` | Add |
| `controllers/settingsController.js` | Add |
| `controllers/storageController.js` | Add |
| `controllers/searchController.js` | Add |
| `middleware/clerk-verify.js` | Add |
| `routes/leads.js` | Replace existing |
| `routes/tasks.js` | Replace existing |
| `routes/users.js` | Add/Replace |
| `routes/v2.js` | Add |
| `routes/index.js` | Replace (adds `router.use("/", v2Router)`) |

---

## 6. API Reference

### Auth
All routes require `Authorization: Bearer <clerk_token>` header.
Get the token with `const token = await getToken()` from `useAuth()`.

### Leads
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/leads` | List with search/status filter + pagination |
| POST   | `/api/leads` | Create lead |
| GET    | `/api/leads/:id` | Detail with linked tasks, notes, meetings |
| PUT    | `/api/leads/:id` | Update lead |
| PATCH  | `/api/leads/:id/status` | Update status only |
| DELETE | `/api/leads/:id` | Delete |

### Tasks
`GET/POST /api/tasks`, `GET/PUT/PATCH/DELETE /api/tasks/:id`

### Reminders
`GET/POST /api/reminders`, `PATCH/DELETE /api/reminders/:id`

### Meetings
`GET/POST /api/meetings`, `DELETE /api/meetings/:id`

### Notes
`GET/POST /api/notes`, `PUT/DELETE /api/notes/:id`

### Customers
`GET/POST /api/customers`, `PUT/DELETE /api/customers/:id`

### Invoices
`GET/POST /api/invoices`, `PATCH /api/invoices/:id/status`, `DELETE /api/invoices/:id`
Query: `?type=sales|purchase|proforma&status=paid|unpaid|partial|draft`

### Chat
`GET /api/chat/:otherId` — conversation with a user  
`POST /api/chat` — send message `{ receiver_id, body }`  
`GET /api/chat/unread` — unread count

### HR
`GET/POST /api/hr/attendance?month=&year=`  
`GET/POST /api/hr/leaves`  
`PATCH /api/hr/leaves/:id/approve`  
`PATCH /api/hr/leaves/:id/reject`

### HR Ops
`GET/POST /api/hr-ops/payroll?month=&year=`  
`PATCH /api/hr-ops/payroll/:id/paid`  
`GET/POST /api/hr-ops/appraisals`

### Settings
`GET/PUT /api/settings/company`  
`GET /api/integrations`  
`POST /api/integrations/:key/toggle`

### Storage
`GET /api/storage` — usage stats + file list

### Search
`GET /api/search?q=keyword` — searches leads, tasks, customers, notes

### Dashboard
`GET /api/dashboard` — stats for my leads, overdue tasks, team performance

---

## 7. Production Checklist

- [ ] Set `NODE_ENV=production` in backend `.env`
- [ ] Use a connection pool (already done with `mysql2/promise`)
- [ ] Put your Express API behind Nginx or a reverse proxy
- [ ] Use HTTPS everywhere — Clerk requires it for webhooks
- [ ] Set `FRONTEND_URL` in backend `.env` to your actual domain
- [ ] Configure Clerk webhook in the Clerk dashboard
- [ ] Run `schema.sql` on your production MySQL instance
- [ ] Store secrets in environment variables, never in code
- [ ] Consider rate limiting per-user for the chat endpoint if you have many users

---

## 8. Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 (App Router), CSS Modules |
| Auth | Clerk |
| Backend | Node.js, Express |
| Database | MySQL (mysql2) |
| Fonts | Montserrat, Lora (Google Fonts) |
| Icons | Font Awesome 6 |