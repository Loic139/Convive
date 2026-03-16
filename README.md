# 🍽 Convive

Organisez vos repas entre amis, sans prise de tête.

Convive est une application web permettant à un organisateur de proposer un repas avec un nombre de places limité, partageable via un lien unique. Les invités réservent leur place selon le principe **first in, first served**.

---

## Stack technique

| Élément | Technologie |
|---|---|
| Frontend | Nuxt.js 3 (Vue 3 + TypeScript) |
| Backend / BDD | Supabase (PostgreSQL + Auth + Realtime) |
| Hébergement Frontend | Vercel |
| Emails | Resend |
| CSS | Tailwind CSS |
| i18n | @nuxtjs/i18n (français par défaut) |

---

## Prérequis

- Node.js 20+
- Un projet [Supabase](https://supabase.com) (gratuit)
- Un compte [Resend](https://resend.com) (gratuit jusqu'à 3000 emails/mois)
- Un compte [Vercel](https://vercel.com) pour le déploiement

---

## Installation locale

### 1. Cloner le dépôt

```bash
git clone https://github.com/votre-username/convive.git
cd convive
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Remplir le `.env` avec vos credentials :

```env
# Supabase — trouvez ces valeurs dans Settings > API
SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...    # anon/public key
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # service_role key

# Resend — trouvez votre clé dans https://resend.com/api-keys
NUXT_RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Email expéditeur (doit être vérifié dans Resend)
NUXT_RESEND_FROM_EMAIL=noreply@votre-domaine.com
NUXT_RESEND_FROM_NAME=Convive

# URL de votre app (utilisée dans les emails)
NUXT_PUBLIC_APP_URL=http://localhost:3000

# Secret pour le cron endpoint Vercel (générez une chaîne aléatoire)
NUXT_CRON_SECRET=votre-secret-aleatoire-long
```

### 4. Appliquer les migrations Supabase

Dans le dashboard Supabase → **SQL Editor**, exécutez le fichier :

```
supabase/migrations/001_initial.sql
```

Ou avec la CLI Supabase :

```bash
npx supabase db push
```

### 5. Lancer en développement

```bash
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000).

---

## Structure du projet

```
convive/
├── assets/css/         # Styles globaux Tailwind
├── components/
│   ├── events/         # EventCard, SeatIndicator, EventForm
│   ├── layout/         # AppNav, AppFooter
│   └── ui/             # Button, Input, Modal, Toast, etc.
├── composables/        # useToast, useSlug, useEventStatus
├── layouts/            # default, auth, public
├── locales/            # fr.json, en.json (i18n)
├── middleware/         # auth, guest
├── pages/
│   ├── index.vue       # Landing page
│   ├── login.vue       # Connexion
│   ├── register.vue    # Inscription
│   ├── dashboard.vue   # Dashboard organisateur
│   ├── profile.vue     # Profil + mes réservations
│   ├── events/
│   │   ├── new.vue         # Créer un repas
│   │   └── [id]/
│   │       ├── index.vue   # Gérer un repas
│   │       └── edit.vue    # Modifier un repas
│   └── e/
│       └── [slug].vue  # Page publique du repas ⭐
├── server/
│   ├── api/
│   │   ├── reservations/   # POST /, POST /[id]/cancel
│   │   ├── events/[id]/    # POST /cancel, PUT /update
│   │   └── cron/           # GET /reminders
│   └── utils/              # email.ts, supabase.ts
├── supabase/migrations/    # Schema SQL + RLS + triggers
└── types/                  # TypeScript types
```

---

## Déploiement sur Vercel

### 1. Importer le projet sur Vercel

```bash
npx vercel
```

Ou connectez votre dépôt GitHub depuis [vercel.com/new](https://vercel.com/new).

### 2. Configurer les variables d'environnement

Dans Vercel → Settings → Environment Variables, ajoutez toutes les variables du `.env.example`.

### 3. Build & Deploy

Le déploiement se fait automatiquement à chaque push sur `main`.

### Cron job (rappels J-1)

Le fichier `vercel.json` configure un cron qui s'exécute chaque jour à 8h UTC :

```json
{
  "crons": [
    {
      "path": "/api/cron/reminders",
      "schedule": "0 8 * * *"
    }
  ]
}
```

Pour sécuriser ce endpoint, définissez `NUXT_CRON_SECRET` et configurez le header `Authorization: Bearer <secret>` dans Vercel Cron → Advanced.

---

## Configuration Supabase

### Auth

Dans Supabase → Authentication → Settings :
- Activer **Email confirmations** (recommandé en production)
- Configurer **Site URL** : `https://votre-app.vercel.app`
- Ajouter **Redirect URLs** : `https://votre-app.vercel.app/**`

### Realtime

Dans Supabase → Database → Replication, activer **Realtime** pour la table `reservations`.

### Emails Supabase Auth

Dans Supabase → Authentication → Email Templates, personnalisez les templates de confirmation et magic link avec votre branding.

---

## Variables d'environnement

| Variable | Description | Requis |
|---|---|---|
| `SUPABASE_URL` | URL de votre projet Supabase | ✅ |
| `SUPABASE_KEY` | Clé publique (anon) Supabase | ✅ |
| `SUPABASE_SERVICE_KEY` | Clé service role Supabase (serveur uniquement) | ✅ |
| `NUXT_RESEND_API_KEY` | Clé API Resend pour les emails | ✅ |
| `NUXT_RESEND_FROM_EMAIL` | Email expéditeur vérifié dans Resend | ✅ |
| `NUXT_RESEND_FROM_NAME` | Nom affiché dans les emails | ✅ |
| `NUXT_PUBLIC_APP_URL` | URL publique de l'app (pour les liens dans emails) | ✅ |
| `NUXT_CRON_SECRET` | Secret pour sécuriser le endpoint cron | Recommandé |

---

## Fonctionnalités MVP

- ✅ Authentification email/password + magic link
- ✅ Création et gestion de repas (1 événement = 1 date)
- ✅ Page publique partageable (`/e/[slug]`)
- ✅ Réservation avec temps réel (Supabase Realtime)
- ✅ Annulation par l'organisateur et par l'invité
- ✅ Emails : confirmation, rappel J-1, annulation, mise à jour
- ✅ Dashboard organisateur
- ✅ Profil invité avec historique de réservations
- ✅ i18n configuré (français + structure anglais)
- ✅ Design mobile-first (palette beige/terracotta/vert sauge)
- ✅ RLS Supabase sur toutes les tables
- ✅ Cron Vercel pour les rappels J-1

---

## Licence

Confidentiel — © Loïc 2026
