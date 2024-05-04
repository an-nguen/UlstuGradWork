export const CONSTANTS = {
  ERROR_MESSAGES: {
    DESKTOP_FRAMEWORK_ERROR:
      'This application is intended for work in desktop frameworks.',
  },
  ENDPOINTS: {
    EXPLORER: '',
    AUTH: {
      PATH: 'auth',
      SIGN_IN: 'sign-in'
    },
    NO_CONNECTION: 'no-connection',
    VIEWER: 'viewer/:id',
    EDIT_DETAILS: 'edit/:id'
  },
  SERVER_URL: {
    BOOKS: {
      PATH: 'books'
    },
    AUTH: {
      PATH: 'auth',
      SIGN_IN: 'sign-in',
      SIGN_OUT: 'sign-out',
      REFRESH_TOKEN: 'refresh-token'
    },
    USERS: {
      PATH: 'users'
    }
  },
  REGEX_PATTERN: {
    PIN_CODE: '^[0-9]{4,16}$'
  }
};
