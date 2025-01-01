const gridContainer = document.getElementById('gridContainer')
const undoElement = document.getElementById('icon-button')

// Connect to the WebSocket server
const socket = new WebSocket('ws://localhost:3000')

// Listen for incoming messages from the WebSocket server
/**
 * grid_data: when clint join, we serve the latest data to keep in sync and create grid with cell color accordingly
 * cell_color_changed: server will send this event with row and col number with next color to set
 * undo_left_count: server will emit this event in case client click on cell or undo to keep undo button state enable and disabled
 *
 */
socket.addEventListener('message', function (event) {
    const parsedMessage = JSON.parse(event.data)
    const { type, grid, row, col, color, undo_left_count: undoLeftCount } = parsedMessage
    switch (type) {
        case 'grid_data': {
            grid.forEach((rows, row) => {
                rows.forEach((element, col) => {
                    const cell = document.createElement('div')
                    cell.id = `div_${row}_${col}`
                    cell.classList.add('grid-cell')
                    cell.style.backgroundColor = element
                    cell.addEventListener('click', () => {
                        socket.send(
                            JSON.stringify({
                                type: 'cell_clicked',
                                col,
                                row,
                            })
                        )
                    })

                    // Append each cell to the container
                    gridContainer.appendChild(cell)
                })
            })
            break
        }

        case 'cell_color_changed': {
            const cell = document.getElementById(`div_${row}_${col}`)
            cell.style.backgroundColor = color
            break
        }

        case 'undo_left_count': {
            if (undoLeftCount > 0) {
                undoElement.disabled = false
            } else {
                undoElement.disabled = true
            }

            break
        }

        default: {
            console.log('Unknown Type received', type)
        }
    }
})

// click event when undo clicked
undoElement.addEventListener(
    'click',
    () => {
        socket.send(
            JSON.stringify({
                type: 'undo_clicked',
            })
        )
    }
)
