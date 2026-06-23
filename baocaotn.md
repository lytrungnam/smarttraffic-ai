# BÁO CÁO THUYẾT TRÌNH PHẦN PHÁT TRIỂN ỨNG DỤNG - SMARTTRAFFIC AI

## 1. Vai trò của em trong đề tài
Em là Lý Trung Nam — phụ trách toàn bộ phần phát triển ứng dụng của SmartTraffic AI, bao gồm:

- Xây dựng frontend (React + TypeScript) cho giao diện Dashboard, Detection, History, Analytics, Camera Management, Subscription và Settings.
- Thiết kế và triển khai backend bằng Python + FastAPI: API REST, WebSocket realtime, tích hợp pipeline AI, xử lý upload ảnh/video, lưu evidence.
- Thiết kế database PostgreSQL và các schema để lưu kết quả nhận diện, metadata camera, subscription và logs.
- Bảo mật API bằng JWT authentication.
- Triển khai hệ thống: frontend deploy trên Vercel, backend và PostgreSQL chạy trên Railway.

Em đảm bảo tích hợp các mô-đun AI (YOLO, biển số, OCR) vào backend để hệ thống hoạt động đồng bộ.

## 2. Mục tiêu phần ứng dụng

- Xây dựng giao diện quản lý trực quan cho người dùng và người quản trị.
- Cho phép upload ảnh/video và nhận diện phương tiện, biển số theo luồng realtime.
- Lưu lịch sử nhận diện và ảnh bằng chứng (evidence image).
- Cung cấp Analytics để thống kê và hỗ trợ giám sát giao thông.
- Hiển thị kết quả realtime trên Dashboard bằng WebSocket.
- Hỗ trợ quản lý camera và cấu hình nguồn dữ liệu (mở rộng RTSP sau này).
- Triển khai hệ thống lên cloud để demo trực tuyến trước hội đồng.

Thời lượng phần app trong bài thuyết trình: Khoảng 7–8 phút.

## 3. Kiến trúc hệ thống

Luồng tổng quan:

User / Camera / Upload
  → React Frontend
    → FastAPI Backend
      → AI Detection Pipeline (YOLO → Plate Detector → OCR)
        → PostgreSQL Database
      → Store Evidence Images
      → WebSocket → Frontend (realtime)

Dashboard realtime hiển thị kết quả từ WebSocket và gọi REST API để xem lịch sử, analytics.

Sơ đồ ASCII:

  [User/Camera]
       |
    (upload)
       |
  [React Frontend]
       |
   REST / WebSocket
       |
  [FastAPI Backend]
     /    |      \
  AI     |     Storage (evidence)
 Pipeline |      |
 (YOLO/   |   [PostgreSQL]
 Plate/OCR)
       |
   WebSocket
       |
  [Frontend Dashboard]

## 4. Luồng xử lý chính của hệ thống

1. Người dùng đăng nhập vào hệ thống (JWT authentication).
2. Người dùng upload ảnh/video hoặc chọn camera để xem livestream.
3. Frontend gửi dữ liệu qua REST API (upload file / camera ID).
4. Backend nhận dữ liệu, lưu tạm nếu cần và tạo task xử lý.
5. Backend gọi AI pipeline: gọi model YOLO để phát hiện phương tiện, gọi detector biển số và OCR.
6. Hệ thống phát hiện phương tiện, phân loại loại xe.
7. Hệ thống phát hiện vùng biển số (plate detection).
8. OCR đọc ký tự biển số và trả về chuỗi ký tự.
9. Backend lưu kết quả (biển số, loại xe, confidence, timestamp, camera) vào PostgreSQL.
10. Backend lưu ảnh bằng chứng (crop plate, evidence image) vào storage và ghi đường dẫn vào DB.
11. Backend gửi kết quả realtime qua WebSocket đến các client đang kết nối.
12. Frontend cập nhật Dashboard, History và Analytics ngay lập tức.

