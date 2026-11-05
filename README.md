# Tuyến điểm — Sổ tay sơ đồ du lịch

Website tĩnh bằng HTML, CSS, JavaScript, không cần cài thư viện.

## Trạng thái thực tế
- Đã có giao diện tiếng Việt và danh mục **109 tên ảnh** lấy từ file SƠ ĐỒ - TUYẾN ĐIỂM.rar.
- **Chưa có sơ đồ nào được vẽ lại hoặc kiểm chứng.**
- Ảnh gốc chưa được đưa vào kho này. Môi trường xử lý tệp đính kèm hiện không khả dụng.
- Chưa triển khai website trực tuyến và chưa kiểm thử giao diện trên trình duyệt.
- Đã kiểm tra cú pháp JavaScript, liên kết ID giao diện, tính duy nhất của danh mục và kiểm tra dữ liệu nhập.

## Chạy
Tải các file cùng thư mục và mở index.html bằng trình duyệt hiện đại.
Có thể đưa toàn bộ thư mục lên dịch vụ hosting tĩnh; chưa có cấu hình triển khai tự động.

## Tính năng đã viết
- Tìm tên tài liệu không phân biệt dấu tiếng Việt; lọc ảnh IMG, tên tuyến, bản nháp.
- Mở nhiều ảnh JPEG/PNG/WebP và ghép đúng tên file trong danh mục.
- Xem bản vẽ, ảnh gốc, hoặc đối chiếu; phóng to, thu nhỏ, kéo khung nhìn.
- Biên tập SVG: thêm điểm, kéo điểm, đổi tên, nối hai điểm, xóa điểm/đường, hoàn tác.
- Bản nháp lưu trong localStorage của trình duyệt nếu khả dụng.
- Xuất/nhập dự án JSON có kiểm tra dữ liệu; xuất SVG.
- Ảnh gốc chỉ được mở trên máy, không tải lên mạng và không nằm trong bản lưu JSON.
- Mọi bản vẽ do người sử dụng biên tập được đánh dấu chưa kiểm chứng.

## Công việc còn lại để đáp ứng yêu cầu gốc
Khôi phục truy cập 109 ảnh đã giải nén; đọc từng ảnh đủ độ phân giải;
phân biệt bản trùng và bản bổ sung; dựng đường tuyến, nhánh, địa danh,
nhãn quốc lộ, khoảng cách; đối chiếu từng bản; kiểm thử giao diện và triển khai.
Không suy đoán chữ mờ, không dùng tên trong danh mục thay cho nội dung sơ đồ.

## Tệp
- index.html: giao diện
- style.css: bố cục responsive
- catalog.js: 109 tên tài liệu gốc
- app.js: trình xem và biên tập

Kho này hiện công khai. Không đưa dữ liệu cá nhân hoặc thông tin bí mật vào mã nguồn.
