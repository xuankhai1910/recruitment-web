# Recruitment Web — Project Progress & Roadmap

**Last updated:** 2026-04-18
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

### React Query Hooks (7)
useAuth, useCompanies, useUsers, useJobs, useResumes, useFiles, useSubscribers

### Homepage (Guest)
- Header với logo + nav + avatar dropdown
- HeroSearch với multi-select thành phố
- TopCompanies section
- LatestJobs section (pagination 5 items/page)
- Footer

### Guest Pages ✨ NEW
- **`/jobs`** — Job list với filter sidebar (keyword / location multi-select / level / minSalary / skills multi-select), URL sync đầy đủ, sort, pagination, mobile Sheet filter
- **`/jobs/:id`** — Job Detail: hero card (salary/location/level/quantity), skill badges, Tiptap HTML description, sidebar Company + dates, relative time, nút Apply Now
- **`/companies`** — Grid responsive (2/3/4 cột), search theo tên, pagination
- **`/companies/:id`** — Company hero, description HTML, list việc làm theo `company._id`

### Candidate Features ✨ NEW
- **ApplyModal** — react-dropzone (PDF/DOC/DOCX, max 1MB), upload `/files/upload` → `POST /resumes`, prefill email, redirect login nếu chưa auth
- **ManageAccountModal** — 4 tabs:
  - Tab "Rải CV" — list resume của user (GET /resumes/by-user) kèm status badge màu, link tải file
  - Tab "Nhận job qua email" — chọn skills, create/update subscriber
  - Tab "Cập nhật thông tin" — PATCH /users/:id (name, age, gender, address)
  - Tab "Đổi mật khẩu" — placeholder (BE chưa có endpoint)
- **Header dropdown** — Thêm "Quản lý tài khoản" + "Trang quản trị" (chỉ user role != NORMAL_USER)

### Shared Components ✨ NEW
- `JobCard` — card dùng chung giữa JobsPage, CompanyDetailPage, LatestJobs
- `Tabs` UI (radix-ui) — cho Manage Account
- `lib/format.ts` — `formatSalaryCompact`, `companyLogoUrl`, `resumeFileUrl`

### Admin Panel (Hoàn chỉnh)
- AdminLayout responsive (desktop sidebar, mobile Sheet)
- AdminSidebar với menu dynamic theo user permissions
- DataTable reusable (search regex format, pagination, skeleton, empty state)
- ConfirmDelete popover
- Dashboard, Company CRUD, User CRUD, Job CRUD, Resume list, Permission CRUD, Role CRUD

### Rich Text Editor
- RichTextEditor component (Tiptap) dùng chung cho Company/Job description

---

## ❌ MISSING (Polish, thứ tự ưu tiên)

### Phase 3: Polish
1. **Infinite scroll** cho mobile job feed
2. **Dark mode** toggle (next-themes đã có sẵn dep)
3. **Skeleton loading states** thêm cho một số section còn thiếu
4. **SEO meta tags** cho job/company detail (React 19 native `<title>`)
5. **Empty states** minh họa đẹp hơn
6. **Code splitting** — build cảnh báo chunk > 500kB, nên lazy-load admin pages
7. **Password change endpoint** — chờ BE

---

## 🔌 BACKEND ENDPOINTS — Coverage

| Endpoint | Frontend |
|----------|----------|
| POST /auth/login, register, logout | ✅ |
| GET /auth/refresh, account | ✅ |
| GET/POST/PATCH/DELETE /companies | ✅ |
| GET/POST/PATCH/DELETE /users | ✅ |
| GET/POST/PATCH/DELETE /jobs | ✅ |
| GET/POST/PATCH/DELETE /resumes | ✅ |
| POST /resumes/by-user | ✅ (ManageAccountModal) |
| POST /files/upload | ✅ (Company logo + CV upload) |
| GET/POST/PATCH/DELETE /permissions | ✅ |
| GET/POST/PATCH/DELETE /roles | ✅ |
| GET/POST/PATCH/DELETE /subscribers | ✅ (ManageAccountModal) |
| POST /subscribers/skills | ✅ |

---

## 📊 Tổng tiến độ

- **Admin panel:** 100%
- **Auth & Infrastructure:** 100%
- **Guest pages:** 100% (home + jobs list/detail + companies list/detail)
- **Candidate features:** 95% (chỉ còn đổi mật khẩu chờ BE)
- **Overall:** ~95%

Ưu tiên tiếp theo: **Phase 3 polish** (dark mode, code splitting, infinite scroll mobile).
