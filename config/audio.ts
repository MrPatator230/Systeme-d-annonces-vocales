export type AudioCategory = 'Non classé' | 'Annonces' | 'Stations' | 'Horaires' | 'Messages' | 'Effets sonores'

export interface AudioFile {
  name: string
  path: string
  category?: AudioCategory
  createdAt: string
}

export interface Folder {
  name: string
  path: string
  createdAt: string
}

export interface AudioMetadata {
  folders: {
    [path: string]: {
      name: string
      createdAt: string
    }
  }
  files: {
    [path: string]: {
      name: string
      category?: AudioCategory
      createdAt: string
    }
  }
}

export const AUDIO_CONFIG = {
  storage: {
    basePath: '/audio',
    rootFolder: '/audio',
    categories: [
      'Non classé',
      'Annonces',
      'Stations',
      'Horaires',
      'Messages',
      'Effets sonores'
    ] as AudioCategory[],
    defaultCategory: 'Non classé' as AudioCategory
  },
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'audio/mpeg',
      'audio/wav',
      'audio/wave'
    ],
    allowedExtensions: ['mp3', 'wav'],
    allowedTypes: '.mp3,.wav'
  },
  player: {
    volume: 0.75
  }
}

export const ERROR_MESSAGES = {
  UPLOAD: {
    FILE_TOO_LARGE: 'Le fichier est trop volumineux (max 10MB)',
    INVALID_TYPE: 'Format de fichier non supporté (MP3 ou WAV uniquement)',
    GENERIC: 'Erreur lors de l\'upload du fichier'
  },
  DELETE: {
    NOT_FOUND: 'Fichier non trouvé',
    GENERIC: 'Erreur lors de la suppression du fichier'
  },
  RENAME: {
    INVALID_NAME: 'Nom de fichier invalide',
    ALREADY_EXISTS: 'Un fichier avec ce nom existe déjà',
    GENERIC: 'Erreur lors du renommage du fichier'
  },
  CATEGORY: {
    INVALID: 'Catégorie invalide',
    UPDATE_FAILED: 'Erreur lors de la mise à jour de la catégorie'
  },
  CONCATENATE: {
    NO_FILES: 'Aucun fichier sélectionné',
    INVALID_OUTPUT: 'Nom de fichier de sortie invalide',
    GENERIC: 'Erreur lors de la concaténation des fichiers'
  },
  PLAYBACK: {
    LOAD_ERROR: 'Erreur lors du chargement du fichier audio',
    PLAY_ERROR: 'Erreur lors de la lecture du fichier audio',
    NOT_SUPPORTED: 'Format audio non supporté'
  }
}
