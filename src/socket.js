import { WebSocketServer, WebSocket } from 'ws'
import { v4 as uuidV4 } from 'uuid'

class WebSocketManager {
    constructor(server) {
        this.wss = new WebSocketServer({ server })
        this.clients = {}
        this.init()
    }

    // Initialize the WebSocket server and handle events
    init() {
        this.wss.on('connection', (ws) => {
            console.log('New client connected')
            const uniqueId = uuidV4()
            ws.id = uniqueId
            ws.username = `guest_${Date.now()}`

            this.clients[uniqueId] = ws

            // Handle incoming messages
            ws.on('message', (message) => {
                this.onMessageReceived(ws, message.toString())
            })

            // Handle client disconnection
            ws.on('close', () => {
                this.onDisconnect(ws)
            })
        })
    }

    // Handle incoming messages
    onMessageReceived(ws, message) {
        try {
            this.broadcastMessage(ws, message)
        } catch (error) {
            console.error('Error parsing message:', error)
            ws.send(JSON.stringify({ error: 'Invalid message format' }))
        }
    }

    // Broadcast a message to all connected clients
    broadcastMessage(ws, message) {
        console.log('Broadcasting message:', message)

        // Send message to all other clients
        Object.values(this.clients).forEach((client) => {
            if (
                client?.id !== ws?.id &&
                client?.readyState === WebSocket.OPEN
            ) {
                client.send(message)
            }
        })
    }

    // Handle client disconnection
    onDisconnect(ws) {
        if (ws?.id) {
            console.log(`${ws?.id} has disconnected`)
            delete this.clients[ws?.id] // Remove user from the clients list
        }
    }
}

export default WebSocketManager