## 5. Các chức năng chính em đã phát triển

### 5.1 Dashboard

- Tổng quan hệ thống: số lượng phương tiện, số lượt phát hiện trong ngày, biểu đồ xu hướng.
- Hiển thị danh sách sự kiện mới nhất (recent detections) với ảnh bằng chứng.
- Trạng thái realtime (kết nối camera, luồng WebSocket).

### 5.2 Detection

- Giao diện upload ảnh/video và xem kết quả ngay.
- Hiển thị kết quả: biển số (text), loại phương tiện, confidence score và ảnh crop.
- Hỗ trợ xem chi tiết sự kiện (thời gian, camera, metadata).

### 5.3 History

- Lưu trữ tất cả bản ghi nhận diện trong PostgreSQL.
- Tìm kiếm theo biển số, khoảng thời gian, loại xe, camera.
- Xem ảnh bằng chứng, export hoặc báo cáo sự kiện.

### 5.4 Analytics

- Thống kê theo loại phương tiện, số lượt phát hiện theo ngày/giờ.
- Biểu đồ để quan sát luồng giao thông theo khung thời gian.
- Số liệu dùng để hỗ trợ quyết định quản lý.

### 5.5 Camera Management

- Danh sách camera, trạng thái, vị trí mô tả.
- Thêm/sửa/xóa camera, cấu hình nguồn (URL, RTSP trong tương lai).
- Hiện trạng prototype: quản lý metadata camera và kết nối mock/stream.

### 5.6 Subscription

- Chức năng gói sử dụng ở mức prototype: quản lý gói, thời hạn demo, giới hạn tính năng.
- Hỗ trợ mở rộng thương mại hoá về sau.

## 6. Công nghệ sử dụng trong phần app

Thành phần | Công nghệ | Vai trò
---|---|---
Frontend | React, TypeScript, Vite | Xây dựng giao diện UI
UI | TailwindCSS, shadcn UI | Thiết kế giao diện hiện đại, component sẵn có
Backend | Python, FastAPI | Xử lý API và tích hợp AI
Database | PostgreSQL | Lưu lịch sử nhận diện, metadata
Realtime | WebSocket | Cập nhật kết quả tức thời lên frontend
Auth | JWT | Đăng nhập và bảo vệ API
Deployment | Vercel, Railway | Triển khai hệ thống

## 7. Triển khai hệ thống

- Frontend được deploy trên Vercel để có URL truy cập nhanh khi demo.
- Backend deploy trên Railway, cùng với PostgreSQL hosted trên Railway.
- Evidence images có thể lưu trên storage của Railway hoặc S3 (tùy mở rộng).
- Triển khai này giúp hội đồng truy cập trực tuyến và em có thể demo live.

## 8. Kịch bản thuyết trình phần của em theo slide

### Slide: Web Monitoring Dashboard

"Sau khi mô hình AI xử lý xong, nhóm cần một hệ thống web để quản lý kết quả. Em phụ trách phần ứng dụng, đã xây dựng dashboard hiển thị tổng quan dữ liệu nhận diện: số lượng phương tiện, lịch sử gần nhất và biểu đồ thống kê. Dashboard cũng cho biết trạng thái realtime và sự kiện mới nhất để người vận hành theo dõi ngay lập tức." 

### Slide: Detection

"Chức năng Detection cho phép người dùng tải ảnh hoặc video lên. Frontend gửi file đến backend, backend gọi pipeline AI (YOLO → plate detector → OCR). Kết quả gồm biển số, loại phương tiện và confidence được trả về và lưu lại. Lưu ý: phần train model do bạn khác phụ trách, em chỉ tích hợp mô hình vào backend." 

### Slide: History

"Mọi kết quả nhận diện đều được lưu vào PostgreSQL cùng ảnh bằng chứng. Người dùng có thể tra cứu lại theo biển số, thời gian, loại xe và xem ảnh evidence để xác minh. Chức năng này rất quan trọng cho việc truy vết và báo cáo." 

