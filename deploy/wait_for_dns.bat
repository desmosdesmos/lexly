@echo off
echo Checking DNS propagation for laxlylaw.ru...
echo.

:loop
echo [%date% %time%] Checking...
nslookup laxlylaw.ru 8.8.8.8 2>nul | findstr "195.58.34.47" >nul
if %errorlevel%==0 (
    echo.
    echo DNS PROPAGATED! laxlylaw.ru -> 195.58.34.47
    echo.
    echo Now getting SSL certificate...
    ssh root@195.58.34.47 "certbot --nginx -d laxlylaw.ru -d www.laxlylaw.ru --non-interactive --agree-tos --email yan.pashhenko6486@gmail.com --redirect --hsts"
    pause
    exit /b
)
timeout /t 30 /nobreak >nul
goto loop
