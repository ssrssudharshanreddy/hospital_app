@echo off
setlocal
set EXE="%~dp0..\backend\build\Release\hospital_queue_backend.exe"
set DLL="%~dp0..\backend\build\Release\hospital_queue_core.dll"

if not exist %EXE% (
    if not exist %DLL% (
        echo [ERROR] Backend binaries not found. Please run scripts\build_backend.bat first.
        exit /b 1
    )
)

echo Starting Hospital Patient Queue Management C++ Backend on port 8080...
python "%~dp0launch_core.py" 8080
if %ERRORLEVEL% NEQ 0 (
    echo [Notice] Fallback to executable...
    %EXE% 8080
)
