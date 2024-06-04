export const CONSTANTS = {
  SIZE: {
    DIALOG_MIN_WIDTH: '80vw',
    TRANSLATION_DIALOG_MIN_WIDTH: '80vw',
    TRANSLATION_DIALOG_MIN_HEIGHT: '60vh',
    TEXT_SUM_MAX_SIZE: 5000
  },
  ENDPOINTS: {
    EXPLORER: 'all-books',
    AUTH: {
      PATH: 'auth',
      SIGN_IN: 'sign-in',
    },
    RECENT_BOOKS: '',
    BOOK_COLLECTIONS: 'collections',
    NO_CONNECTION: 'no-connection',
    VIEWER: 'viewer/:id',
    EDIT_DETAILS: 'edit/:id',
    USER_SETTINGS: 'settings'
  },
  SERVER_URL: {
    BOOKS: {
      PATH: 'books',
    },
    AUTH: {
      PATH: 'auth',
      SIGN_IN: 'sign-in',
      SIGN_OUT: 'sign-out',
      REFRESH_TOKEN: 'refresh-token',
    },
    USERS: {
      PATH: 'users',
    },
  },
  TEXTS: {
    BOOK_DELETE_CONFIRMATION_MESSAGE: 'Вы уверены, что хотите удалить электронную книгу из базы данных?',
    BOOK_COLLECTION_DEL_CONFIRM_MESSAGE: 'Вы уверены, что хотите удалить коллекцию книг?',
    FORM_REQUIRED_ERROR_MESSAGE: 'Обязателен к заполнению'
  },
  REGEX_PATTERN: {
    PIN_CODE: '^[0-9]{4,16}$',
    DICTIONARY_WORD: `^([\\p{L}-]*)( ?)([\\p{L}-]*)$`
  },
  TOTAL_TIME_UPDATE_INTERVAL_IN_SEC: 60, // 1 minute
  PAGE_SIZE: 7,
};
