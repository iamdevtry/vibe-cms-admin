# Cấu trúc dự án cho CMS Admin Dashboard

## Tổng quan về cấu trúc dự án

Cấu trúc dự án được thiết kế dựa trên NextJS App Router, tối ưu hóa cho việc phát triển một hệ thống CMS Admin Dashboard hiện đại với khả năng mở rộng cao. Cấu trúc này tận dụng các tính năng mới nhất của NextJS như Server Components, Route Groups, và Parallel Routes để tạo ra một kiến trúc rõ ràng, dễ bảo trì và mở rộng.

## Cấu trúc thư mục

```
cms-admin-dashboard/
├── .github/                      # CI/CD workflows
├── public/                       # Static assets
├── src/
│   ├── app/                      # App Router
│   │   ├── (auth)/               # Route group cho authentication
│   │   │   ├── login/            # Đăng nhập
│   │   │   ├── register/         # Đăng ký
│   │   │   ├── forgot-password/  # Quên mật khẩu
│   │   │   └── layout.tsx        # Layout cho auth pages
│   │   │
│   │   ├── api/                  # API Routes
│   │   │   ├── auth/             # Authentication API
│   │   │   ├── users/            # Users API
│   │   │   ├── media/            # Media API
│   │   │   ├── content/          # Content API
│   │   │   ├── taxonomy/         # Taxonomy API
│   │   │   ├── settings/         # Settings API
│   │   │   └── webhooks/         # Webhooks API
│   │   │
│   │   ├── dashboard/            # Admin Dashboard
│   │   │   ├── @sidebar/         # Parallel route cho sidebar
│   │   │   │   └── default.tsx
│   │   │   ├── @header/          # Parallel route cho header
│   │   │   │   └── default.tsx
│   │   │   ├── users/            # Quản lý người dùng
│   │   │   │   ├── [id]/         # Chi tiết người dùng
│   │   │   │   ├── create/       # Tạo người dùng mới
│   │   │   │   └── page.tsx      # Danh sách người dùng
│   │   │   │
│   │   │   ├── media/            # Quản lý media
│   │   │   │   ├── [id]/         # Chi tiết media
│   │   │   │   ├── upload/       # Upload media
│   │   │   │   └── page.tsx      # Thư viện media
│   │   │   │
│   │   │   ├── content/          # Quản lý nội dung
│   │   │   │   ├── [type]/       # Loại nội dung cụ thể
│   │   │   │   │   ├── [id]/     # Chi tiết nội dung
│   │   │   │   │   ├── create/   # Tạo nội dung mới
│   │   │   │   │   └── page.tsx  # Danh sách nội dung
│   │   │   │   │
│   │   │   │   └── types/        # Quản lý loại nội dung
│   │   │   │       ├── [id]/     # Chi tiết loại nội dung
│   │   │   │       ├── create/   # Tạo loại nội dung mới
│   │   │   │       └── page.tsx  # Danh sách loại nội dung
│   │   │   │
│   │   │   ├── taxonomy/         # Quản lý phân loại
│   │   │   │   ├── [type]/       # Loại phân loại cụ thể
│   │   │   │   │   ├── [id]/     # Chi tiết thuật ngữ
│   │   │   │   │   ├── create/   # Tạo thuật ngữ mới
│   │   │   │   │   └── page.tsx  # Danh sách thuật ngữ
│   │   │   │   │
│   │   │   │   └── types/        # Quản lý loại phân loại
│   │   │   │       ├── [id]/     # Chi tiết loại phân loại
│   │   │   │       ├── create/   # Tạo loại phân loại mới
│   │   │   │       └── page.tsx  # Danh sách loại phân loại
│   │   │   │
│   │   │   ├── settings/         # Cài đặt hệ thống
│   │   │   │   ├── general/      # Cài đặt chung
│   │   │   │   ├── seo/          # Cài đặt SEO
│   │   │   │   ├── api/          # Quản lý API keys
│   │   │   │   └── page.tsx      # Trang cài đặt chính
│   │   │   │
│   │   │   ├── activity/         # Nhật ký hoạt động
│   │   │   │   └── page.tsx      # Danh sách hoạt động
│   │   │   │
│   │   │   └── page.tsx          # Trang dashboard chính
│   │   │
│   │   ├── layout.tsx            # Root layout
│   │   └── page.tsx              # Home page (redirect to dashboard)
│   │
│   ├── components/               # Shared components
│   │   ├── ui/                   # UI components (buttons, inputs, etc.)
│   │   ├── forms/                # Form components
│   │   ├── layout/               # Layout components
│   │   ├── dashboard/            # Dashboard specific components
│   │   ├── editor/               # Rich text editor components
│   │   ├── media/                # Media components
│   │   └── shared/               # Shared utility components
│   │
│   ├── hooks/                    # Custom React hooks
│   │   ├── use-media.ts
│   │   ├── use-content.ts
│   │   ├── use-taxonomy.ts
│   │   ├── use-auth.ts
│   │   └── ...
│   │
│   ├── lib/                      # Shared libraries and utilities
│   │   ├── api/                  # API utilities
│   │   │   ├── client.ts         # API client
│   │   │   └── endpoints.ts      # API endpoints
│   │   │
│   │   ├── auth/                 # Authentication utilities
│   │   │   ├── session.ts        # Session management
│   │   │   └── permissions.ts    # Permission checking
│   │   │
│   │   ├── db/                   # Database utilities
│   │   │   ├── connection.ts     # MongoDB connection
│   │   │   └── seed.ts           # Database seeding
│   │   │
│   │   ├── utils/                # Utility functions
│   │   │   ├── formatting.ts     # Data formatting
│   │   │   ├── validation.ts     # Data validation
│   │   │   └── helpers.ts        # Helper functions
│   │   │
│   │   └── config.ts             # Application configuration
│   │
│   ├── models/                   # Database models
│   │   ├── user.model.ts
│   │   ├── role.model.ts
│   │   ├── media.model.ts
│   │   ├── content-type.model.ts
│   │   ├── content.model.ts
│   │   ├── taxonomy-type.model.ts
│   │   ├── taxonomy-term.model.ts
│   │   ├── setting.model.ts
│   │   └── activity-log.model.ts
│   │
│   ├── services/                 # Business logic services
│   │   ├── user.service.ts
│   │   ├── media.service.ts
│   │   ├── content.service.ts
│   │   ├── taxonomy.service.ts
│   │   ├── seo.service.ts
│   │   └── ...
│   │
│   ├── store/                    # State management
│   │   ├── slices/               # State slices
│   │   └── index.ts              # Store configuration
│   │
│   ├── types/                    # TypeScript type definitions
│   │   ├── user.types.ts
│   │   ├── media.types.ts
│   │   ├── content.types.ts
│   │   ├── taxonomy.types.ts
│   │   └── ...
│   │
│   └── middleware.ts             # NextJS middleware
│
├── public/                       # Static files
│   ├── favicon.ico
│   ├── logo.svg
│   └── ...
│
├── prisma/                       # Prisma ORM (alternative to Mongoose)
│   └── schema.prisma             # Database schema
│
├── .env.example                  # Example environment variables
├── .eslintrc.js                  # ESLint configuration
├── .prettierrc                   # Prettier configuration
├── next.config.js                # NextJS configuration
├── tailwind.config.js            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Dependencies and scripts
└── README.md                     # Project documentation
```

