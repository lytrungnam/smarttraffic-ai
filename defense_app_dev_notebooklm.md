# Defense Report: App Developer Contribution

## Overview
Bản báo cáo này chỉ ghi nhận những gì có thể đối chiếu trực tiếp với source code hiện tại của `smarttraffic-ai`.

### Thành viên
- Lý Trung Nam

### Mục tiêu
- Kiểm tra các phần đã triển khai và chưa triển khai trong mã nguồn hiện tại
- Trình bày chức năng thực tế dựa trên file code đã có
- Ghi rõ những mục chưa thấy trong source code hiện tại bằng dòng "Chưa thấy trong source code hiện tại"

---

## TASK 3 — Kiểm chứng các nội dung đã làm được trong source code hiện tại

### Backend AI / Inference
- `backend/app/ai/inference.py` thực hiện inference từ bytes ảnh sang frame OpenCV, gọi `detect_vehicles` và `detect_plate`, sau đó OCR trên vùng biển số.
- `backend/app/ai/plate_detector.py` sử dụng Ultralytics YOLO để phát hiện biển số với model file `backend/app/ai/weights/plate_best.pt`.
- `backend/app/ai/vehicle_detector.py` sử dụng Ultralytics YOLO để phát hiện phương tiện với model file `backend/app/ai/weights/vehicle_best.pt`.
- `backend/app/ai/ocr_reader.py` chứa pipeline OCR, gồm:
  - EasyOCR reader (`easyocr.Reader`) và dự phòng PaddleOCR (`PaddleOCR`) nếu có.
  - Chuẩn hóa văn bản biển số với `normalize_plate` và các biến thể `O→0`, `I→1`, `S→5`, `G→6`.
  - Tiền xử lý ảnh: CLAHE, lọc khử nhiễu, tăng cường cạnh, adaptive threshold, Otsu.
  - Kiểm tra tính hợp lệ của chuỗi OCR theo độ dài, số chữ số, số chữ cái.

### Backend Detections / History / Storage
- `backend/app/api/routes/detection.py` xử lý:
  - upload ảnh/video, nhận diện AI, save detection vào DB,
  - history API `/detections/history`,
  - lưu ảnh minh chứng vào `storage/detections`,
  - nếu annotation tồn tại, tạo ảnh `*_annotated.jpg`.
- `backend/app/services/detection_service.py` serialize đối tượng `Detection` và trả về annotated path nếu tồn tại.
- `backend/app/models/detection.py` định nghĩa model `Detection` với `plate_number`, `vehicle_type`, `confidence`, `image_path`, `status`, `created_at`.
- `backend/app/services/analytics_service.py` tổng hợp số liệu từ DB để dùng cho dashboard.
- `backend/app/main.py` mount thư mục static `storage` lên endpoint `/storage`.

### Realtime WebSocket
- `backend/app/api/routes/ws.py` cung cấp WebSocket cho dashboard realtime tại `/api/v1/ws/detections`.
- `backend/app/services/websocket_service.py` quản lý kết nối WebSocket và broadcast JSON tới tất cả client đang kết nối.
- `backend/app/services/detection_engine.py` có loop realtime AI nếu `ENABLE_AI_STARTUP=true` và `CAMERA_SOURCE` được thiết lập. Loop này:
  - đọc frame từ camera/video source,
  - detect vehicles/plates,
  - OCR và ghi detection mới vào DB,
  - broadcast data realtime chứa `plates`, `tracks`, `events`.
- `backend/app/api/routes/stream.py` có WebSocket `/api/v1/stream/mobile` dành cho mobile camera stream: nhận base64 JPEG, chạy AI, trả về kết quả và broadcast đến dashboard clients.

