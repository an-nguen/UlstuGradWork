export const CONSTANTS = {
  SIZE: {
    DIALOG_MIN_WIDTH_PX: '80vw',
  },
  ENDPOINTS: {
    EXPLORER: 'all-books',
    AUTH: {
      PATH: 'auth',
      SIGN_IN: 'sign-in',
    },
    RECENT_BOOKS: '',
    NO_CONNECTION: 'no-connection',
    VIEWER: 'viewer/:id',
    EDIT_DETAILS: 'edit/:id',
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
  REGEX_PATTERN: {
    PIN_CODE: '^[0-9]{4,16}$',
  },
  PAGE_SIZE: 7,
};
