# Recruitment Web — Project Progress & Roadmap

**Last updated:** 2026-04-17
**Stack:** React 19 + TypeScript + Vite + shadcn/ui + Tailwind + React Query + Zustand + Tiptap

---

## ✅ DONE

### Infrastructure
- Axios instance với auto-refresh token interceptor
- Zustand auth store (user, accessToken, permissions)
- React Query setup + devtools
- Sonner toast notifications
- React Router v7 với nested routes
- Path alias `@/` → `src/`

### Auth & Guards
- Login, Register pages
- ProtectedRoute guard (chặn unauthenticated + NORMAL_USER khỏi /admin)
- Access component (permission-based hide/show với SUPER_ADMIN bypass)
- 404 / 403 error pages

### API Layer (9 modules)
auth, companies, users, jobs, resumes, permissions, roles, files, subscribers

### React Query Hooks (6)
useAuth, useCompanies, useUsers, useJobs, useResumes, useFiles

### Homepage (Guest)
- Header với logo + nav + avatar dropdown
- HeroSearch với multi-select thành phố
- TopCompanies section
- LatestJobs section (pagination 5 items/page)
- Footer

### Admin Panel (Hoàn chỉnh)
- AdminLayout responsive (desktop sidebar, mobile Sheet)
- AdminSidebar với menu dynamic theo user permissions
- DataTable reusable (search regex format, pagination, skeleton, empty state)
- ConfirmDelete popover
- **Dashboard** — 4 stat cards
- **Company CRUD** — Modal với logo upload, rich text (Tiptap)
- **User CRUD** — Modal với dynamic select (Role, Company), Detail dialog
- **Job CRUD** — Upsert page full form, rich text mô tả, dynamic company select
- **Resume list** — Detail dialog với đổi status, populate job/company
- **Permission CRUD** — Modal + Detail dialog
- **Role CRUD** — Modal với permission grouping theo module

### Rich Text Editor
- RichTextEditor component (Tiptap) dùng chung cho Company/Job description

---

## ❌ MISSING (Ưu tiên theo thứ tự)

### Phase 1: Guest Pages (~3-4 ngày)
1. **Job list page** `/jobs`
   - Filter sidebar: skills multi-select, location, salary range, level
   - URL sync (`?keyword=&location=&level=&current=&pageSize=`)
   - Pagination + sort
2. **Job detail page** `/jobs/:id`
   - Job info, skills badges, salary, company sidebar với logo
   - Nút "Apply Now" → mở Apply Modal
   - Relative time ("2 giờ trước")
3. **Company list page** `/companies`
   - Grid layout responsive
   - Search + pagination
4. **Company detail page** `/companies/:id`
   - Company info, logo, description (HTML)
   - Danh sách jobs của company đó

### Phase 2: Candidate Features (~2-3 ngày)
5. **Apply Modal**
   - Upload CV (PDF/Word/DOC, max 1MB)
   - Prefill email từ user
   - Submit resume (POST /resumes)
   - Handle chưa login → redirect /login
6. **Manage Account Modal** (4 tabs)
   - Tab 1 "Rải CV" — list resumes của user (GET /resumes/by-user)
   - Tab 2 "Nhận Jobs qua Email" — skill subscription CRUD
   - Tab 3 "Cập nhật thông tin" — edit profile (PATCH /users/:id)
   - Tab 4 "Thay đổi mật khẩu" — change password (BE chưa có endpoint, tạm skip)
7. **Header dropdown** thêm:
   - "Quản lý tài khoản" → mở Manage Account Modal
   - "Admin Panel" link (chỉ hiện nếu user có role != NORMAL_USER)

### Phase 3: Polish (~1-2 ngày)
8. **Infinite scroll** cho mobile job feed
9. **Dark mode** toggle
10. **Skeleton loading states** cho các page chính
11. **SEO meta tags** cho job/company detail
12. **Empty states** đẹp hơn

---

## 🔌 BACKEND ENDPOINTS — Coverage

| Endpoint | Frontend |
|----------|----------|
| POST /auth/login, register, logout | ✅ |
| GET /auth/refresh, account | ✅ |
| GET/POST/PATCH/DELETE /companies | ✅ |
| GET/POST/PATCH/DELETE /users | ✅ |
| GET/POST/PATCH/DELETE /jobs | ✅ |
| GET/POST/PATCH/DELETE /resumes | ✅ (admin) |
| POST /resumes/by-user | ⚠️ (hook sẵn, chưa dùng — sẽ dùng trong Manage Account) |
| POST /files/upload | ✅ (Company logo). Chưa dùng cho CV upload |
| GET/POST/PATCH/DELETE /permissions | ✅ |
| GET/POST/PATCH/DELETE /roles | ✅ |
| GET/POST/PATCH/DELETE /subscribers | ❌ (API sẵn, chưa có UI) |
| POST /subscribers/skills | ❌ (chưa có UI) |

---

## 📊 Tổng tiến độ

- **Admin panel:** 100%
- **Auth & Infrastructure:** 100%
- **Guest pages:** ~30% (chỉ có homepage)
- **Candidate features:** 0%
- **Overall:** ~55%

Ưu tiên tiếp theo: **Phase 1 — Job list/detail + Company list/detail** để user có thể browse việc làm trước khi build Apply flow.
