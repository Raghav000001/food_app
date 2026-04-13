# 🔐 Clerk Authentication Integration Guide

> **Project:** Food App (Zomato Clone)  
> **Stack:** Node.js + Express (auth_service) · React + Vite (web)  
> **Clerk SDK versions:** `@clerk/express` (backend) · `@clerk/react` (frontend)  
> **Last updated:** April 2026

---

## Table of Contents

1. [Overview](#1-overview)
2. [How Clerk Works — Architecture Primer](#2-how-clerk-works--architecture-primer)
3. [Clerk Dashboard Setup](#3-clerk-dashboard-setup)
4. [Backend — auth_service (Express + TypeScript)](#4-backend--auth_service-express--typescript)
   - 4.1 [Install the SDK](#41-install-the-sdk)
   - 4.2 [Environment Variables](#42-environment-variables)
   - 4.3 [Apply `clerkMiddleware` globally](#43-apply-clerkmiddleware-globally)
   - 4.4 [Protect routes with `requireAuth`](#44-protect-routes-with-requireauth)
   - 4.5 [Read auth data with `getAuth`](#45-read-auth-data-with-getauth)
   - 4.6 [Use `clerkClient` to fetch user data](#46-use-clerkclient-to-fetch-user-data)
   - 4.7 [Sync Clerk user to your MongoDB (webhook)](#47-sync-clerk-user-to-your-mongodb-webhook)
   - 4.8 [Full auth_service integration example](#48-full-auth_service-integration-example)
5. [Frontend — web (React + Vite + TypeScript)](#5-frontend--web-react--vite--typescript)
   - 5.1 [Install the SDK](#51-install-the-sdk)
   - 5.2 [Environment Variables](#52-environment-variables)
   - 5.3 [Wrap the app with `<ClerkProvider>`](#53-wrap-the-app-with-clerkprovider)
   - 5.4 [Pre-built UI Components](#54-pre-built-ui-components)
   - 5.5 [Protecting routes with `<SignedIn>` / `<SignedOut>`](#55-protecting-routes-with-signedin--signedout)
   - 5.6 [Protecting routes with React Router v7](#56-protecting-routes-with-react-router-v7)
   - 5.7 [Sending authenticated requests to the backend](#57-sending-authenticated-requests-to-the-backend)
   - 5.8 [Useful Hooks](#58-useful-hooks)
6. [Auth Flow — End-to-End Sequence](#6-auth-flow--end-to-end-sequence)
7. [Environment Variable Reference](#7-environment-variable-reference)
8. [Common Gotchas & Troubleshooting](#8-common-gotchas--troubleshooting)
9. [Further Reading](#9-further-reading)

---

## 1. Overview

Clerk is a **fully-managed authentication service** that replaces the need to build signup/login flows, JWT handling, session management, and user management from scratch.

In this project, Clerk is used as the **sole authentication layer** for the `auth_service`. Other microservices (e.g., `rider_service`) verify tokens issued by Clerk by calling the `auth_service` or by verifying the Clerk JWT directly using the public key.

**What Clerk handles for you:**
- Sign Up / Sign In / Sign Out
- Email/password, Google OAuth, GitHub OAuth, phone OTP
- Session tokens (short-lived JWTs) + session management
- User profile & metadata management
- Webhooks for syncing users to your own DB

---

## 2. How Clerk Works — Architecture Primer

```
┌─────────────────────────────────────────────────────────────────┐
│                     Browser (React App)                         │
│                                                                 │
│  1. User signs in via Clerk's <SignIn /> component              │
│  2. Clerk issues a short-lived SESSION TOKEN (JWT)              │
│  3. Token is stored in a secure cookie managed by Clerk         │
│  4. Every API call includes this token in the Authorization     │
│     header: "Bearer <token>"                                    │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTPS request with Bearer token
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│               auth_service (Express + @clerk/express)           │
│                                                                 │
│  5. clerkMiddleware() intercepts the request                    │
│  6. Validates the JWT against Clerk's public keys (JWKS)        │
│  7. Attaches auth object to req.auth { userId, sessionId }      │
│  8. Your route handler runs — user is verified                  │
└─────────────────────────────────────────────────────────────────┘
```

> **Key insight:** You never manage private keys or token generation. Clerk signs all JWTs; your Express middleware just **verifies** them using Clerk's public JWKS endpoint.

---

## 3. Clerk Dashboard Setup

1. Go to [https://dashboard.clerk.com](https://dashboard.clerk.com) and create a free account.
2. Click **"Add application"** → give it a name (e.g., `food-app`).
3. Choose sign-in methods: **Email + Password** and **Google OAuth** are recommended for a food app.
4. After creation, navigate to **API Keys** in the left sidebar.
5. Copy the following two values:
   - **Publishable Key** → `pk_test_...` (used in the frontend)
   - **Secret Key** → `sk_test_...` (used in the backend — never expose this)
6. If you plan to sync users to MongoDB via webhooks:
   - Go to **Webhooks** → **Add Endpoint**
   - Enter your public URL: `https://yourdomain.com/api/v1/webhooks/clerk`
   - Subscribe to events: `user.created`, `user.updated`, `user.deleted`
   - Copy the **Signing Secret** (starts with `whsec_...`)

---

## 4. Backend — auth_service (Express + TypeScript)

### 4.1 Install the SDK

```bash
# Inside /server/auth_service
npm install @clerk/express
```

This installs:
- `clerkMiddleware()` — global middleware to parse and validate Clerk session tokens
- `requireAuth()` — route-level guard middleware
- `getAuth()` — helper to extract `userId`, `sessionId`, etc. from a request
- `clerkClient` — server-side client to call Clerk's Backend API

### 4.2 Environment Variables

Add the following to `/server/auth_service/.env`:

```env
# Clerk Secret Key — from Clerk Dashboard > API Keys
CLERK_SECRET_KEY=

# Clerk Publishable Key (optional in backend but good to have)
CLERK_PUBLISHABLE_KEY=

# Only needed if using webhooks to sync users
CLERK_WEBHOOK_SECRET=
```

Update `/server/auth_service/sample.env`:

```env
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=
CLERK_WEBHOOK_SECRET=
```

### 4.3 Apply `clerkMiddleware` globally

Update `/server/auth_service/src/server.ts`:

```typescript
import express from "express"
import { clerkMiddleware } from "@clerk/express"          // ← ADD THIS
import { genericErrorHandler } from "./middlewares/error.middleware.js"
import { attachCorelationId } from "./middlewares/corelation.middleware.js"
import { connectDB } from "./config/db.config.js"
import { serverConfig } from "./config/index.js"
import v1Router from "./routes/v1/index.routes.js"

const app = express()

app.use(attachCorelationId)
app.use(clerkMiddleware())                                // ← ADD THIS (before routes)
app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))

app.use("/api/v1", v1Router)
app.use(genericErrorHandler)

connectDB().then(() => {
  app.listen(serverConfig.PORT, () => {
    console.log("app is running on port", serverConfig.PORT)
  })
}).catch((error) => {
  console.log("error connecting to database", error)
})
```

> **Why global?** `clerkMiddleware()` is lightweight — it only parses the token if present. Placing it globally means ALL routes can optionally call `getAuth(req)` without worrying about whether auth was set up.

### 4.4 Protect routes with `requireAuth`

Use `requireAuth()` as middleware on any route that must be accessed only by signed-in users:

```typescript
// src/routes/v1/user.routes.ts
import { Router } from "express"
import { requireAuth } from "@clerk/express"
import { getUserProfile, updateUserProfile } from "../../controllers/user.controller.js"

const router = Router()

// Only authenticated users can access these routes
router.get("/profile",  requireAuth(), getUserProfile)
router.patch("/profile", requireAuth(), updateUserProfile)

export default router
```

If an unauthenticated user hits a `requireAuth()` protected route, Clerk returns a **401 Unauthorized** response automatically.

### 4.5 Read auth data with `getAuth`

Inside any controller or middleware, use `getAuth(req)` to read the authenticated user's identity:

```typescript
// src/controllers/user.controller.ts
import { Request, Response } from "express"
import { getAuth } from "@clerk/express"

export const getUserProfile = async (req: Request, res: Response) => {
  const { userId, sessionId, isAuthenticated } = getAuth(req)

  if (!isAuthenticated || !userId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  // userId is the Clerk user ID — use this to query your MongoDB
  const user = await UserModel.findOne({ clerkId: userId })

  if (!user) {
    return res.status(404).json({ message: "User not found" })
  }

  res.json({ user })
}
```

**Auth object fields returned by `getAuth(req)`:**

| Field           | Type      | Description                                          |
|-----------------|-----------|------------------------------------------------------|
| `userId`        | `string`  | Clerk's unique user ID (e.g. `user_2abc...`)         |
| `sessionId`     | `string`  | ID of the current session                            |
| `isAuthenticated` | `boolean` | `true` if a valid token was found                  |
| `getToken()`    | `function`| Async fn to get the raw JWT string                  |
| `orgId`         | `string \| null` | Organization ID (if orgs feature is enabled)  |

### 4.6 Use `clerkClient` to fetch user data

`clerkClient` lets you call Clerk's Backend API to read/write user data:

```typescript
// src/controllers/user.controller.ts
import { clerkClient, getAuth } from "@clerk/express"
import { Request, Response } from "express"

export const getClerkUser = async (req: Request, res: Response) => {
  const { userId } = getAuth(req)

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" })
  }

  // Fetch the full Clerk User object
  const clerkUser = await clerkClient.users.getUser(userId)

  res.json({
    id: clerkUser.id,
    email: clerkUser.emailAddresses[0]?.emailAddress,
    firstName: clerkUser.firstName,
    lastName: clerkUser.lastName,
    imageUrl: clerkUser.imageUrl,
    createdAt: clerkUser.createdAt,
  })
}
```

**Other useful `clerkClient.users` methods:**

```typescript
// List all users (paginated)
const users = await clerkClient.users.getUserList({ limit: 20, offset: 0 })

// Update user metadata
await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: { role: "customer" },
})

// Delete a user
await clerkClient.users.deleteUser(userId)
```

### 4.7 Sync Clerk user to your MongoDB (webhook)

When a user signs up via Clerk, you need to save them in your MongoDB to associate orders, addresses, etc. Use **Clerk Webhooks** for this.

**Step 1 — Install webhook parsing library:**

```bash
npm install svix
```

**Step 2 — Create the webhook handler:**

```typescript
// src/controllers/webhook.controller.ts
import { Request, Response } from "express"
import { Webhook } from "svix"
import UserModel from "../models/user.model.js"
import { serverConfig } from "../config/index.js"

export const clerkWebhookHandler = async (req: Request, res: Response) => {
  const webhookSecret = serverConfig.CLERK_WEBHOOK_SECRET

  if (!webhookSecret) {
    return res.status(500).json({ message: "Webhook secret not configured" })
  }

  // Get the Svix headers for verification
  const svixId        = req.headers["svix-id"] as string
  const svixTimestamp = req.headers["svix-timestamp"] as string
  const svixSignature = req.headers["svix-signature"] as string

  if (!svixId || !svixTimestamp || !svixSignature) {
    return res.status(400).json({ message: "Missing svix headers" })
  }

  // Verify the webhook signature
  const wh = new Webhook(webhookSecret)
  let event: any

  try {
    // Note: req.body must be the RAW body string, not parsed JSON
    event = wh.verify(JSON.stringify(req.body), {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    })
  } catch (err) {
    return res.status(400).json({ message: "Webhook verification failed" })
  }

  const { type, data } = event

  switch (type) {
    case "user.created": {
      await UserModel.create({
        clerkId: data.id,
        email: data.email_addresses[0]?.email_address,
        firstName: data.first_name,
        lastName: data.last_name,
        imageUrl: data.image_url,
      })
      break
    }

    case "user.updated": {
      await UserModel.findOneAndUpdate(
        { clerkId: data.id },
        {
          email: data.email_addresses[0]?.email_address,
          firstName: data.first_name,
          lastName: data.last_name,
          imageUrl: data.image_url,
        }
      )
      break
    }

    case "user.deleted": {
      await UserModel.findOneAndDelete({ clerkId: data.id })
      break
    }
  }

  res.status(200).json({ received: true })
}
```

**Step 3 — Register the webhook route (NO auth middleware, raw body needed):**

```typescript
// src/routes/v1/webhook.routes.ts
import { Router } from "express"
import express from "express"
import { clerkWebhookHandler } from "../../controllers/webhook.controller.js"

const router = Router()

// ⚠️ Use raw body parser — Svix needs the raw body to verify signature
router.post(
  "/clerk",
  express.raw({ type: "application/json" }),
  clerkWebhookHandler
)

export default router
```

> **Important:** The webhook route must NOT be protected by `requireAuth()`. Make sure `express.raw()` is applied BEFORE `express.json()` for this route.

**Step 4 — Mount the webhook router in your v1 index:**

```typescript
// src/routes/v1/index.routes.ts
import { Router } from "express"
import userRouter from "./user.routes.js"
import webhookRouter from "./webhook.routes.js"

const router = Router()

router.use("/webhooks", webhookRouter)   // Public — no auth
router.use("/users", userRouter)         // Protected

export default router
```

### 4.8 Full auth_service integration example

Here's the recommended User model for syncing with Clerk:

```typescript
// src/models/user.model.ts
import mongoose, { Schema, Document } from "mongoose"

export interface IUser extends Document {
  clerkId: string       // Clerk's user ID — primary link
  email: string
  firstName?: string
  lastName?: string
  imageUrl?: string
  role: "customer" | "restaurant_owner" | "delivery_rider"
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    clerkId:   { type: String, required: true, unique: true, index: true },
    email:     { type: String, required: true, unique: true },
    firstName: { type: String },
    lastName:  { type: String },
    imageUrl:  { type: String },
    role:      { type: String, enum: ["customer", "restaurant_owner", "delivery_rider"], default: "customer" },
  },
  { timestamps: true }
)

export default mongoose.model<IUser>("User", UserSchema)
```

---

## 5. Frontend — web (React + Vite + TypeScript)

### 5.1 Install the SDK

```bash
# Inside /web
npm install @clerk/react
```

### 5.2 Environment Variables

Add to `/web/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXX
```

> **Vite requires the `VITE_` prefix** for environment variables to be available in browser code. Never put your Secret Key here.

### 5.3 Wrap the app with `<ClerkProvider>`

Update `/web/src/main.tsx`:

```tsx
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { ClerkProvider } from "@clerk/react"
import { BrowserRouter } from "react-router-dom"
import App from "./App.tsx"
import "./index.css"

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!publishableKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY in .env")
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ClerkProvider publishableKey={publishableKey}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkProvider>
  </StrictMode>
)
```

### 5.4 Pre-built UI Components

Clerk provides drop-in UI components. Add them to your app — no building login pages from scratch:

```tsx
import {
  SignIn,
  SignUp,
  UserButton,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
} from "@clerk/react"
```

**Render the sign-in form:**

```tsx
// src/pages/LoginPage.tsx
import { SignIn } from "@clerk/react"

const LoginPage = () => (
  <div className="flex justify-center items-center min-h-screen">
    <SignIn routing="path" path="/login" />
  </div>
)

export default LoginPage
```

**Render the sign-up form:**

```tsx
// src/pages/RegisterPage.tsx
import { SignUp } from "@clerk/react"

const RegisterPage = () => (
  <div className="flex justify-center items-center min-h-screen">
    <SignUp routing="path" path="/register" />
  </div>
)

export default RegisterPage
```

**User button (avatar + dropdown) for the navbar:**

```tsx
import { UserButton } from "@clerk/react"

// Shows signed-in user's avatar. Click to open account management.
<UserButton afterSignOutUrl="/" />
```

### 5.5 Protecting routes with `<SignedIn>` / `<SignedOut>`

```tsx
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/react"

const Navbar = () => (
  <nav>
    <SignedOut>
      {/* Only shown to unauthenticated users */}
      <SignInButton mode="modal">
        <button>Login</button>
      </SignInButton>
    </SignedOut>

    <SignedIn>
      {/* Only shown to authenticated users */}
      <UserButton afterSignOutUrl="/" />
    </SignedIn>
  </nav>
)
```

### 5.6 Protecting routes with React Router v7

Your project uses `react-router-dom` v7. Here's how to create a protected route wrapper:

```tsx
// src/components/ProtectedRoute.tsx
import { useAuth } from "@clerk/react"
import { Navigate, Outlet } from "react-router-dom"

const ProtectedRoute = () => {
  const { isSignedIn, isLoaded } = useAuth()

  // Wait until Clerk has loaded auth state
  if (!isLoaded) {
    return <div>Loading...</div>
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
```

```tsx
// src/App.tsx
import { Routes, Route } from "react-router-dom"
import { SignIn, SignUp } from "@clerk/react"
import ProtectedRoute from "./components/ProtectedRoute.tsx"
import HomePage from "./pages/HomePage.tsx"
import DashboardPage from "./pages/DashboardPage.tsx"

const App = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<HomePage />} />
    <Route path="/login/*" element={<SignIn routing="path" path="/login" />} />
    <Route path="/register/*" element={<SignUp routing="path" path="/register" />} />

    {/* Protected routes — redirect to /login if not signed in */}
    <Route element={<ProtectedRoute />}>
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/orders" element={<OrdersPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Route>
  </Routes>
)

export default App
```

### 5.7 Sending authenticated requests to the backend

Clerk gives you a `getToken()` method that returns the JWT for the current session. Attach it as a `Bearer` token on every API call:

```tsx
// src/hooks/useApi.ts
import { useAuth } from "@clerk/react"
import axios from "axios"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"

export const useApi = () => {
  const { getToken } = useAuth()

  const authRequest = async (method: string, endpoint: string, data?: unknown) => {
    const token = await getToken()

    const response = await axios({
      method,
      url: `${API_BASE_URL}${endpoint}`,
      data,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    return response.data
  }

  return {
    get:    (endpoint: string)               => authRequest("GET", endpoint),
    post:   (endpoint: string, data: unknown) => authRequest("POST", endpoint, data),
    patch:  (endpoint: string, data: unknown) => authRequest("PATCH", endpoint, data),
    delete: (endpoint: string)               => authRequest("DELETE", endpoint),
  }
}
```

**Usage in a component:**

```tsx
import { useApi } from "../hooks/useApi.ts"
import { useEffect, useState } from "react"

const ProfilePage = () => {
  const { get } = useApi()
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    get("/users/profile").then(setProfile)
  }, [])

  return <div>{profile?.email}</div>
}
```

### 5.8 Useful Hooks

| Hook | What it gives you |
|------|-------------------|
| `useAuth()` | `isSignedIn`, `isLoaded`, `userId`, `getToken()`, `signOut()` |
| `useUser()` | Full `user` object: `firstName`, `lastName`, `emailAddresses`, `imageUrl`, `publicMetadata` |
| `useClerk()` | Low-level Clerk instance: `openSignIn()`, `openSignUp()`, `openUserProfile()` |
| `useSession()` | Session object with expiry info |

**Example — reading the user's name:**

```tsx
import { useUser } from "@clerk/react"

const Greeter = () => {
  const { user, isLoaded } = useUser()

  if (!isLoaded) return null

  return <h1>Welcome back, {user?.firstName}! 🍔</h1>
}
```

**Example — sign out button:**

```tsx
import { useClerk } from "@clerk/react"

const SignOutButton = () => {
  const { signOut } = useClerk()

  return (
    <button onClick={() => signOut({ redirectUrl: "/" })}>
      Sign Out
    </button>
  )
}
```

---

## 6. Auth Flow — End-to-End Sequence

```
User opens food-app in browser
        │
        ▼
[React] ClerkProvider loads — checks for existing session cookie
        │
        ├── Session found → user is signed in  → ProtectedRoute lets them through
        │
        └── No session   → user is signed out → Navigate to /login
                │
                ▼
        [React] <SignIn /> form rendered (Clerk hosted UI)
                │
                ▼
        User enters credentials → Clerk verifies them
                │
                ▼
        Clerk issues a JWT session token (stored in __session cookie)
                │
                ▼
        [React] useAuth().isSignedIn = true → redirect to dashboard
                │
                ▼
        User makes API call (e.g. GET /api/v1/users/profile)
                │
                ▼
        [React] useApi() → getToken() → attaches "Authorization: Bearer <jwt>"
                │
                ▼
        [Express] clerkMiddleware() → validates JWT using Clerk JWKS
                │
                ▼
        [Express] requireAuth() → checks auth is valid → passes to controller
                │
                ▼
        [Express] getAuth(req).userId → query MongoDB → return user profile
                │
                ▼
        Response sent back to React → displayed in UI
```

---

## 7. Environment Variable Reference

### Backend (`/server/auth_service/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `CLERK_SECRET_KEY` | ✅ Yes | Clerk Backend API key — keep secret! |
| `CLERK_PUBLISHABLE_KEY` | ⬜ Optional | Frontend key (not used in backend logic) |
| `CLERK_WEBHOOK_SECRET` | ✅ If using webhooks | Svix signing secret for webhook verification |

### Frontend (`/web/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_CLERK_PUBLISHABLE_KEY` | ✅ Yes | Clerk Frontend API key — safe to expose in browser |
| `VITE_API_BASE_URL` | ⬜ Optional | Base URL of your auth_service backend |

---

## 8. Common Gotchas & Troubleshooting

### ❌ `clerkMiddleware() must be called before getAuth()`

Make sure `app.use(clerkMiddleware())` is placed **before** your routes in `server.ts`.

---

### ❌ Frontend shows blank page after login

Make sure `VITE_CLERK_PUBLISHABLE_KEY` is set in `/web/.env` (not `.env.local` or anywhere else Vite won't read), and restart the dev server after editing `.env`.

---

### ❌ `401 Unauthorized` even though user is logged in

The token may not be attached to the request. Verify:
1. `getToken()` returns a non-null value in the frontend
2. The `Authorization: Bearer <token>` header is being sent
3. The backend CORS config allows the `Authorization` header:

```typescript
import cors from "cors"

app.use(cors({
  origin: "http://localhost:5173",
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}))
```

---

### ❌ Webhook verification fails with 400

The `clerkWebhookHandler` needs the **raw body** (Buffer/string), NOT a parsed JSON object. Make sure this route uses `express.raw({ type: "application/json" })` and is mounted BEFORE `express.json()` in the middleware chain.

---

### ❌ `Cannot find module '@clerk/express'`

Run `npm install @clerk/express` inside `/server/auth_service`. Make sure you're not accidentally running it at the repo root.

---

### ❌ TypeScript error — `req.auth` does not exist on type `Request`

The `@clerk/express` types extend Express's `Request` type automatically. If you see this error:
1. Ensure you import types from `@clerk/express`, not `express` directly for the typed auth.
2. Use `getAuth(req)` instead of accessing `req.auth` directly.

---

## 9. Further Reading

| Resource | URL |
|----------|-----|
| Clerk Express SDK Reference | https://clerk.com/docs/references/express/overview |
| Clerk React Quickstart | https://clerk.com/docs/quickstarts/react |
| Express Quickstart | https://clerk.com/docs/expressjs/getting-started/quickstart |
| Webhooks Guide | https://clerk.com/docs/integrations/webhooks/sync-data |
| Clerk Backend SDK | https://clerk.com/docs/js-backend/getting-started/quickstart |
| Auth Object Reference | https://clerk.com/docs/reference/backend/types/auth-object |
| Clerk Dashboard | https://dashboard.clerk.com |
| Clerk Changelog | https://clerk.com/changelog |

---

> 💡 **Tip for this project:** Start by integrating Clerk into the frontend first and confirming sign-in/sign-out works. Then add `clerkMiddleware()` to the backend and test a single protected route (`GET /api/v1/users/profile`) before building out full webhook sync.
