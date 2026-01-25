# Admin Features Testing Checklist

## Prerequisites
- [x] Backend server running on port 3333
- [x] Frontend server running on port 3001
- [ ] Admin account logged in
- [ ] MongoDB connected

---

## 1. Settings Management (NEW) ✨
**URL:** `/admin/settings`

### Site Info Tab
- [ ] View current settings (name, logo, description, contact)
- [ ] Update site name
- [ ] Update logo URL
- [ ] Update contact info (email, phone, address)
- [ ] Toggle maintenance mode
- [ ] Update maintenance message
- [ ] Save changes → Success message appears
- [ ] Reload page → Settings persist

### Order Settings Tab
- [ ] View current order settings
- [ ] Update minimum order value
- [ ] Update maximum order value
- [ ] Update shipping fee
- [ ] Toggle COD enabled
- [ ] Toggle online payment enabled
- [ ] Toggle guest checkout
- [ ] Save changes → Success message

### Email Configuration Tab
- [ ] View current email settings
- [ ] Update SMTP host/port
- [ ] Update from email/name
- [ ] Toggle order confirmation email
- [ ] Toggle shipping notification
- [ ] Save changes → Success message

### Social & SEO Tab
- [ ] Update social media links (Facebook, Instagram, Twitter, YouTube)
- [ ] Update meta description
- [ ] Update meta keywords
- [ ] Update Google Analytics ID
- [ ] Update Facebook Pixel ID
- [ ] Save changes → Success message

### Advanced Operations
- [ ] Click "Reset to Defaults" → Confirmation dialog appears
- [ ] Confirm reset → All settings reset to defaults
- [ ] Check validation (e.g., invalid email format)
- [ ] Test with empty fields → Proper error handling

---

## 2. Categories Management (NEW) ✨
**URL:** `/admin/categories`

### View & Navigation
- [ ] Page loads without errors
- [ ] Categories display in tree structure
- [ ] Parent-child relationships visible
- [ ] Level indentation shows hierarchy
- [ ] Active/Inactive badges display correctly

### Create Category
- [ ] Click "Thêm danh mục mới" button
- [ ] Enter name (e.g., "Giày Thể Thao")
- [ ] Select parent category (or leave empty for root)
- [ ] Slug auto-generates from name
- [ ] Enter description
- [ ] Set display order
- [ ] Toggle "Hiển thị" checkbox
- [ ] Click "Thêm danh mục" → Success message
- [ ] New category appears in tree

### Edit Category
- [ ] Click edit icon on a category
- [ ] Form populates with current data
- [ ] Update name → Slug updates automatically
- [ ] Change parent category
- [ ] Update description
- [ ] Toggle active status
- [ ] Click "Cập nhật" → Success message
- [ ] Category updates in tree

### Delete Category
- [ ] Click delete icon on a category without children
- [ ] Confirmation dialog appears
- [ ] Confirm delete → Category removed
- [ ] Try deleting category with children → Error/warning

### Edge Cases
- [ ] Create category with same name → Duplicate slug handling
- [ ] Create circular reference (parent = child) → Validation error
- [ ] Deep nesting (4+ levels) → Tree renders correctly
- [ ] Search/filter categories (if implemented)

---

## 3. Brands Management (NEW) ✨
**URL:** `/admin/brands`

### View & Layout
- [ ] Page loads without errors
- [ ] Brands display in grid/card layout
- [ ] Logo images display correctly
- [ ] Category tags show under each brand
- [ ] Active/Inactive status visible

### Create Brand
- [ ] Click "Thêm thương hiệu mới"
- [ ] Enter brand name (e.g., "Nike")
- [ ] Slug auto-generates from name
- [ ] Enter logo URL
- [ ] Logo preview appears
- [ ] Enter description
- [ ] Select multiple categories (checkboxes)
- [ ] Enter website URL
- [ ] Toggle "Hiển thị" checkbox
- [ ] Click "Thêm thương hiệu" → Success message
- [ ] New brand appears in grid

### Edit Brand
- [ ] Click edit icon on a brand
- [ ] Form populates with current data
- [ ] Update name → Slug updates
- [ ] Change logo URL → Preview updates
- [ ] Update description
- [ ] Change category selections
- [ ] Toggle active status
- [ ] Click "Cập nhật" → Success message

