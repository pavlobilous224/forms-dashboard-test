## Forms Dashboard

Mini application for managing forms with basic role-based access control, validation, and a simple REST API – implemented with the Next.js App Router.

### Tech Stack

- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS
- **Forms & Validation**: React Hook Form + Zod (shared schema between client and server)
- **State Management**: Zustand (auth session + toasts)
- **API**: Route Handlers under `app/api`
- **Auth**: Custom cookie-based auth (no external provider)

### Features

- **Public landing** (`/`)
  - Simple hero with CTA to `/login`.
  - Server component with metadata for SEO and social sharing.

- **Login & Roles** (`/login`)
  - Login form: `email` + `role` (`individual` or `admin`).
  - On submit, an HTTP-only cookie (`forms_auth`) is written and the client-side auth store is hydrated.
  - Logged-in users are redirected from `/` to `/forms`.

- **Forms list** (`/forms`)
  - Server-rendered list fetched from the app’s own API (`GET /api/forms`).
  - Table with title, status, fields count, and updated date.
  - Filter by status via query param (`?status=`).
  - CSV export (all or only selected rows).
  - Bulk delete for selected rows (admin only).

- **CRUD (admin only)**
  - `GET /forms/new` – create form.
  - `GET /forms/[id]` – edit existing form.
  - Backed by `POST /api/forms`, `PUT /api/forms/[id]`, `DELETE /api/forms/[id]`.
  - Shared `formSchema` (Zod) for both RHF on the client and request validation on the server.

### Auth & Authorization Design

- **Cookie format**
  - Name: `forms_auth`
  - Payload: JSON `{ email: string; role: "individual" | "admin" }`

- **Shared parsing logic**
  - `lib/auth-shared.ts` contains:
    - `AUTH_COOKIE_NAME`
    - `AuthSession` type
    - `parseAuthCookie(raw: string | undefined): AuthSession | null`
  - This module is used by:
    - `lib/server-auth.ts` (server-only wrapper),
    - `app/api/login/route.ts`, `app/api/logout/route.ts`,
    - `RootClientProviders` (for typing `initialSession`).

- **Server-only helpers**
  - `lib/server-auth.ts`:
    - `getServerSession()` – reads cookie via `cookies()` from `next/headers` and delegates to `parseAuthCookie`.
    - `hasAtLeastRole(session, requiredRole)` – simple role hierarchy helper.

- **Middleware (Edge Runtime)**
  - `middleware.ts` protects:
    - all `/forms/*` routes (requires any logged-in user),
    - `POST/PUT/DELETE` under `/api/forms/*` (requires `admin` role),
    - `/forms/new` and `/forms/[id]` pages (admin only).
  - Edge functions have stricter constraints on imports, so the middleware contains a minimal, local implementation of cookie parsing:
    - same cookie name and payload shape,
    - simple `JSON.parse` + validation of `email` and `role`.
  - This is an intentional duplication kept very small and aligned with the shared parser to avoid coupling middleware to server-only modules.

### Data Layer

- Forms are stored in a JSON file under `data/forms.json` and accessed via `lib/forms-repository.ts`.
- `forms-repository` exposes functions like `getForms`, `getFormById`, `createForm`, `updateForm`, `deleteForm` and encapsulates:
  - reading/writing the JSON file,
  - simple validation and domain errors (`ValidationError`, `NotFoundError`, `StorageError`).

### UX Details

- All form controls have labels and error messages from Zod.
- The layout is responsive (header + table + editor view).
- Admin-only actions (New form, Edit, Delete, bulk delete) are hidden for `individual` users.
- A small toast system (Zustand + `ToastProvider`) is used for user feedback on login, CRUD operations, and error states.

### Design Decisions & Trade-offs

