const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Configura dotenv
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware di sicurezza
app.use(helmet());

// Middleware per il logging
app.use(morgan('combined'));

// Middleware per il parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Configurazione CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:4200',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware per servire file statici
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route di base
app.get('/', (req, res) => {
  res.json({
    message: 'CRM Server API',
    version: '1.0.0',
    status: 'active',
    endpoints: {
      auth: '/api/auth',
      customers: '/api/customers',
      contacts: '/api/contacts',
      deals: '/api/deals',
      activities: '/api/activities'
    }
  });
});

// Importa e usa le route
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes caricate');
} catch (error) {
  console.error('❌ Errore auth routes:', error.message);
}

try {
  const customersRoutes = require('./routes/customers');
  app.use('/api/customers', customersRoutes);
  console.log('✅ Customers routes caricate');
} catch (error) {
  console.error('❌ Errore customers routes:', error.message);
}

try {
  const contactsRoutes = require('./routes/contacts');
  app.use('/api/contacts', contactsRoutes);
  console.log('✅ Contacts routes caricate');
} catch (error) {
  console.error('❌ Errore contacts routes:', error.message);
}

try {
  const dealsRoutes = require('./routes/deals');
  app.use('/api/deals', dealsRoutes);
  console.log('✅ Deals routes caricate');
} catch (error) {
  console.error('❌ Errore deals routes:', error.message);
}

try {
  const activitiesRoutes = require('./routes/activities');
  app.use('/api/activities', activitiesRoutes);
  console.log('✅ Activities routes caricate');
} catch (error) {
  console.error('❌ Errore activities routes:', error.message);
}

// Middleware per la gestione degli errori
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Errore interno del server',
      status: err.status || 500,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Middleware per rotte non trovate
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Endpoint non trovato',
      status: 404,
      path: req.originalUrl
    }
  });
});

// Avvio del server
app.listen(PORT, () => {
  console.log(`🚀 CRM Server avviato su http://localhost:${PORT}`);
  console.log(`📊 Dashboard API disponibile su http://localhost:${PORT}/`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
