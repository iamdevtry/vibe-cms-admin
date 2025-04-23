# Thiết kế cơ sở dữ liệu cho CMS Admin Dashboard

## Tổng quan về thiết kế

Thiết kế cơ sở dữ liệu cho hệ thống CMS Admin Dashboard sẽ sử dụng mô hình NoSQL (MongoDB) kết hợp với các tính năng của NextJS. Lựa chọn này phù hợp với yêu cầu về tính linh hoạt, khả năng mở rộng và hiệu suất cao của hệ thống.

## Các Collection chính

### 1. Users (Người dùng)
```
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  firstName: String,
  lastName: String,
  displayName: String,
  avatar: String (URL),
  bio: String,
  role: String (reference to Roles),
  permissions: [String],
  status: String (active, inactive, suspended),
  socialAuth: {
    google: { id: String, token: String },
    facebook: { id: String, token: String }
  },
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId (reference to Users),
  updatedBy: ObjectId (reference to Users)
}
```

### 2. Roles (Vai trò)
```
{
  _id: ObjectId,
  name: String,
  description: String,
  permissions: [String],
  isSystem: Boolean,
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId (reference to Users),
  updatedBy: ObjectId (reference to Users)
}
```

### 3. Media (Phương tiện)
```
{
  _id: ObjectId,
  name: String,
  originalName: String,
  description: String,
  altText: String,
  caption: String,
  type: String (image, video, document, audio),
  mimeType: String,
  size: Number,
  dimensions: {
    width: Number,
    height: Number
  },
  url: String,
  thumbnailUrl: String,
  folder: ObjectId (reference to MediaFolders),
  metadata: {
    exif: Object,
    location: {
      lat: Number,
      lng: Number
    }
  },
  status: String (active, archived),
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId (reference to Users),
  updatedBy: ObjectId (reference to Users)
}
```

### 4. MediaFolders (Thư mục phương tiện)
```
{
  _id: ObjectId,
  name: String,
  slug: String,
  description: String,
  parent: ObjectId (reference to MediaFolders),
  path: String,
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId (reference to Users),
  updatedBy: ObjectId (reference to Users)
}
```

### 5. ContentTypes (Loại nội dung)
```
{
  _id: ObjectId,
  name: String,
  slug: String,
  description: String,
  fields: [
    {
      name: String,
      label: String,
      type: String (text, textarea, rich-text, number, date, boolean, media, reference),
      required: Boolean,
      defaultValue: Mixed,
      options: [Mixed],
      validation: Object
    }
  ],
  taxonomies: [ObjectId (reference to TaxonomyTypes)],
  isSystem: Boolean,
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId (reference to Users),
  updatedBy: ObjectId (reference to Users)
}
```

### 6. Contents (Nội dung)
```
{
  _id: ObjectId,
  title: String,
  slug: String,
  contentType: ObjectId (reference to ContentTypes),
  status: String (draft, published, archived),
  publishedAt: Date,
  content: String (JSON/HTML),
  excerpt: String,
  featuredImage: ObjectId (reference to Media),
  author: ObjectId (reference to Users),
  customFields: Object,
  taxonomyTerms: [ObjectId (reference to TaxonomyTerms)],
  seo: {
    metaTitle: String,
    metaDescription: String,
    canonicalUrl: String,
    focusKeyword: String,
    metaRobots: String,
    structuredData: Object
  },
  revisions: [
    {
      content: String,
      updatedAt: Date,
      updatedBy: ObjectId (reference to Users)
    }
  ],
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId (reference to Users),
  updatedBy: ObjectId (reference to Users)
}
```

### 7. TaxonomyTypes (Loại phân loại)
```
{
  _id: ObjectId,
  name: String,
  slug: String,
  description: String,
  hierarchical: Boolean,
  contentTypes: [ObjectId (reference to ContentTypes)],
  isSystem: Boolean,
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId (reference to Users),
  updatedBy: ObjectId (reference to Users)
}
```

### 8. TaxonomyTerms (Thuật ngữ phân loại)
```
{
  _id: ObjectId,
  name: String,
  slug: String,
  description: String,
  taxonomyType: ObjectId (reference to TaxonomyTypes),
  parent: ObjectId (reference to TaxonomyTerms),
  order: Number,
  featuredImage: ObjectId (reference to Media),
  seo: {
    metaTitle: String,
    metaDescription: String,
    canonicalUrl: String,
    focusKeyword: String
  },
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId (reference to Users),
  updatedBy: ObjectId (reference to Users)
}
```

### 9. Settings (Cài đặt)
```
{
  _id: ObjectId,
  group: String,
  key: String,
  value: Mixed,
  isSystem: Boolean,
  createdAt: Date,
  updatedAt: Date,
  updatedBy: ObjectId (reference to Users)
}
```

