class SnakeGameUI {
    constructor() {
        // Initialize language manager first
        this.lang = new LanguageManager();
        
        // Initialize scoreboard
        this.scoreboard = new ScoreboardManager(this.lang);
        
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.overlay = document.getElementById('gameOverlay');
        this.scoreElement = document.getElementById('score');
        this.highScoreElement = document.getElementById('high-score');
        this.levelElement = document.getElementById('level');
        
        // Game state
        this.gridSize = 25;
        this.tileCount = {
            x: Math.floor(this.canvas.width / this.gridSize),
            y: Math.floor(this.canvas.height / this.gridSize)
        };
        
        this.snake = [{ x: 10, y: 10 }];
        this.food = this.generateFood();
        this.direction = { x: 0, y: 0 };
        this.score = 0;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameSpeed = 150;
        this.soundEnabled = true;
        this.darkMode = false;
        this.gameStartTime = null;
        this.gameEndTime = null;
        
        // Make game instance globally available for inline onclick handlers
        window.gameInstance = this;
        
        // Initialize UI
        this.initializeUI();
    }
    
    initializeUI() {
        try {
            // Update high score display
            this.updateHighScoreDisplay();
            
            // Setup event listeners
            this.setupEventListeners();
            this.setupMobileControls();
            this.setupSettings();
            this.setupLanguage();
            this.setupDarkMode();
            
            // Update UI with current language
            this.lang.updateUI();
            
            // Show welcome screen
            this.showOverlay('welcomeTitle', 'welcomeMessage', 'start');
        } catch (error) {
            console.error('Error initializing UI:', error);
            // Fallback to basic initialization
            this.showOverlay('welcomeTitle', 'welcomeMessage', 'start');
        }
    }
    
