import dotenv from 'dotenv'
import cors from 'cors'
import express from 'express'
import authRoute from './routes/authroute.js'
import listingRoute from './routes/listingroute.js'
import postRoute from './routes/postroute.js'
import { connectDB } from './config/db.js'

dotenv.config()

const app = express()

app.use(cors({
  origin: ['https://food-redistribution-zeta.vercel.app', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}))
app.use(express.json())

const PORT = process.env.PORT || 5000

connectDB()

// API Routes
app.use('/api/auth', authRoute)
app.use('/api/listings', listingRoute)
app.use('/api/posts', postRoute)

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://127.0.0.1:${PORT}`);
  console.log(`API Health Check: http://127.0.0.1:${PORT}/api/health`);
})

