const express = require('express');
const cors = require('cors');
const path = require('path');
const errorHandler = require('./middleware/errorHandler');

const petsRouter = require('./routes/pets');
const vaccinationsRouter = require('./routes/vaccinations');
const appointmentsRouter = require('./routes/appointments');
const medicationsRouter = require('./routes/medications');
const weightRouter = require('./routes/weight');
const conditionsRouter = require('./routes/conditions');
const aiRouter = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  'https://pawchart.com',
  'https://www.pawchart.com',
  ...(process.env.NODE_ENV !== 'production' ? ['http://localhost:5173', 'http://localhost:3000'] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/pets', petsRouter);
app.use('/api/vaccinations', vaccinationsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/medications', medicationsRouter);
app.use('/api/weight', weightRouter);
app.use('/api/conditions', conditionsRouter);
app.use('/api/ai', aiRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'))
  );
}

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`PawChart API server running on http://localhost:${PORT}`);
});

module.exports = app;
