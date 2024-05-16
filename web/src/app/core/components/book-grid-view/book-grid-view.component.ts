import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  EventEmitter,
  Output,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BookDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { debounceTime, fromEvent } from 'rxjs';

@Component({
  selector: 'app-book-grid-view',
  templateUrl: './book-grid-view.component.html',
  styleUrl: './book-grid-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookGridViewComponent implements AfterViewInit {
  
  protected readonly RESIZE_DEBOUNCE_TIME = 200;

  public books = input.required<BookDto[]>();

  public openItemEvent = output<BookDto>();
  public editItemEvent = output<BookDto>();
  public deleteItemEvent = output<BookDto>();

  @Output()
  public numOfVisibleItemsChangeEvent = new EventEmitter<number>();

  constructor(
    private readonly _hostElement: ElementRef,
    private readonly _destroyRef: DestroyRef
  ) {}

  public ngAfterViewInit(): void {
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(this.RESIZE_DEBOUNCE_TIME),
        takeUntilDestroyed(this._destroyRef)
      )
      .subscribe(() =>
        this.numOfVisibleItemsChangeEvent.emit(this._calculateGridItemCount())
      );
    this.numOfVisibleItemsChangeEvent.emit(this._calculateGridItemCount());
  }

  public emitOpenItemEvent(book: BookDto): void {
    this.openItemEvent.emit(book);
  }

  public emitEditItemEvent(book: BookDto): void {
    this.editItemEvent.emit(book);
  }

  public emitDeleteItemEvent(book: BookDto): void {
    this.deleteItemEvent.emit(book);
  }

  private _calculateGridItemCount(): number {
    const hostStyles = getComputedStyle(this._hostElement.nativeElement);
    const rowCount = hostStyles.gridTemplateRows.split(' ').length;
    const colCount = hostStyles.gridTemplateColumns.split(' ').length;
    return rowCount * colCount;
  }
  
}
