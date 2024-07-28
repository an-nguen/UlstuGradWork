import { SortOption } from "@core/components/sort-menu/sort-menu.component";
import { SortOrder } from "@core/dtos/BookManager.Application.Common.DTOs";

export const DEFAULT_DEFINITION_PROVIDER: string = 'MerriamWebster';
export const DEFAULT_PAGE_SIZE: number = 7;
export const DEFAULT_SORT_ORDER: SortOrder = SortOrder.Asc;
export const DEFAULT_SORT_OPTION: SortOption = {
  value: 'recent_access',
  name: 'По посл. открытию',
};
export const DEFAULT_TEXT_SUM_MAX_SIZE = 5000;
export const DEFAULT_TRANSLATION_TEXT_MAX_LENGTH = 1000;