# 🚗 SmartTraffic AI — Hệ Thống Nhận Diện Phương Tiện

Hệ thống nhận diện phương tiện và biển số xe thời gian thực sử dụng **YOLOv5 + EasyOCR + FastAPI + React**. Backend xử lý video liên tục, phát hiện xe và đọc biển số, lưu vào PostgreSQL và đẩy kết quả lên frontend qua WebSocket.

---

## ⚙️ Yêu cầu cài đặt

| Phần mềm | Phiên bản tối thiểu | Link tải |
|----------|---------------------|----------|
| **Docker Desktop** | Mới nhất | https://www.docker.com/products/docker-desktop |
| **Node.js** | >= 18.0 | https://nodejs.org |
| **Python** | >= 3.10 | https://www.python.org/downloads |
| **uv** | Mới nhất | https://docs.astral.sh/uv |
| **Git** | Mới nhất | https://git-scm.com |
| **Bun** (tuỳ chọn) | >= 1.0 | https://bun.sh |

> 💡 Nếu chỉ chạy bằng Docker thì **không cần** cài Node.js, Python hay uv riêng.

---

## 🌐 Online Deployment

| Service | URL |
|---------|-----|
| Frontend | https://smarttraffic-ai-frontend.vercel.app |
| Backend API Docs | https://smarttraffic-ai-production.up.railway.app/docs |
| Healthcheck | https://smarttraffic-ai-production.up.railway.app/railway-health |

---

## 🚀 Chạy bằng Docker (Khuyên dùng)

```bash
# Clone project (lần đầu)
git clone https://github.com/lytrungnam/smarttraffic-ai.git
cd smarttraffic-ai

# Tạo file .env (lần đầu) — xem mẫu ở phần Biến môi trường bên dưới
cp .env.example .env   # hoặc tạo tay

# Chạy toàn bộ stack
docker compose up --build
```

Chờ thấy dòng:
```
backend  | INFO:     Uvicorn running on http://0.0.0.0:8000
```
→ Mở trình duyệt tại **http://localhost:5173** ✅

**Chế độ hot-reload** (tự reload khi sửa code):
```bash
docker compose watch
```

---

## 🛠️ Chạy từng service trên localhost (Phát triển)

### Backend — dùng uv

docker network create traefik-public

docker compose -f compose.yml up backend

```bash
# Cài uv nếu chưa có (Windows)
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

cd backend

# Lần đầu: cài dependencies vào .venv
uv sync

# Chạy dev server
uv run fastapi dev app/main.py
```

Chờ thấy: `Uvicorn running on http://0.0.0.0:8000` ✅

> ⚠️ Trước khi chạy local, dừng service đó trong Docker:
> ```bash
> docker compose stop backend
> ```

### Frontend — dùng Bun

```bash
# từ thư mục gốc hoặc frontend/
bun run dev
# hoặc: npm run dev
```

Chờ thấy: `Local: http://localhost:5173` ✅

> ⚠️ Tương tự, dừng frontend Docker trước nếu đang chạy:
> ```bash
> docker compose stop frontend
> ```

---

## 🌐 Địa chỉ local development

| Service | URL |
|---------|-----|
| 🖥️ Frontend (Dashboard) | http://localhost:5173 |
| ⚙️ Backend API | http://localhost:8000 |
| 📖 Swagger UI (API Docs) | http://localhost:8000/docs |
| 🗄️ Adminer (Quản lý DB) | http://localhost:8080 |
| 🔀 Traefik UI | http://localhost:8090 |
| 📧 Mailcatcher | http://localhost:1080 |

---

## 🔑 Biến môi trường (.env)

Tạo file `.env` ở **thư mục gốc project** (cùng cấp với `compose.yml`):

