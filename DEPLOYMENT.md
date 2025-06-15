# Snake Game Deployment Guide

## 🐳 Docker Deployment with Environment Variables

### Prerequisites
- Docker installed on your system
- Docker Compose installed

### Environment Configuration

#### 1. Create Environment File
```bash
# Copy the example file
cp .env.example .env

# Edit the .env file with your preferred settings
nano .env
```

#### 2. Environment Variables
```bash
# .env file content
PORT=3000                    # Server port
NODE_ENV=production         # Environment mode
CONTAINER_NAME=snake-game-app # Docker container name
DOCKER_PORT=3000            # Docker port mapping
```

### Quick Start

#### Option 1: Using Docker Compose (Recommended)
```bash
# Development (uses .env file)
docker-compose up -d

# Production (uses .env.production)
cp .env.production .env
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

#### Option 2: Using Docker directly
```bash
# Build the image
docker build -t snake-game .

# Run with environment file
docker run --env-file .env -p ${PORT}:${PORT} snake-game

# Or run with specific port
docker run -e PORT=8080 -p 8080:8080 snake-game
```

### NPM Scripts
```bash
# Start development server
npm run dev

# Build Docker image
npm run docker:build

# Run Docker container with .env
npm run docker:run

# Start with Docker Compose
npm run docker:compose:up

# Stop Docker Compose
npm run docker:compose:down

# View Docker Compose logs
npm run docker:compose:logs
```

## 🌐 Access the Game

Once deployed, access the game at:
- **Local:** http://localhost:${PORT}
- **Production:** http://your-domain.com:${PORT}

## 🔧 Configuration Options

### Environment Variables
| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | 3000 | Server port number |
| `NODE_ENV` | production | Environment mode |
| `CONTAINER_NAME` | snake-game-app | Docker container name |
| `DOCKER_PORT` | 3000 | Docker port mapping |

### Different Port Configurations

#### Development (Port 3000)
```bash
# .env
PORT=3000
NODE_ENV=development
CONTAINER_NAME=snake-game-dev
```

#### Production (Port 8080)
```bash
# .env
PORT=8080
NODE_ENV=production
CONTAINER_NAME=snake-game-prod
```

#### Custom Port (e.g., 5000)
```bash
# .env
PORT=5000
NODE_ENV=production
CONTAINER_NAME=snake-game-custom
```

### Docker Compose Files

#### docker-compose.yml (Development)
- Uses `.env` file
- Default port 3000
- Development settings

#### docker-compose.prod.yml (Production)
- Production optimized
- Resource limits
- Enhanced logging
- Higher retry counts

## 🚀 Production Deployment

### Server Deployment Steps

1. **Prepare Environment**
```bash
# Clone repository
git clone <your-repo>
cd snake-game

# Create production environment
cp .env.production .env
# Edit .env with your server's port requirements
```

2. **Deploy with Docker Compose**
```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

3. **Verify Deployment**
```bash
# Check if service is running
curl http://localhost:${PORT}

# Check container health
docker ps
```

### Cloud Platform Deployment

#### Heroku
```bash
# Set environment variables
heroku config:set PORT=8080
heroku config:set NODE_ENV=production

# Deploy
git push heroku main
```

#### AWS ECS/Fargate
```yaml
# task-definition.json
{
  "environment": [
    {"name": "PORT", "value": "8080"},
    {"name": "NODE_ENV", "value": "production"}
  ]
}
```

#### Google Cloud Run
```bash
# Deploy with environment variables
gcloud run deploy snake-game \
  --image gcr.io/PROJECT-ID/snake-game \
  --set-env-vars PORT=8080,NODE_ENV=production
```

## 📁 Project Structure
```
snake-game/
├── public/                 # Web assets
├── server.js              # Express server (reads PORT from env)
├── package.json           # Dependencies with dotenv
├── Dockerfile            # Dynamic port configuration
├── docker-compose.yml    # Development compose
├── docker-compose.prod.yml # Production compose
├── .env                  # Environment variables (create from .env.example)
├── .env.example          # Environment template
├── .env.production       # Production template
└── .dockerignore         # Excludes .env from build
```

## 🔍 Health Checks

The application includes dynamic health checks:
- **Endpoint:** http://localhost:${PORT}
- **Interval:** 30 seconds
- **Timeout:** 10 seconds
- **Retries:** 3 (dev) / 5 (prod)

## 🛠️ Troubleshooting

### Common Issues

1. **Port already in use**
```bash
# Change port in .env file
PORT=8080

# Or kill process using the port
lsof -ti:3000 | xargs kill -9
```

2. **Environment variables not loading**
```bash
# Ensure .env file exists
ls -la .env

# Check .env file content
cat .env

# Rebuild container
docker-compose down
docker-compose up --build -d
```

3. **Permission denied**
```bash
# Ensure Docker daemon is running
sudo systemctl start docker

# Check Docker permissions
sudo usermod -aG docker $USER
```

### Logs and Debugging
```bash
# Docker Compose logs
docker-compose logs -f snake-game

# Container logs
docker logs snake-game-app

# Check environment variables in container
docker exec snake-game-app env | grep PORT
```

## 🔒 Security Features
- Non-root user in container
- Minimal Alpine Linux base image
- Environment variables for sensitive config
- Health check monitoring
- Resource limits in production
- Log rotation in production

## 📊 Monitoring

### Production Monitoring
```bash
# Check container stats
docker stats snake-game-app

# Check health status
docker inspect snake-game-app | grep Health

# Monitor logs
docker-compose -f docker-compose.prod.yml logs -f --tail=100
```