### Frontend realtime / dashboard / detection
- `frontend/src/hooks/useWebSocket.ts` là hook WebSocket với retry reconnect.
- `frontend/src/services/websocket.ts` mở WebSocket tới `/api/v1/ws/detections` và parse JSON.
- `frontend/src/routes/_layout/dashboard.tsx` kết nối WS để nhận realtime updates và cập nhật dashboard.
- `frontend/src/routes/_layout/history.tsx` cũng mở WS để cập nhật lịch sử detections realtime.
- `frontend/src/routes/_layout/detection.tsx` dùng WS để nhận `tracks` và `events` cho phần live detection preview.
- `frontend/src/routes/mobile-camera.tsx` cung cấp trang mobile camera stream với chế độ demo.

### Frontend API / Auth
- `frontend/src/main.tsx` cấu hình `OpenAPI.BASE` và `OpenAPI.TOKEN`, lấy token JWT từ `localStorage`.
- Frontend sử dụng OpenAPI generated client trong `frontend/src/client/`.
- `backend/app/api/routes/login.py` cung cấp `/login/access-token` và `/login/test-token`, token OAuth2.
- `backend/app/api/deps.py` chứa dependency `get_current_active_user` / JWT auth để bảo vệ route.

### Subscription / Demo activation
- `backend/app/api/routes/subscriptions.py` cung cấp:
  - `/subscriptions/me` để lấy subscription user hiện tại,
  - `/subscriptions/activate-demo` để kích hoạt gói demo.
- Frontend có `frontend/src/services/subscriptionService.ts` dùng token từ `localStorage` để gọi API subscription.

### Mô hình hệ thống hiện tại
- Backend: FastAPI + SQLModel + PostgreSQL / local DB.
- AI: Ultralytics YOLO + EasyOCR / PaddleOCR + OpenCV preprocessing.
- Frontend: React + Vite + TanStack Router + TanStack Query + generated OpenAPI client.
- Realtime: WebSocket server broadcast và client reconnect logic.
- File storage: ảnh detection lưu vào `storage/detections`; `storage` được mount static.

---

## TASK 4 — Những gì chưa thấy trong source code hiện tại

- Chưa thấy trong source code hiện tại: tích hợp thanh toán MoMo hoặc hệ thống payment gateway.
- Chưa thấy trong source code hiện tại: cấu hình hoặc triển khai hạ tầng production cloud như Kubernetes, Docker Compose production, Azure/AWS deployment scripts cụ thể.
- Chưa thấy trong source code hiện tại: cache/Redis/session store để scale WebSocket state.
- Chưa thấy trong source code hiện tại: xác thực WebSocket token cho `/api/v1/ws/detections` hoặc `/api/v1/stream/mobile`.
- Chưa thấy trong source code hiện tại: hệ thống ticket/violation pháp luật đầy đủ cho từng loại vi phạm; detection hiện tại chỉ lưu plate, vehicle_type, confidence, ảnh.
- Chưa thấy trong source code hiện tại: cơ chế refresh token JWT hoặc multi-device token management.
- Chưa thấy trong source code hiện tại: backend upload image/video lưu ảnh đã detect ngoài `storage/detections` nếu plate không đọc được.
- Chưa thấy trong source code hiện tại: unit tests hoặc integration tests rõ ràng cho AI pipeline hoặc WebSocket routes trong repository gốc (mặc dù frontend/backend có config test, không thấy test cụ thể cho các luồng này trong các file đã duyệt).

---

## TASK 5 — Các lỗ hổng / technical debt cần lưu ý

### Kiến trúc hiện tại
- WebSocket manager `backend/app/services/websocket_service.py` là implementation đơn giản, không có cơ chế phân đoạn/rooms, không có giữ trạng thái cho scale nhiều worker.
- Lưu file detection trực tiếp vào `storage/detections` và `storage/debug_plates` là local file storage, chưa phù hợp với kiến trúc phân tán hoặc cloud storage.
- `real_ai_detection_loop` dùng biến toàn cục `saved_plates` để tránh duplicate detection, nhưng đây là state không bền qua khởi động lại.
- `backend/app/main.py` mount `storage` trực tiếp mà không có cấu hình bảo mật chi tiết.

