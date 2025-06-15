const http = require('http')
const fs = require('fs')
const path = require('path')
require('dotenv').config()

const PORT = process.env.PORT || 3000

// MIME types for different file extensions
const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
}

const server = http.createServer((req, res) => {
  // Parse URL and remove query parameters
  let filePath = req.url.split('?')[0]

  // Default to index.html for root path
  if (filePath === '/') {
    filePath = '/index.html'
  }

  // Construct full file path
  const fullPath = path.join(__dirname, 'public', filePath)

  // Get file extension
  const ext = path.extname(fullPath).toLowerCase()
  const contentType = mimeTypes[ext] || 'application/octet-stream'

  // Check if file exists and serve it
  fs.readFile(fullPath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File not found
        res.writeHead(404, { 'Content-Type': 'text/html' })
        res.end('<h1>404 - File Not Found</h1>')
      } else {
        // Server error
        res.writeHead(500, { 'Content-Type': 'text/html' })
        res.end('<h1>500 - Internal Server Error</h1>')
      }
    } else {
      // Success
      res.writeHead(200, { 'Content-Type': contentType })
      res.end(data)
    }
  })
})

server.listen(PORT, () => {
  console.log(`🐍 Snake Game Server running at http://localhost:${PORT}`)
  console.log('Press Ctrl+C to stop the server')
})

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})
