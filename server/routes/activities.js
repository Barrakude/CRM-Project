const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Mock database per le attività
let activities = [
  {
    id: 1,
    customerId: 1,
    dealId: 1,
    type: 'call',
    title: 'Chiamata di follow-up',
    description: 'Discutere i requisiti tecnici del progetto CRM',
    status: 'completed',
    priority: 'high',
    assignedTo: 2,
    createdBy: 2,
    dueDate: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    notes: 'Cliente interessato, richiede demo tecnica entro la settimana',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    customerId: 1,
    dealId: 1,
    type: 'meeting',
    title: 'Demo tecnica CRM',
    description: 'Presentazione delle funzionalità del sistema CRM',
    status: 'scheduled',
    priority: 'high',
    assignedTo: 2,
    createdBy: 2,
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 giorni
    completedAt: null,
    notes: 'Preparare demo ambiente con dati di esempio',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Tipi di attività
const activityTypes = [
  { value: 'call', label: 'Chiamata' },
  { value: 'meeting', label: 'Riunione' },
  { value: 'email', label: 'Email' },
  { value: 'task', label: 'Task' },
  { value: 'note', label: 'Nota' },
  { value: 'demo', label: 'Demo' },
  { value: 'proposal', label: 'Proposta' },
  { value: 'follow-up', label: 'Follow-up' }
];

// Applica autenticazione a tutte le route
router.use(authenticateToken);

// GET /api/activities/types - Ottieni tipi di attività
router.get('/types', (req, res) => {
  res.json(activityTypes);
});

// GET /api/activities/my/today - Attività di oggi per l'utente corrente
router.get('/my/today', (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayActivities = activities.filter(a => {
    const dueDate = new Date(a.dueDate);
    return a.assignedTo === req.user.id && 
           dueDate >= today && 
           dueDate < tomorrow;
  });

  res.json({
    activities: todayActivities,
    total: todayActivities.length
  });
});

// GET /api/activities/my/overdue - Attività scadute per l'utente corrente
router.get('/my/overdue', (req, res) => {
  const now = new Date();

  const overdueActivities = activities.filter(a => {
    const dueDate = new Date(a.dueDate);
    return a.assignedTo === req.user.id && 
           a.status !== 'completed' && 
           dueDate < now;
  });

  res.json({
    activities: overdueActivities,
    total: overdueActivities.length
  });
});

// GET /api/activities/stats/overview - Statistiche attività
router.get('/stats/overview', (req, res) => {
  const now = new Date();
  
  const stats = {
    total: activities.length,
    pending: activities.filter(a => a.status === 'pending').length,
    completed: activities.filter(a => a.status === 'completed').length,
    overdue: activities.filter(a => {
      const dueDate = new Date(a.dueDate);
      return a.status !== 'completed' && dueDate < now;
    }).length,
    byType: activityTypes.map(type => ({
      type: type.value,
      label: type.label,
      count: activities.filter(a => a.type === type.value).length
    })),
    byPriority: {
      high: activities.filter(a => a.priority === 'high').length,
      medium: activities.filter(a => a.priority === 'medium').length,
      low: activities.filter(a => a.priority === 'low').length
    }
  };

  res.json(stats);
});

// GET /api/activities - Ottieni tutte le attività
router.get('/', (req, res) => {
  const { 
    customerId, 
    dealId, 
    type, 
    status, 
    assignedTo, 
    priority,
    search, 
    page = 1, 
    limit = 10,
    sortBy = 'dueDate',
    sortOrder = 'asc'
  } = req.query;
  
  let filteredActivities = [...activities];
  
  // Filtri
  if (customerId) {
    filteredActivities = filteredActivities.filter(a => a.customerId === parseInt(customerId));
  }
  
  if (dealId) {
    filteredActivities = filteredActivities.filter(a => a.dealId === parseInt(dealId));
  }
  
  if (type) {
    filteredActivities = filteredActivities.filter(a => a.type === type);
  }
  
  if (status) {
    filteredActivities = filteredActivities.filter(a => a.status === status);
  }
  
  if (assignedTo) {
    filteredActivities = filteredActivities.filter(a => a.assignedTo === parseInt(assignedTo));
  }
  
  if (priority) {
    filteredActivities = filteredActivities.filter(a => a.priority === priority);
  }
  
  // Ricerca
  if (search) {
    const searchLower = search.toLowerCase();
    filteredActivities = filteredActivities.filter(a => 
      a.title.toLowerCase().includes(searchLower) ||
      a.description.toLowerCase().includes(searchLower)
    );
  }
  
  // Ordinamento
  filteredActivities.sort((a, b) => {
    let aVal = a[sortBy];
    let bVal = b[sortBy];
    
    if (sortBy === 'dueDate' || sortBy === 'createdAt' || sortBy === 'updatedAt') {
      aVal = new Date(aVal);
      bVal = new Date(bVal);
    }
    
    if (sortOrder === 'desc') {
      return bVal > aVal ? 1 : -1;
    }
    return aVal > bVal ? 1 : -1;
  });
  
  // Paginazione
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex);
  
  res.json({
    activities: paginatedActivities,
    total: filteredActivities.length,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(filteredActivities.length / limit)
  });
});

// GET /api/activities/types - Ottieni tipi di attività
router.get('/types', (req, res) => {
  res.json(activityTypes);
});

// GET /api/activities/:id - Ottieni un'attività specifica
router.get('/:id', (req, res) => {
  const activity = activities.find(a => a.id === parseInt(req.params.id));
  
  if (!activity) {
    return res.status(404).json({
      error: 'Attività non trovata'
    });
  }
  
  res.json(activity);
});

// POST /api/activities - Crea nuova attività
router.post('/', requireRole(['admin', 'sales']), (req, res) => {
  const {
    customerId,
    dealId,
    type,
    title,
    description,
    status = 'pending',
    priority = 'medium',
    assignedTo,
    dueDate,
    notes = ''
  } = req.body;

  // Validazione
  if (!customerId || !type || !title) {
    return res.status(400).json({
      error: 'Cliente ID, tipo e titolo sono obbligatori'
    });
  }

  const newActivity = {
    id: activities.length + 1,
    customerId: parseInt(customerId),
    dealId: dealId ? parseInt(dealId) : null,
    type,
    title,
    description,
    status,
    priority,
    assignedTo: assignedTo ? parseInt(assignedTo) : req.user.id,
    createdBy: req.user.id,
    dueDate: dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // domani di default
    completedAt: null,
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  activities.push(newActivity);

  res.status(201).json({
    message: 'Attività creata con successo',
    activity: newActivity
  });
});

// PUT /api/activities/:id - Aggiorna attività
router.put('/:id', requireRole(['admin', 'sales']), (req, res) => {
  const activityIndex = activities.findIndex(a => a.id === parseInt(req.params.id));
  
  if (activityIndex === -1) {
    return res.status(404).json({
      error: 'Attività non trovata'
    });
  }

  const {
    type,
    title,
    description,
    status,
    priority,
    assignedTo,
    dueDate,
    notes
  } = req.body;

  // Aggiorna i campi
  const activity = activities[activityIndex];
  if (type) activity.type = type;
  if (title) activity.title = title;
  if (description !== undefined) activity.description = description;
  if (status) {
    activity.status = status;
    // Se l'attività viene completata, imposta completedAt
    if (status === 'completed' && !activity.completedAt) {
      activity.completedAt = new Date().toISOString();
    } else if (status !== 'completed') {
      activity.completedAt = null;
    }
  }
  if (priority) activity.priority = priority;
  if (assignedTo !== undefined) activity.assignedTo = parseInt(assignedTo);
  if (dueDate) activity.dueDate = dueDate;
  if (notes !== undefined) activity.notes = notes;
  
  activity.updatedAt = new Date().toISOString();

  res.json({
    message: 'Attività aggiornata con successo',
    activity
  });
});

// PUT /api/activities/:id/complete - Completa attività
router.put('/:id/complete', requireRole(['admin', 'sales']), (req, res) => {
  const activityIndex = activities.findIndex(a => a.id === parseInt(req.params.id));
  
  if (activityIndex === -1) {
    return res.status(404).json({
      error: 'Attività non trovata'
    });
  }

  const { notes } = req.body;

  const activity = activities[activityIndex];
  activity.status = 'completed';
  activity.completedAt = new Date().toISOString();
  activity.updatedAt = new Date().toISOString();
  
  if (notes) {
    activity.notes = notes;
  }

  res.json({
    message: 'Attività completata con successo',
    activity
  });
});

// DELETE /api/activities/:id - Elimina attività
router.delete('/:id', requireRole(['admin', 'sales']), (req, res) => {
  const activityIndex = activities.findIndex(a => a.id === parseInt(req.params.id));
  
  if (activityIndex === -1) {
    return res.status(404).json({
      error: 'Attività non trovata'
    });
  }

  const deletedActivity = activities.splice(activityIndex, 1)[0];

  res.json({
    message: 'Attività eliminata con successo',
    activity: deletedActivity
  });
});

module.exports = router;