## Giải thích cấu trúc

### 1. App Router (`/src/app`)

NextJS App Router sử dụng cấu trúc thư mục để định nghĩa routes. Mỗi thư mục đại diện cho một route segment và file `page.tsx` trong thư mục đó định nghĩa UI cho route đó.

- **Route Groups**: Sử dụng cú pháp `(group)` để tổ chức routes mà không ảnh hưởng đến URL path.
- **Parallel Routes**: Sử dụng cú pháp `@name` để hiển thị nhiều page components trong cùng một layout.
- **Dynamic Routes**: Sử dụng cú pháp `[param]` để tạo dynamic routes.

### 2. API Routes (`/src/app/api`)

API routes được tổ chức theo tính năng, mỗi thư mục đại diện cho một nhóm endpoints liên quan.

### 3. Components (`/src/components`)

Components được tổ chức theo chức năng và mục đích sử dụng:

- **UI Components**: Các components cơ bản như buttons, inputs, modals.
- **Form Components**: Các components liên quan đến forms.
- **Layout Components**: Các components liên quan đến layout như header, sidebar, footer.
- **Dashboard Components**: Các components đặc thù cho dashboard.
- **Editor Components**: Các components liên quan đến rich text editor.

### 4. Models (`/src/models`)

Định nghĩa các Mongoose schemas cho MongoDB, mỗi file đại diện cho một collection trong database.

