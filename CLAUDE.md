# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — Vite dev server (HMR).
- `npm run build` — `tsc -b && vite build`. The TypeScript project-references build runs before bundling; both must pass.
- `npm run lint` — ESLint over the entire repo. There are no unit tests configured.
- `npm run preview` — Serve the production build locally.
- `npm run gen:types` — Regenerate `src/types/api-schema.d.ts` from `http://localhost:8000/swagger-json` (requires the backend running locally).

Install with `npm install` (the repo has both `pnpm-lock.yaml` and `package-lock.json`, but the Dockerfile and scripts use npm with `--legacy-peer-deps` because `openapi-typescript` conflicts with `typescript@6`).

`.env` must define `VITE_API_BASE_URL` (REST root, e.g. `https://.../api/v1`) and `VITE_STATIC_URL` (used for serving uploaded files/logos). Vite inlines these at build time, so the Docker image takes them as build args (see [Dockerfile](Dockerfile) and [docker-compose.yml](docker-compose.yml)).

Path alias: `@/` → `src/` (configured in both [vite.config.ts](vite.config.ts) and [tsconfig.json](tsconfig.json)).

## Architecture

### Three portals share one React app

The router in [src/App.tsx](src/App.tsx) splits routes into three guarded sections:

- **Public / candidate** (`MainLayout`): `/`, `/jobs`, `/companies`, `/profiles/:userId`, `/tools/*`. Authenticated sub-tree under `AuthenticatedRoute` adds `/account/*` (CV builder, resumes, saved jobs, subscriber, settings) and `/notifications`.
- **Admin** (`/admin/*`, `ProtectedRoute` + `AdminLayout`): **SUPER_ADMIN only** — any other role hits `/403`.
- **HR** (`/hr/*`, `HrRoute` + `HrLayout`): role `HR` or `SUPER_ADMIN`. HR users must have `user.company._id` set or they are redirected to `/403`.

The auth bootstrap in `App.tsx` calls `authApi.refreshToken()` on mount and blocks rendering until done — this is what prevents login/logout flicker. Don't render routes until `isLoading` is false.

### Auth + permissions

[src/stores/auth.store.ts](src/stores/auth.store.ts) is a Zustand store holding `user`, `accessToken`, `isAuthenticated`. The refresh token lives in an httpOnly cookie (axios is configured `withCredentials: true`); only the access token is in memory.

[src/lib/axios.ts](src/lib/axios.ts) attaches `Authorization: Bearer ...` per request and auto-refreshes on 401:

- A single in-flight refresh is shared across concurrent failures via `refreshQueue`.
- Refresh is skipped for `/auth/login` and `/auth/refresh` to avoid loops.
- On refresh failure, store is cleared and the page is hard-redirected to `/login`.

Permission model:

- `SUPER_ADMIN` bypasses all checks (in [Access.tsx](src/components/guards/Access.tsx), `useHasPermission`, and route guards).
- Other roles must have a permission whose `method` + `apiPath` matches. Canonical permission tuples live in [src/lib/permissions.ts](src/lib/permissions.ts) (`ALL_PERMISSIONS`, `ALL_MODULES`) — use those rather than hard-coding strings.
- The `<Access permission={...}>` wrapper either hides children or shows an inline "Truy cập bị từ chối" panel.
- HR vs admin separation: route guards enforce *who can enter the layout*; `<Access>` controls *what they can do once inside*.

### Data layer: api → hooks → pages

Strict three-layer pattern, mirrored module-for-module:

- [src/api/*.api.ts](src/api/) — thin axios wrappers, typed against `ApiResponse<T>` / `PaginatedResponse<T>` from [src/types/api.ts](src/types/api.ts). These are the only files that should reference `api` from `lib/axios.ts`.
- [src/hooks/use*.ts](src/hooks/) — React Query hooks (one file per module). Mutations call `qc.invalidateQueries({ queryKey: [module] })` on success and emit `sonner` toasts. Reuse the existing query keys (`["jobs", params]`, `["jobs", id]`, `["jobs-admin", params]`, etc.) — they are used for cross-hook invalidation.
- Pages import only from hooks, never from `api/*` directly.

QueryClient defaults (in [src/main.tsx](src/main.tsx)): `staleTime: 5min`, `retry: 1`, `placeholderData: keepPreviousData` (paginated lists keep the previous page visible during refetch).

Two list variants for jobs: `useJobs` hits public `GET /jobs`; `useJobsByAdmin` hits `POST /jobs/by-admin`, which the backend filters by the caller's company for HR users. Use the right one based on which portal you're in.

### API response shape

The backend's `TransformInterceptor` wraps everything as `{ statusCode, message, data }`. Paginated endpoints nest `{ meta: { current, pageSize, pages, total }, result: T[] }` inside `data`. Hooks unwrap to the inner `data` payload — pages get `PaginatedData<T>` or `T` directly, not the axios response.

Query params for filters use the backend's MongoDB-style syntax (e.g. `salary[$gte]`, `salary[$lte]`). The `JobQueryParams` interface in [jobs.api.ts](src/api/jobs.api.ts) documents which keys are supported.

### Notifications (realtime)

[src/lib/notification-socket.ts](src/lib/notification-socket.ts) connects to `<host>/notifications` via socket.io. The hook [useNotificationBootstrap](src/hooks/useNotifications.ts) is mounted once at the top of `App` and:

- Connects/disconnects automatically based on auth state.
- Updates the socket's `auth.token` when the access token changes (e.g. after refresh).
- Server events (`notification:new`, `:read`, `:deleted`, `:unread-count`) invalidate the `["notifications"]` query family and update the Zustand store.
- `useUnreadCount` falls back to polling every 30s only when the socket is offline.

When mutating notifications, follow the optimistic pattern already in `useMarkNotificationRead` / `useDeleteNotification`: update all `["notifications", "list", ...]` caches via `updateAllListCaches`, adjust the unread counter, and roll back on error.

### Reusable components

- [DataTable](src/components/admin/DataTable.tsx) — the admin-panel table primitive (columns, search, pagination, skeleton, empty state). All admin CRUD pages compose this; don't reinvent.
- [JobCard](src/components/common/JobCard.tsx) — shared card used by JobsPage, CompanyDetailPage, LatestJobs.
- [RichTextEditor](src/components/common/RichTextEditor.tsx) — Tiptap editor; the canonical input for any HTML description field (companies, jobs). Descriptions are stored and rendered as HTML.
- [ApplyModal](src/components/common/ApplyModal.tsx) — upload-and-apply flow (PDF/DOC/DOCX, 1MB cap, `POST /files/upload` → `POST /resumes`).
- UI primitives are shadcn/ui in [src/components/ui/](src/components/ui/) (style `radix-nova` per [components.json](components.json), icon library `lucide`).

### Conventions worth knowing

- Path imports always use `@/...`; don't introduce relative paths that cross feature boundaries.
- UI strings, toasts, and error messages are in **Vietnamese** — match that when adding new copy.
- File upload uses `/files/upload`; rendered URLs go through helpers in [src/lib/format.ts](src/lib/format.ts) (`companyLogoUrl`, `resumeFileUrl`) which prepend `VITE_STATIC_URL`.
- Build emits a chunk-size warning (>500kB) — admin pages are good candidates for lazy-loading if you touch this area (see PROGRESS.md Phase 3).
- After changing backend DTOs, re-run `npm run gen:types` to refresh `src/types/api-schema.d.ts`.
