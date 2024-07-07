import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BookDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { debounceTime, fromEvent } from 'rxjs';
import { MatActionList, MatListItem } from '@angular/material/list';
import { MatTooltip } from '@angular/material/tooltip';
import { BookListItemComponent } from '@core/components/book-list-item/book-list-item.component';
import { countVisibleItems } from '@shared/utils';

@Component({
  selector: 'app-book-list-view',
  templateUrl: './book-list-view.component.html',
  styleUrl: './book-list-view.component.scss',
  standalone: true,
  imports: [
    MatActionList,
    MatListItem,
    MatTooltip,
    BookListItemComponent,

  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookListViewComponent implements AfterViewInit {

  public readonly RESIZE_DEBOUNCE_TIME = 200;
  public readonly LIST_ITEM_HEIGHT_PX = 130;
  public readonly LIST_ITEM_GAP_PX = 14;

  public showEditButton = input(true);
  public showDeleteButton = input(true);
  public books = input.required<BookDto[]>();

  public openItemEvent = output<BookDto>();
  public infoItemEvent = output<BookDto>();
  public editItemEvent = output<BookDto>();
  public deleteItemEvent = output<BookDto>();
  public numOfVisibleItemsChangeEvent = output<number>();

  constructor(
    private readonly _hostElement: ElementRef,
    private readonly _destroyRef: DestroyRef,
  ) {
  }

  public ngAfterViewInit(): void {
    fromEvent(window, 'resize')
      .pipe(
        debounceTime(this.RESIZE_DEBOUNCE_TIME),
        takeUntilDestroyed(this._destroyRef),
      )
      .subscribe(() =>
        this._emitNumOfVisibleItems(),
      );
    this._emitNumOfVisibleItems();
  }

  public handleOpenItemEvent(book: BookDto): void {
    this.openItemEvent.emit(book);
  }

  public handleInfoItemEvent(book: BookDto): void {
    this.infoItemEvent.emit(book);
  }

  public handleDeleteItemEvent(book: BookDto): void {
    this.deleteItemEvent.emit(book);
  }

  public handleEditItemEvent(book: BookDto) {
    this.editItemEvent.emit(book);
  }

  private _emitNumOfVisibleItems(): void {
    const numberOfVisibleItems = countVisibleItems(
      this._hostElement.nativeElement,
      this.LIST_ITEM_HEIGHT_PX,
      this.LIST_ITEM_GAP_PX
    );
    this.numOfVisibleItemsChangeEvent.emit(numberOfVisibleItems);
  }

}
