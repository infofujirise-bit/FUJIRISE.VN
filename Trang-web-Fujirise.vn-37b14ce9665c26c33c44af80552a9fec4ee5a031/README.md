# Hướng dẫn sử dụng Website Fujirise Elevator

Chào mừng bạn đến với hệ thống website thang máy gia đình cao cấp Fujirise. Đây là website được lập trình với cấu trúc chuyên nghiệp, dễ dàng mở rộng và tối ưu cho SEO.

## 1. Thông tin quản trị (Supabase)
Hệ thống sử dụng **Supabase** kết hợp xác thực bảo mật qua **Telegram OTP**:
- **Đường dẫn Admin:** `/admin`
- **Tài khoản gốc:** `info.fujirise@gmail.com`
- **Xác thực:** Quên mật khẩu/Cấp OTP qua Telegram Bot.
- **Cách cấp quyền Admin:**
  Nếu hệ thống báo lỗi CSDL, đăng nhập vào Admin, màn hình sẽ hiển thị 1 đoạn mã SQL màu đỏ. Copy đoạn mã đó dán vào thẻ SQL Editor trên Supabase và nhấn RUN. Hệ thống sẽ tự động khôi phục toàn bộ bảng và tài khoản.

## 2. Cấu trúc Database (Supabase)
Bạn cần tạo table `leads` trong Supabase với các cột sau:
- `id`: int8 (Primary Key, Auto Increment)
- `name`: text (Tên khách hàng)
- `phone`: text (Số điện thoại)
- `email`: text (Email - optional)
- `message`: text (Nội dung tư vấn)
- `status`: text (Mặc định là 'new')
- `created_at`: timestamptz (Mặc định `now()`)

## 3. Deploy lên Vercel
1. Upload toàn bộ code này lên Github.
2. Truy cập [Vercel](https://vercel.com/) và Import dự án từ Github.
3. Thêm các **Environment Variables** (Biến môi trường) sau vào Vercel Settings:
   - `VITE_SUPABASE_URL`: Link Supabase của bạn.
   - `VITE_SUPABASE_ANON_KEY`: Mã Anon Key của Supabase.
   - `VITE_TELEGRAM_BOT_TOKEN`: Điền Token Bot của bạn vào đây.
   - `VITE_TELEGRAM_CHAT_ID`: Điền ID chat cá nhân của bạn vào đây.
4. Nhấn **Deploy**. Vercel sẽ tự động che giấu các thông tin này và cấp link website an toàn cho bạn.

## 4. Quản lý nhận thông báo qua Telegram
Thông tin từ Form liên hệ sẽ gửi thẳng về Bot Telegram của bạn:
1. Bạn lấy Token từ BotFather và ChatID từ @userinfobot.
2. Thêm 2 thông số đó vào file `.env` (nếu chạy local) hoặc trong bảng Environment của Vercel (nếu chạy thật).

## 5. Cấu trúc thư mục chuẩn
- `src/components`: Chứa các "viên gạch" của web (Menu, Banner, Chân trang...). Nếu bạn muốn sửa giao diện phần nào, hãy vào đây.
- `src/pages`: Chứa các trang chính (Trang chủ Home, Trang quản trị Admin).
- `src/index.css`: Nơi quản lý màu sắc chủ đạo. Tìm `--color-fuji-blue` để đổi màu xanh thương hiệu.
- `src/constants.ts`: Nơi chứa dữ liệu "cứng" như danh sách sản phẩm, tin tức.

## 6. Triển khai lên Github và Vercel
1. Tạo một Repository mới trên Github của bạn.
2. Tải toàn bộ source code này lên (trừ thư mục `node_modules`).
3. Truy cập [Vercel.com](https://vercel.com), kết nối với Github.
4. Chọn dự án này và nhấn **Deploy**. Vercel sẽ tự động làm mọi thứ còn lại.

## 7. Hướng dẫn chạy Local An toàn (Trên máy tính cá nhân)
Để chạy và chỉnh sửa dự án trên máy của bạn, thực hiện các bước sau:
1. Đảm bảo máy tính đã cài đặt **Node.js**.
2. Mở terminal/cmd tại thư mục dự án và chạy lệnh cài đặt thư viện:
   ```bash
   npm install
   ```
3. Tạo file `.env` ở thư mục gốc (ngang hàng với `package.json`) và điền các biến môi trường:
   ```env
   VITE_SUPABASE_URL=link_supabase_của_bạn
   VITE_SUPABASE_ANON_KEY=anon_key_của_bạn
   VITE_TELEGRAM_BOT_TOKEN=8650537472:AAEL9KW4PazTORaf05am8dti6OsIQcA12mo
   VITE_TELEGRAM_CHAT_ID=8620352791
   ```
4. Khởi động server phát triển bằng lệnh:
   ```bash
   npm run dev
   ```
5. Mở trình duyệt và truy cập địa chỉ `http://localhost:5173`.

---
**Chúc bạn sở hữu một website đẳng cấp và kinh doanh hồng phát!**