- **Custom cookie-based auth instead of NextAuth**
  - The project brief explicitly allowed a simple fake login. Using a custom cookie (`forms_auth`) keeps the setup lightweight and makes the auth flow fully transparent in code, which is useful for an interview setting.
  - In a production system I would typically use a battle-tested solution (e.g. NextAuth or an internal auth service) for security, session rotation, and integrations, but here the goal is to demonstrate understanding of the flow end-to-end.

- **Server-auth split: shared parser + server-only wrapper**
  - Parsing and validating the auth cookie is centralized in `lib/auth-shared.ts` so that both the API layer and the client bootstrap logic use the same rules and types (`AuthSession`, `Role`).
  - `lib/server-auth.ts` is a server-only wrapper responsible for integrating with `cookies()` from `next/headers`. This keeps runtime-specific concerns (headers, request context) separate from pure parsing/validation logic.

- **Minimal duplication in middleware due to Edge constraints**
  - The Edge middleware needs to run before any server code and under stricter runtime constraints. Importing server modules (or in some cases even shared modules) into Edge functions can break the build on Vercel.
  - To keep the middleware robust and independent of server-only modules, it contains a very small, local implementation of cookie parsing with the same shape as `AuthSession`. The logic is intentionally trivial (one cookie, email + role check) so that the risk of divergence is low, and the shared module still defines the canonical contract.

- **JSON file for persistence**
  - The brief explicitly requested no real database, so forms are stored in `data/forms.json` behind `lib/forms-repository.ts`.
  - The repository module is responsible for all I/O and domain errors (`ValidationError`, `NotFoundError`, `StorageError`), so that the rest of the app can be written as if it worked with a real data source (DB or API) without leaking filesystem details.

- **Shared Zod schema between client and server**
  - `formSchema` is used both in React Hook Form on the client and in the API route handlers. This guarantees that the constraints (min/max, required fields, enum values) are not duplicated and cannot drift over time.
  - The same pattern is used for login: the `loginSchema` defines what the server accepts, and the form uses it for client-side validation.

- **Role model kept intentionally simple**
  - Roles are `individual` and `admin`, defined once in `lib/types.ts` (`roleValues`) and reused across schemas and UI. There is a tiny helper (`hasAtLeastRole`) instead of a heavier RBAC system because the scope is small.
  - This keeps the permission model easy to reason about while still exercising checks in both middleware and route handlers.

- **Separation of concerns in the forms UI**
  - Listing, filtering, editing and bulk actions are split into dedicated components:
    - `FormsTable` – purely responsible for rendering rows and per-row actions.
    - `FormsFilters` – status filter, selection-aware Export/Delete buttons, and “New form”.
    - `FormEditor` – form fields + validation + submit.
    - `FormsPageContent` – orchestrates fetching, selection state, bulk export/delete.
  - This separation makes each component easier to test and change independently (for example, swapping out the data source or adding pagination).

### Testing

- **Test runner**: Jest (`jest`, `ts-jest`, `jest-environment-jsdom`)
- **Assertion & utilities**:
  - `@testing-library/jest-dom` for DOM-focused matchers,
  - `@testing-library/react` / `@testing-library/user-event` (ready for component tests).

Current test coverage focuses on **domain logic**:

- `lib/__tests__/auth-shared.test.ts`
  - `parseAuthCookie` – valid vs invalid JSON, missing fields, invalid role.
  - `AUTH_COOKIE_NAME` – ensures the cookie name is stable across the app.
- `lib/__tests__/formsToCsv.test.ts`
  - `formsToCsv` – header row, date formatting, escaping of quotes and commas.
- `lib/__tests__/schemas.test.ts`
  - `loginSchema` – valid credentials vs invalid email.
  - `formSchema` – valid payload, too-short title, invalid status.

The goal is to keep business rules (auth/session shape, validation, CSV export) well specified and easy to refactor without breaking behaviour.

To run the tests:

```bash
pnpm test
```

### Running Locally

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:3000`.

Any email is accepted on the login form; choose **Individual** or **Admin** to simulate the corresponding role.
