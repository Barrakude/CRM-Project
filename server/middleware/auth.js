const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      error: 'Token di accesso richiesto' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'crm-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Token non valido o scaduto' 
      });
    }
    
    req.user = user;
    next();
  });
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Autenticazione richiesta' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Permessi insufficienti' 
      });
    }

    next();
  };
};

module.exports = { authenticateToken, requireRole };
