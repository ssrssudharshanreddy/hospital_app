@echo off
setlocal
cd /d "%~dp0..\frontend"
if not exist node_modules (
    echo Installing frontend dependencies...
    cmd /c "npm install"
)
echo Starting React Vite Frontend...
cmd /c "npm run dev"
