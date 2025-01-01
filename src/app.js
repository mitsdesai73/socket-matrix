import express from 'express'
const app = express()

// Serve static files (your client-side HTML, CSS, JS)
app.use(express.static('public'))

export default app
