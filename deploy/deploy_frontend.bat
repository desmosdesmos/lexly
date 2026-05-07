@echo off
echo ========================================
echo  Деплой Frontend на Laxly
echo ========================================
echo.

echo [1/3] Сборка...
cd /d "%~dp0..\frontend"
call npm run build
if %errorlevel% neq 0 (
    echo Ошибка сборки!
    pause
    exit /b 1
)

echo.
echo [2/3] Загрузка файлов...
scp -r dist\* root@195.58.34.47:/opt/law-ai-agent/frontend/dist/
if %errorlevel% neq 0 (
    echo Ошибка загрузки!
    pause
    exit /b 1
)

echo.
echo [3/3] Исправление прав и перезапуск...
ssh root@195.58.34.47 "chmod -R 755 /opt/law-ai-agent/frontend/dist/ && pkill nginx 2>/dev/null; sleep 1; nginx"

echo.
echo ========================================
echo  ✅ Деплой завершён!
echo  🌐 https://laxlylaw.ru
echo ========================================
pause
