@echo off
echo ========================================
echo DNS & SSL Monitor for laxlylaw.ru
echo ========================================
echo.

:loop
echo [%date% %time%] Checking DNS...
nslookup laxlylaw.ru 8.8.8.8 2>nul | findstr "195.58.34.47" >nul
if %errorlevel%==0 (
    echo.
    echo DNS PROPAGATED!
    echo.
    echo Getting SSL certificate...
    ssh root@195.58.34.47 "certbot --nginx -d laxlylaw.ru -d www.laxlylaw.ru --non-interactive --agree-tos --email yan.pashhenko6486@gmail.com --redirect --hsts"
    echo.
    echo SSL SETUP COMPLETE!
    echo Site available at: https://laxlylaw.ru
    pause
    exit /b
)
timeout /t 30 /nobreak >nul
goto loop
