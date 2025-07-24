# CRM Server API

Server Express.js per la gestione di un sistema CRM completo.

## Caratteristiche

- 🔐 **Autenticazione JWT** con ruoli utente (admin, sales, user)
- 👥 **Gestione Clienti** - CRUD completo per i clienti
- 📞 **Gestione Contatti** - Contatti associati ai clienti
- 💼 **Gestione Opportunità** - Pipeline di vendita con fasi personalizzabili
- 📋 **Gestione Attività** - Task, chiamate, riunioni e follow-up
- 📊 **Statistiche e Report** - Dashboard con metriche di vendita
- 🔍 **Ricerca e Filtri** - Ricerca avanzata su tutti i moduli
- 📄 **Paginazione** - Gestione efficiente di grandi dataset

## API Endpoints

### Autenticazione
- `POST /api/auth/login` - Login utente
- `POST /api/auth/register` - Registrazione nuovo utente
- `GET /api/auth/verify` - Verifica token JWT
- `GET /api/auth/profile` - Profilo utente corrente
- `PUT /api/auth/profile` - Aggiorna profilo

### Clienti
- `GET /api/customers` - Lista clienti (con filtri e paginazione)
- `GET /api/customers/:id` - Dettagli cliente
- `POST /api/customers` - Crea nuovo cliente
- `PUT /api/customers/:id` - Aggiorna cliente
- `DELETE /api/customers/:id` - Elimina cliente
- `GET /api/customers/stats/overview` - Statistiche clienti

### Contatti
- `GET /api/contacts` - Lista contatti
- `GET /api/contacts/:id` - Dettagli contatto
- `POST /api/contacts` - Crea nuovo contatto
- `PUT /api/contacts/:id` - Aggiorna contatto
- `DELETE /api/contacts/:id` - Elimina contatto
- `GET /api/contacts/customer/:customerId` - Contatti per cliente

### Opportunità (Deals)
- `GET /api/deals` - Lista opportunità
- `GET /api/deals/:id` - Dettagli opportunità
- `POST /api/deals` - Crea nuova opportunità
- `PUT /api/deals/:id` - Aggiorna opportunità
- `PUT /api/deals/:id/stage` - Cambia fase dell'opportunità
- `DELETE /api/deals/:id` - Elimina opportunità
- `GET /api/deals/stages` - Fasi del pipeline
- `GET /api/deals/stats/overview` - Statistiche opportunità
- `GET /api/deals/stats/pipeline` - Vista pipeline

### Attività
- `GET /api/activities` - Lista attività
- `GET /api/activities/:id` - Dettagli attività
- `POST /api/activities` - Crea nuova attività
- `PUT /api/activities/:id` - Aggiorna attività
- `PUT /api/activities/:id/complete` - Completa attività
- `DELETE /api/activities/:id` - Elimina attività
- `GET /api/activities/my/today` - Attività di oggi
- `GET /api/activities/my/overdue` - Attività scadute
- `GET /api/activities/types` - Tipi di attività
- `GET /api/activities/stats/overview` - Statistiche attività

## Avvio del Server

### Modalità Sviluppo
```bash
# Solo server
npm run server:dev

# Server + Frontend Angular contemporaneamente
npm run dev
```

### Modalità Produzione
```bash
npm run start:prod
```

## Configurazione

1. Copia il file `.env.example` in `.env`
2. Modifica le variabili di ambiente secondo le tue necessità

### Variabili di Ambiente

```env
PORT=3000                           # Porta del server
NODE_ENV=development                # Ambiente (development/production)
FRONTEND_URL=http://localhost:4200  # URL del frontend per CORS
JWT_SECRET=your-secret-key          # Chiave segreta per JWT
JWT_EXPIRES_IN=24h                 # Durata token JWT
```

## Credenziali di Test

### Admin
- **Username:** admin
- **Password:** admin123
- **Ruolo:** admin

### Sales Manager
- **Username:** sales
- **Password:** admin123
- **Ruolo:** sales

## Struttura del Progetto

```
server/
├── server.js              # Entry point del server
├── middleware/
│   └── auth.js            # Middleware di autenticazione
├── routes/
│   ├── auth.js           # Route autenticazione
│   ├── customers.js      # Route clienti
│   ├── contacts.js       # Route contatti
│   ├── deals.js          # Route opportunità
│   └── activities.js     # Route attività
├── mock_data/
│   └── seed_data.json    # Dati di esempio
└── uploads/               # Directory per file caricati
```

## Sicurezza

- 🛡️ **Helmet.js** - Sicurezza HTTP headers
- 🔐 **JWT Authentication** - Token sicuri con scadenza
- 👤 **Role-based Access Control** - Permessi basati sui ruoli
- 🚫 **CORS Protection** - Configurazione CORS personalizzata
- 📝 **Request Logging** - Log dettagliato delle richieste

## Prossimi Sviluppi

- [ ] Integrazione con database PostgreSQL/MySQL
- [ ] Sistema di notifiche email
- [ ] Upload file e documenti
- [ ] API per report e export dati
- [ ] Integrazione con servizi esterni (email, calendario)
- [ ] Cache Redis per prestazioni
- [ ] Test automatizzati
- [ ] Documentazione Swagger/OpenAPI

## Supporto

Per problemi o domande, contatta il team di sviluppo.
