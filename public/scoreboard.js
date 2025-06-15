// Scoreboard and Statistics Manager
class ScoreboardManager {
  constructor(languageManager) {
    this.lang = languageManager
    this.scores = this.loadScores()
    this.stats = this.loadStats()
    this.achievements = this.loadAchievements()
    this.initializeScoreboard()
  }

  loadScores() {
    const saved = localStorage.getItem('snakeGameScores')
    return saved ? JSON.parse(saved) : []
  }

  saveScores() {
    localStorage.setItem('snakeGameScores', JSON.stringify(this.scores))
  }

  loadStats() {
    const saved = localStorage.getItem('snakeGameStats')
    return saved
      ? JSON.parse(saved)
      : {
          gamesPlayed: 0,
          totalScore: 0,
          bestStreak: 0,
          currentStreak: 0,
          timeSpent: 0,
          startTime: null,
        }
  }

  saveStats() {
    localStorage.setItem('snakeGameStats', JSON.stringify(this.stats))
  }

  loadAchievements() {
    const saved = localStorage.getItem('snakeGameAchievements')
    return saved
      ? JSON.parse(saved)
      : {
          firstGame: false,
          score100: false,
          score500: false,
          score1000: false,
          noDeaths: false,
          speedDemon: false,
        }
  }

  saveAchievements() {
    localStorage.setItem(
      'snakeGameAchievements',
      JSON.stringify(this.achievements),
    )
  }

