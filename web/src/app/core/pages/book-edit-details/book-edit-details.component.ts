import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BookDocumentDetailsUpdateRequest, BookDocumentService, BookReply } from '@core/interfaces/book-document-service';
import { NEVER, catchError, from, mergeMap, throwError } from 'rxjs';

@Component({
  selector: 'app-book-edit-details',
  templateUrl: './book-edit-details.component.html',
  styleUrl: './book-edit-details.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookEditDetailsComponent implements OnInit {

  public details = this._fb.group({
    title: this._fb.control<string>('', [Validators.required]),
    description: this._fb.control<string | null>(null),
    publisherName: this._fb.control<string | null>(null),
    isbn: this._fb.control<string | null>(null),
    tags: this._fb.control<string[]>([]),
  });

  private _bookId?: string;

  constructor(
    private readonly _fb: FormBuilder,
    private readonly _route: ActivatedRoute,
    private readonly _service: BookDocumentService,
    private destroyRef: DestroyRef
  ) { }

  public ngOnInit(): void {
    this.loadBook();
  }

  public loadBook(): void {
    this._route.paramMap
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        mergeMap((params) => {
          const id = params.get('id');
          if (!id) return NEVER;
          this._bookId = id;
          return from(this._service.getBookDocumentById(id));
        }),
        catchError((err) => {
          console.error(err);
          return throwError(() => err);
        })
      )
      .subscribe((bookReply) => {
        this.setBookDetails(bookReply);
      });
  }

  public setBookDetails(dto: BookReply): void {
    this.details.setValue({
      title: dto.title ?? '',
      description: dto.description ?? null,
      publisherName: dto.publisherName ?? null,
      isbn: dto.isbn ?? null,
      tags: null,
    });
  }

  public saveChanges(): void {
    if (this.details.invalid) return;
    this._service.updateBookDetails(this._createRequest())
      .then(book => { this.setBookDetails(book); });
  }

  private _createRequest(): BookDocumentDetailsUpdateRequest {
    if (!this._bookId) throw new Error('A book ID is not defined.');
    return {
      id: this._bookId,
      title: this.details.value.title!,
      description: this.details.value.description ?? undefined,
      isbn: this.details.value.isbn ?? undefined,
      publisherName: this.details.value.publisherName ?? undefined
    };
  }

}