```env
# =========================================================
# DOMAIN & HOST
# =========================================================
DOMAIN=localhost
FRONTEND_HOST=http://localhost:5173
ENVIRONMENT=local                       # local | staging | production
PROJECT_NAME="SmartTraffic AI"
STACK_NAME=smarttraffic-ai

# =========================================================
# BACKEND
# =========================================================
BACKEND_CORS_ORIGINS=http://localhost,http://localhost:5173,http://127.0.0.1:5173
SECRET_KEY=supersecretkey123
FIRST_SUPERUSER=admin@alpr.com
FIRST_SUPERUSER_PASSWORD=12345678

# =========================================================
# POSTGRESQL
# =========================================================
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=alpr_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<mật_khẩu_postgres_của_bạn>

# =========================================================
# EMAIL (tuỳ chọn)
# =========================================================
SMTP_HOST=
SMTP_USER=
SMTP_PASSWORD=
EMAILS_FROM_EMAIL=info@alpr.com
SMTP_TLS=True
SMTP_SSL=False
SMTP_PORT=587

# =========================================================
# SENTRY (tuỳ chọn)
# =========================================================
SENTRY_DSN=

# =========================================================
# DOCKER IMAGES
# =========================================================
DOCKER_IMAGE_BACKEND=backend
DOCKER_IMAGE_FRONTEND=frontend

# =========================================================
# REALTIME AI CAMERA (tuỳ chọn)
# =========================================================
ENABLE_AI_STARTUP=False                 # True để backend tự chạy realtime loop
CAMERA_SOURCE=                          # 0, RTSP/HTTP camera URL, hoặc path video demo
```

> 🔐 **Bảo mật:** Không commit file `.env` lên Git — đã có trong `.gitignore`.

---

## 💳 Subscription & MoMo Demo Payment

SmartTraffic AI dùng mô hình SaaS subscription qua tài khoản đăng nhập JWT thông thường. Không cần ví, khóa thanh toán, hoặc credential MoMo thật.

Các gói hiện có:

| Gói | Giá | Giới hạn chính |
|-----|-----|----------------|
| Free Trial | 0 VND | 7 ngày, 1 camera, 100 detections/day, basic history |
| Basic | 99,000 VND/month | 1 camera, 1,000 detections/day, history, basic analytics |
| Pro | 299,000 VND/month | 5 cameras, 10,000 detections/day, advanced analytics, export reports |
| Enterprise | Contact sales | Unlimited cameras, realtime alerts, custom retention, multi-user management |

Frontend có trang `/subscription`. Basic và Pro mở modal "Thanh toán bằng MoMo" với QR placeholder demo; khi người dùng bấm "Tôi đã thanh toán", frontend gọi `POST /api/v1/subscriptions/activate-demo` để kích hoạt gói trong database.

Backend subscription endpoints:

- `GET /api/v1/subscriptions/me`
- `POST /api/v1/subscriptions/activate-demo`

---

## 🏗️ Kiến trúc hệ thống

### AI Detection Pipeline

```
CAMERA_SOURCE → OpenCV frame → resize 960×540 → mỗi 3 frame:
  → vehicle_detector.py  (YOLOv5, weights/vehicle_best.pt)
  → plate_detector.py    (YOLOv5, weights/plate_best.pt)
  → ocr_reader.py        (EasyOCR trên vùng crop biển số)
  → vehicle_matcher.py   (ghép bbox biển số → loại xe)
  → lưu biển số mới vào PostgreSQL + storage/detections/
  → broadcast JSON đến tất cả WebSocket clients
```

Vòng lặp realtime chỉ chạy khi `ENABLE_AI_STARTUP=True`. Nguồn camera lấy từ `CAMERA_SOURCE`:

- Webcam local: `CAMERA_SOURCE=0`
- Camera IP/RTSP: `CAMERA_SOURCE=rtsp://user:pass@host:554/stream`
- Camera HTTP: `CAMERA_SOURCE=http://host/video`
- Demo local: `CAMERA_SOURCE=backend/demo/sample.mp4`

Nếu `ENABLE_AI_STARTUP=True` nhưng thiếu `CAMERA_SOURCE`, backend log warning và không start realtime loop. Upload detection endpoint vẫn hoạt động độc lập với realtime loop. Set `saved_plates` là in-memory dedup guard — reset khi restart.

Railway realtime env tối thiểu:

```env
ENVIRONMENT=production
ENABLE_AI_STARTUP=True
CAMERA_SOURCE=rtsp://user:pass@host:554/stream
```

