import express from "express";
import path from "path";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";

const PORT = 3000;
const app = express();
const server = http.createServer(app);

// Create a WebSocket server
const __dirname = path.resolve()

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

// Catch-all route to serve the HTML page
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Start the server
let httpServer = server.listen(PORT, () => console.log(`Listening on ${ PORT }`));
const wss = new WebSocketServer({ server: httpServer });

let clients = [];

wss.on("connection", (ws) => {
  console.log("A user connected");

  // Add client to the clients array
  clients.push(ws);

  // Handle incoming messages from clients
  ws.on("message", (message) => {
    console.log("Message from client: ", message.toString());

    // Broadcast message to all connected clients
    clients.forEach((client) => {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });

  // Handle client disconnection
  ws.on("close", () => {
    console.log("A user disconnected");
    clients = clients.filter((client) => client !== ws);
  });
});