const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Mock database per gli utenti (in un'applicazione reale useresti un database)
let users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@crm.com',
    password: '$2a$10$XB3RRrfKbKN7NLqNOvn/YeGn3YgWG1jvVZqGY4XcKTgkQ8gFGn9MS', // password: admin123
    role: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    username: 'sales',
    email: 'sales@crm.com',
    password: '$2a$10$XB3RRrfKbKN7NLqNOvn/YeGn3YgWG1jvVZqGY4XcKTgkQ8gFGn9MS', // password: admin123
    role: 'sales',
    firstName: 'Sales',
    lastName: 'Manager',
    createdAt: new Date().toISOString()
  }
];

// Registrazione utente
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, firstName, lastName, role = 'user' } = req.body;

    // Validazione input
    if (!username || !email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Tutti i campi sono obbligatori'
      });
    }

    // Verifica se l'utente esiste già
    const existingUser = users.find(u => u.username === username || u.email === email);
    if (existingUser) {
      return res.status(409).json({
        error: 'Username o email già esistenti'
      });
    }

    // Hash della password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crea nuovo utente
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword,
      role,
      firstName,
      lastName,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    // Rimuovi la password dalla risposta
    const { password: _, ...userResponse } = newUser;

    res.status(201).json({
      message: 'Utente registrato con successo',
      user: userResponse
    });

  } catch (error) {
    res.status(500).json({
      error: 'Errore durante la registrazione'
    });
  }
});

// Login utente
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: 'Username e password sono obbligatori'
      });
    }

    // Trova l'utente
    const user = users.find(u => u.username === username || u.email === username);
    if (!user) {
      return res.status(401).json({
        error: 'Credenziali non valide'
      });
    }

    // Verifica la password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Credenziali non valide'
      });
    }

    // Genera il token JWT
    const token = jwt.sign(
      { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'crm-secret-key',
      { expiresIn: '24h' }
    );

    // Rimuovi la password dalla risposta
    const { password: _, ...userResponse } = user;

    res.json({
      message: 'Login effettuato con successo',
      token,
      user: userResponse
    });

  } catch (error) {
    res.status(500).json({
      error: 'Errore durante il login'
    });
  }
});

// Verifica token
router.get('/verify', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({
      error: 'Utente non trovato'
    });
  }

  const { password: _, ...userResponse } = user;
  res.json({
    valid: true,
    user: userResponse
  });
});

// Profilo utente
router.get('/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({
      error: 'Utente non trovato'
    });
  }

  const { password: _, ...userResponse } = user;
  res.json(userResponse);
});

// Aggiorna profilo
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, email } = req.body;
    const userIndex = users.findIndex(u => u.id === req.user.id);

    if (userIndex === -1) {
      return res.status(404).json({
        error: 'Utente non trovato'
      });
    }

    // Aggiorna i campi
    if (firstName) users[userIndex].firstName = firstName;
    if (lastName) users[userIndex].lastName = lastName;
    if (email) users[userIndex].email = email;

    users[userIndex].updatedAt = new Date().toISOString();

    const { password: _, ...userResponse } = users[userIndex];
    res.json({
      message: 'Profilo aggiornato con successo',
      user: userResponse
    });

  } catch (error) {
    res.status(500).json({
      error: 'Errore durante l\'aggiornamento del profilo'
    });
  }
});

module.exports = router;
