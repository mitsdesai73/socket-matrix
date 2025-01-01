// Connect to the WebSocket server
const socket = new WebSocket('ws://localhost:3000');

// Listen for incoming messages from the WebSocket server
socket.addEventListener('message', function(event) {
    const message = event.data;
    const messageElement = document.createElement('li');
    messageElement.classList.add('message');
    messageElement.textContent = message;
    document.getElementById('messages').appendChild(messageElement);
});

// Send a message when the "Send" button is clicked
document.getElementById('sendButton').addEventListener('click', () => {
    const message = document.getElementById('messageInput').value;
    if (message) {
        socket.send(message); // Send the message to the server
        document.getElementById('messageInput').value = ''; // Clear the input field
    }
});

// Optionally, allow the user to press "Enter" to send a message
document.getElementById('messageInput').addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        document.getElementById('sendButton').click();
    }
});