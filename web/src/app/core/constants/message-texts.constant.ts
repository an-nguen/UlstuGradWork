import { MessageType } from "@core/enums/message-type.enum";

export const MESSAGE_TEXTS = {
  [MessageType.BookDeleteConfirmation]: 'Вы уверены, что хотите удалить электронную книгу из базы данных?',
  [MessageType.BookCollectionDeleteConfirmation]: 'Вы уверены, что хотите удалить коллекцию книг?'
} as const;