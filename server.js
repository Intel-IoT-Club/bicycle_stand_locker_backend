// server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const commandRoutes = require('./routes/commandRoutes');
const statusRoutes = require('./routes/statusRoutes');
const logRoutes = require('./routes/logRoutes');

app.use('/api/command', commandRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/logs', logRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
