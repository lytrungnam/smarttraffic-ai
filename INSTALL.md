# Hướng dẫn cài đặt thư viện

## Cách 1 — Dùng uv (Khuyên dùng)
```bash
# Cài uv nếu chưa có
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# Tạo môi trường ảo
uv venv

# Kích hoạt môi trường ảo
.venv\Scripts\activate   # Windows
source .venv/bin/activate # Mac/Linux

# Cài tất cả thư viện
uv pip install -r requirements.txt
```

## Cách 2 — Dùng pip thông thường
```bash
# Tạo môi trường ảo
python -m venv .venv

# Kích hoạt
.venv\Scripts\activate   # Windows
source .venv/bin/activate # Mac/Linux

# Cài thư viện
pip install -r requirements.txt
```

## Cách 3 — Dùng Docker (Không cần cài gì)
```bash
docker compose up --build
```

## Kiểm tra cài đặt thành công
```bash
cd backend
uv run fastapi dev app/main.py
# Thấy: Uvicorn running on http://0.0.0.0:8000 ✅
```
