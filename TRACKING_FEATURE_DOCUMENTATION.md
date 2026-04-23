# 📍 Fonctionnalité de Suivi de Demande - Localisation

## 📋 Vue d'ensemble

Cette fonctionnalité permet aux utilisateurs de suivre l'étape actuelle de leur demande de document et aux administrateurs de gérer ce suivi. Elle affiche une timeline visuelle des étapes de traitement.

---

## 🎯 Étapes de Suivi

### Étapes disponibles:

| Code | Étape | Description | Icône |
|------|-------|-------------|-------|
| `submitted` | 📄 Demande soumise | Votre demande a été soumise au service | FileText |
| `in_processing` | ⏳ En traitement | Votre demande est en cours de traitement | Clock |
| `under_validation` | 🔍 En cours de validation | Votre demande est validée par l'administration | CheckCircle |
| `validated` | ✅ Validée | Votre demande a été validée avec succès | Check |
| `ready_for_pickup` | 📦 Prête à être récupérée | Votre document est prêt à être récupéré | Package |
| `rejected` | ❌ Rejetée | Votre demande a été rejetée | X |

---

## 🔧 Installation & Configuration

### 1️⃣ **Exécuter la migration**

Avant de démarrer l'application, exécutez le script de migration:

```bash
cd backend
node -e "require('./scripts/migrate-add-tracking-status.js').runMigration()"
```

Ou via npm (si configuré):
```bash
npm run migrate:tracking
```

### 2️⃣ **Vérifier les modèles**

Le modèle `Request` a été mis à jour avec le champ:
```javascript
trackingStatus: {
  type: DataTypes.ENUM('submitted', 'in_processing', 'under_validation', 'validated', 'ready_for_pickup', 'rejected'),
  defaultValue: 'submitted',
  allowNull: false,
}
```

### 3️⃣ **Services Backend**

Un nouveau service `trackingService.js` gère la logique du suivi:

```javascript
// Services disponibles:
- getAllSteps()              // Récupère toutes les étapes
- getRequestTracking()       // Obtient le suivi d'une demande
- updateTrackingStatus()     // Met à jour le statut (admin)
- syncTrackingStatus()       // Sync auto avec le statut principal
- getTrackingHistory()       // Historique des changements
```

---

## 🔌 API Endpoints

### Endpoints REST

#### 1. **Obtenir toutes les étapes**
```
GET /api/requests/tracking/steps/all
Headers: Authorization: Bearer {token}
Response:
{
  "success": true,
  "data": [
    {
      "key": "submitted",
      "order": 1,
      "label": "Demande soumise",
      "description": "...",
      "icon": "FileText",
      "color": "blue"
    },
    ...
  ]
}
```

#### 2. **Obtenir le suivi d'une demande**
```
GET /api/requests/{requestId}/tracking
Headers: Authorization: Bearer {token}
Response:
{
  "success": true,
  "data": {
    "requestId": "uuid",
    "currentStatus": "in_processing",
    "currentStep": {...},
    "steps": [
      {
        "key": "submitted",
        "order": 1,
        "label": "...",
        "completed": true,
        "current": false
      },
      ...
    ],
    "progress": 40,
    "updatedAt": "2024-04-23T..."
  }
}
```

#### 3. **Mettre à jour le suivi** (Admin/Employee)
```
PUT /api/requests/{requestId}/tracking
Headers: Authorization: Bearer {token}
Body:
{
  "trackingStatus": "under_validation",
  "notes": "Envoyé pour validation par le département administratif"
}
Response:
{
  "success": true,
  "message": "Tracking status updated successfully",
  "data": {...updated request...}
}
```

#### 4. **Obtenir l'historique de suivi**
```
GET /api/requests/{requestId}/tracking/history
Headers: Authorization: Bearer {token}
Response:
{
  "success": true,
  "data": {
    "requestId": "uuid",
    "history": [
      "[2024-04-23T10:00:00Z] Statut: submitted → in_processing",
      "[2024-04-23T11:30:00Z] Statut: in_processing → under_validation",
      ...
    ]
  }
}
```

---

## 🎨 Composants Frontend

### 1. **RequestTrackingTimeline** (Public)
Composant affichant la timeline du suivi pour les utilisateurs.

```jsx
import RequestTrackingTimeline from '../components/RequestTrackingTimeline';

<RequestTrackingTimeline requestId={requestId} />
```

**Fonctionnalités:**
- Affiche la timeline visuelle
- Indique l'étape actuelle
- Montre la barre de progression
- Permet de rafraîchir le suivi
- Responsive et multilingue

### 2. **AdminTrackingManager** (Admin)
Interface pour les administrateurs pour gérer le suivi.

```jsx
import AdminTrackingManager from '../components/AdminTrackingManager';

<AdminTrackingManager 
  requestId={requestId}
  onUpdate={(updatedRequest) => {
    // Callback après mise à jour
  }}
  onClose={() => {
    // Callback de fermeture
  }}
/>
```

