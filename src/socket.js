import { WebSocketServer, WebSocket } from 'ws'
import { v4 as uuidV4 } from 'uuid'

const rows = 50
const cols = 80

class WebSocketManager {
    constructor(server) {
        this.wss = new WebSocketServer({ server })
        this.clients = {}
        this.init()
        this.gridData = []
        this.populateInitialGrid()
        this.trackCellClickEvents = {}
    }

    /**
     * This function will create 2 dimension array for row and col and store the color
     */
    populateInitialGrid() {
        this.gridData = new Array(rows).fill().map(() => new Array(cols).fill('green'))
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

            // send latest grid data to client who just joined
            ws.send(
                JSON.stringify({
                    type: 'grid_data',
                    grid: this.gridData,
                })
            )
        })
    }

    /**
     * This function will emit `cell_color_changed` events to all the connected clients with the next color.
     * Also keep track of the click event per user
     * At the end, it will send undo left count for the current user.
     */

    onCellClicked(ws, row, col, track = true) {
        let color = this.gridData[row][col] == 'green' ? 'red' : 'green'
        this.gridData[row][col] = color

        this.broadcastMessage(ws, {
            type: 'cell_color_changed',
            col,
            row,
            color,
        })

        // add to track event for current client
        if (track) {
            if (Array.isArray(this.trackCellClickEvents[ws?.id])) {
                this.trackCellClickEvents[ws?.id].push({
                    row,
                    col,
                })
            } else {
                this.trackCellClickEvents[ws?.id] = [
                    {
                        row,
                        col,
                    },
                ]
            }
        }

        this.sendMessage(ws, {
            type: 'undo_left_count',
            undo_left_count: this.trackCellClickEvents[ws?.id]?.length || 0,
        })
    }

    /* Handle incoming messages
     * cell_clicked : when clint click on any cell
     * unco_clicked : when client click on undo button
     */
    onMessageReceived(ws, message) {
        try {
            const parsedMessage = JSON.parse(message)
            const { type, row, col } = parsedMessage

            switch (type) {
                case 'cell_clicked': {
                    this.onCellClicked(ws, row, col)
                    break
                }

                case 'undo_clicked': {
                    const undoTracks = this.trackCellClickEvents[ws?.id]
                    if (Array.isArray(undoTracks)) {
                        const { row: undoRow, col: undoCol } = undoTracks[undoTracks?.length - 1]
                        undoTracks.pop()
                        this.onCellClicked(ws, undoRow, undoCol, false)
                    }
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
        // Send message to all clients
        Object.values(this.clients).forEach((client) => {
            if (client?.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(message))
            }
        })
    }

    sendMessage(ws, message) {
        ws.send(JSON.stringify(message))
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
