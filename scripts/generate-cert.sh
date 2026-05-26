#!/bin/bash
# Tạo self-signed SSL certificate cho demo local với điện thoại.
# Chạy một lần rồi commit cert.pem + key.pem vào .gitignore.
#
# Cách dùng:
#   chmod +x scripts/generate-cert.sh
#   ./scripts/generate-cert.sh
#
# Sau đó sửa IP trong lệnh bên dưới thành IP thật của laptop:
#   ip route get 1 | awk '{print $7}'   # Linux
#   ipconfig | findstr "IPv4"            # Windows

YOUR_IP="${1:-192.168.1.100}"

openssl req -x509 \
  -newkey rsa:4096 \
  -keyout key.pem \
  -out cert.pem \
  -days 365 \
  -nodes \
  -subj "/CN=smarttraffic.local" \
  -addext "subjectAltName=IP:${YOUR_IP},IP:127.0.0.1,DNS:localhost"

echo ""
echo "Cert tạo thành công!"
echo "  cert.pem  — public certificate"
echo "  key.pem   — private key"
echo ""
echo "Để dùng HTTPS với Vite:"
echo "  VITE_HTTPS=true vite --host ${YOUR_IP}"
echo ""
echo "Hoặc thêm vào compose.override.yml:"
echo "  HTTPS=true"
echo "  SSL_CRT_FILE=./cert.pem"
echo "  SSL_KEY_FILE=./key.pem"
echo ""
echo "Cách nhanh hơn cho Chrome Android:"
echo "  1. chrome://flags → Insecure origins treated as secure"
echo "  2. Thêm: http://${YOUR_IP}:5173"
echo "  3. Relaunch Chrome"