    setupEventListeners() {
        try {
            // Keyboard controls
            document.addEventListener('keydown', (e) => {
                // Allow R key to work even when game is not running (for restart)
                if (!this.gameRunning && !['Space', 'Enter', 'KeyR'].includes(e.code)) return;
                
                switch(e.code) {
                    case 'ArrowUp':
                    case 'KeyW':
                        e.preventDefault();
                        this.changeDirection(0, -1);
                        break;
                    case 'ArrowDown':
                    case 'KeyS':
                        e.preventDefault();
                        this.changeDirection(0, 1);
                        break;
                    case 'ArrowLeft':
                    case 'KeyA':
                        e.preventDefault();
                        this.changeDirection(-1, 0);
                        break;
                    case 'ArrowRight':
                    case 'KeyD':
                        e.preventDefault();
                        this.changeDirection(1, 0);
                        break;
                    case 'Space':
                        e.preventDefault();
                        this.togglePause();
                        break;
                    case 'KeyR':
                        e.preventDefault();
                        console.log('R key pressed - restarting game');
                        this.restartGame();
                        break;
                }
            });
            
            // Button controls
            const startBtn = document.getElementById('startButton');
            const restartBtn = document.getElementById('restartButton');
            const pauseBtn = document.getElementById('pauseButton');
            const mobileRestartBtn = document.getElementById('mobileRestartButton');
            const scoreboardBtn = document.getElementById('scoreboardBtn');
            
            if (startBtn) {
                startBtn.addEventListener('click', () => this.startGame());
            }
            
            if (restartBtn) {
                restartBtn.addEventListener('click', () => this.restartGame());
            }
            
            if (pauseBtn) {
                pauseBtn.addEventListener('click', () => this.togglePause());
            }
            
            if (mobileRestartBtn) {
                mobileRestartBtn.addEventListener('click', () => this.restartGame());
            }
            
            if (scoreboardBtn) {
                scoreboardBtn.addEventListener('click', () => {
                    this.scoreboard.showScoreboard();
                });
            }
            
            // Debug button (hidden by default)
            const debugBtn = document.getElementById('debugBtn');
            if (debugBtn) {
                debugBtn.addEventListener('click', () => {
                    this.debugSettings();
                });
            }
            
            // Enable debug mode with Ctrl+Shift+D
            document.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.shiftKey && e.code === 'KeyD') {
                    e.preventDefault();
                    const debugBtn = document.getElementById('debugBtn');
                    if (debugBtn) {
                        debugBtn.style.display = debugBtn.style.display === 'none' ? 'inline-block' : 'none';
                        this.showSettingsFeedback('Debug mode ' + (debugBtn.style.display === 'none' ? 'disabled' : 'enabled'));
                    }
                }
            });
            
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }
    
    setupMobileControls() {
        // Enhanced D-pad controls
        const dpadButtons = document.querySelectorAll('.dpad-btn');
        dpadButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const direction = btn.dataset.direction;
                this.handleDirectionInput(direction);
            });
            
            // Add touch feedback
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                btn.classList.add('active');
            });
            
            btn.addEventListener('touchend', (e) => {
                e.preventDefault();
                btn.classList.remove('active');
            });
        });
        
        // Mobile settings toggle
        const mobileSettingsBtn = document.getElementById('mobileSettingsBtn');
        if (mobileSettingsBtn) {
            mobileSettingsBtn.addEventListener('click', () => {
                this.toggleMobileSettings();
            });
        }
        
        // Setup swipe gestures
        this.setupSwipeGestures();
        
        // Update mobile score display
        this.updateMobileScoreDisplay();
    }
    
    handleDirectionInput(direction) {
        switch(direction) {
            case 'up': this.changeDirection(0, -1); break;
            case 'down': this.changeDirection(0, 1); break;
            case 'left': this.changeDirection(-1, 0); break;
            case 'right': this.changeDirection(1, 0); break;
        }
        
        // Provide haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }
    
    setupSwipeGestures() {
        let startX, startY, endX, endY;
        const minSwipeDistance = 30;
        
        // Add swipe area to canvas
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!startX || !startY) return;
            
            const touch = e.changedTouches[0];
            endX = touch.clientX;
            endY = touch.clientY;
            
            const deltaX = endX - startX;
            const deltaY = endY - startY;
            
            // Determine swipe direction
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0) {
                        this.handleDirectionInput('right');
                    } else {
                        this.handleDirectionInput('left');
                    }
                }
            } else {
                // Vertical swipe
                if (Math.abs(deltaY) > minSwipeDistance) {
                    if (deltaY > 0) {
                        this.handleDirectionInput('down');
                    } else {
                        this.handleDirectionInput('up');
                    }
                }
            }
            
            // Reset coordinates
            startX = startY = endX = endY = null;
        }, { passive: false });
    }
    
    toggleMobileSettings() {
        const controls = document.querySelector('.controls');
        if (controls) {
            const isVisible = controls.style.display !== 'none';
            controls.style.display = isVisible ? 'none' : 'block';
            
            // Update button text
            const settingsBtn = document.getElementById('mobileSettingsBtn');
            const settingsText = settingsBtn.querySelector('.settings-text');
            if (settingsText) {
                settingsText.textContent = isVisible ? 
                    this.lang.getText('settingsTitle') : 
                    this.lang.getText('hide') || 'Hide';
            }
            
            this.showSettingsFeedback(isVisible ? 'Settings hidden' : 'Settings shown');
        }
    }
    
    updateMobileScoreDisplay() {
        const mobileScore = document.getElementById('mobileScore');
        const mobileLevel = document.getElementById('mobileLevel');
        
        if (mobileScore) mobileScore.textContent = this.score;
        if (mobileLevel) mobileLevel.textContent = this.level;
    }
    
    setupSettings() {
        try {
            const speedSlider = document.getElementById('speedSlider');
            const speedValue = document.getElementById('speedValue');
            const gridSizeSelect = document.getElementById('gridSize');
            const soundToggle = document.getElementById('soundToggle');
            
            // Load saved settings first
            this.loadSettings();
            
            // Speed slider event - only if element exists
            if (speedSlider && speedValue) {
                speedSlider.addEventListener('input', (e) => {
                    const speed = parseInt(e.target.value);
                    speedValue.textContent = speed;
                    this.gameSpeed = this.calculateGameSpeed(speed);
                    localStorage.setItem('snakeGameSpeed', speed);
                    
                    // Show feedback
                    this.showSettingsFeedback(`Speed set to ${speed}`);
                });
            }
            
            // Grid size event - only if element exists
            if (gridSizeSelect) {
                gridSizeSelect.addEventListener('change', (e) => {
                    const newGridSize = parseInt(e.target.value);
                    const oldGridSize = this.gridSize;
                    
                    this.gridSize = newGridSize;
                    this.updateTileCount();
                    localStorage.setItem('snakeGameGridSize', newGridSize);
                    
                    // Show feedback and restart if needed
                    if (this.gameRunning && oldGridSize !== newGridSize) {
                        this.showSettingsFeedback('Grid size changed - Game restarted');
                        this.restartGame();
                    } else {
                        this.showSettingsFeedback(`Grid size set to ${newGridSize}px`);
                        this.draw(); // Redraw with new grid
                    }
                });
            }
            
            // Sound toggle event - only if element exists
            if (soundToggle) {
                soundToggle.addEventListener('change', (e) => {
                    this.soundEnabled = e.target.checked;
                    localStorage.setItem('snakeGameSound', this.soundEnabled);
                    
                    // Test sound when enabled
                    if (this.soundEnabled) {
                        this.playSound('eat');
                        this.showSettingsFeedback('Sound enabled');
                    } else {
                        this.showSettingsFeedback('Sound disabled');
                    }
                });
            }
        } catch (error) {
            console.error('Error setting up settings:', error);
        }
    }
    
    loadSettings() {
        try {
            // Load and apply all saved settings
            const savedSpeed = localStorage.getItem('snakeGameSpeed');
            const savedGridSize = localStorage.getItem('snakeGameGridSize');
            const savedSound = localStorage.getItem('snakeGameSound');
            
            // Apply speed setting
            if (savedSpeed) {
                const speed = parseInt(savedSpeed);
                const speedSlider = document.getElementById('speedSlider');
                const speedValue = document.getElementById('speedValue');
                
                if (speedSlider) speedSlider.value = speed;
                if (speedValue) speedValue.textContent = speed;
                this.gameSpeed = this.calculateGameSpeed(speed);
            }
            
            // Apply grid size setting
            if (savedGridSize) {
                const gridSize = parseInt(savedGridSize);
                const gridSelect = document.getElementById('gridSize');
                
                if (gridSelect) gridSelect.value = gridSize;
                this.gridSize = gridSize;
                this.updateTileCount();
            }
            
            // Apply sound setting
            if (savedSound !== null) {
                this.soundEnabled = savedSound === 'true';
                const soundToggle = document.getElementById('soundToggle');
                if (soundToggle) soundToggle.checked = this.soundEnabled;
            }
            
            console.log('Settings loaded:', {
                speed: this.gameSpeed,
                gridSize: this.gridSize,
                sound: this.soundEnabled
            });
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }
    
    calculateGameSpeed(speedLevel) {
        // Convert speed level (1-10) to milliseconds
        // Level 1 = 275ms (slow), Level 10 = 50ms (fast)
        return Math.max(50, 300 - (speedLevel * 25));
    }
    
    updateTileCount() {
        this.tileCount = {
            x: Math.floor(this.canvas.width / this.gridSize),
            y: Math.floor(this.canvas.height / this.gridSize)
        };
        console.log('Tile count updated:', this.tileCount);
    }
    
    showSettingsFeedback(message) {
        try {
            // Create or update feedback element
            let feedback = document.getElementById('settingsFeedback');
            if (!feedback) {
                feedback = document.createElement('div');
                feedback.id = 'settingsFeedback';
                feedback.className = 'settings-feedback';
                document.body.appendChild(feedback);
            }
            
            feedback.textContent = message;
            feedback.classList.add('show');
            
            // Hide after 2 seconds
            setTimeout(() => {
                feedback.classList.remove('show');
            }, 2000);
        } catch (error) {
            console.log('Settings feedback:', message);
        }
    }
    
    setupLanguage() {
        try {
            const languageSelect = document.getElementById('languageSelect');
            
            if (!languageSelect) {
                console.warn('Language select element not found');
                return;
            }
            
            // Set current language
            languageSelect.value = this.lang.getCurrentLanguage();
            
            // Handle language change with immediate effect
            languageSelect.addEventListener('change', (e) => {
                const newLanguage = e.target.value;
                const oldLanguage = this.lang.getCurrentLanguage();
                
                console.log(`Language changing from ${oldLanguage} to ${newLanguage}`);
                
                // Change language
                this.lang.setLanguage(newLanguage);
                
                // Update all UI elements immediately
                this.updateUIAfterLanguageChange();
                
                // Show feedback
                const languageName = this.lang.getLanguageName(newLanguage);
                this.showSettingsFeedback(`Language changed to ${languageName}`);
            });
        } catch (error) {
            console.error('Error setting up language:', error);
        }
    }
    
    setupDarkMode() {
        try {
            const themeToggle = document.getElementById('themeToggle');
            
            if (!themeToggle) {
                console.warn('Theme toggle button not found');
                return;
            }
            
            // Load saved theme preference
            const savedTheme = localStorage.getItem('snakeGameTheme');
            this.darkMode = savedTheme === 'dark';
            
            // Apply initial theme
            this.applyTheme();
            
            // Setup toggle event
            themeToggle.addEventListener('click', () => {
                this.toggleDarkMode();
            });
            
            console.log('Dark mode setup completed:', { darkMode: this.darkMode });
        } catch (error) {
            console.error('Error setting up dark mode:', error);
        }
    }
    
    toggleDarkMode() {
        this.darkMode = !this.darkMode;
        this.applyTheme();
        
        // Save preference
        localStorage.setItem('snakeGameTheme', this.darkMode ? 'dark' : 'light');
        
        // Update button text and icon
        this.updateThemeToggleButton();
        
        // Show feedback
        const themeText = this.darkMode ? 
            this.lang.getText('darkMode') : 
            this.lang.getText('lightMode');
        this.showSettingsFeedback(`Theme changed to ${themeText} mode`);
        
        // Redraw canvas with new theme
        if (this.gameRunning || this.gamePaused) {
            this.draw();
        }
        
        console.log('Theme toggled:', { darkMode: this.darkMode });
    }
    
    applyTheme() {
        const body = document.body;
        
        if (this.darkMode) {
            body.setAttribute('data-theme', 'dark');
        } else {
            body.removeAttribute('data-theme');
        }
        
        this.updateThemeToggleButton();
        this.updateCanvasColors();
    }
    
    updateThemeToggleButton() {
        const themeToggle = document.getElementById('themeToggle');
        const themeIcon = themeToggle?.querySelector('.theme-toggle-icon');
        const themeText = themeToggle?.querySelector('.theme-toggle-text');
        
        if (themeIcon && themeText) {
            if (this.darkMode) {
                themeIcon.textContent = '☀️';
                themeText.textContent = this.lang.getText('lightMode') || 'Light';
                themeToggle.setAttribute('aria-label', 'Switch to Light Mode');
            } else {
                themeIcon.textContent = '🌙';
                themeText.textContent = this.lang.getText('darkMode') || 'Dark';
                themeToggle.setAttribute('aria-label', 'Switch to Dark Mode');
            }
        }
    }
    
    updateCanvasColors() {
        // Update canvas background color based on theme
        if (this.canvas) {
            const computedStyle = getComputedStyle(document.documentElement);
            const canvasBg = computedStyle.getPropertyValue('--canvas-bg').trim();
            this.canvas.style.backgroundColor = canvasBg;
        }
    }
    
    updateUIAfterLanguageChange() {
        // Update overlay if visible
        if (this.overlay.style.display === 'flex') {
            const titleElement = document.getElementById('overlayTitle');
            const messageElement = document.getElementById('overlayMessage');
            
            if (titleElement && messageElement) {
                // Re-show overlay with new language
                if (this.gameRunning) {
                    if (this.gamePaused) {
                        titleElement.textContent = this.lang.getText('pausedTitle');
                        messageElement.textContent = this.lang.getText('pausedMessage');
                    }
                } else {
                    // Game not running - show welcome or game over
                    const isGameOver = this.snake.length === 0 || this.score > 0;
                    if (isGameOver) {
                        titleElement.textContent = this.lang.getText('gameOverTitle');
                        messageElement.textContent = this.lang.getText('finalScore', { score: this.score });
                    } else {
                        titleElement.textContent = this.lang.getText('welcomeTitle');
                        messageElement.textContent = this.lang.getText('welcomeMessage');
                    }
                }
            }
        }
        
        // Update scoreboard if open
        const scoreboardModal = document.getElementById('scoreboardModal');
        if (scoreboardModal && scoreboardModal.style.display === 'flex') {
            this.scoreboard.updateScoreboardDisplay();
            this.scoreboard.updateStatsDisplay();
            this.scoreboard.updateAchievementsDisplay();
        }
        
        // Force update of all i18n elements
        setTimeout(() => {
            this.lang.updateUI();
        }, 100);
    }
    
    changeDirection(x, y) {
        if (!this.gameRunning || this.gamePaused) return;
        
        // Prevent reversing into itself
        if (this.direction.x === -x && this.direction.y === -y) return;
        
        this.direction = { x, y };
    }
    
    generateFood() {
        let food;
        do {
            food = {
                x: Math.floor(Math.random() * this.tileCount.x),
                y: Math.floor(Math.random() * this.tileCount.y)
            };
        } while (this.snake.some(segment => segment.x === food.x && segment.y === food.y));
        
        return food;
    }
    
    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.gameStartTime = Date.now(); // Track game start time
        this.hideOverlay();
        this.direction = { x: 1, y: 0 }; // Start moving right
        this.scoreboard.startGameTimer();
        
        // Update statistics
        const gamesPlayed = parseInt(localStorage.getItem('snakeGamesPlayed') || '0') + 1;
        localStorage.setItem('snakeGamesPlayed', gamesPlayed.toString());
        
        this.gameLoop();
    }
    
    gameLoop() {
        if (!this.gameRunning) return;
        
        if (!this.gamePaused) {
            this.update();
            this.draw();
        }
        
        // Use current game speed (which can be changed by settings)
        setTimeout(() => this.gameLoop(), this.gameSpeed);
    }
    
    update() {
        // Move snake head
        const head = { ...this.snake[0] };
        head.x += this.direction.x;
        head.y += this.direction.y;
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount.x || 
            head.y < 0 || head.y >= this.tileCount.y) {
            this.gameOver();
            return;
        }
        
        // Check self collision
        if (this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }
        
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.updateScore();
            this.food = this.generateFood();
            
            // Level up every 100 points
            const newLevel = Math.floor(this.score / 100) + 1;
            if (newLevel > this.level) {
                this.level = newLevel;
                this.updateLevel();
                
                // Increase speed slightly with each level (but respect user settings)
                const baseSpeed = this.calculateGameSpeed(parseInt(document.getElementById('speedSlider').value));
                const levelSpeedBonus = Math.min(this.level * 5, 50); // Max 50ms bonus
                this.gameSpeed = Math.max(30, baseSpeed - levelSpeedBonus);
                
                this.showSettingsFeedback(`Level ${this.level}! Speed increased!`);
            }
            
            // Add particle effect for food collection
            this.createFoodParticles(head.x, head.y);
            
            // Play sound effect
            this.playSound('eat');
        } else {
            this.snake.pop();
        }
    }
    
    draw() {
        // Get theme-aware colors
        const computedStyle = getComputedStyle(document.documentElement);
        const canvasBg = computedStyle.getPropertyValue('--canvas-bg').trim();
        
        // Clear canvas with theme color
        this.ctx.fillStyle = canvasBg || '#f0f0f0';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid (lighter on mobile for better performance)
        if (this.isMobile()) {
            this.drawLightGrid();
        } else {
            this.drawGrid();
        }
        
        // Draw food with glow effect
        this.drawFood();
        
        // Draw snake
        this.drawSnake();
        
        // Draw pause indicator
        if (this.gamePaused) {
            this.drawPauseIndicator();
        }
    }
    
    drawLightGrid() {
        // Lighter grid for mobile performance
        this.ctx.strokeStyle = '#f0f0f0';
        this.ctx.lineWidth = 0.5;
        
        // Draw fewer grid lines on mobile
        const step = this.gridSize * 2;
        for (let x = 0; x <= this.canvas.width; x += step) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.canvas.height; y += step) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }
    
    isMobile() {
        return window.innerWidth <= 768 || 'ontouchstart' in window;
    }
    
    drawGrid() {
        this.ctx.strokeStyle = '#e0e0e0';
        this.ctx.lineWidth = 1;
        
        for (let x = 0; x <= this.tileCount.x; x++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x * this.gridSize, 0);
            this.ctx.lineTo(x * this.gridSize, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y <= this.tileCount.y; y++) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y * this.gridSize);
            this.ctx.lineTo(this.canvas.width, y * this.gridSize);
            this.ctx.stroke();
        }
    }
    
    drawSnake() {
        this.snake.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;
            
            if (index === 0) {
                // Snake head
                this.ctx.fillStyle = '#2E7D32';
                this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
                
                // Add eyes
                this.ctx.fillStyle = 'white';
                const eyeSize = 3;
                const eyeOffset = 6;
                this.ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize);
                this.ctx.fillRect(x + this.gridSize - eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize);
                
                this.ctx.fillStyle = 'black';
                this.ctx.fillRect(x + eyeOffset + 1, y + eyeOffset + 1, 1, 1);
                this.ctx.fillRect(x + this.gridSize - eyeOffset - eyeSize + 1, y + eyeOffset + 1, 1, 1);
            } else {
                // Snake body
                const gradient = this.ctx.createLinearGradient(x, y, x + this.gridSize, y + this.gridSize);
                gradient.addColorStop(0, '#4CAF50');
                gradient.addColorStop(1, '#45a049');
                
                this.ctx.fillStyle = gradient;
                this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2);
            }
        });
    }
    
    drawFood() {
        const x = this.food.x * this.gridSize;
        const y = this.food.y * this.gridSize;
        
        // Glow effect
        const gradient = this.ctx.createRadialGradient(
            x + this.gridSize/2, y + this.gridSize/2, 0,
            x + this.gridSize/2, y + this.gridSize/2, this.gridSize/2
        );
        gradient.addColorStop(0, '#ff6b6b');
        gradient.addColorStop(1, '#ee5a52');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
        
        // Add sparkle effect
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(x + 4, y + 4, 2, 2);
        this.ctx.fillRect(x + this.gridSize - 8, y + 6, 1, 1);
    }
    
    drawPauseIndicator() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.fillStyle = 'white';
        this.ctx.font = '48px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(this.lang.getText('pausedTitle'), this.canvas.width/2, this.canvas.height/2);
        
        this.ctx.font = '16px Arial';
        this.ctx.fillText(this.lang.getText('pausedMessage'), this.canvas.width/2, this.canvas.height/2 + 40);
    }
    
    createFoodParticles(x, y) {
        // Simple particle effect - could be enhanced with actual particles
        const centerX = x * this.gridSize + this.gridSize/2;
        const centerY = y * this.gridSize + this.gridSize/2;
        
        this.ctx.fillStyle = '#ffeb3b';
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const particleX = centerX + Math.cos(angle) * 15;
            const particleY = centerY + Math.sin(angle) * 15;
            this.ctx.fillRect(particleX - 1, particleY - 1, 2, 2);
        }
    }
    
    updateScore() {
        if (this.scoreElement) {
            this.scoreElement.textContent = this.score;
        }
        this.updateMobileScoreDisplay();
    }
    
    updateLevel() {
        if (this.levelElement) {
            this.levelElement.textContent = this.level;
        }
        this.updateMobileScoreDisplay();
    }
    
    updateHighScoreDisplay() {
        this.highScoreElement.textContent = this.scoreboard.getHighScore();
    }
    
    playSound(type) {
        if (!this.soundEnabled) return;
        
        // Create audio context for sound effects
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            if (type === 'eat') {
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);
            } else if (type === 'gameOver') {
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.5);
            }
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (e) {
            // Fallback for browsers that don't support Web Audio API
            console.log('Sound effect:', type);
        }
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        
        // Update both desktop and mobile pause buttons
        const pauseBtn = document.getElementById('pauseButton');
        const pauseIcon = pauseBtn.querySelector('.action-icon');
        const pauseText = pauseBtn.querySelector('.action-text');
        
        if (this.gamePaused) {
            if (pauseIcon) pauseIcon.textContent = '▶️';
            if (pauseText) pauseText.textContent = this.lang.getText('resume');
            pauseBtn.textContent = pauseBtn.textContent.includes('▶️') ? pauseBtn.textContent : '▶️';
        } else {
            if (pauseIcon) pauseIcon.textContent = '⏸️';
            if (pauseText) pauseText.textContent = this.lang.getText('pause');
            pauseBtn.textContent = pauseBtn.textContent.includes('⏸️') ? pauseBtn.textContent : '⏸️';
        }
        
        if (!this.gamePaused) {
            this.draw(); // Redraw to remove pause indicator
        }
        
        // Provide haptic feedback on mobile
        if (this.isMobile() && navigator.vibrate) {
            navigator.vibrate(100);
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        this.gameEndTime = Date.now();
        this.playSound('gameOver');
        
        // Update total score statistics
        const totalScore = parseInt(localStorage.getItem('snakeTotalScore') || '0') + this.score;
        localStorage.setItem('snakeTotalScore', totalScore.toString());
        
        // Don't add score here - wait for name input
        const isNewHighScore = this.scoreboard.isNewHighScore(this.score);
        
        // Update high score display
        this.updateHighScoreDisplay();
        
        // Show enhanced game over modal
        this.showGameOverModal(isNewHighScore);
    }
    
    showGameOverModal(isNewHighScore = false) {
        console.log('Game over - showing name input modal');
        
        // Show the modal with name input content
        const overlay = document.getElementById('gameOverlay');
        const welcomeScreen = document.getElementById('welcomeScreen');
        const gameOverModal = document.getElementById('gameOverModal');
        
        welcomeScreen.style.display = 'none';
        gameOverModal.style.display = 'block';
        overlay.style.display = 'flex';
        
        // Set name input content
        this.showNameInputContent();
    }
    
    showNameInputContent() {
        const modalContent = document.getElementById('modalContent');
        
        modalContent.innerHTML = `
            <h2 style="margin: 0 0 15px 0; font-size: 1.8rem;">Enter Your Name</h2>
            <p style="margin: 0 0 20px 0; font-size: 1.1rem;">Your Score: ${this.score}</p>
            
            <input 
                type="text" 
                id="playerNameInput" 
                placeholder="Enter your name..."
                style="width: 100%; max-width: 300px; padding: 15px; font-size: 1.1rem; border: 2px solid #ddd; border-radius: 10px; text-align: center; margin-bottom: 20px; box-sizing: border-box;"
            >
            
            <div style="display: flex; gap: 15px; justify-content: center;">
                <button 
                    onclick="window.gameInstance.submitName()"
                    style="padding: 12px 25px; background: #4CAF50; color: white; border: none; border-radius: 25px; font-size: 1rem; font-weight: bold; cursor: pointer; min-width: 100px;"
                >
                    Submit
                </button>
                <button 
                    onclick="window.gameInstance.skipName()"
                    style="padding: 12px 25px; background: #6c757d; color: white; border: none; border-radius: 25px; font-size: 1rem; font-weight: bold; cursor: pointer; min-width: 100px;"
                >
                    Skip
                </button>
            </div>
        `;
        
        // Load saved name and focus
        setTimeout(() => {
            const nameInput = document.getElementById('playerNameInput');
            const savedName = localStorage.getItem('snakePlayerName');
            if (savedName && savedName !== 'Anonymous') {
                nameInput.value = savedName;
            }
            nameInput.focus();
            
            // Handle Enter key
            nameInput.onkeypress = (e) => {
                if (e.key === 'Enter') {
                    this.submitName();
                }
            };
        }, 100);
    }
    
    submitName() {
        console.log('Submit name clicked!');
        const nameInput = document.getElementById('playerNameInput');
        const name = nameInput.value.trim();
        const playerName = name || 'Anonymous';
        
        // Save name if provided
        if (name) {
            localStorage.setItem('snakePlayerName', name);
        }
        
        // Add score to scoreboard
        this.scoreboard.addScore(this.score, playerName);
        this.updateHighScoreDisplay();
        
        // Change modal content to show options
        this.showOptionsContent();
    }
    
    skipName() {
        console.log('Skip name clicked!');
        
        // Add score as Anonymous
        this.scoreboard.addScore(this.score, 'Anonymous');
        this.updateHighScoreDisplay();
        
        // Change modal content to show options
        this.showOptionsContent();
    }
    
    showOptionsContent() {
        console.log('Showing options content in same modal');
        
        const modalContent = document.getElementById('modalContent');
        
        modalContent.innerHTML = `
            <h2 style="margin: 0 0 20px 0; font-size: 1.8rem;">Game Over</h2>
            <p style="margin: 0 0 30px 0; font-size: 1.1rem;">Your Score: ${this.score}</p>
            
            <div style="display: flex; flex-direction: column; gap: 15px; align-items: center;">
                <button 
                    onclick="window.gameInstance.playAgain()"
                    style="padding: 15px 30px; background: #4CAF50; color: white; border: none; border-radius: 25px; font-size: 1.1rem; font-weight: bold; cursor: pointer; min-width: 200px; transition: all 0.3s ease;"
                    onmouseover="this.style.background='#45a049'; this.style.transform='translateY(-2px)'"
                    onmouseout="this.style.background='#4CAF50'; this.style.transform='translateY(0)'"
                >
                    🔄 Play Again
                </button>
                <button 
                    onclick="window.gameInstance.showScoreboard()"
                    style="padding: 15px 30px; background: #2196F3; color: white; border: none; border-radius: 25px; font-size: 1.1rem; font-weight: bold; cursor: pointer; min-width: 200px; transition: all 0.3s ease;"
                    onmouseover="this.style.background='#1976D2'; this.style.transform='translateY(-2px)'"
                    onmouseout="this.style.background='#2196F3'; this.style.transform='translateY(0)'"
                >
                    🏆 Scoreboard
                </button>
            </div>
        `;
    }
    
    playAgain() {
        console.log('Play Again clicked!');
        
        // Hide modal
        const overlay = document.getElementById('gameOverlay');
        const gameOverModal = document.getElementById('gameOverModal');
        
        overlay.style.display = 'none';
        gameOverModal.style.display = 'none';
        
        // Reset and start new game immediately
        this.snake = [{ x: 10, y: 10 }];
        this.food = this.generateFood();
        this.direction = { x: 0, y: 0 };
        this.score = 0;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameStartTime = null;
        this.gameEndTime = null;
        
        // Update displays
        this.updateScore();
        this.updateLevel();
        this.draw();
        
        // Start game immediately
        this.startGame();
    }
    
    showScoreboard() {
        console.log('Scoreboard clicked!');
        
        // Hide modal and show welcome screen
        const overlay = document.getElementById('gameOverlay');
        const welcomeScreen = document.getElementById('welcomeScreen');
        const gameOverModal = document.getElementById('gameOverModal');
        
        gameOverModal.style.display = 'none';
        welcomeScreen.style.display = 'block';
        
        // Reset game state
        this.snake = [{ x: 10, y: 10 }];
        this.food = this.generateFood();
        this.direction = { x: 0, y: 0 };
        this.score = 0;
        this.level = 1;
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameStartTime = null;
        this.gameEndTime = null;
        
        // Update displays
        this.updateScore();
        this.updateLevel();
        this.draw();
        
        // Show scoreboard
        this.scoreboard.showScoreboard();
    }
    
    calculateGameTime() {
        if (!this.gameStartTime || !this.gameEndTime) {
            return '0:00';
        }
        
        const totalSeconds = Math.floor((this.gameEndTime - this.gameStartTime) / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    
    getGameOverSubtitle() {
        if (this.score >= 1000) {
            return this.lang.getText('gameOverPerfect');
        } else if (this.score >= 500) {
            return this.lang.getText('gameOverAmazing');
        } else if (this.score >= 200) {
            return this.lang.getText('gameOverGreat');
        } else {
            return this.lang.getText('gameOverGood');
        }
    }
    
    checkAndShowAchievements() {
        const achievementNotification = document.getElementById('achievementNotification');
        const achievementName = document.getElementById('achievementName');
        
        // Check for achievements (simplified example)
        let newAchievement = null;
        
        if (this.score >= 100 && !localStorage.getItem('achievement_century')) {
            newAchievement = 'Century Club';
            localStorage.setItem('achievement_century', 'true');
        } else if (this.score >= 500 && !localStorage.getItem('achievement_highroller')) {
            newAchievement = 'High Roller';
            localStorage.setItem('achievement_highroller', 'true');
        } else if (this.score >= 1000 && !localStorage.getItem('achievement_master')) {
            newAchievement = 'Snake Master';
            localStorage.setItem('achievement_master', 'true');
        }
        
        if (newAchievement) {
            achievementName.textContent = newAchievement;
            achievementNotification.style.display = 'flex';
        } else {
            achievementNotification.style.display = 'none';
        }
    }
    
    setupGameOverModalEvents() {
        // Restart button
        const restartButton = document.getElementById('restartButton');
        restartButton.onclick = () => {
            this.hideGameOverModal();
            this.resetGame();
        };
        
        // View scoreboard button
        const viewScoreboardButton = document.getElementById('viewScoreboardButton');
        viewScoreboardButton.onclick = () => {
            this.hideGameOverModal();
            this.scoreboard.showScoreboard();
        };
        
        // Share score button
        const shareScoreButton = document.getElementById('shareScoreButton');
        shareScoreButton.onclick = () => {
            this.shareScore();
        };
    }
    
    hideGameOverModal() {
        const overlay = document.getElementById('gameOverlay');
        const welcomeScreen = document.getElementById('welcomeScreen');
        const gameOverModal = document.getElementById('gameOverModal');
        
        // Hide modal with animation
        gameOverModal.style.animation = 'modalSlideOut 0.3s ease-in';
        
        setTimeout(() => {
            overlay.style.display = 'none';
            gameOverModal.style.display = 'none';
            welcomeScreen.style.display = 'block';
        }, 300);
    }
    
    shareScore() {
        const playerName = localStorage.getItem('snakePlayerName') || 'Anonymous';
        const shareText = `${playerName} just scored ${this.score} points in Snake Game! 🐍 Can you beat this score?`;
        
        if (navigator.share) {
            // Use native sharing if available
            navigator.share({
                title: 'Snake Game Score',
                text: shareText,
                url: window.location.href
            }).catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback to clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                this.showSettingsFeedback('Score copied to clipboard!');
            }).catch(() => {
                // Final fallback - show text in alert
                prompt('Copy this text to share your score:', shareText);
            });
        }
    }
    
    restartGame() {
        // Reset game state
        this.snake = [{ x: 10, y: 10 }];
        this.food = this.generateFood();
        this.direction = { x: 0, y: 0 };
        this.score = 0;
        this.level = 1;
        this.gamePaused = false;
        this.gameStartTime = null;
        this.gameEndTime = null;
        
        // Reset speed to user's setting
        const speedSlider = document.getElementById('speedSlider');
        const userSpeedSetting = speedSlider ? parseInt(speedSlider.value) : 5;
        this.gameSpeed = this.calculateGameSpeed(userSpeedSetting);
        
        // Update displays
        this.updateScore();
        this.updateLevel();
        this.draw();
        
        // Reset pause button
        const pauseBtn = document.getElementById('pauseButton');
        if (pauseBtn) {
            pauseBtn.textContent = '⏸️';
        }
        
        // Hide any overlays
        this.hideOverlay();
        
        // Start the game immediately (this is the key fix!)
        this.gameRunning = true;
        this.gameStartTime = Date.now();
        this.direction = { x: 1, y: 0 }; // Start moving right
        this.gameLoop();
        
        console.log('Game restarted and started immediately');
    }
    
    resetGame() {
        // This method is called from modal buttons - same as restartGame
        this.restartGame();
    }
    
    showOverlay(titleKey, messageKey, buttonType, params = {}) {
        document.getElementById('overlayTitle').textContent = this.lang.getText(titleKey, params);
        document.getElementById('overlayMessage').textContent = this.lang.getText(messageKey, params);
        
        const startBtn = document.getElementById('startButton');
        const restartBtn = document.getElementById('restartButton');
        
        if (buttonType === 'start') {
            startBtn.style.display = 'inline-block';
            restartBtn.style.display = 'none';
        } else {
            startBtn.style.display = 'none';
            restartBtn.style.display = 'inline-block';
        }
        
        this.overlay.style.display = 'flex';
    }
    
    hideOverlay() {
        this.overlay.style.display = 'none';
    }
    
    // Debug method to check current settings
    debugSettings() {
        console.log('=== CURRENT GAME SETTINGS ===');
        console.log('Game Speed:', this.gameSpeed + 'ms');
        console.log('Grid Size:', this.gridSize + 'px');
        console.log('Sound Enabled:', this.soundEnabled);
        console.log('Language:', this.lang.getCurrentLanguage());
        console.log('Level:', this.level);
        console.log('Score:', this.score);
        console.log('Game Running:', this.gameRunning);
        console.log('Game Paused:', this.gamePaused);
        console.log('Tile Count:', this.tileCount);
        console.log('==============================');
        
        // Also check DOM elements
        const speedSlider = document.getElementById('speedSlider');
        const gridSelect = document.getElementById('gridSize');
        const langSelect = document.getElementById('languageSelect');
        const soundToggle = document.getElementById('soundToggle');
        
        console.log('DOM Values:');
        console.log('Speed Slider:', speedSlider ? speedSlider.value : 'NOT FOUND');
        console.log('Grid Select:', gridSelect ? gridSelect.value : 'NOT FOUND');
        console.log('Language Select:', langSelect ? langSelect.value : 'NOT FOUND');
        console.log('Sound Toggle:', soundToggle ? soundToggle.checked : 'NOT FOUND');
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // Simple error handler for password manager issues only
    window.addEventListener('error', function(e) {
        if (e.message && e.message.includes('ControlLooksLikePasswordCredentialField')) {
            e.preventDefault();
            console.warn('Password manager error suppressed');
            return true;
        }
    });
    
    // Initialize game normally
    window.game = new SnakeGameUI();
});
