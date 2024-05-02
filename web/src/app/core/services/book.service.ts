import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BookService {
  constructor(private readonly _window: Window) { }

  public override async getBookDocuments(): Promise<BookReply[]> {
    return this._window.electronAPI!.getBookDocuments();
  }

  public override getBookDocumentById(id: string): Promise<BookReply> {
    return this._window.electronAPI!.getBookDocumentById(id);
  }

  public override async addBookDocuments(
    filePaths: string[]
  ): Promise<BookReply[]> {
    return this._window.electronAPI!.addBookDocuments(filePaths);
  }

  public override updateBookDetails(
    request: BookDocumentDetailsUpdateRequest
  ): Promise<BookReply> {
    return this._window.electronAPI!.updateBookDetails(request);
  }

  public override async deleteBookDocuments(ids: string[]): Promise<void> {
    this._window.electronAPI?.deleteBookDocuments(ids);
  }

  public override async shareBook(request: BookShareRequest): Promise<void> {
    await this._window.electronAPI?.shareBook(request);
  }

  public override async openBook(id: string): Promise<Uint8Array> {
    return await this._window.electronAPI!.openBook(id);
  }
}
