# Agent Instructions (AGENT.md)

Chào bạn (Agent), đây là các quy tắc và hướng dẫn quan trọng khi làm việc trong dự án ShopAHSO. Vui lòng tuân thủ nghiêm ngặt các điều khoản sau:

## 🛠 Nguyên tắc cốt lõi
1. **Ưu tiên tiếng Việt**: Luôn phản hồi và giải thích bằng tiếng Việt trừ khi có yêu cầu khác.
2. **Không làm việc trên Main/Master**: Luôn thông báo cho người dùng nếu bạn đang ở nhánh `main` hoặc `master`.
3. **Hiểu rõ yêu cầu**: Luôn xác nhận yêu cầu trước khi bắt đầu. Đừng giả định các chi tiết còn thiếu.
4. **Chia nhỏ Code**: Tránh viết code nguyên khối. Chia nhỏ các logic phức tạp thành các Service, Module hoặc Component tái sử dụng được.

## 🎨 Frontend & UI (Nếu có)
- **Design System**: Tuân thủ hệ thống thiết kế hiện có.
- **Animations**: Ưu tiên sử dụng **GSAP** cho các hiệu ứng chuyển động.
- **Components**: Sử dụng **shadcn/ui** cho các thành phần giao diện.
- **Thông báo**: Tuyệt đối không dùng `alert()`, `confirm()`, `prompt()` mặc định của trình duyệt. Luôn sử dụng **Sonner** để hiển thị thông báo (Success, Error, Warning, Loading).
- **Phản hồi người dùng**: Mọi hành động của người dùng đều phải có phản hồi rõ ràng qua UI.

## ⚙️ Backend & API
- **Framework**: NestJS.
- **Database**: Prisma v7 (PostgreSQL).
- **ID Strategy**: Luôn sử dụng UUID/CUID cho Primary Key.
- **Port**: Mặc định là `3001`. Swagger UI tại `/api`.

## 🚀 Quy trình thực thi
- Luôn chạy thử, kiểm tra và fix lỗi trước khi bàn giao.
- Sau khi hoàn thành, hãy cung cấp gợi ý cải thiện UI/UX nhưng **không tự ý thực hiện** khi chưa được duyệt.
- Xử lý đầy đủ các trạng thái: Loading, Error, Empty.

## 📚 Kỹ năng đặc biệt
- Dự án có tích hợp skill **impeccable** tại `.agents/skills/impeccable`. Hãy sử dụng nó khi cần thiết kế hoặc audit UI.

---
**Ghi chú**: Mọi lỗi phát sinh phải được hiển thị rõ ràng cho người dùng, không được để lỗi chạy ngầm (fail silently).
