#!/bin/bash
set -euo pipefail

echo "============================================"
echo "       Router Guest Manager"
echo "============================================"
echo ""

# Check for Bun
if ! command -v bun &>/dev/null; then
  echo "[ERROR] Bun is not installed."
  echo "Install it from https://bun.sh and try again."
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Install backend deps
echo "[1/4] Installing backend dependencies..."
(cd "$SCRIPT_DIR/backend" && bun install) || {
  echo "[ERROR] Backend install failed."
  exit 1
}

# Install frontend deps
echo "[2/4] Installing frontend dependencies..."
(cd "$SCRIPT_DIR/frontend" && bun install) || {
  echo "[ERROR] Frontend install failed."
  exit 1
}

# Start backend
echo ""
echo "[3/4] Starting backend on http://localhost:3000..."
(cd "$SCRIPT_DIR/backend" && bun run dev) &
BACKEND_PID=$!

# Small delay
sleep 2

# Start frontend
echo "[4/4] Starting frontend on http://localhost:5173..."
(cd "$SCRIPT_DIR/frontend" && bun run dev) &
FRONTEND_PID=$!

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" INT TERM EXIT

echo ""
echo "============================================"
echo "  All servers started!"
echo "  Dashboard:  http://localhost:5173"
echo "  API:        http://localhost:3000"
echo "============================================"
echo ""
echo "Press Ctrl+C to stop."
wait