### Slide: Analytics

"Analytics tổng hợp số liệu theo loại phương tiện và theo thời gian, hiển thị biểu đồ để quản lý dễ quan sát xu hướng giao thông. Tính năng này giúp ra quyết định hoặc phát hiện điểm nóng". 

### Slide: Camera Management

"Camera Management cho phép quản lý danh sách camera và metadata. Ở giai đoạn prototype, chúng em hỗ trợ cấu hình nguồn và sẽ mở rộng tích hợp RTSP/ONVIF khi triển khai thực tế." 

### Slide: Deployment

"Hệ thống được triển khai: frontend trên Vercel, backend và PostgreSQL trên Railway. Cách triển khai này giúp chúng em demo trực tuyến trước hội đồng một cách thuận tiện." 

## 9. Đoạn nói chuyển tiếp từ phần AI sang phần App

"Sau khi bạn Mỹ trình bày phần huấn luyện và đánh giá mô hình AI, em xin trình bày phần phát triển ứng dụng SmartTraffic AI. Phần này tập trung vào cách nhóm tích hợp mô hình AI vào một hệ thống web hoàn chỉnh, bao gồm frontend, backend, cơ sở dữ liệu, WebSocket realtime và triển khai cloud." 

## 10. Đoạn kết thúc phần của em

"Tóm lại, phần ứng dụng giúp biến kết quả từ mô hình AI thành một hệ thống có thể sử dụng thực tế. Người dùng không chỉ xem được kết quả nhận diện biển số, mà còn có thể lưu trữ, tìm kiếm, thống kê và theo dõi dữ liệu thông qua giao diện web." 

## 11. Câu hỏi hội đồng có thể hỏi và cách trả lời

1. Em phụ trách phần nào trong đề tài?
- Trả lời: Em (Lý Trung Nam) phụ trách frontend (React/TS), backend (FastAPI), DB (PostgreSQL), WebSocket, tích hợp AI và triển khai cloud.

2. Vì sao chọn FastAPI?
- Trả lời: FastAPI cho hiệu năng tốt, dễ viết REST API, tích hợp async thuận tiện cho gọi model và WebSocket.

3. Vì sao dùng React TypeScript?
- Trả lời: React + TypeScript giúp xây UI động, an toàn kiểu tĩnh, phát triển nhanh với component tái sử dụng.

4. WebSocket dùng để làm gì?
- Trả lời: Để gửi kết quả nhận diện realtime từ backend tới dashboard mà không cần refresh trang.

5. PostgreSQL lưu những dữ liệu gì?
- Trả lời: Lưu record nhận diện (biển số, loại xe, confidence, timestamp, camera), metadata camera và đường dẫn ảnh bằng chứng.

6. Hệ thống đã realtime thật chưa?
- Trả lời: Ở prototype, frontend nhận được sự kiện realtime qua WebSocket khi backend xử lý xong. Độ trễ phụ thuộc vào pipeline AI và mạng.

7. Nếu camera thực tế thì hệ thống xử lý thế nào?
- Trả lời: Kết nối RTSP/stream, backend sẽ lấy frame, gửi vào pipeline AI, lưu kết quả và push qua WebSocket; có thể cân bằng tải xử lý bằng worker/task queue.

8. Khó khăn lớn nhất khi làm phần app là gì?
- Trả lời: Tích hợp pipeline AI không đồng bộ (latency) và quản lý lưu trữ ảnh evidence sao cho hiệu quả và bảo mật.

9. Điểm khác giữa demo prototype và hệ thống thực tế là gì?
- Trả lời: Prototype tập trung chức năng cơ bản, hệ thống thực tế cần mở rộng về scale, bảo mật, fault-tolerance và storage tối ưu.

10. Hướng phát triển tiếp theo là gì?
- Trả lời: Tích hợp RTSP trực tiếp, scaling bằng worker queue, lưu ảnh lên object storage, và thêm phân quyền chi tiết cho người dùng.