**Fonctionnalités:**
- Sélectionner la nouvelle étape
- Ajouter des notes optionnelles
- Envoyer des notifications utilisateur
- Historique des changements dans adminNotes

---

## 📱 Intégration dans les pages

### **RequestDetails.jsx** (Utilisateur)
Le composant `RequestTrackingTimeline` est intégré pour afficher le suivi.

```jsx
import RequestTrackingTimeline from '../components/RequestTrackingTimeline';

// Dans le rendu:
<Card>
  <CardContent className="pt-6">
    <RequestTrackingTimeline requestId={id} />
  </CardContent>
</Card>
```

### **AdminRequestDetail.jsx** (Admin)
Le composant `AdminTrackingManager` est intégré pour gérer le suivi.

```jsx
import AdminTrackingManager from '../components/AdminTrackingManager';

// Dans le rendu:
<Card>
  <CardContent className="pt-6">
    <AdminTrackingManager 
      requestId={id}
      onUpdate={(updatedRequest) => {
        setRequest(updatedRequest);
      }}
    />
  </CardContent>
</Card>
```

---

## 💬 Notifications Utilisateur

Quand le suivi est mis à jour par un admin:

1. ✉️ **Notification dans la base de données**
   - Type: `request_tracking_updated`
   - Message: `"Le statut de votre demande est maintenant: [Nom de l'étape]"`

2. 🔔 **Email** (si configuré)
   - Sujet: "Mise à jour de votre demande de document"
   - Contenu: Détails du nouveau statut

---

## 🔄 Automatisation

### Synchronisation Auto du Statut

Quand le statut principal de la demande change, le `trackingStatus` est automatiquement synchronisé:

| Status Demande | → | Tracking Status |
|---|---|---|
| `pending` | → | `submitted` |
| `in_review` | → | `in_processing` |
| `approved` | → | `validated` |
| `document_generated` | → | `ready_for_pickup` |
| `rejected` | → | `rejected` |

---

## 📊 Exemple de Workflow Complet

```
1. Utilisateur crée une demande
   ↓ trackingStatus = "submitted"
   ↓ Notification: "Demande soumise"

2. Admin clique sur "Commencer l'examen"
   ↓ trackingStatus = "in_processing"
   ↓ Status = "in_review"
   ↓ Notification: "En cours de traitement"

3. Admin met à jour manuellement vers "under_validation"
   ↓ trackingStatus = "under_validation"
   ↓ Notification: "En cours de validation par l'administration"

4. Admin approuve la demande
   ↓ trackingStatus = "validated"
   ↓ Status = "approved"
   ↓ PDF généré
   ↓ Notification: "Validée par l'administration"

5. Document prêt
   ↓ trackingStatus = "ready_for_pickup"
   ↓ Status = "document_generated"
   ↓ Notification: "Prête à être récupérée"

6. Utilisateur récupère le document ✓
```

---

## 🔐 Permissions

### Accès Utilisateur
- ✅ Voir son propre tracking
- ✅ Voir l'historique
- ❌ Modifier le tracking

### Accès Admin/Employee
- ✅ Voir tous les trackings
- ✅ Mettre à jour le tracking
- ✅ Voir l'historique complet
- ✅ Ajouter des notes

### Accès Public
- ❌ Aucun accès (endpoint sécurisé)

---

## 🐛 Dépannage

### Migration échoue
```bash
# Vérifier la base de données
mysql -u root -p
USE wathiqati_db;
DESCRIBE requests;
```

### Timeline ne s'affiche pas
- Vérifier que `Authorization` header est présent
- Vérifier le token JWT est valide
- Vérifier la requête GET `/api/requests/{id}/tracking` retourne 200

### Les notifications ne s'envoient pas
- Vérifier que `NotificationService` est configuré
- Vérifier les logs du serveur
- Vérifier que l'utilisateur a un email valide

---

## 📝 Notes d'implémentation

### Points importants

1. **Historique**: L'historique complet est stocké dans `adminNotes` avec timestamps
2. **Autoformation**: Le tracking se sync auto avec le statut principal
3. **Notifications**: Les utilisateurs reçoivent une notification à chaque mise à jour
4. **Permissions**: Seuls les admins/employees peuvent mettre à jour le tracking
5. **Timeline**: Affiche visuellement la progression avec couleurs et icônes

---

## 🚀 Prochaines Améliorations Possibles

- [ ] SMS notifications
- [ ] Webhooks pour intégrations externes
- [ ] API pour statut en temps réel
- [ ] Analytics du tracking
- [ ] Export historique en PDF
- [ ] Templates de notes personnalisées
- [ ] Auto-progression (ex: auto-passer à "ready_for_pickup" après génération)

---

## 📞 Support

Pour toute question ou problème:
1. Consulter les logs serveur: `backend/logs/`
2. Vérifier la base de données
3. Vérifier les permissions utilisateur
4. Contacter l'administrateur système

---

**Version**: 1.0  
**Date**: Avril 2024  
**Auteur**: Wathiqati Dev Team
