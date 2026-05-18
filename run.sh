#!/usr/bin/env bash
# ================================================================
# run.sh — Start backend + frontend concurrently
# ================================================================

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║     ClinicOS — Starting Services         ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Start backend
echo "🚀  Starting Spring Boot backend on :8080..."
cd backend
mvn spring-boot:run &
BACKEND_PID=$!
cd ..

# Wait for backend to be ready
echo "⏳  Waiting for backend to start..."
for i in {1..30}; do
  sleep 2
  if curl -s http://localhost:8080/api/auth/login -o /dev/null 2>&1; then
    echo "✅  Backend is ready!"
    break
  fi
  echo "   Attempt $i/30..."
done

# Start frontend
echo ""
echo "🚀  Starting Angular frontend on :4200..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  Services running:                                       ║"
echo "║  Backend  → http://localhost:8080                        ║"
echo "║  Frontend → http://localhost:4200                        ║"
echo "║                                                          ║"
echo "║  Demo credentials:                                       ║"
echo "║  Admin:   admin / password                               ║"
echo "║  Doctor:  dr_smith / password                            ║"
echo "║  Patient: john_doe / password                            ║"
echo "║                                                          ║"
echo "║  Press Ctrl+C to stop both services                      ║"
echo "╚══════════════════════════════════════════════════════════╝"

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo 'Services stopped.'" EXIT
wait
