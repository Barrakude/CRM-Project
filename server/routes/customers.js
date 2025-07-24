const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Mock database per i clienti
let customers = [
  {
    id: 1,
    companyName: 'Tech Solutions SRL',
    contactPerson: 'Mario Rossi',
    email: 'mario.rossi@techsolutions.it',
    phone: '+39 02 1234567',
    address: 'Via Milano 123, Milano, MI 20100',
    industry: 'Tecnologia',
    status: 'active',
    revenue: 50000,
    notes: 'Cliente principale nel settore IT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    companyName: 'Digital Marketing Agency',
    contactPerson: 'Giulia Bianchi',
    email: 'giulia@digitalmarketing.it',
    phone: '+39 06 9876543',
    address: 'Via Roma 456, Roma, RM 00100',
    industry: 'Marketing',
    status: 'prospect',
    revenue: 25000,
    notes: 'Interessati ai nostri servizi di consulenza',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Applica autenticazione a tutte le route
router.use(authenticateToken);

// GET /api/customers/stats/overview - Statistiche clienti
router.get('/stats/overview', (req, res) => {
  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    prospect: customers.filter(c => c.status === 'prospect').length,
    inactive: customers.filter(c => c.status === 'inactive').length,
    totalRevenue: customers.reduce((sum, c) => sum + c.revenue, 0),
    averageRevenue: customers.length > 0 ? customers.reduce((sum, c) => sum + c.revenue, 0) / customers.length : 0,
    industries: [...new Set(customers.map(c => c.industry))].filter(Boolean)
  };

  res.json(stats);
});

// GET /api/customers - Ottieni tutti i clienti
router.get('/', (req, res) => {
  const { status, industry, search, page = 1, limit = 10 } = req.query;
  
  let filteredCustomers = [...customers];
  
  // Filtro per status
  if (status) {
    filteredCustomers = filteredCustomers.filter(c => c.status === status);
  }
  
  // Filtro per industry
  if (industry) {
    filteredCustomers = filteredCustomers.filter(c => c.industry === industry);
  }
  
  // Ricerca
  if (search) {
    const searchLower = search.toLowerCase();
    filteredCustomers = filteredCustomers.filter(c => 
      c.companyName.toLowerCase().includes(searchLower) ||
      c.contactPerson.toLowerCase().includes(searchLower) ||
      c.email.toLowerCase().includes(searchLower)
    );
  }
  
  // Paginazione
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);
  
  res.json({
    customers: paginatedCustomers,
    total: filteredCustomers.length,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(filteredCustomers.length / limit)
  });
});

// GET /api/customers/:id - Ottieni un cliente specifico
router.get('/:id', (req, res) => {
  const customer = customers.find(c => c.id === parseInt(req.params.id));
  
  if (!customer) {
    return res.status(404).json({
      error: 'Cliente non trovato'
    });
  }
  
  res.json(customer);
});

// POST /api/customers - Crea nuovo cliente
router.post('/', requireRole(['admin', 'sales']), (req, res) => {
  const {
    companyName,
    contactPerson,
    email,
    phone,
    address,
    industry,
    status = 'prospect',
    revenue = 0,
    notes = ''
  } = req.body;

  // Validazione
  if (!companyName || !contactPerson || !email) {
    return res.status(400).json({
      error: 'Nome azienda, persona di contatto ed email sono obbligatori'
    });
  }

  // Verifica email duplicata
  const existingCustomer = customers.find(c => c.email === email);
  if (existingCustomer) {
    return res.status(409).json({
      error: 'Email già esistente'
    });
  }

  const newCustomer = {
    id: customers.length + 1,
    companyName,
    contactPerson,
    email,
    phone,
    address,
    industry,
    status,
    revenue: parseFloat(revenue) || 0,
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  customers.push(newCustomer);

  res.status(201).json({
    message: 'Cliente creato con successo',
    customer: newCustomer
  });
});

// PUT /api/customers/:id - Aggiorna cliente
router.put('/:id', requireRole(['admin', 'sales']), (req, res) => {
  const customerIndex = customers.findIndex(c => c.id === parseInt(req.params.id));
  
  if (customerIndex === -1) {
    return res.status(404).json({
      error: 'Cliente non trovato'
    });
  }

  const {
    companyName,
    contactPerson,
    email,
    phone,
    address,
    industry,
    status,
    revenue,
    notes
  } = req.body;

  // Verifica email duplicata (escludendo il cliente corrente)
  if (email) {
    const existingCustomer = customers.find(c => c.email === email && c.id !== parseInt(req.params.id));
    if (existingCustomer) {
      return res.status(409).json({
        error: 'Email già esistente'
      });
    }
  }

  // Aggiorna i campi
  const customer = customers[customerIndex];
  if (companyName) customer.companyName = companyName;
  if (contactPerson) customer.contactPerson = contactPerson;
  if (email) customer.email = email;
  if (phone) customer.phone = phone;
  if (address) customer.address = address;
  if (industry) customer.industry = industry;
  if (status) customer.status = status;
  if (revenue !== undefined) customer.revenue = parseFloat(revenue) || 0;
  if (notes !== undefined) customer.notes = notes;
  
  customer.updatedAt = new Date().toISOString();

  res.json({
    message: 'Cliente aggiornato con successo',
    customer
  });
});

// DELETE /api/customers/:id - Elimina cliente
router.delete('/:id', requireRole(['admin']), (req, res) => {
  const customerIndex = customers.findIndex(c => c.id === parseInt(req.params.id));
  
  if (customerIndex === -1) {
    return res.status(404).json({
      error: 'Cliente non trovato'
    });
  }

  const deletedCustomer = customers.splice(customerIndex, 1)[0];

  res.json({
    message: 'Cliente eliminato con successo',
    customer: deletedCustomer
  });
});

module.exports = router;
