FROM python:3.10-slim

# Cài system dependencies cho OpenCV
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libgomp1 \
    gcc \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements trước để cache layer
COPY pyproject.toml .
COPY alembic.ini .

# Cài pip và thư viện
RUN pip install --upgrade pip
RUN pip install uv
RUN uv pip install --system -e .

# Copy code
COPY app ./app
COPY scripts ./scripts

# Tạo thư mục storage cho StaticFiles
RUN mkdir -p /app/storage/detections

# Chạy server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
