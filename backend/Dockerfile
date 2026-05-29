FROM python:3.10

ENV PYTHONUNBUFFERED=1

# System dependencies for OpenCV, PyTorch, EasyOCR on Linux
RUN apt-get update && apt-get install -y \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# Install uv
COPY --from=ghcr.io/astral-sh/uv:0.9.26 /uv /uvx /bin/

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

WORKDIR /app/

ENV PATH="/app/.venv/bin:$PATH"

# Copy dependency manifest (relative to backend/ build context)
COPY pyproject.toml /app/

# Install dependencies
RUN uv sync --no-install-workspace --package app

# Copy application code
COPY scripts /app/scripts
COPY alembic.ini /app/
COPY app /app/app

# Create storage directory required by StaticFiles mount
RUN mkdir -p /app/storage/detections

# Final sync with app installed
RUN uv sync --package app

CMD ["fastapi", "run", "--workers", "4", "app/main.py"]
