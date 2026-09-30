import ctypes
import os
import sys

# Locate C++ DLL
script_dir = os.path.dirname(os.path.abspath(__file__))
dll_path = os.path.normpath(os.path.join(script_dir, "..", "backend", "build", "Release", "hospital_queue_core.dll"))

if not os.path.exists(dll_path):
    print(f"[ERROR] C++ native library not found at: {dll_path}")
    print("Please run scripts\\build_backend.bat first.")
    sys.exit(1)

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8080

try:
    core_dll = ctypes.CDLL(dll_path)
    # Call native C++ exported server function
    core_dll.run_backend_server.argtypes = [ctypes.c_int]
    core_dll.run_backend_server.restype = ctypes.c_int
    print(f"[Launcher] Executing pure C++ backend from: {dll_path} on port {port}")
    core_dll.run_backend_server(port)
except Exception as e:
    print(f"[ERROR] Failed to execute C++ backend: {e}")
    sys.exit(1)
