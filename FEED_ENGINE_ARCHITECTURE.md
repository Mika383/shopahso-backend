# Kiến trúc Feed Động (Dynamic Feed Engine)

Tài liệu này định nghĩa các nguyên tắc kiến trúc cốt lõi để xây dựng hệ thống Feed (trang chủ hiển thị sản phẩm) cho ShopAHSO, hướng tới khả năng scale vài chục ngàn sản phẩm, cá nhân hóa tốt và hiệu năng cao tương tự Shopee/TikTok Shop.

---

## 1. Các Tầng Kiến Trúc (Architecture Layers)

Hệ thống được chia thành 5 lớp chính để đảm bảo tính tách biệt và dễ mở rộng:

```text
Client
  ↓
API Layer
  ↓
Feed Service
  ↓
Ranking + Diversity Engine
  ↓
Database / Cache / Search
```

**Cấu trúc Module dự kiến:**
`product`, `feed`, `ranking`, `tracking`, `search`, `cache`, `recommendation`.

---

## 2. Nguyên tắc chung

- **KHÔNG lưu cứng thứ tự (No static ordering):** Tuyệt đối không dùng các cột như `position` hay `homepage_order`. Feed phải được sinh ra tại runtime (động).
- **Tránh realtime toàn bộ:** Không tính toán điểm số (score) realtime cho toàn bộ DB khi có request.
- **Index Database:** Phải có composite index trên các trường thường xuyên query cho feed (ví dụ: `category_id` + `score DESC`).

---

## 3. Product & Ranking Service

### Tính điểm sản phẩm (Score)
Sản phẩm cần có một cột `score` để lưu trữ mức độ hấp dẫn.
- **Công thức ví dụ:** `score = (orderCount * 0.4) + (viewCount * 0.2) + (freshness * 0.2) + (ctr * 0.2)`
- **Thực thi:** Sử dụng **Cron Job / Queue (BullMQ)** chạy định kỳ (vd: mỗi 5 phút) để update cột `score` trong DB (`UPDATE products SET score = ...`).

---

## 4. Feed & Diversity Engine (Trái tim của hệ thống)

Nhiệm vụ là tạo ra một luồng sản phẩm đa dạng, không gây nhàm chán.

### Luồng xử lý chuẩn:
1. **Fetch Top Products:** Lấy top sản phẩm của *từng* category dựa trên `score`. (Query song song).
2. **Group:** Gom nhóm theo `Map<categoryId, Product[]>`.
3. **Diversified Merge:** Trộn lẫn sản phẩm từ các category khác nhau. **Chống spam category** bằng logic kiểm tra: Nếu `lastCategory === currentCategory` thì bỏ qua và chọn category khác.

---

## 5. Phân trang (Cursor Pagination)

- **TUYỆT ĐỐI KHÔNG DÙNG OFFSET:** Bỏ qua kiểu phân trang truyền thống `?page=2` (gây chậm khi offset lớn).
- **BẮT BUỘC DÙNG CURSOR:** URL dạng `/feed?cursor=abcxyz`.
- **Cấu trúc Cursor (encode Base64):**
  ```ts
  {
    seed: string, // Mã định danh phiên
    seenIds: number[], // ID đã xem (giới hạn 200-500)
    categoryState: object, // Trạng thái lấy dữ liệu các category
    lastScore: number
  }
  ```

---

## 6. Seed & Chống trùng lặp (Seen Tracking)

- **Seed:** Tạo chuỗi băm `hash(ip + currentDate)` hoặc dùng `sessionId`. Mục đích: User A khác User B, nhưng trong cùng một phiên lướt, thứ tự vẫn ổn định.
- **Seen Tracking:** Tránh hiển thị lại sản phẩm đã xem ở các trang trước. Lưu danh sách khoảng **200-500 items gần nhất** vào `seenIds` và dùng SQL `NOT IN (...)`. Không lưu quá nhiều để tránh quá tải DB.

---

## 7. Caching (Redis) - Bắt buộc

Redis là lá chắn bắt buộc để bảo vệ Database khi traffic tăng cao.
- **Cơ chế:** Cache toàn bộ Feed trả về cho mỗi User/Seed.
- **Key ví dụ:** `feed:guest:seed123`
- **TTL:** Khoảng 5 phút.

---

## 8. Các Module Hỗ Trợ Khác

- **Search Service:** Vượt qua giới hạn của SQL `LIKE` bằng cách dùng các engine chuyên dụng như **Meilisearch** hoặc Elasticsearch.
- **Tracking Module:** Lưu lại hành vi người dùng (view, click, search, category_click) để phục vụ Data Analytics và Recommendation sau này. Lược đồ cơ bản: `{ sessionId, productId, type, timestamp }`.
- **Recommendation:** Bắt đầu bằng gợi ý cơ bản (cùng category, material) rồi tiến tới Collaborative Filtering (Người xem X cũng xem Y).

---

## 9. Thứ Tự Ưu Tiên Tích Hợp (Priority)

Khi phát triển, tuân thủ thứ tự ưu tiên sau để mang lại hiệu quả UX lớn nhất:
1. **Diversified feed engine** (Thuật toán trộn Feed).
2. **Cursor pagination** (Phân trang mượt).
3. **Redis cache** (Bảo vệ hệ thống).
4. **Tracking event** (Thu thập dữ liệu sớm).
5. **Search/filter tốt** (Tích hợp Meilisearch).
