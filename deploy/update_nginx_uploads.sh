#!/bin/bash
# Update Nginx to serve /uploads/ directory

CONFIG="/etc/nginx/sites-available/laxlylaw.ru"

# Add /uploads/ location block if not present
if ! grep -q "location /uploads/" "$CONFIG"; then
    # Insert after /api/ block
    sed -i '/location \/api\/ {/,/}/ { /}/ a \
\
    # User Uploads (Support images, etc)\
    location /uploads/ {\
        alias /opt/law-ai-agent/backend/uploads/;\
        expires 30d;\
        add_header Cache-Control "public, immutable";\
        try_files $uri =404;\
    }
    }' "$CONFIG"
fi

# Test and reload
nginx -t && systemctl reload nginx

echo "✅ Nginx updated with /uploads/ path!"