### 10. ApiKeys (Khóa API)
```
{
  _id: ObjectId,
  name: String,
  key: String,
  secret: String,
  permissions: [String],
  status: String (active, inactive),
  lastUsed: Date,
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId (reference to Users),
  updatedBy: ObjectId (reference to Users)
}
```

### 11. ActivityLogs (Nhật ký hoạt động)
```
{
  _id: ObjectId,
  user: ObjectId (reference to Users),
  action: String,
  entity: String,
  entityId: ObjectId,
  details: Object,
  ip: String,
  userAgent: String,
  createdAt: Date
}
```

### 12. Redirects (Chuyển hướng)
```
{
  _id: ObjectId,
  source: String,
  destination: String,
  type: Number (301, 302),
  isRegex: Boolean,
  createdAt: Date,
  updatedAt: Date,
  createdBy: ObjectId (reference to Users),
  updatedBy: ObjectId (reference to Users)
}
```

## Mối quan hệ giữa các Collection

### Quản lý người dùng
- **Users** ↔ **Roles**: Mỗi người dùng thuộc về một vai trò, mỗi vai trò có thể được gán cho nhiều người dùng
- **Users** ↔ **ActivityLogs**: Mỗi người dùng có thể có nhiều hoạt động được ghi lại

### Quản lý media
- **Media** ↔ **MediaFolders**: Mỗi media thuộc về một thư mục, mỗi thư mục có thể chứa nhiều media
- **MediaFolders** ↔ **MediaFolders**: Mối quan hệ đệ quy cho phép cấu trúc thư mục phân cấp

### Quản lý nội dung
- **Contents** ↔ **ContentTypes**: Mỗi nội dung thuộc về một loại nội dung, mỗi loại nội dung có thể có nhiều nội dung
- **Contents** ↔ **Users**: Mỗi nội dung được tạo bởi một người dùng (tác giả)
- **Contents** ↔ **Media**: Mỗi nội dung có thể có một hình ảnh đại diện
- **Contents** ↔ **TaxonomyTerms**: Mỗi nội dung có thể thuộc về nhiều thuật ngữ phân loại

### Quản lý phân loại
- **TaxonomyTerms** ↔ **TaxonomyTypes**: Mỗi thuật ngữ phân loại thuộc về một loại phân loại
- **TaxonomyTerms** ↔ **TaxonomyTerms**: Mối quan hệ đệ quy cho phép cấu trúc phân cấp
- **TaxonomyTypes** ↔ **ContentTypes**: Mỗi loại phân loại có thể được sử dụng bởi nhiều loại nội dung

## Chỉ mục (Indexes)

### Users
- email (unique)
- username (unique)
- role

### Media
- type
- folder
- createdAt

### Contents
- slug (unique within contentType)
- contentType
- status
- publishedAt
- author
- taxonomyTerms

### TaxonomyTerms
- slug (unique within taxonomyType)
- taxonomyType
- parent

### Settings
- group
- key (unique within group)

## Lưu ý thiết kế

1. **Tính linh hoạt**: Thiết kế cho phép tạo và quản lý nhiều loại nội dung và phân loại tùy chỉnh.

2. **Hiệu suất**: Các chỉ mục được thiết kế để tối ưu hóa các truy vấn phổ biến.

3. **Khả năng mở rộng**: Cấu trúc cho phép dễ dàng thêm các tính năng mới trong tương lai (như giỏ hàng, thanh toán).

4. **Bảo mật**: Mật khẩu được mã hóa, và hệ thống phân quyền chi tiết.

5. **Lịch sử phiên bản**: Lưu trữ lịch sử chỉnh sửa cho nội dung.

6. **SEO**: Các trường SEO được tích hợp trực tiếp vào nội dung và phân loại.

7. **API**: Thiết kế hỗ trợ việc truy xuất dữ liệu qua API cho frontend.

## So sánh với WordPress

Thiết kế cơ sở dữ liệu này khác biệt so với WordPress ở những điểm sau:

1. **Sử dụng NoSQL thay vì SQL**: Cho phép cấu trúc dữ liệu linh hoạt hơn và dễ dàng mở rộng.

2. **Tích hợp SEO**: Các trường SEO được tích hợp trực tiếp vào các collection thay vì phụ thuộc vào metadata như WordPress.

3. **Quản lý media hiện đại**: Hỗ trợ cấu trúc thư mục phân cấp và metadata phong phú.

4. **Hệ thống phân quyền linh hoạt**: Cho phép tạo và tùy chỉnh vai trò với các quyền hạn cụ thể.

5. **Thiết kế hướng API**: Cấu trúc dữ liệu được tối ưu hóa cho việc truy xuất qua API.

6. **Quản lý nội dung tùy chỉnh**: Hỗ trợ tạo và quản lý các loại nội dung và trường tùy chỉnh một cách linh hoạt.

7. **Lịch sử hoạt động**: Theo dõi chi tiết các hoạt động trong hệ thống.
