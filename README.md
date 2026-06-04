# SmartTraffic AI

SmartTraffic AI is a full-stack traffic monitoring and automatic license plate recognition platform. It combines a FastAPI backend, React + Vite frontend, PostgreSQL storage, YOLO vehicle detection, YOLO license plate detection, OCR recognition, analytics, camera monitoring, and a SaaS-style subscription prototype with MoMo demo payment.

## Project Status

- Active Development
- Thesis Project
- Startup Prototype

## Online Deployment

| Service | URL |
| --- | --- |
| Frontend | https://smarttraffic-ai-frontend.vercel.app |
| Backend API Docs | https://smarttraffic-ai-production.up.railway.app/docs |
| Healthcheck | https://smarttraffic-ai-production.up.railway.app/railway-health |

## Features

- User authentication with JWT login and signup.
- Camera monitoring dashboard with realtime detection feed.
- Upload-based image detection for vehicle and license plate recognition.
- Configurable realtime camera source via `CAMERA_SOURCE`.
- Detection history with search, filters, evidence preview, and export-oriented UI.
- Analytics dashboard with vehicle type distribution and trained model evaluation metrics.
- PostgreSQL persistence for users, cameras, detections, and subscriptions.
- SaaS subscription plans: Free Trial, Basic, Pro, and Enterprise.
- MoMo demo payment flow for prototype plan activation.
- Railway backend deployment and Vercel frontend deployment.

## Architecture

```text
User Browser
  |
  | HTTPS
  v
Vercel Frontend (React + Vite)
  |
  | REST API / WebSocket
  v
Railway Backend (FastAPI)
  |
  | SQLModel / psycopg
  v
PostgreSQL

Camera / Upload Image
  |
  v
OpenCV -> YOLO Vehicle Model -> YOLO Plate Model -> OCR -> Detection Records
```

## AI Pipeline

```text
Camera source or uploaded image
  -> OpenCV image decode / frame capture
  -> YOLO vehicle detection (vehicle_best.pt)
  -> YOLO license plate detection (plate_best.pt)
  -> Plate crop preprocessing
  -> OCR recognition
  -> Vehicle-to-plate matching
  -> PostgreSQL detection record
  -> Dashboard, history, analytics, and WebSocket updates
```

The trained vehicle model classes used by analytics are:

- bicycle
- bus
- car
- motorcycle
- train
- truck

`background` is treated as an evaluation class, not a public traffic category.

## AI Model

- `backend/app/ai/weights/vehicle_best.pt`: YOLO model for vehicle detection.
- `backend/app/ai/weights/plate_best.pt`: YOLO model for license plate localization.
- `backend/app/ai/ocr_reader.py`: OCR pipeline for cropped plate images.
- Analytics uses stored detection records for traffic distribution and separate offline validation values for model evaluation.

Runtime detection thresholds can be configured with:

```env
VEHICLE_CONFIDENCE_THRESHOLD=0.25
PLATE_CONFIDENCE_THRESHOLD=0.25
```

## Camera Source Support

Realtime detection is disabled by default. Enable it only when a camera source is configured.

```env
ENABLE_AI_STARTUP=True
CAMERA_SOURCE=0
```

Supported `CAMERA_SOURCE` values:

- `0` for local webcam.
- RTSP URL for IP cameras.
- HTTP camera stream URL.
- Local video file path for demonstration.

If `ENABLE_AI_STARTUP=True` and `CAMERA_SOURCE` is missing, the backend logs a warning and continues without starting the realtime loop. Upload detection remains available.

## Subscription System

SmartTraffic AI includes a SaaS prototype subscription system.

| Plan | Price | Main Limits |
| --- | --- | --- |
| Free Trial | 0 VND | 7 days, 1 camera, 100 detections/day, basic history |
| Basic | 99,000 VND/month | 1 camera, 1,000 detections/day, detection history, basic analytics |
| Pro | 299,000 VND/month | 5 cameras, 10,000 detections/day, advanced analytics, export reports, priority processing |
| Enterprise | Contact sales | Unlimited cameras, realtime alerts, custom retention, multi-user management, priority support |

### Commercialization

The current payment flow is a safe MoMo demo payment UI for thesis and startup-prototype validation. Basic and Pro plans show a MoMo QR placeholder and activate after the user confirms demo payment. No real payment credentials are stored in this repository.

Future commercialization work may add:

- Real MoMo payment gateway integration.
- Invoice and receipt management.
- Subscription renewal automation.
- Admin approval workflow for Enterprise customers.
- Usage-based billing and camera quota enforcement.

## Screenshots

Add thesis screenshots here before final submission:

- Dashboard overview.
- Realtime detection page.
- Upload detection result.
- Detection history.
- Analytics dashboard.
- Subscription and MoMo demo payment modal.