### 5. Services (`/src/services`)

Chứa business logic của ứng dụng, tách biệt logic khỏi UI và API routes.

### 6. Hooks (`/src/hooks`)

Custom React hooks để tái sử dụng logic giữa các components.

### 7. Lib (`/src/lib`)

Chứa các utilities và helpers được sử dụng trong toàn bộ ứng dụng.

### 8. Types (`/src/types`)

TypeScript type definitions để đảm bảo type safety trong toàn bộ ứng dụng.

## Luồng dữ liệu

```
Client Request → Middleware → API Route → Service → Model → Database
                                      ↑
                                      ↓
                           Client Components ← Server Components
```

1. **Client Request**: Request từ client đến server.
2. **Middleware**: Xử lý authentication và authorization.
3. **API Route**: Định nghĩa endpoints và xử lý requests.
4. **Service**: Chứa business logic.
5. **Model**: Tương tác với database.
6. **Server Components**: Render UI trên server.
7. **Client Components**: Xử lý tương tác người dùng.

## Kiến trúc module

Hệ thống được tổ chức theo kiến trúc module, mỗi module đại diện cho một tính năng chính của CMS:

1. **User Module**: Quản lý người dùng và phân quyền.
2. **Media Module**: Quản lý media (hình ảnh, video, tài liệu).
3. **Content Module**: Quản lý nội dung và loại nội dung.
4. **Taxonomy Module**: Quản lý phân loại và thuật ngữ.
5. **Settings Module**: Quản lý cài đặt hệ thống.
6. **SEO Module**: Quản lý SEO cho nội dung và trang.
7. **API Module**: Quản lý API keys và endpoints.

Mỗi module bao gồm:
- UI Components
- API Routes
- Services
- Models
- Types

## Lợi ích của cấu trúc dự án

1. **Tính module hóa cao**: Dễ dàng thêm, sửa, xóa các tính năng mà không ảnh hưởng đến phần còn lại của ứng dụng.

2. **Separation of Concerns**: Tách biệt rõ ràng giữa UI, business logic, và data access.

3. **Code reusability**: Components, hooks, và utilities có thể được tái sử dụng trong toàn bộ ứng dụng.

4. **Khả năng mở rộng**: Cấu trúc cho phép dễ dàng thêm các tính năng mới trong tương lai.

5. **Developer Experience**: Cấu trúc rõ ràng giúp các developer mới dễ dàng hiểu và làm việc với codebase.

6. **Performance**: Tận dụng Server Components của NextJS để tối ưu hóa hiệu suất.

7. **Type Safety**: TypeScript được sử dụng trong toàn bộ ứng dụng để đảm bảo type safety.

## So sánh với WordPress

| Tiêu chí | Cấu trúc đề xuất | WordPress |
|----------|-----------------|-----------|
| Tổ chức code | Module-based, rõ ràng | Plugin-based, phân tán |
| Separation of concerns | Cao | Trung bình |
| Khả năng mở rộng | Dễ dàng thông qua modules | Phụ thuộc vào plugins |
| Developer Experience | Modern, TypeScript | Legacy, PHP |
| Performance | Tối ưu với Server Components | Phụ thuộc vào caching |
| API-first | Được thiết kế từ đầu | Được thêm vào sau |

## Kết luận

Cấu trúc dự án đề xuất tận dụng các tính năng mới nhất của NextJS và các best practices trong phát triển web hiện đại để tạo ra một hệ thống CMS Admin Dashboard có tính module hóa cao, dễ bảo trì và mở rộng. So với WordPress, cấu trúc này cung cấp một nền tảng vững chắc hơn cho việc phát triển một CMS hiện đại với hiệu suất cao và trải nghiệm phát triển tốt hơn.