  initializeScoreboard() {
    // Ensure DOM is ready before creating modal
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.createScoreboardModal()
        this.updateScoreboardDisplay()
        this.updateStatsDisplay()
      })
    } else {
      this.createScoreboardModal()
      this.updateScoreboardDisplay()
      this.updateStatsDisplay()
    }
  }

  createScoreboardModal() {
    const modal = document.createElement('div')
    modal.id = 'scoreboardModal'
    modal.className = 'modal'
    modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2 data-i18n="scoreboardTitle">🏆 Scoreboard</h2>
                    <span class="close-modal">&times;</span>
                </div>
                
                <div class="modal-tabs">
                    <button class="tab-btn active" data-tab="scores" data-i18n="scoreboardTitle">Scoreboard</button>
                    <button class="tab-btn" data-tab="stats" data-i18n="gameStats">Statistics</button>
                    <button class="tab-btn" data-tab="achievements" data-i18n="achievements">Achievements</button>
                </div>
                
                <div class="tab-content">
                    <!-- Scores Tab -->
                    <div id="scoresTab" class="tab-panel active">
                        <div class="scoreboard-header">
                            <button id="clearScoresBtn" class="danger-btn" data-i18n="clearScores">Clear Scores</button>
                        </div>
                        <div class="scoreboard-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th data-i18n="rank">Rank</th>
                                        <th data-i18n="playerName">Player</th>
                                        <th data-i18n="points">Points</th>
                                        <th data-i18n="date">Date</th>
                                    </tr>
                                </thead>
                                <tbody id="scoresTableBody">
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <!-- Stats Tab -->
                    <div id="statsTab" class="tab-panel">
                        <div class="stats-grid">
                            <div class="stat-card">
                                <div class="stat-value" id="gamesPlayedValue">0</div>
                                <div class="stat-label" data-i18n="gamesPlayed">Games Played</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value" id="totalScoreValue">0</div>
                                <div class="stat-label" data-i18n="totalScore">Total Score</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value" id="averageScoreValue">0</div>
                                <div class="stat-label" data-i18n="averageScore">Average Score</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value" id="bestStreakValue">0</div>
                                <div class="stat-label" data-i18n="bestStreak">Best Streak</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-value" id="timeSpentValue">0m</div>
                                <div class="stat-label" data-i18n="timeSpent">Time Spent</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Achievements Tab -->
                    <div id="achievementsTab" class="tab-panel">
                        <div class="achievements-grid" id="achievementsGrid">
                        </div>
                    </div>
                </div>
            </div>
        `

    document.body.appendChild(modal)
    this.setupModalEvents()
  }

  setupModalEvents() {
    const modal = document.getElementById('scoreboardModal')
    const closeBtn = modal.querySelector('.close-modal')
    const tabBtns = modal.querySelectorAll('.tab-btn')
    const clearBtn = document.getElementById('clearScoresBtn')

    // Close modal
    closeBtn.addEventListener('click', () => this.hideScoreboard())
    modal.addEventListener('click', (e) => {
      if (e.target === modal) this.hideScoreboard()
    })

    // Tab switching
    tabBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab
        this.switchTab(tabName)
      })
    })

    // Clear scores
    clearBtn.addEventListener('click', () => {
      const confirmMessages = {
        en: 'Are you sure you want to clear all scores?',
        es: '¿Estás seguro de que quieres borrar todas las puntuaciones?',
        fr: 'Êtes-vous sûr de vouloir effacer tous les scores?',
        de: 'Sind Sie sicher, dass Sie alle Punkte löschen möchten?',
        vi: 'Bạn có chắc chắn muốn xóa tất cả điểm số?',
        zh: '您确定要清除所有分数吗？',
      }

      const currentLang = this.lang.getCurrentLanguage()
      const confirmMessage = confirmMessages[currentLang] || confirmMessages.en

      if (confirm(confirmMessage)) {
        this.clearAllScores()
      }
    })
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach((btn) => {
      btn.classList.remove('active')
    })
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active')

    // Update tab panels
    document.querySelectorAll('.tab-panel').forEach((panel) => {
      panel.classList.remove('active')
    })
    document.getElementById(`${tabName}Tab`).classList.add('active')

    // Update content based on tab
    if (tabName === 'achievements') {
      this.updateAchievementsDisplay()
    }
  }

  addScore(score, playerName = null) {
    // if (!playerName) {
    //     playerName = prompt(this.lang.getText('enterName')) || this.lang.getText('anonymous');
    // }

    const scoreEntry = {
      player: playerName,
      score: score,
      date: new Date().toLocaleDateString(),
      timestamp: Date.now(),
    }

    this.scores.push(scoreEntry)
    this.scores.sort((a, b) => b.score - a.score)
    this.scores = this.scores.slice(0, 10) // Keep top 10

    this.saveScores()
    this.updateScoreboardDisplay()

    // Update stats
    this.updateGameStats(score)

    // Check achievements
    this.checkAchievements(score)

    return (
      this.scores.findIndex((s) => s.timestamp === scoreEntry.timestamp) + 1
    )
  }

  updateGameStats(score) {
    this.stats.gamesPlayed++
    this.stats.totalScore += score

    if (score > 0) {
      this.stats.currentStreak++
      this.stats.bestStreak = Math.max(
        this.stats.bestStreak,
        this.stats.currentStreak,
      )
    } else {
      this.stats.currentStreak = 0
    }

    // Update time spent
    if (this.stats.startTime) {
      this.stats.timeSpent += Math.floor(
        (Date.now() - this.stats.startTime) / 1000,
      )
      this.stats.startTime = null
    }

    this.saveStats()
    this.updateStatsDisplay()
  }

  startGameTimer() {
    this.stats.startTime = Date.now()
  }

  checkAchievements(score) {
    const newAchievements = []

    // First game
    if (!this.achievements.firstGame && this.stats.gamesPlayed === 1) {
      this.achievements.firstGame = true
      newAchievements.push('firstGame')
    }

    // Score milestones
    if (!this.achievements.score100 && score >= 100) {
      this.achievements.score100 = true
      newAchievements.push('score100')
    }

    if (!this.achievements.score500 && score >= 500) {
      this.achievements.score500 = true
      newAchievements.push('score500')
    }

    if (!this.achievements.score1000 && score >= 1000) {
      this.achievements.score1000 = true
      newAchievements.push('score1000')
    }

    // No deaths streak
    if (!this.achievements.noDeaths && this.stats.currentStreak >= 5) {
      this.achievements.noDeaths = true
      newAchievements.push('noDeaths')
    }

    this.saveAchievements()

    // Show achievement notifications
    newAchievements.forEach((achievement) => {
      this.showAchievementNotification(achievement)
    })
  }

  showAchievementNotification(achievementKey) {
    const notification = document.createElement('div')
    notification.className = 'achievement-notification'
    notification.innerHTML = `
            <div class="achievement-icon">🏆</div>
            <div class="achievement-text">
                <div class="achievement-title">Achievement Unlocked!</div>
                <div class="achievement-name">${this.lang.getText(
                  achievementKey,
                )}</div>
            </div>
        `

    document.body.appendChild(notification)

    // Animate in
    setTimeout(() => notification.classList.add('show'), 100)

    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show')
      setTimeout(() => notification.remove(), 300)
    }, 3000)
  }

  updateScoreboardDisplay() {
    const tbody = document.getElementById('scoresTableBody')
    if (!tbody) {
      console.error('Scoreboard table body not found')
      return
    }

    tbody.innerHTML = ''

    if (this.scores.length === 0) {
      const row = document.createElement('tr')
      row.innerHTML = `
                <td colspan="4" style="text-align: center; padding: 20px; color: #666;">
                    ${
                      this.lang.getText('noScoresYet') ||
                      'No scores yet. Play a game to get started!'
                    }
                </td>
            `
      tbody.appendChild(row)
      return
    }

    this.scores.forEach((score, index) => {
      const row = document.createElement('tr')
      row.innerHTML = `
                <td class="rank">${index + 1}</td>
                <td class="player">${
                  score.player || this.lang.getText('anonymous')
                }</td>
                <td class="points">${score.score}</td>
                <td class="date">${score.date}</td>
            `

      if (index < 3) {
        row.classList.add(`rank-${index + 1}`)
      }

      tbody.appendChild(row)
    })
  }

  updateStatsDisplay() {
    const elements = {
      gamesPlayed: document.getElementById('gamesPlayedValue'),
      totalScore: document.getElementById('totalScoreValue'),
      averageScore: document.getElementById('averageScoreValue'),
      bestStreak: document.getElementById('bestStreakValue'),
      timeSpent: document.getElementById('timeSpentValue'),
    }

    // Check if elements exist
    Object.keys(elements).forEach((key) => {
      if (!elements[key]) {
        console.error(`Stats element not found: ${key}Value`)
      }
    })

    if (elements.gamesPlayed)
      elements.gamesPlayed.textContent = this.stats.gamesPlayed
    if (elements.totalScore)
      elements.totalScore.textContent = this.stats.totalScore
    if (elements.averageScore) {
      elements.averageScore.textContent =
        this.stats.gamesPlayed > 0
          ? Math.round(this.stats.totalScore / this.stats.gamesPlayed)
          : 0
    }
    if (elements.bestStreak)
      elements.bestStreak.textContent = this.stats.bestStreak
    if (elements.timeSpent)
      elements.timeSpent.textContent = this.formatTime(this.stats.timeSpent)
  }

  updateAchievementsDisplay() {
    const grid = document.getElementById('achievementsGrid')
    grid.innerHTML = ''

    const achievementsList = [
      {
        key: 'firstGame',
        icon: '🎮',
        description: {
          en: 'Play your first game',
          es: 'Juega tu primer juego',
          fr: 'Jouez votre premier jeu',
          de: 'Spiele dein erstes Spiel',
          vi: 'Chơi trận đầu tiên của bạn',
          zh: '玩你的第一场游戏',
        },
      },
      {
        key: 'score100',
        icon: '💯',
        description: {
          en: 'Score 100 points',
          es: 'Consigue 100 puntos',
          fr: 'Marquez 100 points',
          de: 'Erreiche 100 Punkte',
          vi: 'Đạt 100 điểm',
          zh: '得到100分',
        },
      },
      {
        key: 'score500',
        icon: '🔥',
        description: {
          en: 'Score 500 points',
          es: 'Consigue 500 puntos',
          fr: 'Marquez 500 points',
          de: 'Erreiche 500 Punkte',
          vi: 'Đạt 500 điểm',
          zh: '得到500分',
        },
      },
      {
        key: 'score1000',
        icon: '👑',
        description: {
          en: 'Score 1000 points',
          es: 'Consigue 1000 puntos',
          fr: 'Marquez 1000 points',
          de: 'Erreiche 1000 Punkte',
          vi: 'Đạt 1000 điểm',
          zh: '得到1000分',
        },
      },
      {
        key: 'noDeaths',
        icon: '🛡️',
        description: {
          en: 'Win 5 games in a row',
          es: 'Gana 5 juegos seguidos',
          fr: "Gagnez 5 jeux d'affilée",
          de: 'Gewinne 5 Spiele in Folge',
          vi: 'Thắng 5 trận liên tiếp',
          zh: '连续赢5场游戏',
        },
      },
      {
        key: 'speedDemon',
        icon: '⚡',
        description: {
          en: 'Play on maximum speed',
          es: 'Juega a velocidad máxima',
          fr: 'Jouez à vitesse maximale',
          de: 'Spiele mit maximaler Geschwindigkeit',
          vi: 'Chơi ở tốc độ tối đa',
          zh: '以最高速度游戏',
        },
      },
    ]

    achievementsList.forEach((achievement) => {
      const achieved = this.achievements[achievement.key]
      const currentLang = this.lang.getCurrentLanguage()
      const description =
        achievement.description[currentLang] || achievement.description.en

      const card = document.createElement('div')
      card.className = `achievement-card ${achieved ? 'achieved' : 'locked'}`
      card.innerHTML = `
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-name">${this.lang.getText(
                      achievement.key,
                    )}</div>
                    <div class="achievement-description">${description}</div>
                </div>
                ${
                  achieved
                    ? '<div class="achievement-check">✓</div>'
                    : '<div class="achievement-lock">🔒</div>'
                }
            `
      grid.appendChild(card)
    })
  }

  formatTime(seconds) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  showScoreboard() {
    const modal = document.getElementById('scoreboardModal')
    if (!modal) {
      console.error('Scoreboard modal not found')
      return
    }

    modal.style.display = 'flex'

    // Debug: Log current scores
    console.log('Current scores:', this.scores)
    console.log('Current stats:', this.stats)

    this.updateScoreboardDisplay()
    this.updateStatsDisplay()
  }

  hideScoreboard() {
    document.getElementById('scoreboardModal').style.display = 'none'
  }

  clearAllScores() {
    this.scores = []
    this.stats = {
      gamesPlayed: 0,
      totalScore: 0,
      bestStreak: 0,
      currentStreak: 0,
      timeSpent: 0,
      startTime: null,
    }
    this.achievements = {
      firstGame: false,
      score100: false,
      score500: false,
      score1000: false,
      noDeaths: false,
      speedDemon: false,
    }

    this.saveScores()
    this.saveStats()
    this.saveAchievements()

    this.updateScoreboardDisplay()
    this.updateStatsDisplay()
    this.updateAchievementsDisplay()
  }

  getHighScore() {
    return this.scores.length > 0 ? this.scores[0].score : 0
  }

  isNewHighScore(score) {
    return score > this.getHighScore()
  }
}