## Installation

### Requirements

| Tool | Recommended Version |
| --- | --- |
| Docker Desktop | Latest |
| Python | 3.10+ |
| Node.js | 18+ |
| uv | Latest |
| Bun or npm | Bun 1.0+ or npm bundled with Node.js |
| Git | Latest |

### Clone

```bash
git clone https://github.com/lytrungnam/smarttraffic-ai.git
cd smarttraffic-ai
```

Create a project `.env` file from your deployment or local values.

## Local Development

### Docker

```bash
docker compose up --build
```

Local services:

| Service | URL |
| --- | --- |
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| Adminer | http://localhost:8080 |

### Backend

```bash
cd backend
uv sync
uv run fastapi dev app/main.py
```

Useful backend commands:

```bash
uv run ruff check app
uv run ruff format app --check
uv run mypy app
uv run ty check app
```

### Frontend

```bash
cd frontend
npm install
npm run build
npm run dev
```

If using Bun:

```bash
bun install
bun run dev
```

## Environment Variables

Core backend variables:

```env
ENVIRONMENT=local
PROJECT_NAME="SmartTraffic AI"
SECRET_KEY=change-this-secret
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=change-this-password
BACKEND_CORS_ORIGINS=http://localhost,http://localhost:5173,http://127.0.0.1:5173
```

Database variables:

```env
POSTGRES_SERVER=localhost
POSTGRES_PORT=5432
POSTGRES_DB=alpr_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change-this-password
```

Railway may provide:

```env
DATABASE_URL=postgresql://...
```

Optional AI startup variables:

```env
ENABLE_AI_STARTUP=False
CAMERA_SOURCE=
VEHICLE_CONFIDENCE_THRESHOLD=0.25
PLATE_CONFIDENCE_THRESHOLD=0.25
```

## Production Deployment

### Frontend on Vercel

1. Connect the repository to Vercel.
2. Set the frontend root directory to `frontend`.
3. Configure:

```env
VITE_API_URL=https://smarttraffic-ai-production.up.railway.app
```

4. Build command:

```bash
npm run build
```

### Backend on Railway

1. Deploy the backend service from the repository.
2. Configure PostgreSQL on Railway.
3. Set production environment variables:

```env
ENVIRONMENT=production
PROJECT_NAME="SmartTraffic AI"
SECRET_KEY=<secure-value>
FIRST_SUPERUSER=<admin-email>
FIRST_SUPERUSER_PASSWORD=<secure-password>
DATABASE_URL=<railway-postgres-url>
BACKEND_CORS_ORIGINS=https://smarttraffic-ai-frontend.vercel.app
ENABLE_AI_STARTUP=False
```

#### Realtime Deployment Strategy

The production backend is deployed on Railway to serve API requests, store data, and process image/video uploads. For realtime monitoring, the system supports camera sources through the `CAMERA_SOURCE` configuration.

Railway does not provide GPU resources and has limited CPU/RAM for continuous YOLO/OCR processing. For stable realtime AI performance, run realtime monitoring locally in a demo environment rather than continuously on Railway.

Recommended setup:

- Production:

```env
ENABLE_AI_STARTUP=false
```

- Local realtime demo:

```env
ENABLE_AI_STARTUP=true
CAMERA_SOURCE=0
```

or:

```env
ENABLE_AI_STARTUP=true
CAMERA_SOURCE=path/to/demo.mp4
```

Conclusion:

Railway is used for production API, authentication, upload detection, history, analytics, subscription, and database integration. Local environment is used for realtime AI camera demo.

## API Documentation

- Production Swagger UI: https://smarttraffic-ai-production.up.railway.app/docs
- Local Swagger UI: http://localhost:8000/docs
- Railway healthcheck: https://smarttraffic-ai-production.up.railway.app/railway-health

Important API groups:

- `/api/v1/login`
- `/api/v1/users`
- `/api/v1/detections`
- `/api/v1/analytics`
- `/api/v1/subscriptions`
- `/api/v1/ws/detections`

## Repository Structure

```text
smarttraffic-ai/
  backend/
    app/
      ai/          YOLO and OCR modules
      api/         FastAPI route modules
      core/        config, database, security
      models/      SQLModel tables
      services/    detection, analytics, history, websocket services
  frontend/
    src/
      components/  React UI components
      routes/      TanStack Router pages
      services/    API service wrappers
      client/      generated API client
```

## Future Roadmap

- Real payment gateway integration.
- Admin subscription management.
- Multi-camera tenant management.
- Better role-based access control.
- Model training documentation and dataset versioning.
- Automated evaluation reports for vehicle and plate models.
- Production-grade alerting for violations and realtime events.
- Cloud object storage for evidence images.
- CI/CD checks for backend, frontend, and database migrations.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).
