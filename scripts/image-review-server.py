#!/usr/bin/env python3
"""
Backward-compatible wrapper for review-server.py.
Use review-server.py directly for the full review UI (images + entities).
"""
import importlib.util
from pathlib import Path

# Import and run review-server.py
spec_path = Path(__file__).parent / "review-server.py"
spec = importlib.util.spec_from_file_location("review_server", spec_path)
if spec and spec.loader:
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    if __name__ == "__main__":
        mod.main()
