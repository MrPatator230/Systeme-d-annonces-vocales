# Système d'annonces vocales SNCF

Système de génération d'annonces sonores SNCF avec la voix de E-Mone. Cette application permet de gérer une banque de sons, créer des annonces personnalisées et gérer une liste d'annonces.

## Fonctionnalités

- 🎵 **Banque de sons**
  - Import de fichiers audio (MP3, WAV)
  - Catégorisation des fichiers
  - Lecture, renommage et suppression des fichiers
  - Organisation par catégories

- 🎙️ **Conception d'annonces**
  - Interface drag & drop pour la composition
  - Prévisualisation audio
  - Concaténation de fichiers
  - Export des annonces finales

- 📋 **Liste des annonces**
  - Gestion des annonces créées
  - Lecture et téléchargement
  - Suppression d'annonces

## Prérequis

- Node.js 18+
- FFmpeg (pour la manipulation audio)
- npm ou yarn

## Installation

1. Cloner le dépôt :
   ```bash
   git clone https://github.com/votre-username/systeme-annonces-vocales.git
   cd systeme-annonces-vocales
   ```

2. Installer les dépendances :
   ```bash
   npm install
   # ou
   yarn install
   ```

3. Créer le dossier pour les fichiers audio :
   ```bash
   mkdir -p public/audio
   ```

4. Démarrer le serveur de développement :
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

5. Ouvrir [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Structure des fichiers

```
systeme-annonces-vocales/
├── app/                    # Pages et routes Next.js
│   ├── admin/             # Interface d'administration
│   └── api/               # Routes API
├── components/            # Composants React réutilisables
├── config/               # Configuration de l'application
├── contexts/             # Contextes React
├── public/              # Fichiers statiques
│   └── audio/           # Fichiers audio
├── services/            # Services métier
└── utils/               # Utilitaires
```

## Technologies utilisées

- Next.js 13+ (App Router)
- React 18
- TypeScript
- Tailwind CSS
- FFmpeg pour le traitement audio
- DND Kit pour le drag & drop

## Contribution

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit les changements (`git commit -m 'Add amazing feature'`)
4. Push la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.
