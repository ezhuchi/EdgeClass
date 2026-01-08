#!/bin/bash

# Edge Class Quick Start Script
# Run this to start the application

echo "
╔════════════════════════════════════════╗
║     Edge Class Quick Start         ║
╚════════════════════════════════════════╝
"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed!"
    echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "Docker Compose is not installed!"
    echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "Docker found"
echo "Docker Compose found"
echo ""

# Check if ports are available
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo " Port 3000 is already in use!"
    echo "Kill the process? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        lsof -ti:3000 | xargs kill -9
        echo "Port 3000 freed"
    else
        exit 1
    fi
fi

if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo " Port 5173 is already in use!"
    echo "Kill the process? (y/n)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        lsof -ti:5173 | xargs kill -9
        echo "Port 5173 freed"
    else
        exit 1
    fi
fi

echo ""
echo "🚀 Starting Edge Class..."
echo ""

# Start Docker Compose in detached mode
docker-compose up --build -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 5

# Health check for backend
echo ""
echo "🔍 Checking backend health..."
BACKEND_HEALTH=$(curl -s http://localhost:3000/health | grep -o '"status":"healthy"')
if [ -n "$BACKEND_HEALTH" ]; then
    echo "✅ Backend is healthy (http://localhost:3000)"
else
    echo "❌ Backend health check failed"
    docker-compose logs backend
    exit 1
fi

# Check if frontend is responding
echo ""
echo "🔍 Checking frontend..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)
if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend is running (http://localhost:5173)"
else
    echo "❌ Frontend is not responding"
    docker-compose logs frontend
    exit 1
fi

echo ""
echo "
╔════════════════════════════════════════╗
║   ✅ Edge Class is Running!           ║
╠════════════════════════════════════════╣
║   Frontend: http://localhost:5173      ║
║   Backend:  http://localhost:3000      ║
║   Health:   http://localhost:3000/health
║   Stats:    http://localhost:3000/api/stats
╠════════════════════════════════════════╣
║   Press Ctrl+C to stop                 ║
╚════════════════════════════════════════╝
"

# Follow logs
echo "📋 Viewing logs (Ctrl+C to exit)..."
echo ""
docker-compose logs -f
