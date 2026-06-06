#!/bin/bash
echo "Starting Router Guest Manager..."
echo ""
echo "Backend: http://localhost:3000"
echo "Frontend: http://localhost:5173"
echo ""

# Start backend
(cd backend && bun run dev) &
BACKEND_PID=$!

# Start frontend
(cd frontend && bun run dev) &
FRONTEND_PID=$!

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT

echo "Press Ctrl+C to stop both servers."
wait