### Delete Brand
- [ ] Click delete icon
- [ ] Confirmation dialog appears
- [ ] Confirm delete → Brand removed
- [ ] Check if products with this brand still work

### Filtering & Search
- [ ] Use search box → Brands filter in real-time
- [ ] Select category filter → Only brands in that category show
- [ ] Clear filters → All brands return
- [ ] Pagination works (if implemented)

### Edge Cases
- [ ] Enter invalid logo URL → Image broken icon shows
- [ ] Create brand with no categories selected
- [ ] Long description → Text truncates properly
- [ ] Deselect all categories from existing brand

---

## 4. Attributes Management (NEW) ✨
**URL:** `/admin/attributes`

### View & Layout
- [ ] Page loads without errors
- [ ] Attributes display in table
- [ ] Type badges show correctly (Variant/Specification/Filter)
- [ ] Values display as tags
- [ ] Filterable/Required checkboxes visible

### Create Attribute
- [ ] Click "Thêm thuộc tính mới"
- [ ] Enter name (e.g., "Màu sắc")
- [ ] Select type: Variant/Specification/Filter
- [ ] Add values one by one:
  - [ ] Type value in input (e.g., "Đỏ")
  - [ ] Press Enter or click Add
  - [ ] Value appears as tag
  - [ ] Add multiple values (Xanh, Vàng, Đen)
- [ ] Toggle "Có thể lọc"
- [ ] Toggle "Bắt buộc"
- [ ] Toggle "Hiển thị"
- [ ] Click "Thêm thuộc tính" → Success message

### Edit Attribute
- [ ] Click edit icon on an attribute
- [ ] Form populates with current data
- [ ] Update name
- [ ] Change type → Warning if values exist
- [ ] Add new values
- [ ] Remove values (click X on tag)
- [ ] Toggle checkboxes
- [ ] Click "Cập nhật" → Success message

### Delete Attribute
- [ ] Click delete icon
- [ ] Confirmation dialog appears
- [ ] Confirm delete → Attribute removed
- [ ] Check if products with this attribute still work

### Value Management
- [ ] Try adding duplicate value → Should be prevented
- [ ] Add value with spaces → Trim whitespace
- [ ] Remove all values → Validation error or warning
- [ ] Reorder values (if drag-drop implemented)

### Type-Specific Tests
- [ ] Create Variant attribute (e.g., Size) → Used in product variants
- [ ] Create Specification attribute (e.g., Material) → Shows in specs
- [ ] Create Filter attribute (e.g., Brand) → Used in filters

---

## 5. Existing Admin Features

### Products Management
**URL:** `/admin/products`
- [ ] View products list
- [ ] Create new product with variants
- [ ] Edit product → Update variants
- [ ] Delete product
- [ ] Upload images
- [ ] Assign categories (from new Categories)
- [ ] Assign brand (from new Brands)
- [ ] Use attributes (from new Attributes)

### Orders Management
**URL:** `/admin/orders`
- [ ] View orders list
- [ ] Update order status
- [ ] View order details
- [ ] Cancel order
- [ ] Process refund

### Reviews Management
**URL:** `/admin/reviews`
- [ ] View all reviews
- [ ] Approve/reject reviews
- [ ] Reply to reviews
- [ ] Delete spam reviews

### Users Management
**URL:** `/admin/users`
- [ ] View users list
- [ ] Search/filter users
- [ ] View user details
- [ ] Update user role (user/partner/admin)
- [ ] Block/unblock users

### Dashboard
**URL:** `/admin/dashboard`
- [ ] View statistics (total orders, revenue, products, users)
- [ ] Recent orders table
- [ ] Charts/graphs render
- [ ] Navigate to each section from dashboard

---

## 6. Permissions & Security

### Admin-Only Access
- [ ] Login as admin → All features accessible
- [ ] Login as user → Redirect to home or 403 error
- [ ] Login as partner → Cannot access admin routes
- [ ] No token → Redirect to login

