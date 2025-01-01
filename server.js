import http from 'http'
import app from './src/app.js'
import WebSocketManager from './src/socket.js'
import dotenv from 'dotenv'
dotenv.config()

// Create the HTTP server with the Express app
const server = http.createServer(app)

// Start the server
const PORT = process.env.PORT || 4000
// Initialize the WebSocket manager and pass the server to it
const httpServer = server.listen(PORT, () =>
    console.log(`Listening on ${PORT}`)
)
new WebSocketManager(httpServer)
