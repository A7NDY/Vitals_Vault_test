# Data Storage Guide for Vitals Vault

Your app currently has three data storage options. Choose based on your needs:

---

## **Option 1: LocalStorage (Current Approach)**

**How it works:** Data stored in browser's local storage (survives page refresh, but only on that device)

### Pros:

- ✅ No backend needed
- ✅ Works offline
- ✅ Great for prototyping
- ✅ No server costs

### Cons:

- ❌ Data lost if user clears browser cache
- ❌ Data only on that device (not synced)
- ❌ Limited storage (~5-10MB)
- ❌ No sharing between users
- ❌ Not suitable for production

### Current Storage Keys in Your App:

```
vv_registered_users    → Array of all registered users
vv_user               → Currently logged-in user
```

### How to Use:

The app includes a clean Storage utility in `client/lib/storage.ts`:

```typescript
import Storage from "@/lib/storage";

// Get data
const user = Storage.get("vv_user");
const users = Storage.get("vv_registered_users", []);

// Save data
Storage.set("vv_user", { email: "john@example.com", role: "Doctor" });

// Remove data
Storage.remove("vv_user");

// Clear everything
Storage.clear();

// Check if exists
if (Storage.has("vv_user")) {
  /* ... */
}

// With expiration (expires in 30 minutes)
Storage.set("session_token", token, 30);
```

---

## **Option 2: Real Database (Recommended for Production)**

For a real healthcare application, use **Supabase** or **Neon**:

### Supabase (PostgreSQL + Auth)

**Best for:** Full backend with authentication

Features:

- PostgreSQL database
- Built-in user authentication
- Real-time features (websockets)
- File storage
- Auto-generated REST API

### Neon (Serverless PostgreSQL)

**Best for:** If you need only the database

Features:

- Serverless PostgreSQL
- Auto-scaling
- Perfect with Prisma ORM
- No need to manage servers

### Pros:

- ✅ Data persists permanently
- ✅ Synced across all devices
- ✅ Share data between users
- ✅ Secure password hashing on server
- ✅ Can handle millions of records
- ✅ Built-in backups
- ✅ Production-ready

### Cons:

- ❌ Requires internet connection
- ❌ Minimal setup cost (usually free tier available)
- ❌ Slightly more complex to implement

---

## **Implementation Strategy**

### Current Setup (Just LocalStorage):

1. User registers → saved to `localStorage`
2. User logs in → credentials checked against `localStorage`
3. User data → retrieved from `localStorage`

**Status:** ✅ Working but not persistent across devices

### For Small Team/MVP:

Keep using **localStorage** but improve reliability:

- Use the `Storage` utility in `client/lib/storage.ts`
- Add seed data for demo users
- Provide export/import functionality

### For Production App:

Migrate to **Supabase**:

1. Connect Supabase MCP → [Open MCP](#open-mcp-popover)
2. Create `users` table with Supabase
3. Replace localStorage calls with Supabase queries
4. Enable row-level security (RLS) for privacy

---

## **Data Models (If Using Database)**

Your app would need these tables in Supabase:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  full_name VARCHAR NOT NULL,
  phone VARCHAR,
  role ENUM('Doctor', 'Patient', 'Admin') NOT NULL,
  created_at TIMESTAMP
);

-- Patient vitals
CREATE TABLE vitals (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES users(id),
  heart_rate INT,
  blood_pressure VARCHAR,
  temperature FLOAT,
  recorded_at TIMESTAMP
);

-- Appointments
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  doctor_id UUID REFERENCES users(id),
  patient_id UUID REFERENCES users(id),
  scheduled_at TIMESTAMP,
  status VARCHAR,
  notes TEXT
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  content TEXT,
  created_at TIMESTAMP
);
```

---

## **Next Steps**

### To Keep Using LocalStorage:

No changes needed! The `Storage` utility in `client/lib/storage.ts` provides a cleaner interface.

### To Migrate to Supabase:

1. Tell me when you're ready
2. I'll help you:
   - Set up Supabase tables
   - Update Login/Register pages to use Supabase auth
   - Migrate localStorage queries to database queries
   - Ensure security with row-level security (RLS)

### Questions?

- **How much data?** If just demo/testing → localStorage is fine
- **Need sharing?** Different users need same data → use database
- **Production?** Always use database for security & persistence
- **Budget?** Supabase free tier covers most apps

---

## **Sample: Converting Login to Use Database**

### Current (LocalStorage):

```typescript
const users = JSON.parse(localStorage.getItem("vv_registered_users") || "[]");
const foundUser = users.find(
  (u) => u.email === email && u.password === password,
);
```

### Future (Supabase):

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: email,
  password: password,
});
```

Much simpler! Supabase handles password hashing & security automatically.