### API Protection
- [ ] Call `/api/admin/settings` without token → 401
- [ ] Call `/api/admin/categories` as user → 403
- [ ] Call `/api/settings/public` → Works (public endpoint)
- [ ] Call with expired token → 401

### Role Checks in Frontend
- [ ] CartContext skips API calls for admin
- [ ] WishlistContext skips API calls for admin
- [ ] Admin cannot add to cart (UI hidden or disabled)
- [ ] Admin cannot add to wishlist

---

## 7. Integration Tests

### Category → Product
- [ ] Create category "Giày Chạy"
- [ ] Create product → Select "Giày Chạy" category
- [ ] Delete category with products → Error or reassign

### Brand → Product
- [ ] Create brand "Adidas"
- [ ] Create product → Select "Adidas" brand
- [ ] Delete brand with products → Handle gracefully

### Attribute → Product
- [ ] Create attribute "Kích thước" with values 38, 39, 40
- [ ] Create product variant → Use "Kích thước" attribute
- [ ] Values populate in variant form

### Settings → Public Site
- [ ] Update site name in Settings
- [ ] Check homepage → Site name updates
- [ ] Toggle maintenance mode ON
- [ ] Visit site as non-admin → Maintenance message shows
- [ ] Toggle maintenance mode OFF → Site accessible

---

## 8. Error Handling

### Network Errors
- [ ] Stop backend server → Frontend shows error messages
- [ ] Restart backend → Frontend recovers
- [ ] Slow network → Loading spinners show

### Validation Errors
- [ ] Submit empty form → Validation messages appear
- [ ] Enter invalid data (e.g., negative price) → Error message
- [ ] Enter duplicate slug → Backend returns 400 error

### Edge Cases
- [ ] Rapid clicking "Save" button → No duplicate submissions
- [ ] Navigate away while form dirty → No unsaved data warning (optional)
- [ ] Session expired → Redirect to login

---

## 9. UI/UX Quality

### Design Consistency
- [ ] All pages follow same design system
- [ ] Colors match (primary #4285f4, success #4caf50, error #f44336)
- [ ] Buttons have consistent styling
- [ ] Forms have uniform spacing

### Responsiveness
- [ ] Test on desktop (1920x1080) → Everything fits
- [ ] Test on tablet (768px) → Layout adapts
- [ ] Test on mobile (375px) → Forms usable

### User Feedback
- [ ] Loading states show during API calls
- [ ] Success messages appear after actions
- [ ] Error messages clear and helpful
- [ ] Empty states show when no data
- [ ] Hover effects on interactive elements

### Accessibility
- [ ] Tab navigation works
- [ ] Form labels present
- [ ] Error messages announce
- [ ] Color contrast sufficient

---

## 10. Performance

### Load Times
- [ ] Initial page load < 3 seconds
- [ ] Navigation between pages instant
- [ ] Large lists (100+ items) render smoothly
- [ ] Image loading optimized

### Code Splitting
- [ ] Admin pages lazy-loaded
- [ ] Bundle size reasonable
- [ ] No unnecessary re-renders

---

## Summary

### Backend (10/10 Admin Features)
- [x] Products ✅
- [x] Categories ✅ (NEW)
- [x] Brands ✅ (NEW)
- [x] Attributes ✅ (NEW)
- [x] Variants ✅
- [x] Orders ✅
- [x] Reviews ✅
- [x] Users ✅
- [x] Settings ✅ (NEW)
- [x] Dashboard ✅

### Frontend (10/10 Admin Pages)
- [x] Products Management ✅
- [x] Categories Management ✅ (NEW)
- [x] Brands Management ✅ (NEW)
- [x] Attributes Management ✅ (NEW)
- [x] Orders Management ✅
- [x] Reviews Management ✅
- [x] Users Management ✅
- [x] Settings Management ✅ (NEW)
- [x] Dashboard ✅
- [x] Navigation ✅

### Critical Issues to Fix
- [ ] (None currently known)

### Nice-to-Have Improvements
- [ ] Drag-drop for category reordering
- [ ] Bulk operations (delete multiple, update status)
- [ ] Advanced filters and search
- [ ] Export data (CSV, Excel)
- [ ] Activity logs/audit trail
- [ ] Image upload to server (vs URL only)
