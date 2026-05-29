FROM python:3.10

ENV PYTHONUNBUFFERED=1

# Install uv
COPY --from=ghcr.io/astral-sh/uv:0.9.26 /uv /uvx /bin/

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

WORKDIR /app/

ENV PATH="/app/.venv/bin:$PATH"

# Copy dependency files from project root
COPY ./backend/pyproject.toml ./uv.lock /app/

# Install dependencies
RUN uv sync --frozen --no-install-workspace --package app

# Copy application code
COPY ./backend/scripts /app/scripts
COPY ./backend/pyproject.toml ./backend/alembic.ini /app/
COPY ./backend/app /app/app

# Final sync
RUN uv sync --frozen --package app

CMD ["fastapi", "run", "--workers", "4", "app/main.py"]
