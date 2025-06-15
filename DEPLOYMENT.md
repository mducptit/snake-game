# Snake Game Deployment Guide

## 🐳 Docker Deployment

### Prerequisites
- Docker installed on your system
- Docker Compose installed

### Quick Start

#### Option 1: Using Docker Compose (Recommended)
```bash
# Build and start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

#### Option 2: Using Docker directly
```bash
# Build the image
docker build -t snake-game .

# Run the container
docker run -p 3000:3000 snake-game
```

### NPM Scripts
```bash
# Start development server
npm run dev

# Build Docker image
npm run docker:build

# Run Docker container
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
- **Local:** http://localhost:3000
- **Production:** http://your-domain.com:3000

## 🔧 Configuration

### Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (production/development)

### Docker Compose Configuration
The `docker-compose.yml` includes:
- Health checks
- Automatic restart policy
- Network isolation
- Port mapping

## 📁 Project Structure
```
snake-game/
├── public/                 # Web assets
│   ├── index.html         # Main HTML file
│   ├── game.js           # Game logic
│   ├── styles.css        # Styling
│   ├── languages.js      # Multi-language support
│   └── scoreboard.js     # Scoreboard functionality
├── server.js             # Express server
├── package.json          # Dependencies
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose setup
└── README.md           # Documentation
```

## 🚀 Production Deployment

### Using Docker Compose
1. Clone the repository
2. Run `docker-compose up -d`
3. Access via http://your-server:3000

### Using Cloud Platforms
- **Heroku:** Push to Heroku with Dockerfile
- **AWS:** Use ECS or Elastic Beanstalk
- **Google Cloud:** Use Cloud Run
- **DigitalOcean:** Use App Platform

## 🔍 Health Checks

The application includes health checks:
- **Endpoint:** http://localhost:3000
- **Interval:** 30 seconds
- **Timeout:** 10 seconds
- **Retries:** 3

## 🛠️ Troubleshooting

### Common Issues
1. **Port already in use:** Change port in docker-compose.yml
2. **Permission denied:** Ensure Docker daemon is running
3. **Build fails:** Check Node.js version compatibility

### Logs
```bash
# Docker Compose logs
docker-compose logs -f snake-game

# Docker container logs
docker logs snake-game-app
```

## 🔒 Security Features
- Non-root user in container
- Minimal Alpine Linux base image
- No sensitive data in image
- Health check monitoring
