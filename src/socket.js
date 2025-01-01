import { WebSocketServer, WebSocket } from 'ws'
import { v4 as uuidV4 } from 'uuid'

const rows = 50
const cols = 80

class WebSocketManager {
    constructor(server) {
        this.wss = new WebSocketServer({ server })
        this.clients = {}
        this
        this.init()
        this.gridData = []
        this.populateGrid()
    }

    populateGrid() {
        console.log("New Data")
        this.gridData = new Array(rows)
            .fill()
            .map(() => new Array(cols).fill('green'))
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
                this.onMessageReceived(ws, message)
            })

            // Handle client disconnection
            ws.on('close', () => {
                this.onDisconnect(ws)
            })

            // send latest grid data to client
            ws.send(
                JSON.stringify({
                    type: 'grid_data',
                    grid: this.gridData,
                })
            )
        })
    }

    // Handle incoming messages
    onMessageReceived(ws, message) {
        try {
            const parsedMessage = JSON.parse(message)
            const { type, row, col } = parsedMessage

            switch (type) {
                case 'cell_clicked': {
                    let color = this.gridData[row][col]
                    console.log("Click color", color)
                    if (color == 'green') {
                        color = 'red'
                    } else {
                        color = 'green'
                    }

                    this.broadcastMessage(ws, {
                        type: 'cell_color_changed',
                        col,
                        row,
                        color,
                    })
                    break
                }

                default: {
                    console.log('Unknown Type received', type)
                }
            }
        } catch (error) {
            console.error('Error parsing message:', error)
            ws.send(JSON.stringify({ error: 'Invalid message format' }))
        }
    }

    // Broadcast a message to all connected clients
    broadcastMessage(ws, message) {
        console.log('Broadcasting message:', message)

        // Send message to all clients
        Object.values(this.clients).forEach((client) => {
            if (
                // client?.id !== ws?.id &&
                client?.readyState === WebSocket.OPEN
            ) {
                client.send(JSON.stringify(message))
            }
        })
    }

    sendMessage(ws, message) {
        console.log('Sending message:', message)
        ws.send(message)
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
