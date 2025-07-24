const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Route di test semplice
app.get('/', (req, res) => {
  res.json({
    message: 'CRM Server API - Test',
    status: 'active'
  });
});

app.get('/test', (req, res) => {
  res.json({ message: 'Server funziona!' });
});

// Test auth routes
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes caricate');
} catch (error) {
  console.log('❌ Errore auth routes:', error.message);
}

// Test customers routes
try {
  const customersRoutes = require('./routes/customers');
  app.use('/api/customers', customersRoutes);
  console.log('✅ Customers routes caricate');
} catch (error) {
  console.log('❌ Errore customers routes:', error.message);
}

// Test contacts routes
try {
  const contactsRoutes = require('./routes/contacts');
  app.use('/api/contacts', contactsRoutes);
  console.log('✅ Contacts routes caricate');
} catch (error) {
  console.log('❌ Errore contacts routes:', error.message);
}

// Test deals routes
try {
  const dealsRoutes = require('./routes/deals');
  app.use('/api/deals', dealsRoutes);
  console.log('✅ Deals routes caricate');
} catch (error) {
  console.log('❌ Errore deals routes:', error.message);
}

// Test activities routes
try {
  const activitiesRoutes = require('./routes/activities');
  app.use('/api/activities', activitiesRoutes);
  console.log('✅ Activities routes caricate');
} catch (error) {
  console.log('❌ Errore activities routes:', error.message);
}

app.listen(PORT, () => {
  console.log(`🚀 Server di test avviato su http://localhost:${PORT}`);
});
