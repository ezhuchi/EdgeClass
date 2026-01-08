#!/bin/bash

# GhostClass Quick Start Script
# Run this to start the application

echo "
╔════════════════════════════════════════╗
║     GhostClass Quick Start         ║
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
echo "Starting GhostClass..."
echo ""

# Start Docker Compose
docker-compose up --build

# This will keep running until Ctrl+C
