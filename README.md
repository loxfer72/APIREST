# APIREST

API REST pour la gestion des outils SaaS internes de TechCorp Solutions.

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

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/api/tools` | Liste avec filtres, pagination, tri |
| GET | `/api/tools/:id` | Détail + métriques d'usage |
| POST | `/api/tools` | Créer un outil |
| PUT | `/api/tools/:id` | Mettre à jour un outil |

### Filtres disponibles sur GET /api/tools

```
GET /api/tools?department=Engineering&status=active
GET /api/tools?min_cost=5&max_cost=50
GET /api/tools?category=Development&sort_by=monthly_cost&order=DESC
GET /api/tools?page=2&limit=10
```

## Tests

```bash
npm test
```

## Architecture

```
src/
├── config/       # Connexion Sequelize + pool
├── models/       # Modèles ORM (Tool, Category, UsageLog)
├── validators/   # Schémas Joi (validation des inputs)
├── middlewares/  # errorHandler centralisé + validate
├── controllers/  # Reçoit req/res, délègue au service
├── services/     # Logique métier, filtres, métriques
├── routes/       # Définition des endpoints
└── swagger/      # Configuration OpenAPI
```

**Justification des choix techniques :**
- **Express** : framework minimaliste et flexible, idéal pour une API REST
- **Sequelize** : ORM mature avec support natif MySQL, pool de connexions intégré, et associations déclaratives
- **Joi** : validation expressible et lisible, messages d'erreur personnalisables par champ
- **Swagger-jsdoc** : génération de la doc depuis les annotations JSDoc, évite la duplication