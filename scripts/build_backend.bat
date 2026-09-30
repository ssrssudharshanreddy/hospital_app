@echo off
setlocal

echo ========================================================
echo  Building Hospital Patient Queue Management C++ Backend
echo ========================================================

call "C:\Program Files (x86)\Microsoft Visual Studio\18\BuildTools\VC\Auxiliary\Build\vcvarsall.bat" x64
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to initialize MSVC x64 build environment.
    exit /b %ERRORLEVEL%
)

set CMAKE_EXE="C:\Program Files (x86)\Microsoft Visual Studio\18\BuildTools\Common7\IDE\CommonExtensions\Microsoft\CMake\CMake\bin\cmake.exe"

set ROOT_DIR=%~dp0..
set BUILD_DIR=%ROOT_DIR%\backend\build

if not exist "%BUILD_DIR%" (
    mkdir "%BUILD_DIR%"
)

cd /d "%BUILD_DIR%"

%CMAKE_EXE% -G "Visual Studio 18 2026" -A x64 ..
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] CMake configuration failed.
    exit /b %ERRORLEVEL%
)

%CMAKE_EXE% --build . --config Release
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Build failed.
    exit /b %ERRORLEVEL%
)

echo ========================================================
echo  Build successful! Executable is at:
echo  %BUILD_DIR%\Release\hospital_queue_backend.exe
echo ========================================================
exit /b 0
