#!/bin/bash

# Snake Game Deployment Script
# Usage: ./deploy.sh [development|production] [port]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-development}
PORT=${2:-3000}

echo -e "${BLUE}🐍 Snake Game Deployment Script${NC}"
echo -e "${BLUE}================================${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

print_status "Docker is running"

# Create .env file based on environment
if [ "$ENVIRONMENT" = "production" ]; then
    print_status "Setting up production environment"
    cat > .env << EOF
# Production Environment Configuration
PORT=${PORT}
NODE_ENV=production
CONTAINER_NAME=snake-game-prod
DOCKER_PORT=${PORT}
EOF
    COMPOSE_FILE="docker-compose.prod.yml"
else
    print_status "Setting up development environment"
    cat > .env << EOF
# Development Environment Configuration
PORT=${PORT}
NODE_ENV=development
CONTAINER_NAME=snake-game-dev
DOCKER_PORT=${PORT}
EOF
    COMPOSE_FILE="docker-compose.yml"
fi

print_status "Environment file created with PORT=${PORT}"

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose -f $COMPOSE_FILE down 2>/dev/null || true

# Build and start the application
print_status "Building and starting the application..."
docker-compose -f $COMPOSE_FILE up -d --build

# Wait for the application to start
print_status "Waiting for application to start..."
sleep 10

# Check if the application is running
if curl -s -o /dev/null -w "%{http_code}" http://localhost:${PORT} | grep -q "200"; then
    print_status "Application is running successfully!"
    echo -e "${GREEN}🎮 Snake Game is available at: http://localhost:${PORT}${NC}"
else
    print_error "Application failed to start properly"
    echo -e "${YELLOW}Checking logs...${NC}"
    docker-compose -f $COMPOSE_FILE logs --tail=20
    exit 1
fi

# Show container status
print_status "Container status:"
docker-compose -f $COMPOSE_FILE ps

echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}🚀 Deployment completed successfully!${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Port: ${PORT}${NC}"
echo -e "${BLUE}URL: http://localhost:${PORT}${NC}"
echo -e "${BLUE}================================${NC}"

# Show useful commands
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "  View logs: ${BLUE}docker-compose -f $COMPOSE_FILE logs -f${NC}"
echo -e "  Stop app:  ${BLUE}docker-compose -f $COMPOSE_FILE down${NC}"
echo -e "  Restart:   ${BLUE}docker-compose -f $COMPOSE_FILE restart${NC}"
