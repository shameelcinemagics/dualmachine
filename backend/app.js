const express = require('express');
const cors = require('cors');
const path = require('path');
const machineRoutes = require('./src/routes/machineRoutes');
const slotRoutes = require('./src/routes/slotRoutes');
const temperatureRoutes = require('./src/routes/temperatureRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const verifyPin = require('./src/routes/auth.routes');
const planogram = require('./src/routes/planogramRoutes');
const update = require('./src/routes/updateRoutes');
const media = require('./src/routes/signageRoutes')
// const productRoutes = require('./src/routes/productRoutes');


const app = express();

app.use(express.json())

// app.use(cors());

const allowedOrigins = [
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:8083'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use('/api/machine',machineRoutes);
app.use('/api/slots',slotRoutes);
app.use('/api/temperature',temperatureRoutes);
app.use('/api/payment',paymentRoutes);
app.use('/api/verifyPin',verifyPin);
app.use('/api/planogram',planogram);
app.use('/api/update',update);
app.use('/api/media',media)

app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});

// 🔥 Error Handler
app.use((err, req, res, next) => {
  console.error('💥 Internal error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error',
  });
});

module.exports = app;