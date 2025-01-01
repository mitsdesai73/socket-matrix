const gridContainer = document.getElementById("gridContainer");

// Connect to the WebSocket server
const socket = new WebSocket('ws://localhost:3000');

// Listen for incoming messages from the WebSocket server
socket.addEventListener('message', function(event) {
    const parsedMessage = JSON.parse(event.data);
    console.log("Message Received", parsedMessage)
    const { type, grid, row, col, color } = parsedMessage;
            switch(type){
                case "grid_data": {
                    grid.forEach((rows, row) => { // Iterating over each row
                        rows.forEach((element, col) => { // Iterating over each column in the row
                            const cell = document.createElement("div");
                            cell.id = `div_${row}_${col}`
                            cell.classList.add("grid-cell");
                            cell.setAttribute("row-index", row)
                            cell.setAttribute("col-index",col)
                            cell.style.backgroundColor = element
                            cell.addEventListener("click", () => {
                                // if(cell.style.backgroundColor === "green"){
                                //     cell.style.backgroundColor = "red"
                                // } else {
                                //     cell.style.backgroundColor = "green"
                                // }

                                socket.send(JSON.stringify({
                                    type: "cell_clicked",
                                    col,
                                    row,
                                }))
                            });
                    
                            // Append each cell to the container
                            gridContainer.appendChild(cell);
                        });
                    });
                    break;
                }

                case "cell_color_changed": {
                    const cell = document.getElementById(`div_${row}_${col}`);
                    cell.style.backgroundColor =  color
                    break;
                }

                default: {
                    console.log("Unknown Type received", type)
                }
            }
    
});

