import express from 'express'

// Initialize the express app
const app = express()

// Serve static files (your client-side HTML, CSS, JS)
app.use(express.static('public'))

// Export the app for use in server.js
export default app
