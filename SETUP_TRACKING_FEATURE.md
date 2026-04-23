# 🚀 Guide de Mise en Place - Fonctionnalité de Suivi de Demande

## Sommaire
1. [Prérequis](#prérequis)
2. [Installation Backend](#installation-backend)
3. [Migration DB](#migration-db)
4. [Installation Frontend](#installation-frontend)
5. [Tests](#tests)
6. [Déploiement](#déploiement)

---

## ✅ Prérequis

- Node.js >= 14
- MySQL/MariaDB
- Application Wathiqati déjà en cours d'exécution
- Accès administrateur à la base de données

---

## 📦 Installation Backend

### Étape 1: Vérifier les fichiers

Les fichiers suivants ont été créés/modifiés:

```
backend/
├── models/
│   └── request.js                    (✏️ MODIFIÉ - champ trackingStatus ajouté)
├── services/
│   └── trackingService.js            (✨ NOUVEAU)
├── controllers/
│   └── requestController.js          (✏️ MODIFIÉ - 4 nouvelles fonctions)
├── routes/
│   └── requests.js                   (✏️ MODIFIÉ - 4 nouvelles routes)
└── scripts/
    └── migrate-add-tracking-status.js (✨ NOUVEAU)
```

### Étape 2: Vérifier les imports

Assurez-vous que le contrôleur importe TrackingService:

```bash
# Cela devrait être fait automatiquement mais vérifiez:
grep -n "TrackingService" backend/controllers/requestController.js
```

---

## 🗄️ Migration DB

### Étape 1: Préparation

```bash
cd backend
```

### Étape 2: Exécuter la migration

```bash
# Option 1: Via Node
node -e "require('./scripts/migrate-add-tracking-status.js').runMigration()"

# Option 2: Via npm (si package.json configure)
npm run migrate:tracking
```

### Étape 3: Vérifier la migration

```bash
# Connexion à MySQL
mysql -u root -p

# Dans MySQL:
USE wathiqati_db;
DESCRIBE requests;

# Vous devriez voir la colonne trackingStatus
```

### Résultat attendu:

```sql
mysql> DESCRIBE requests;
+------------------+------------------+------+-----+---------+-------+
| Field            | Type             | Null | Key | Default | Extra |
+------------------+------------------+------+-----+---------+-------+
| ...              | ...              | ...  | ... | ...     | ...   |
| trackingStatus   | enum(...)        | NO   |     | submitted | ...   |
| ...              | ...              | ...  | ... | ...     | ...   |
+------------------+------------------+------+-----+---------+-------+
```

---

## 📱 Installation Frontend

### Étape 1: Vérifier les composants

Les fichiers suivants ont été créés:

```
frontend/src/
├── components/
│   ├── RequestTrackingTimeline.jsx   (✨ NOUVEAU)
│   └── AdminTrackingManager.jsx      (✨ NOUVEAU)
└── pages/
    └── RequestDetails.jsx             (✏️ MODIFIÉ - Timeline intégrée)
    └── AdminRequestDetail.jsx         (✏️ MODIFIÉ - Manager intégré)
```

### Étape 2: Vérifier les imports

```bash
# Dans RequestDetails.jsx
grep "RequestTrackingTimeline" frontend/src/pages/RequestDetails.jsx

# Dans AdminRequestDetail.jsx
grep "AdminTrackingManager" frontend/src/pages/AdminRequestDetail.jsx
```

### Étape 3: Vérifier le fichier .env

```bash
# Vérifiez que le port 5002 est correct
cat frontend/.env | grep REACT_APP_API_URL

# Devrait afficher:
# REACT_APP_API_URL=http://localhost:5002
```

---

## 🧪 Tests

### Test 1: Vérifier le démarrage du backend

```bash
cd backend

# Démarrer le serveur
npm start

# Résultat attendu:
# ✓ Server running on port 5002
# ✓ Database connected
```

### Test 2: Vérifier les routes API

```bash
# Dans une nouvelle fenêtre PowerShell:

# 1. Obtenir le token
$loginResponse = Invoke-WebRequest -Uri "http://localhost:5002/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@example.com","password":"password"}'
$token = ($loginResponse.Content | ConvertFrom-Json).data.token

# 2. Tester l'endpoint GET tracking steps
Invoke-WebRequest -Uri "http://localhost:5002/api/requests/tracking/steps/all" `
  -Headers @{Authorization="Bearer $token"}

# 3. Tester GET tracking d'une demande
$requestId = "YOUR_REQUEST_ID"
Invoke-WebRequest -Uri "http://localhost:5002/api/requests/$requestId/tracking" `
  -Headers @{Authorization="Bearer $token"}
```

### Test 3: Vérifier le démarrage du frontend

```bash
cd frontend

# Démarrer l'application React
npm start

# Résultat attendu:
# ✓ Compiled successfully!
# ✓ You can now view wathiqati-frontend in the browser
# ✓ Listening on http://localhost:3000
```

### Test 4: Tests manuels dans l'interface

1. **En tant qu'utilisateur régulier:**
   - Aller à "Mes demandes"
   - Cliquer sur une demande
   - 👀 Vérifier que la timeline s'affiche sous le titre
   - ✓ Timeline doit montrer l'étape actuelle

2. **En tant qu'admin:**
   - Aller à "Tableau de bord Admin"
   - Cliquer sur une demande
   - 👀 Vérifier que le composant "Gérer le suivi de la demande" est présent
   - ✓ Pouvoir changer le statut de suivi

### Test 5: Vérifier les notifications

```bash
# Dans les logs du serveur, vous devriez voir:
# [Tracking] Updated request {id} to {status}
# Notification sent to user {userId}
```

---

## 📋 Checklist de déploiement

- [ ] Backend démarré sans erreurs
- [ ] Migration DB exécutée avec succès
- [ ] Colonne `trackingStatus` visible dans la DB
- [ ] Routes API répondent correctement
- [ ] Frontend démarré sans erreurs
- [ ] Timeline visible sur RequestDetails
- [ ] AdminTrackingManager visible sur AdminRequestDetail
- [ ] Able to update tracking status as admin
- [ ] User receives notification on tracking update
- [ ] Timeline shows correct progress percentage
- [ ] All icons and colors display correctly

---

## 🔍 Vérification des Erreurs Courantes

### Erreur: "trackingStatus is not defined"
```
Solution: Vérifiez que la migration a été exécutée
Commande: node -e "require('./scripts/migrate-add-tracking-status.js').runMigration()"
```

### Erreur: "Cannot read property 'trackingStatus' of null"
```
Solution: Vérifiez que la demande existe en DB
SELECT * FROM requests WHERE id = 'YOUR_ID';
```

### Erreur: "Tracking endpoints 404"
```
Solution: Vérifiez que les routes sont ajoutées dans requests.js
grep "tracking" backend/routes/requests.js
```

### Erreur: "CORS error on frontend"
```
Solution: Vérifiez que REACT_APP_API_URL est correct
cat frontend/.env
```

### Erreur: "Timeline ne se charge pas"
```
Solution: Vérifiez les logs du navigateur (F12)
Vérifiez que le token JWT est valide
Vérifiez la réponse de /api/requests/{id}/tracking
```

---

## 🚀 Déploiement Production

### Prérequis
- Base de données productionMigration exécutée
- Secrets configurés (.env)
- SSL/TLS activé

### Étapes

1. **Backend**
   ```bash
   npm install  # Réinstaller si nécessaire
   npm start
   # Ou avec PM2:
   pm2 start npm --name "wathiqati-backend" -- start
   ```

2. **Frontend**
   ```bash
   npm run build  # Compiler en production
   npm start      # Ou servir via nginx
   ```

3. **Vérifier les logs**
   ```bash
   pm2 logs wathiqati-backend
   pm2 logs wathiqati-frontend
   ```

---

## 📞 Support & Dépannage

### Logs importants à vérifier

```bash
# Backend logs
cat backend/logs/error.log
cat backend/logs/app.log

# Browser console (F12)
# Vérifier pour les erreurs d'API
```

### Contactez le support avec:
- ✓ Message d'erreur exact
- ✓ Logs du serveur
- ✓ Requête HTTP (curl command)
- ✓ Version de Node.js: `node --version`
- ✓ Version de MySQL: `mysql --version`

---

## ✅ Vérification Finale

```bash
# 1. Backend running?
curl http://localhost:5002/health

# 2. Frontend running?
curl http://localhost:3000

# 3. DB accessible?
mysql -u root -p -e "SELECT * FROM wathiqati_db.requests LIMIT 1;"

# 4. Tracking column exists?
mysql -u root -p -e "DESCRIBE wathiqati_db.requests;" | grep trackingStatus
```

**Tout devrait retourner des résultats positifs! ✅**

---

**Besoin d'aide?** Consultez [TRACKING_FEATURE_DOCUMENTATION.md](./TRACKING_FEATURE_DOCUMENTATION.md)

