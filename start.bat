@echo off
echo Starting Video Streaming Application...
echo.

echo Starting Server...
start "Video Server" cmd /k "cd server && npm start"

timeout /t 3 /nobreak >nul

echo Starting Client...
start "Video Client" cmd /k "cd client && npm start"

echo.
echo Both servers are starting...
echo Server: http://localhost:4000
echo Client: http://localhost:3000
echo.
pause