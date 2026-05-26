# SmartTraffic AI 🚦

Hệ thống giám sát phương tiện và nhận diện biển số xe theo thời gian thực sử dụng Deep Learning và Computer Vision.

---

# 📌 Giới thiệu

SmartTraffic AI là hệ thống AI hỗ trợ:

* Phát hiện phương tiện giao thông realtime
* Nhận diện biển số xe tự động
* OCR nhận diện ký tự biển số
* Giám sát camera/webcam/video
* Dashboard quản lý dữ liệu
* WebSocket realtime detection
* Lưu lịch sử nhận diện vào PostgreSQL
* Quản lý dữ liệu qua Admin Dashboard

Hệ thống được xây dựng theo kiến trúc Full Stack AI Application sử dụng FastAPI + React + Docker.

---

# 🧠 AI Pipeline

```text
Input Image / Video
        ↓
Vehicle Detection (YOLOv5)
        ↓
Vehicle Cropping
        ↓
License Plate Detection
        ↓
Plate Cropping
        ↓
OCR Recognition
        ↓
Database Storage
        ↓
Realtime Frontend Dashboard
```

---

# 🚀 Công nghệ sử dụng

## 🔹 Backend

* FastAPI
* SQLModel
* PostgreSQL
* WebSocket
* Alembic
* Docker

## 🔹 Frontend

* React
* TypeScript
* Vite
* TailwindCSS
* shadcn/ui

## 🔹 AI / Computer Vision

* YOLOv5
* OpenCV
* EasyOCR
* NumPy


# 📱 Progressive Web App (PWA)

Hệ thống hỗ trợ Progressive Web Application (PWA), cho phép:

* Cài đặt ứng dụng trực tiếp trên điện thoại hoặc desktop
* Hoạt động như ứng dụng native
* Hỗ trợ trải nghiệm đa nền tảng
* Tối ưu cho mobile devices
* Hỗ trợ chạy fullscreen sau khi cài đặt

Người dùng có thể thêm ứng dụng vào màn hình chính thông qua trình duyệt:

```text id="v4v2ec"
Add to Home Screen
```

Công nghệ sử dụng:

* Vite PWA Plugin
* React
* TypeScript
* Service Worker

---

# 📂 Cấu trúc dự án


SmartTraffic-AI/
│
├── backend/                     # FastAPI Backend
│   ├── app/
│   │   ├── api/                # API Routes
│   │   ├── core/               # Config, Security
│   │   ├── crud/               # Database CRUD
│   │   ├── models/             # SQLModel Database Models
│   │   ├── schemas/            # Pydantic Schemas
│   │   ├── services/           # Business Logic
│   │   └── main.py             # FastAPI Entry
│   ├── scripts/
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                    # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/         # UI Components
│   │   ├── routes/             # Application Routes
│   │   ├── hooks/              # Custom Hooks
│   │   ├── lib/                # Utilities
│   │   ├── client/             # API Client
│   │   └── main.tsx
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.ts
│
├── hooks/                       # Git Hooks / Project Hooks
├── img/                         # Images & Assets
├── scripts/                     # Deployment Scripts
│
├── compose.yml                  # Main Docker Compose
├── compose.override.yml         # Local Development Config
├── compose.traefik.yml          # Traefik Production Config
│
├── .env                         # Environment Variables
├── .gitignore
├── README.md
├── LICENSE
├── pyproject.toml
├── package.json
└── bun.lock
```


---

# ⚡ Chạy dự án bằng Docker

## 1️⃣ Clone project

```bash
git clone https://github.com/lytrungnam/smarttraffic-ai.git
cd smarttraffic-ai
```

---

## 2️⃣ Chạy Docker

```bash
docker compose up --build
```

---

# 🌐 Truy cập hệ thống

| Service      | URL                        |
| ------------ | -------------------------- |
| Frontend     | http://localhost:3000      |
| Backend API  | http://localhost:8000      |
| Swagger Docs | http://localhost:8000/docs |
| Adminer      | http://localhost:8080      |
| PostgreSQL   | localhost:5432             |

---

# 🧪 API Detection

## Upload Image Detection

```http
POST /api/v1/detection/image
```

---

# 📡 Realtime Detection

Hệ thống hỗ trợ realtime detection sử dụng WebSocket.

```text
/ws/detection
```

---

# 🗄️ Database

Sử dụng PostgreSQL để lưu:

* Biển số xe
* Loại phương tiện
* Độ chính xác AI
* Ảnh detect
* Thời gian nhận diện

---

# 🐳 Docker Architecture

```text
Browser
   ↓
Frontend (React + Vite)
   ↓
FastAPI Backend
   ↓
PostgreSQL Database
   ↓
AI Detection Pipeline
```

---

# ☁️ Production Architecture (Future Deployment)

```text
Internet
   ↓
Domain
   ↓
VPS Public IP
   ↓
Traefik / Nginx
   ↓
Docker Containers
   ↓
Frontend + Backend + Database
```

---

# 🔐 Environment Variables

Tạo file `.env`

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=smarttraffic
SECRET_KEY=your-secret-key
```

---

# 🚧 Tính năng hiện tại

* ✅ Vehicle Detection
* ✅ License Plate Detection
* ✅ OCR Recognition
* ✅ FastAPI REST API
* ✅ Dockerized System
* ✅ PostgreSQL Database
* ✅ Realtime WebSocket
* ✅ Frontend Dashboard

---

# 🔮 Hướng phát triển

* AI Tracking nhiều camera
* Phân tích lưu lượng giao thông
* Face Recognition
* Vehicle Tracking
* Cloud Deployment
* Mobile App
* AI Analytics Dashboard

---

# 👨‍💻 Thành viên thực hiện

* Nguyễn Tấn Mỹ
* Lý Trung Nam

---

# 📜 License

MIT License

---

# ⭐ SmartTraffic AI

AI-powered Real-time Traffic Monitoring and License Plate Recognition System.