## 12. Bản tóm tắt 1 phút phần của em

"Em là Lý Trung Nam, phụ trách phát triển ứng dụng SmartTraffic AI. Em xây dựng frontend bằng React/TypeScript và backend bằng FastAPI, tích hợp pipeline AI (YOLO → plate detector → OCR) để nhận diện phương tiện và biển số. Kết quả được lưu vào PostgreSQL, ảnh bằng chứng được lưu trữ, và dữ liệu realtime được gửi tới dashboard qua WebSocket. Hệ thống được deploy trên Vercel và Railway để demo trực tuyến." 

## 13. Bản đầy đủ 7 phút phần của em

"Kính thầy cô, em là Lý Trung Nam, tiếp nối phần trình bày của bạn Mỹ về huấn luyện mô hình AI, em sẽ trình bày phần phát triển ứng dụng. Mục tiêu của em là biến mô hình AI thành một hệ thống web hoàn chỉnh để người dùng có thể thao tác: upload ảnh/video, xem kết quả realtime, lưu lịch sử và thống kê. (30s)

Về kiến trúc, frontend dùng React + TypeScript với Vite để xây giao diện gồm Dashboard, Detection, History, Analytics, Camera Management và Settings. Backend dùng Python và FastAPI chịu trách nhiệm REST API, gọi pipeline AI để phát hiện phương tiện, vùng biển số và OCR, lưu kết quả vào PostgreSQL và gửi sự kiện realtime qua WebSocket. (40s)

Luồng xử lý: người dùng đăng nhập, upload ảnh/video hoặc chọn camera; frontend gửi dữ liệu lên backend; backend gọi các model (YOLO → plate detector → OCR), nhận kết quả và lưu vào database cùng ảnh bằng chứng; cuối cùng backend push kết quả về frontend qua WebSocket để dashboard cập nhật ngay. Em đã viết API upload, xử lý response, lưu ảnh evidence và các endpoint để tra cứu lịch sử và thống kê. (1m)

Về chức năng cụ thể: Dashboard hiển thị tổng quan và realtime events; Detection cho phép upload và nhận kết quả ngay; History lưu trữ và tra cứu; Analytics hiển thị biểu đồ; Camera Management quản lý metadata camera; Subscription quản lý gói dùng demo. Em đã đảm bảo bảo mật API cơ bản bằng JWT. (1m)

Về tích hợp AI: phần train và dữ liệu do bạn Mỹ trình bày; em chỉ tích hợp các model đã được huấn luyện vào backend (gọi model và xử lý output). Việc này giúp tách rõ trách nhiệm giữa phần AI và phần ứng dụng. (30s)

Về triển khai: frontend được deploy trên Vercel, backend và PostgreSQL trên Railway để tạo môi trường demo trực tuyến cho hội đồng. Điều này cho phép chúng ta truy cập và demo live từ bất kỳ máy nào có Internet. (30s)

Khó khăn chính em gặp là đồng bộ hóa luồng xử lý bất đồng bộ (AI có độ trễ) và quản lý lưu trữ ảnh bằng chứng hiệu quả; em đã xử lý bằng luồng task đơn giản và lưu trữ metadata trong DB. Hướng phát triển tiếp theo là tích hợp xử lý stream RTSP, tách worker queue để scale, và dùng object storage cho ảnh. (40s)

Kết lại, phần ứng dụng của em biến output từ mô hình AI thành sản phẩm có thể dùng: người dùng có thể upload, xem realtime, tìm kiếm, thống kê và lưu evidence. Em sẵn sàng demo chức năng nếu thầy cô muốn. Xin cảm ơn. (20s)"

---

Nếu thầy cô hoặc hội đồng cần em chỉnh sửa nội dung để phù hợp thời lượng hoặc nhấn mạnh điểm khác, em sẽ cập nhật ngay.
