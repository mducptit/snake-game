# 🐍 Snake Game

A modern web-based Snake game with multi-language support, comprehensive scoreboard system, and Docker deployment.

## ✨ Features

- **🎮 Classic Gameplay**: Smooth snake movement with collision detection
- **🌍 Multi-Language Support**: 6 languages available
  - 🇺🇸 English
  - 🇪🇸 Spanish (Español)
  - 🇫🇷 French (Français)
  - 🇩🇪 German (Deutsch)
  - 🇻🇳 Vietnamese (Tiếng Việt)
  - 🇨🇳 Chinese (中文)
- **🏆 Advanced Scoreboard**: Top 10 scores with player names
- **📊 Statistics Tracking**: Games played, total score, achievements
- **🎯 Achievement System**: Unlockable achievements
- **📱 Mobile Friendly**: Touch controls and responsive design
- **🔊 Sound Effects**: Audio feedback for game events
- **⚙️ Customizable Settings**: Speed, theme, language options
- **🐳 Docker Ready**: Easy deployment with Docker

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Start the server
npm start

# Open browser
http://localhost:3000
```

### Docker Deployment
```bash
# Using Docker Compose (Recommended)
docker-compose up -d

# Or using Docker directly
docker build -t snake-game .
docker run -p 3000:3000 snake-game
```

## 🎮 How to Play

1. **Start Game**: Click "Start Game" button
2. **Move Snake**: Use arrow keys or WASD
3. **Eat Food**: Collect food (◆) to grow and score points
4. **Avoid Collision**: Don't hit walls or your own body
5. **Game Over**: Enter your name and choose to play again or view scoreboard

### Controls
- **Arrow Keys** or **WASD** - Move the snake
- **Space** - Pause/Resume
- **R** - Restart game
- **ESC** - Open settings

## 🏆 Game Features

### Scoring System
- **Food**: +10 points per food item
- **Level Progression**: Speed increases every 50 points
- **High Score Tracking**: Personal best scores saved

### Achievements
- 🎮 **First Game** - Play your first game
- 💯 **Century Club** - Score 100 points
- 🔥 **High Roller** - Score 500 points
- 👑 **Snake Master** - Score 1000 points
- 🛡️ **Survivor** - Win 5 games in a row
- ⚡ **Speed Demon** - Play on maximum speed

## 🌍 Multi-Language Support

The game automatically detects your browser language and supports:
- Complete UI translations
- Localized achievement names
- Regional number formatting
- Cultural adaptations

## 📁 Project Structure

```
snake-game/
├── public/                 # Web assets
│   ├── index.html         # Main HTML file
│   ├── game.js           # Core game logic
│   ├── styles.css        # Game styling
│   ├── languages.js      # Multi-language support
│   └── scoreboard.js     # Scoreboard & achievements
├── server.js             # Express web server
├── package.json          # Project dependencies
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose setup
└── README.md           # This file
```

## 🐳 Docker Deployment

### Using Docker Compose
```bash
# Start the application
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the application
docker-compose down
```

### Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode

## 🔧 Development

### Available Scripts
```bash
npm start              # Start production server
npm run dev           # Start development server
npm run docker:build  # Build Docker image
npm run docker:run    # Run Docker container
```

### Adding New Languages
1. Add language object to `public/languages.js`
2. Include all required translation keys
3. Add language option to settings menu
4. Test all UI elements

## 🌟 Game Mechanics

### Snake Movement
- Smooth directional changes
- Collision detection with walls and self
- Growing mechanism when eating food

### Food Generation
- Random placement avoiding snake body
- Visual feedback with special character
- Score increment on consumption

### Level System
- Progressive difficulty increase
- Speed adjustment based on score
- Visual level indicator

## 📊 Data Storage

All game data is stored locally in browser:
- **High Scores**: Top 10 player scores
- **Statistics**: Games played, total score
- **Achievements**: Progress and unlocked achievements
- **Settings**: Language, theme, preferences
- **Player Names**: Remembered for future games

## 🔒 Security & Performance

- **Client-side Storage**: No server-side data collection
- **Lightweight**: Minimal dependencies
- **Fast Loading**: Optimized assets
- **Cross-browser**: Compatible with modern browsers

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Future Enhancements

- [ ] Multiplayer support
- [ ] Custom themes
- [ ] Power-ups and special items
- [ ] Tournament mode
- [ ] Social sharing
- [ ] Progressive Web App (PWA)

---

**Enjoy playing Snake! 🐍🎮**
