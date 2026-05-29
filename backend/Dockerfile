FROM python:3.10

ENV PYTHONUNBUFFERED=1

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

# Final sync with app installed
RUN uv sync --package app

CMD ["fastapi", "run", "--workers", "4", "app/main.py"]
