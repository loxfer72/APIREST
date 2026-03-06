# APIREST

API REST pour la gestion et l'analytics des outils SaaS internes de TechCorp Solutions.

## Technologies

| Composant | Choix |
|-----------|-------|
| Langage | Node.js 18+ |
| Framework | Express 4 |
| ORM | Sequelize 6 |
| Base de données | MySQL 8 (Docker) |
| Validation | Joi 17 |
| Documentation | Swagger / OpenAPI 3 |
| Tests | Jest + Supertest |

## Quick Start

**1. Démarrer la base de données (depuis le dossier back_env)**
```bash
docker-compose --profile mysql up -d
```

**2. Installer les dépendances et configurer l'environnement**
```bash
npm install
cp .env.example .env
```

**3. Démarrer le serveur**
```bash
npm run dev       # développement (hot reload)
npm start         # production
```

L'API est disponible sur **http://localhost:3000**
La documentation Swagger est sur **http://localhost:3000/api/docs**

## Configuration

Variables d'environnement (fichier `.env`) :

| Variable | Description | Défaut |
|----------|-------------|--------|
| `PORT` | Port du serveur API | `3000` |
| `DB_HOST` | Hôte MySQL | `localhost` |
| `DB_PORT` | Port MySQL | `3306` |
| `DB_NAME` | Nom de la base | `internal_tools` |
| `DB_USER` | Utilisateur | `dev` |
| `DB_PASSWORD` | Mot de passe | `dev123` |

## Endpoints

### CRUD Outils

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/tools` | Liste avec filtres, pagination, tri |
| GET | `/api/tools/:id` | Détail + métriques d'usage 30 jours |
| POST | `/api/tools` | Créer un outil |
| PUT | `/api/tools/:id` | Mettre à jour un outil |

### Filtres disponibles sur GET /api/tools

```
GET /api/tools?department=Engineering&status=active
GET /api/tools?min_cost=5&max_cost=50
GET /api/tools?category=Development&sort_by=monthly_cost&order=DESC
GET /api/tools?page=2&limit=10
```

### Analytics

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/analytics/department-costs` | Répartition des coûts par département |
| GET | `/api/analytics/expensive-tools` | Top outils coûteux avec efficiency rating |
| GET | `/api/analytics/tools-by-category` | Répartition des outils par catégorie |
| GET | `/api/analytics/low-usage-tools` | Outils sous-utilisés + économies potentielles |
| GET | `/api/analytics/vendor-summary` | Analyse consolidée par fournisseur |

### Filtres disponibles sur les endpoints analytics

```
GET /api/analytics/department-costs?sort_by=total_cost&order=ASC
GET /api/analytics/expensive-tools?limit=5&min_cost=50
GET /api/analytics/low-usage-tools?max_users=3
```

## Approche Analytics

Tous les calculs analytics n'incluent que les outils avec `status = 'active'`.

**Efficiency rating** (expensive-tools) — basé sur le ratio `cost_per_user` vs moyenne entreprise :
- `excellent` : < 50% de la moyenne
- `good` : 50–80% de la moyenne
- `average` : 80–120% de la moyenne
- `low` : > 120% de la moyenne — outils à 0 utilisateurs inclus automatiquement

**Warning level** (low-usage-tools) — basé sur le `cost_per_user` absolu :
- `low` : < 20€/utilisateur
- `medium` : 20–50€/utilisateur
- `high` : > 50€/utilisateur — outils à 0 utilisateurs inclus automatiquement

**Économies potentielles** : somme des coûts des outils `high` + `medium`, annualisée × 12.

**Gestion division par zéro** : tous les calculs impliquant `active_users_count` sont protégés — un outil à 0 utilisateurs ne provoque jamais d'erreur serveur.

## Tests

```bash
npm test
```

Les tests couvrent les cas nominaux et les edge cases : pourcentages totalisant 100%, tri décroissant vérifié, `annual_savings = monthly_savings × 12`, départements vendors triés sans doublons.

## Architecture

```
src/
├── config/       # Connexion Sequelize + pool
├── models/       # Modèles ORM (Tool, Category, UsageLog)
├── validators/   # Schémas Joi — validation body (tools) et query params (analytics)
├── middlewares/  # errorHandler centralisé + validate
├── controllers/  # Reçoit req/res, délègue au service
├── services/     # Logique métier, filtres, métriques, calculs analytics
├── routes/       # Définition des endpoints (tools + analytics)
└── swagger/      # Configuration OpenAPI 3 — schémas Tools et Analytics
```

**Justification des choix techniques :**
- **Express** : framework minimaliste et flexible, idéal pour une API REST
- **Sequelize** : ORM mature avec support natif MySQL, pool de connexions intégré, associations déclaratives et agrégations (`fn('SUM')`, `fn('COUNT')`)
- **Joi** : validation expressible et lisible, messages d'erreur personnalisables par champ, réutilisable pour body et query params
- **Swagger-jsdoc** : génération de la doc depuis les annotations JSDoc, évite la duplication entre le code et la documentation