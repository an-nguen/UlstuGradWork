import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  input,
  output
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BookDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { debounceTime, fromEvent } from 'rxjs';

@Component({
  selector: 'app-book-list-view',
  templateUrl: './book-list-view.component.html',
  styleUrl: './book-list-view.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookListViewComponent implements AfterViewInit {

  public showEditButton = input(true);
  public showDeleteButton = input(true);
  public books = input.required<BookDto[]>();

  public openItemEvent = output<BookDto>();
  public editItemEvent = output<BookDto>();
  public deleteItemEvent = output<BookDto>();
  public numOfVisibleItemsChangeEvent = output<number>();

  protected readonly RESIZE_DEBOUNCE_TIME = 200;
  protected readonly LIST_ITEM_HEIGHT_PX = 130;
  protected readonly LIST_ITEM_GAP_PX = 14;

  constructor(
    private readonly _hostElement: ElementRef,
    private readonly _destroyRef: DestroyRef,
  ) { }

  public ngAfterViewInit(): void {
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(this.RESIZE_DEBOUNCE_TIME),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() => this.numOfVisibleItemsChangeEvent.emit(this._countVisibleItems()));
    this.numOfVisibleItemsChangeEvent.emit(this._countVisibleItems());
  }

  public handleOpenItemEvent(book: BookDto): void {
    this.openItemEvent.emit(book);
  }

  public handleDeleteItemEvent(book: BookDto): void {
    this.deleteItemEvent.emit(book);
  }

  public handleEditItemEvent(book: BookDto) {
    this.editItemEvent.emit(book);
  }

  private _countVisibleItems(): number {
    const hostStyles = getComputedStyle(this._hostElement.nativeElement);
    const height = parseInt(hostStyles.getPropertyValue('height'));
    return Math.round(height / (this.LIST_ITEM_HEIGHT_PX + this.LIST_ITEM_GAP_PX));
  }

}
