const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Mock database per le opportunità
let deals = [
  {
    id: 1,
    customerId: 1,
    title: 'Implementazione CRM Enterprise',
    description: 'Progetto per implementare sistema CRM completo',
    value: 75000,
    currency: 'EUR',
    stage: 'proposal',
    probability: 70,
    expectedCloseDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 giorni
    source: 'referral',
    assignedTo: 2, // userId
    status: 'active',
    notes: 'Cliente molto interessato, richiesta demo tecnica',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    customerId: 2,
    title: 'Consulenza Digital Marketing',
    description: 'Servizi di consulenza per strategia digital marketing',
    value: 15000,
    currency: 'EUR',
    stage: 'negotiation',
    probability: 85,
    expectedCloseDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 giorni
    source: 'website',
    assignedTo: 2,
    status: 'active',
    notes: 'In fase di negoziazione finale del contratto',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Stages del pipeline
const dealStages = [
  { name: 'lead', label: 'Lead', order: 1 },
  { name: 'qualified', label: 'Qualificato', order: 2 },
  { name: 'proposal', label: 'Proposta', order: 3 },
  { name: 'negotiation', label: 'Negoziazione', order: 4 },
  { name: 'closed-won', label: 'Vinto', order: 5 },
  { name: 'closed-lost', label: 'Perso', order: 6 }
];

// Applica autenticazione a tutte le route
router.use(authenticateToken);

// GET /api/deals/stages - Ottieni le fasi del pipeline
router.get('/stages', (req, res) => {
  res.json(dealStages);
});

// GET /api/deals/stats/overview - Statistiche opportunità
router.get('/stats/overview', (req, res) => {
  const stats = {
    total: deals.length,
    active: deals.filter(d => d.status === 'active').length,
    won: deals.filter(d => d.status === 'won').length,
    lost: deals.filter(d => d.status === 'lost').length,
    totalValue: deals.reduce((sum, d) => sum + d.value, 0),
    wonValue: deals.filter(d => d.status === 'won').reduce((sum, d) => sum + d.value, 0),
    averageValue: deals.length > 0 ? deals.reduce((sum, d) => sum + d.value, 0) / deals.length : 0,
    byStage: dealStages.map(stage => ({
      stage: stage.name,
      label: stage.label,
      count: deals.filter(d => d.stage === stage.name).length,
      value: deals.filter(d => d.stage === stage.name).reduce((sum, d) => sum + d.value, 0)
    }))
  };

  res.json(stats);
});

// GET /api/deals/stats/pipeline - Vista pipeline
router.get('/stats/pipeline', (req, res) => {
  const pipeline = dealStages.map(stage => ({
    stage: stage.name,
    label: stage.label,
    order: stage.order,
    deals: deals.filter(d => d.stage === stage.name),
    count: deals.filter(d => d.stage === stage.name).length,
    value: deals.filter(d => d.stage === stage.name).reduce((sum, d) => sum + d.value, 0)
  }));

  res.json(pipeline);
});

// GET /api/deals - Ottieni tutte le opportunità
router.get('/', (req, res) => {
  const { customerId, stage, status, assignedTo, search, page = 1, limit = 10 } = req.query;
  
  let filteredDeals = [...deals];
  
  // Filtro per cliente
  if (customerId) {
    filteredDeals = filteredDeals.filter(d => d.customerId === parseInt(customerId));
  }
  
  // Filtro per stage
  if (stage) {
    filteredDeals = filteredDeals.filter(d => d.stage === stage);
  }
  
  // Filtro per status
  if (status) {
    filteredDeals = filteredDeals.filter(d => d.status === status);
  }
  
  // Filtro per assegnato a
  if (assignedTo) {
    filteredDeals = filteredDeals.filter(d => d.assignedTo === parseInt(assignedTo));
  }
  
  // Ricerca
  if (search) {
    const searchLower = search.toLowerCase();
    filteredDeals = filteredDeals.filter(d => 
      d.title.toLowerCase().includes(searchLower) ||
      d.description.toLowerCase().includes(searchLower)
    );
  }
  
  // Paginazione
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedDeals = filteredDeals.slice(startIndex, endIndex);
  
  res.json({
    deals: paginatedDeals,
    total: filteredDeals.length,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(filteredDeals.length / limit)
  });
});

// GET /api/deals/:id - Ottieni un'opportunità specifica
router.get('/:id', (req, res) => {
  const deal = deals.find(d => d.id === parseInt(req.params.id));
  
  if (!deal) {
    return res.status(404).json({
      error: 'Opportunità non trovata'
    });
  }
  
  res.json(deal);
});

// POST /api/deals - Crea nuova opportunità
router.post('/', requireRole(['admin', 'sales']), (req, res) => {
  const {
    customerId,
    title,
    description,
    value,
    currency = 'EUR',
    stage = 'lead',
    probability = 0,
    expectedCloseDate,
    source,
    assignedTo,
    status = 'active',
    notes = ''
  } = req.body;

  // Validazione
  if (!customerId || !title || !value) {
    return res.status(400).json({
      error: 'Cliente ID, titolo e valore sono obbligatori'
    });
  }

  const newDeal = {
    id: deals.length + 1,
    customerId: parseInt(customerId),
    title,
    description,
    value: parseFloat(value),
    currency,
    stage,
    probability: parseInt(probability),
    expectedCloseDate: expectedCloseDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    source,
    assignedTo: assignedTo ? parseInt(assignedTo) : req.user.id,
    status,
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  deals.push(newDeal);

  res.status(201).json({
    message: 'Opportunità creata con successo',
    deal: newDeal
  });
});

// PUT /api/deals/:id - Aggiorna opportunità
router.put('/:id', requireRole(['admin', 'sales']), (req, res) => {
  const dealIndex = deals.findIndex(d => d.id === parseInt(req.params.id));
  
  if (dealIndex === -1) {
    return res.status(404).json({
      error: 'Opportunità non trovata'
    });
  }

  const {
    title,
    description,
    value,
    currency,
    stage,
    probability,
    expectedCloseDate,
    source,
    assignedTo,
    status,
    notes
  } = req.body;

  // Aggiorna i campi
  const deal = deals[dealIndex];
  if (title) deal.title = title;
  if (description) deal.description = description;
  if (value !== undefined) deal.value = parseFloat(value);
  if (currency) deal.currency = currency;
  if (stage) deal.stage = stage;
  if (probability !== undefined) deal.probability = parseInt(probability);
  if (expectedCloseDate) deal.expectedCloseDate = expectedCloseDate;
  if (source) deal.source = source;
  if (assignedTo !== undefined) deal.assignedTo = parseInt(assignedTo);
  if (status) deal.status = status;
  if (notes !== undefined) deal.notes = notes;
  
  deal.updatedAt = new Date().toISOString();

  res.json({
    message: 'Opportunità aggiornata con successo',
    deal
  });
});

// PUT /api/deals/:id/stage - Cambia fase dell'opportunità
router.put('/:id/stage', requireRole(['admin', 'sales']), (req, res) => {
  const dealIndex = deals.findIndex(d => d.id === parseInt(req.params.id));
  
  if (dealIndex === -1) {
    return res.status(404).json({
      error: 'Opportunità non trovata'
    });
  }

  const { stage, probability } = req.body;

  if (!stage) {
    return res.status(400).json({
      error: 'Fase richiesta'
    });
  }

  const deal = deals[dealIndex];
  deal.stage = stage;
  
  if (probability !== undefined) {
    deal.probability = parseInt(probability);
  }
  
  // Aggiorna status automaticamente
  if (stage === 'closed-won') {
    deal.status = 'won';
    deal.probability = 100;
  } else if (stage === 'closed-lost') {
    deal.status = 'lost';
    deal.probability = 0;
  }
  
  deal.updatedAt = new Date().toISOString();

  res.json({
    message: 'Fase aggiornata con successo',
    deal
  });
});

// DELETE /api/deals/:id - Elimina opportunità
router.delete('/:id', requireRole(['admin']), (req, res) => {
  const dealIndex = deals.findIndex(d => d.id === parseInt(req.params.id));
  
  if (dealIndex === -1) {
    return res.status(404).json({
      error: 'Opportunità non trovata'
    });
  }

  const deletedDeal = deals.splice(dealIndex, 1)[0];

  res.json({
    message: 'Opportunità eliminata con successo',
    deal: deletedDeal
  });
});

module.exports = router;