Local demo env tối thiểu:

```env
ENVIRONMENT=local
ENABLE_AI_STARTUP=True
CAMERA_SOURCE=0
```

### Cấu trúc Backend

- `app/main.py` — FastAPI entry: mount `/storage`, fire startup task, set CORS
- `app/core/config.py` — Settings qua `pydantic-settings` từ `../.env`
- `app/api/deps.py` — Shared dependencies: `SessionDep`, `CurrentUser`, `CurrentSuperUser`
- `app/api/routes/` — Route modules: `login`, `users`, `detection`, `analytics`, `ws`, `subscriptions`
- `app/services/websocket_service.py` — `ConnectionManager` singleton với broadcast + disconnect cleanup
- `app/services/detection_engine.py` — Vòng lặp AI chính
- `app/services/tracking_service.py` — Kalman filter + Hungarian matching tracker
- `app/models/` — SQLModel table definitions (UUID PKs)
- `app/ai/` — Bốn AI module load lúc import (YOLO models là singleton)

### Cấu trúc Frontend

- **TanStack Router** — file-based routing trong `src/routes/`. Routes dưới `_layout/` yêu cầu auth.
- **TanStack Query** — quản lý server state. `src/client/` là typed API client tự động generate.
- Auth: JWT token lưu trong `localStorage`, inject qua `OpenAPI.TOKEN` trong `main.tsx`. 401/403 → xoá token, redirect `/login`.
- `src/components/` — tổ chức theo feature: `Dashboard/`, `Detection/`, `History/`, `Analytics/`, `Camera/`, `Admin/`, `Common/`, `ui/`.

### Database

PostgreSQL qua SQLModel + psycopg3. Alembic migrations trong `backend/app/alembic/versions/`. Backend gọi `SQLModel.metadata.create_all(engine)` lúc startup.

Quan hệ chính: `Camera` → `Detection` (one-to-many, cascade delete trong migration `1a31ce608336`).

---

## 📁 Cấu trúc thư mục

```
smarttraffic-ai/
├── .env                              # Biến môi trường (tạo tay, không commit)
├── compose.yml                       # Docker Compose
├── compose.override.yml              # Docker Compose (dev override)
├── requirements.txt                  # Python dependencies (cài không dùng Docker)
│
├── backend/
│   ├── app/
│   │   ├── main.py                   # FastAPI entry point
│   │   ├── ai/
│   │   │   ├── vehicle_detector.py   # YOLOv5 phát hiện xe
│   │   │   ├── plate_detector.py     # YOLOv5 phát hiện biển số
│   │   │   ├── ocr_reader.py         # EasyOCR đọc chữ biển số
│   │   │   ├── vehicle_matcher.py    # Ghép biển số với xe
│   │   │   └── weights/              # Model weights (.pt files)
│   │   ├── api/routes/               # API endpoints
│   │   ├── core/                     # Config, DB, security
│   │   ├── models/                   # SQLModel table definitions
│   │   └── services/                 # Detection engine, WebSocket, tracker
│   ├── pyproject.toml                # Python dependencies (quản lý bằng uv)
│   └── storage/                      # Ảnh biển số đã lưu
│
└── frontend/
    ├── src/
    │   ├── routes/                   # File-based routing (TanStack Router)
    │   ├── components/               # React components theo feature
    │   └── client/                   # API client tự động generate (không sửa tay)
    ├── package.json
    └── vite.config.ts
```

---

## 🧰 Tech Stack

### Backend
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| Python | >= 3.10 | Ngôn ngữ chính |
| FastAPI | 0.136 | Web framework |
| uv | Mới nhất | Package manager |
| SQLModel + psycopg3 | - | ORM + PostgreSQL |
| Alembic | 1.18 | Database migrations |
| PyJWT + pwdlib | - | Xác thực JWT |
| Sentry SDK | 2.x | Giám sát lỗi production |

### AI / Computer Vision
| Công nghệ | Mục đích |
|-----------|----------|
| YOLOv5 (ultralytics) | Phát hiện xe và biển số |
| EasyOCR | Đọc text từ biển số |
| OpenCV | Xử lý frame video |
| filterpy + scipy | Kalman filter tracking |