### AI / OCR
- Mô hình YOLO yêu cầu file weights tại `backend/app/ai/weights`; nếu file weights không có sẵn thì ứng dụng sẽ lỗi `FileNotFoundError`.
- `backend/app/ai/ocr_reader.py` tải EasyOCR/PaddleOCR tại runtime, có thể gây delay khởi động và phụ thuộc vào GPU/CPU.
- `backend/app/api/routes/stream.py` xử lý mobile frame blocking bằng `run_in_executor`, nhưng vẫn có giới hạn hiệu năng nếu nhiều frame cùng lúc.
- Không có cấu hình rõ ràng cho pipeline OCR vs detection threshold ngoài `settings`.

### Frontend
- WebSocket frontend không dùng JWT auth header; chỉ kết nối công khai tới `/api/v1/ws/detections`.
- `OpenAPI.TOKEN` dùng localStorage, không có fallback nếu token expire ngoài việc redirect 401.
- Mobile camera stream được triển khai như trang web `mobile-camera`, chứ không phải app native.

### Bảo mật & quản lý người dùng
- Authentication được triển khai, nhưng không có refresh token hoặc bảo vệ thêm cho các route realtime.
- Không thấy cơ chế role-based access control rõ ràng ngoài `get_current_active_superuser` cho một số route.

---

## TASK 6 — Hướng bảo vệ / đề xuất hoàn thiện báo cáo

### Những điểm có thể bảo vệ
- Dự án đã có backend FastAPI đầy đủ cho:
  - AI detection image/video upload,
  - realtime WebSocket dashboard,
  - mobile stream endpoint,
  - history/analytics,
  - JWT login.
- Dự án đã có pipeline AI thực tế với:
  - YOLO plate detection,
  - YOLO vehicle detection,
  - OCR qua EasyOCR/PaddleOCR,
  - tiền xử lý OpenCV cho ảnh biển số.
- Frontend đã triển khai dashboard realtime, detection upload, history, và mobile camera page.
- Dự án có cấu trúc rõ ràng giữa `backend/app` và `frontend/src`, với OpenAPI client và token auth kết nối hai phần.

### Những gì cần nhấn mạnh trong defense
- “Triển khai thực tế” dựa vào code: `backend/app/ai/`, `backend/app/api/routes/detection.py`, `backend/app/api/routes/ws.py`, `frontend/src/routes/_layout/dashboard.tsx`, `frontend/src/hooks/useWebSocket.ts`.
- “Feature chưa hoàn chỉnh” phải ghi rõ là chưa thấy trong nguồn: thanh toán MoMo, production infrastructure, WebSocket auth, refresh token, cloud storage.
- Nếu cần so sánh với yêu cầu lớn hơn, chỉ ra: hiện tại system focus vào detection, OCR, realtime stream và history; chưa có payment/microservice scale.

### Đề xuất tối ưu tiếp theo
1. Bổ sung kiểm soát và xác thực WebSocket cho driver dashboard/mobile stream.
2. Chuyển storage từ local `storage/` sang object storage hoặc DB lưu trữ cloud nếu cần mở rộng.
3. Thêm cơ chế refresh JWT và chính sách token hợp lý.
4. Thêm tests cho luồng AI inference và WebSocket realtime.
5. Nếu muốn gọi là sản phẩm enterprise, cần bổ sung deployment/infra rõ ràng và xử lý scale stateless.

---

## Checklist
- [x] Backend FastAPI detection + history API
- [x] YOLO vehicle + plate detection pipeline
- [x] OCR preprocessing và normalization
- [x] Realtime WebSocket broadcast `/api/v1/ws/detections`
- [x] Mobile stream endpoint `/api/v1/stream/mobile`
- [x] Frontend React dashboard + history + detection pages
- [x] JWT login và OpenAPI client
- [x] Subscription demo activation endpoint
- [ ] Chưa thấy trong source code hiện tại: MoMo/payment integration
- [ ] Chưa thấy trong source code hiện tại: production cloud infra / scaling architecture
- [ ] Chưa thấy trong source code hiện tại: secure WebSocket authentication
- [ ] Chưa thấy trong source code hiện tại: refresh token JWT mechanism
- [ ] Chưa thấy trong source code hiện tại: persistent cloud storage for detection assets
