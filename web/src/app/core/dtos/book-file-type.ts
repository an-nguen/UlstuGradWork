import { BookFileType } from "./BookManager.Domain.Enums";

export function getBookFileType(fileTypeString: string): BookFileType {
  switch (fileTypeString) {
  case 'application/pdf':
  case '.pdf':
    return BookFileType.Pdf;
  case 'application/epub':
  case '.epub':
    return BookFileType.Epub;
  default:
    throw new Error(`This file type is not supported! ${fileTypeString}`);
  }
}