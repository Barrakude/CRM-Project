const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Mock database per i contatti
let contacts = [
  {
    id: 1,
    customerId: 1,
    firstName: 'Marco',
    lastName: 'Verdi',
    email: 'marco.verdi@techsolutions.it',
    phone: '+39 02 1234568',
    position: 'CTO',
    department: 'Tecnologia',
    isPrimary: true,
    notes: 'Decisore tecnico principale',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    customerId: 1,
    firstName: 'Laura',
    lastName: 'Neri',
    email: 'laura.neri@techsolutions.it',
    phone: '+39 02 1234569',
    position: 'Acquisti Manager',
    department: 'Procurement',
    isPrimary: false,
    notes: 'Gestisce gli acquisti IT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Applica autenticazione a tutte le route
router.use(authenticateToken);

// GET /api/contacts/customer/:customerId - Ottieni contatti per cliente
router.get('/customer/:customerId', (req, res) => {
  const customerId = parseInt(req.params.customerId);
  const customerContacts = contacts.filter(c => c.customerId === customerId);
  
  res.json({
    contacts: customerContacts,
    total: customerContacts.length
  });
});

// GET /api/contacts - Ottieni tutti i contatti
router.get('/', (req, res) => {
  const { customerId, search, page = 1, limit = 10 } = req.query;
  
  let filteredContacts = [...contacts];
  
  // Filtro per cliente
  if (customerId) {
    filteredContacts = filteredContacts.filter(c => c.customerId === parseInt(customerId));
  }
  
  // Ricerca
  if (search) {
    const searchLower = search.toLowerCase();
    filteredContacts = filteredContacts.filter(c => 
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchLower) ||
      c.email.toLowerCase().includes(searchLower) ||
      c.position.toLowerCase().includes(searchLower)
    );
  }
  
  // Paginazione
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + parseInt(limit);
  const paginatedContacts = filteredContacts.slice(startIndex, endIndex);
  
  res.json({
    contacts: paginatedContacts,
    total: filteredContacts.length,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(filteredContacts.length / limit)
  });
});

// GET /api/contacts/:id - Ottieni un contatto specifico
router.get('/:id', (req, res) => {
  const contact = contacts.find(c => c.id === parseInt(req.params.id));
  
  if (!contact) {
    return res.status(404).json({
      error: 'Contatto non trovato'
    });
  }
  
  res.json(contact);
});

// POST /api/contacts - Crea nuovo contatto
router.post('/', requireRole(['admin', 'sales']), (req, res) => {
  const {
    customerId,
    firstName,
    lastName,
    email,
    phone,
    position,
    department,
    isPrimary = false,
    notes = ''
  } = req.body;

  // Validazione
  if (!customerId || !firstName || !lastName || !email) {
    return res.status(400).json({
      error: 'Cliente ID, nome, cognome ed email sono obbligatori'
    });
  }

  // Verifica email duplicata
  const existingContact = contacts.find(c => c.email === email);
  if (existingContact) {
    return res.status(409).json({
      error: 'Email già esistente'
    });
  }

  // Se questo contatto è primario, rimuovi il flag da altri contatti dello stesso cliente
  if (isPrimary) {
    contacts.forEach(c => {
      if (c.customerId === parseInt(customerId)) {
        c.isPrimary = false;
      }
    });
  }

  const newContact = {
    id: contacts.length + 1,
    customerId: parseInt(customerId),
    firstName,
    lastName,
    email,
    phone,
    position,
    department,
    isPrimary,
    notes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  contacts.push(newContact);

  res.status(201).json({
    message: 'Contatto creato con successo',
    contact: newContact
  });
});

// PUT /api/contacts/:id - Aggiorna contatto
router.put('/:id', requireRole(['admin', 'sales']), (req, res) => {
  const contactIndex = contacts.findIndex(c => c.id === parseInt(req.params.id));
  
  if (contactIndex === -1) {
    return res.status(404).json({
      error: 'Contatto non trovato'
    });
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    position,
    department,
    isPrimary,
    notes
  } = req.body;

  // Verifica email duplicata (escludendo il contatto corrente)
  if (email) {
    const existingContact = contacts.find(c => c.email === email && c.id !== parseInt(req.params.id));
    if (existingContact) {
      return res.status(409).json({
        error: 'Email già esistente'
      });
    }
  }

  const contact = contacts[contactIndex];

  // Se questo contatto diventa primario, rimuovi il flag da altri contatti dello stesso cliente
  if (isPrimary && !contact.isPrimary) {
    contacts.forEach(c => {
      if (c.customerId === contact.customerId && c.id !== contact.id) {
        c.isPrimary = false;
      }
    });
  }

  // Aggiorna i campi
  if (firstName) contact.firstName = firstName;
  if (lastName) contact.lastName = lastName;
  if (email) contact.email = email;
  if (phone) contact.phone = phone;
  if (position) contact.position = position;
  if (department) contact.department = department;
  if (isPrimary !== undefined) contact.isPrimary = isPrimary;
  if (notes !== undefined) contact.notes = notes;
  
  contact.updatedAt = new Date().toISOString();

  res.json({
    message: 'Contatto aggiornato con successo',
    contact
  });
});

// DELETE /api/contacts/:id - Elimina contatto
router.delete('/:id', requireRole(['admin', 'sales']), (req, res) => {
  const contactIndex = contacts.findIndex(c => c.id === parseInt(req.params.id));
  
  if (contactIndex === -1) {
    return res.status(404).json({
      error: 'Contatto non trovato'
    });
  }

  const deletedContact = contacts.splice(contactIndex, 1)[0];

  res.json({
    message: 'Contatto eliminato con successo',
    contact: deletedContact
  });
});

module.exports = router;
