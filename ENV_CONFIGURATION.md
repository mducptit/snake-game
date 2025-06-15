# Environment Configuration Guide

## 🔧 Port Configuration with .env

The Snake Game now supports dynamic port configuration through environment variables, making it perfect for server deployment.

## 📁 Environment Files

### `.env` (Main configuration)
```bash
PORT=3000
NODE_ENV=production
CONTAINER_NAME=snake-game-app
DOCKER_PORT=3000
```

### `.env.example` (Template)
```bash
PORT=3000
NODE_ENV=production
CONTAINER_NAME=snake-game-app
DOCKER_PORT=3000
```

### `.env.production` (Production template)
```bash
PORT=8080
NODE_ENV=production
CONTAINER_NAME=snake-game-prod
DOCKER_PORT=8080
```

## 🚀 Deployment Options

### 1. Quick Deployment Script
```bash
# Development on port 3000
./deploy.sh development 3000

# Production on port 8080
./deploy.sh production 8080

# Custom port 5000
./deploy.sh production 5000
```

### 2. Manual Docker Compose
```bash
# Create your .env file
cp .env.example .env
# Edit PORT in .env file

# Development
docker-compose up -d

# Production
docker-compose -f docker-compose.prod.yml up -d
```

### 3. Direct Docker Run
```bash
# With .env file
docker run --env-file .env -p ${PORT}:${PORT} snake-game

# With environment variables
docker run -e PORT=8080 -p 8080:8080 snake-game
```

## 🌐 Server Deployment Examples

### Example 1: Standard Web Server (Port 80)
```bash
# .env
PORT=80
NODE_ENV=production
CONTAINER_NAME=snake-game-web

# Deploy
./deploy.sh production 80
# Access: http://your-domain.com
```

### Example 2: Development Server (Port 3000)
```bash
# .env
PORT=3000
NODE_ENV=development
CONTAINER_NAME=snake-game-dev

# Deploy
./deploy.sh development 3000
# Access: http://localhost:3000
```

### Example 3: Custom Port Server (Port 8080)
```bash
# .env
PORT=8080
NODE_ENV=production
CONTAINER_NAME=snake-game-custom

# Deploy
./deploy.sh production 8080
# Access: http://your-server:8080
```

## 🔧 Configuration Details

### Environment Variables
| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `PORT` | Server port | 3000 | 8080 |
| `NODE_ENV` | Environment mode | production | development |
| `CONTAINER_NAME` | Docker container name | snake-game-app | snake-game-prod |
| `DOCKER_PORT` | Docker port mapping | 3000 | 8080 |

### Docker Configuration
- **Dockerfile**: Uses `ENV PORT` and dynamic `EXPOSE $PORT`
- **docker-compose.yml**: Uses `${PORT:-3000}` for port mapping
- **Health checks**: Dynamic port in health check commands
- **Security**: Non-root user, minimal Alpine image

## 📊 Port Usage Scenarios

### Development
```bash
PORT=3000    # Local development
PORT=3001    # Alternative dev port
PORT=4000    # Testing port
```

### Production
```bash
PORT=80      # Standard HTTP
PORT=443     # HTTPS (with reverse proxy)
PORT=8080    # Common application port
PORT=3000    # Node.js default
```

### Cloud Platforms
```bash
PORT=8080    # Google Cloud Run
PORT=3000    # Heroku
PORT=80      # AWS ECS
PORT=5000    # DigitalOcean App Platform
```

## 🛠️ Troubleshooting

### Port Already in Use
```bash
# Check what's using the port
lsof -i :3000

# Kill process using port
lsof -ti:3000 | xargs kill -9

# Use different port
echo "PORT=3001" > .env
```

### Environment Variables Not Loading
```bash
# Check .env file exists
ls -la .env

# Verify content
cat .env

# Test environment loading
node -e "require('dotenv').config(); console.log('PORT:', process.env.PORT)"
```

### Docker Issues
```bash
# Rebuild with new environment
docker-compose down
docker-compose up --build -d

# Check environment in container
docker exec snake-game-app env | grep PORT
```

## 🔒 Security Considerations

### Production Deployment
- Use non-standard ports when possible
- Configure firewall rules
- Use reverse proxy (nginx/Apache)
- Enable HTTPS with SSL certificates
- Monitor port access logs

### Environment File Security
- Never commit `.env` to version control
- Use `.env.example` for templates
- Set proper file permissions: `chmod 600 .env`
- Use secrets management in production

## 📈 Monitoring

### Health Checks
```bash
# Check application health
curl http://localhost:${PORT}

# Docker health status
docker inspect snake-game-app | grep Health

# Container stats
docker stats snake-game-app
```

### Logs
```bash
# Application logs
docker-compose logs -f

# System logs
journalctl -u docker

# Port monitoring
netstat -tulpn | grep :${PORT}
```

## 🎯 Best Practices

1. **Use .env files** for environment-specific configuration
2. **Set appropriate ports** for your deployment environment
3. **Use production compose file** for production deployments
4. **Monitor health checks** to ensure application availability
5. **Configure logging** for production troubleshooting
6. **Use deployment script** for consistent deployments
7. **Test port accessibility** before going live

## 📝 Quick Reference

```bash
# Setup
cp .env.example .env          # Create environment file
nano .env                     # Edit configuration

# Deploy
./deploy.sh production 8080   # Quick deployment
docker-compose up -d          # Manual deployment

# Monitor
docker-compose logs -f        # View logs
docker-compose ps            # Check status

# Cleanup
docker-compose down          # Stop application
```
