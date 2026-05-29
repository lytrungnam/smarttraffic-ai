FROM python:3.10-slim

# System dependencies cho OpenCV trên Linux
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

# Copy toàn bộ code trước (hatchling cần thấy app/ khi build wheel)
COPY pyproject.toml .
COPY alembic.ini .
COPY app ./app
COPY scripts ./scripts
COPY start.sh .

# Tạo thư mục storage cho StaticFiles
RUN mkdir -p /app/storage/detections

# Cài pip, uv, rồi install package
RUN pip install --upgrade pip
RUN pip install uv
RUN uv pip install --system .

# Pre-download EasyOCR models during build so they are cached in the image
RUN python -c "import easyocr; easyocr.Reader(['en'], gpu=False)"

RUN chmod +x /app/start.sh

CMD ["/app/start.sh"]
