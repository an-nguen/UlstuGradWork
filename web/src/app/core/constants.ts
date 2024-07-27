import { SortOption } from "./components/sort-menu/sort-menu.component";
import { SortOrder } from "./dtos/BookManager.Application.Common.DTOs";

export const PIN_CODE_REGEX = '^[0-9]{4,16}$';
export const DICTIONARY_WORD_REGEX = `^([\\p{L}-]*)( ?)([\\p{L}-]*)$`;
export const TEXT_SUM_MAX_SIZE = 5000;
export const TRANSLATION_TEXT_MAX_LENGTH = 1000;

export class ServerPaths {
  public static readonly BOOKS = {
    PATH: 'books',
  };
  public static readonly AUTH = {
    PATH: 'auth',
    SIGN_IN: 'sign-in',
    SIGN_OUT: 'sign-out',
    REFRESH_TOKEN: 'refresh-token',
  };
  public static readonly USERS = {
    PATH: 'users',
  };
}

export const enum RoutePaths {
  EXPLORER = 'all-books',
  AUTH = 'auth',
  SIGN_IN = 'auth/sign-in',
  RECENT_BOOKS = '',
  BOOK_COLLECTIONS = 'collections',
  DICTIONARY = 'dictionary',
  NO_CONNECTION = 'no-connection',
  VIEWER = 'viewer/:id',
  EDIT_DETAILS = 'edit/:id',
  USER_SETTINGS = 'settings',
}

export const enum Dimensions {
  DIALOG_MIN_WIDTH = '80vw',
  TRANSLATION_DIALOG_MIN_WIDTH = '80vw',
  TRANSLATION_DIALOG_MIN_HEIGHT = '60vh',
}

export class Defaults {

  public static readonly DEFINITION_PROVIDER: string = 'MerriamWebster';
  public static readonly SORT_ORDER: SortOrder = SortOrder.Asc;
  public static readonly SORT_OPTION: SortOption = {
    value: 'recent_access',
    name: 'По посл. открытию',
  };
  public static readonly PAGE_SIZE: number = 7;

}

export const enum Strings {
  BOOK_DELETE_CONFIRMATION = 'Вы уверены, что хотите удалить электронную книгу из базы данных?',
  BOOK_COLLECTION_DEL_CONFIRM = 'Вы уверены, что хотите удалить коллекцию книг?',
  FORM_REQUIRED_ERROR = 'Обязателен к заполнению',
}

export const enum StorageKeyStrings {
  SORT_OPTION = 'library-explorer-sort-option',
  SORT_ORDER = 'library-explorer-sort-order',
  VIEW_MODE = 'library-explorer-view-mode',
  TICKET_ID = 'libmgr_device_ticket_id',
};