### Frontend
| Công nghệ | Phiên bản | Mục đích |
|-----------|-----------|----------|
| React | 19 | UI framework |
| TypeScript | 5.9 | Type safety |
| Vite | 7 | Build tool |
| TailwindCSS | 4 | Styling |
| TanStack Router | 1.x | File-based routing |
| TanStack Query | 5.x | Server state management |
| Recharts | 3.x | Biểu đồ thống kê |
| shadcn + Radix UI | - | UI components |
| Playwright | 1.x | E2E testing |

### Hạ tầng
| Công nghệ | Mục đích |
|-----------|----------|
| Docker + Compose | Containerization |
| Traefik 3.x | Reverse proxy |
| PostgreSQL 18 | Cơ sở dữ liệu |

---

## 🔧 Lệnh phát triển

### Backend (chạy trong `backend/`)

```bash
# Dev server
uv run fastapi dev app/main.py

# Lint và type-check
uv run ruff check app
uv run ruff format app --check
uv run mypy app
uv run ty check app

# Tự động format
uv run ruff check app --fix
uv run ruff format app

# Tests
uv run bash scripts/test.sh           # coverage + report
uv run pytest tests/path/to/test.py   # single file
```

### Frontend (chạy trong `frontend/` hoặc project root)

```bash
bun run lint             # biome check --write --unsafe
bun run build            # tsc + vite build
bun run test             # Playwright e2e
bun run test:ui          # Playwright UI mode
bun run generate-client  # Tái tạo src/client/ từ openapi.json
```

### Regenerate API client

Sau khi thay đổi backend routes:

```bash
bash scripts/generate-client.sh
```

`src/client/` được generate bởi `@hey-api/openapi-ts` từ `frontend/openapi.json` — **không sửa tay**.

### Pre-commit / Linting

[prek](https://prek.j178.dev/) được cấu hình trong `.pre-commit-config.yaml`:

```bash
# Cài một lần (từ backend/)
uv run prek install -f

# Chạy thủ công trên tất cả files
uv run prek run --all-files
```

Hooks: ruff check + format, mypy, ty, biome, YAML/TOML validation, auto-SDK regeneration.

---

## ❗ Lỗi thường gặp

| Lỗi | Nguyên nhân | Cách fix |
|-----|-------------|----------|
| `Cannot find dockerDesktopLinuxEngine` | Docker Desktop chưa bật | Mở Docker Desktop, chờ icon xanh |
| `Port 8000 already in use` | Backend đang chạy | `docker compose down` rồi `up` lại |
| `'uv' is not recognized` | uv chưa cài | Chạy lệnh cài uv ở mục Backend bên trên |
| `'fastapi' is not recognized` | Chạy thiếu `uv run` | Dùng `uv run fastapi dev app/main.py` |
| `No module named 'cv2'` | Thiếu OpenCV | `uv pip install opencv-python-headless` |
| `POSTGRES_PASSWORD not set` | Thiếu file .env | Tạo file `.env` theo mẫu trên |
| `connection refused` khi kết nối DB | PostgreSQL chưa chạy | `docker compose up db` trước |
| Frontend trắng / không load API | CORS sai URL | Kiểm tra `BACKEND_CORS_ORIGINS` trong `.env` |

---

## 🛑 Tắt dự án

```bash
docker compose down        # dừng tất cả container
# Nếu đang chạy local: Ctrl + C
```

---

## 👥 Thông tin dự án

- **GitHub:** https://github.com/lytrungnam/smarttraffic-ai
- **Thành viên:** Nguyễn Tấn Mỹ, Lý Trung Nam
- **Tài khoản admin mặc định:** `admin@alpr.com` / `12345678`

Terminal 1 — backend:
  cd "C:\Users\HP VICTUS\Downloads\smarttraffic-ai\smarttraffic-ai\backend"
  uv run fastapi dev app/main.py

  Terminal 2 — ngrok (mở CMD mới):
  py "C:\Users\HP VICTUS\Downloads\smarttraffic-ai\smarttraffic-ai\ngrok_start.py"

