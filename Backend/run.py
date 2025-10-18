# Backend/run.py
# Robust runner that ensures the project root is on sys.path then imports create_app

import sys
from pathlib import Path

# Ensure project root (one level up from this file) is on sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Now import the package factory
try:
    from Backend import create_app
except Exception as e:
    # show helpful debug info and re-raise
    print("ERROR importing Backend.create_app():", e)
    print("sys.path:", sys.path[:6])
    raise

app = create_app()

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
