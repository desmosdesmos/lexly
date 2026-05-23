#!/bin/bash
# Hardening Nginx for Laxly AI Law

# 1. Update global nginx.conf
sed -i 's/# server_tokens off;/server_tokens off;/' /etc/nginx/nginx.conf
if ! grep -q "limit_req_zone" /etc/nginx/nginx.conf; then
    sed -i '/http {/a \    limit_req_zone $binary_remote_addr zone=mylimit:10m rate=10r/s;' /etc/nginx/nginx.conf
fi

# 2. Update site-specific config
CONFIG="/etc/nginx/sites-available/laxlylaw.ru"

# Add security headers if not present
if ! grep -q "X-Frame-Options" "$CONFIG"; then
    sed -i '/server_name laxlylaw.ru/a \    add_header X-Frame-Options "SAMEORIGIN";\n    add_header X-XSS-Protection "1; mode=block";\n    add_header X-Content-Type-Options "nosniff";' "$CONFIG"
fi

# Add rate limiting to /api/ block
if ! grep -q "limit_req zone=mylimit" "$CONFIG"; then
    sed -i '/location \/api\/ {/a \        limit_req zone=mylimit burst=20 nodelay;' "$CONFIG"
fi

# Add Slowloris protection (timeouts)
if ! grep -q "client_body_timeout" "$CONFIG"; then
    sed -i '/server {/a \    client_body_timeout 10s;\n    client_header_timeout 10s;\n    keepalive_timeout 5s;\n    send_timeout 10s;' "$CONFIG"
fi

# 3. Test and reload
nginx -t && systemctl reload nginx

echo "✅ Nginx hardening applied!"
