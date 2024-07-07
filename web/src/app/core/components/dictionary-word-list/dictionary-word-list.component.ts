import { CommonModule } from "@angular/common";
import { AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, ElementRef, input, output } from '@angular/core';
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { MatListModule } from "@angular/material/list";
import { WordDto } from "@core/dtos/BookManager.Application.Common.DTOs";
import { countVisibleItems } from "@shared/utils";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";
import { debounceTime, fromEvent } from "rxjs";

@Component({
  selector: 'app-dictionary-word-list',
  standalone: true,
  imports: [
    CommonModule,
    MatListModule,
    InfiniteScrollDirective,
  ],
  templateUrl: './dictionary-word-list.component.html',
  styleUrl: './dictionary-word-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DictionaryWordListComponent implements AfterViewInit {

  public readonly RESIZE_DEBOUNCE_TIME = 200;
  public readonly LIST_ITEM_HEIGHT_PX = 64;
  public readonly LIST_ITEM_GAP_PX = 14;

  public words = input.required<WordDto[]>();

  public wordClickEvent = output<WordDto>();
  public scrolledEvent = output();
  public numOfVisibleItemsChangeEvent = output<number>();

  constructor(
    private readonly _hostElement: ElementRef,
    private readonly _destroyRef: DestroyRef
  ) { }

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

  public emitWordClickEvent(word: WordDto) {
    this.wordClickEvent.emit(word);
  }

  public emitScrolledEvent(): void {
    this.scrolledEvent.emit();
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
