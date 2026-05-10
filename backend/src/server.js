require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('🚢 Fathom Marine Backend Running');
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/ships', require('./routes/ships'));
app.use('/api/users', require('./routes/users'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/drills', require('./routes/drills'));
app.use('/api/compliance', require('./routes/compliance'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚢 Fathom Marine API running on http://localhost:${PORT}`);
});