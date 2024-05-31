import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  BookDto,
  SortOrder,
} from '@core/dtos/BookManager.Application.Common.DTOs';
import { BookService } from '@core/services/book.service';
import { MatButton } from '@angular/material/button';
import { MatProgressBar } from '@angular/material/progress-bar';
import { NgOptimizedImage } from '@angular/common';
import { BookListViewComponent } from '@core/components/book-list-view/book-list-view.component';

@Component({
  selector: 'app-recent-books',
  templateUrl: './recent-books.component.html',
  styleUrl: './recent-books.component.scss',
  standalone: true,
  imports: [
    MatButton,
    MatProgressBar,
    NgOptimizedImage,
    BookListViewComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentBooksComponent implements OnInit {
  
  public otherBooks = signal<BookDto[]>([]);
  public mostRecentBook = signal<BookDto | null>(null);
  public isBooksEmpty = computed(() => {
    return this.otherBooks().length === 0;
  })

  protected readonly DEFAULT_PAGE_SIZE = 5;
  protected readonly DEFAULT_PAGE_NUMBER = 0;
  protected readonly SORT_BY = 'recent_access';
  protected readonly SORT_ORDER = SortOrder.Desc;

  public mostRecentBookProgressValue = computed(() => {
    const mostRecentBook = this.mostRecentBook();
    if (!mostRecentBook) return 0;
    const pageCount = mostRecentBook?.documentDetails.pageCount ?? 0;
    const pageNumber = mostRecentBook.stats?.lastViewedPage ?? 0;
    return Math.round((pageNumber / pageCount) * 100);
  });

  constructor(
    private readonly _service: BookService,
    private readonly _router: Router
  ) {}

  public ngOnInit(): void {
    this._loadBooks();
  }

  public openBook(book: BookDto): void {
    this._router.navigate(['viewer', book.documentDetails.id]);
  }

  private _loadBooks(): void {
    this._service
      .getPage(
        this.DEFAULT_PAGE_NUMBER,
        this.DEFAULT_PAGE_SIZE,
        this.SORT_BY,
        this.SORT_ORDER
      )
      .subscribe((page) => {
        this.otherBooks.set(page.items.slice(1));
        this.mostRecentBook.set(page.items[0]);
      });
  }
  
}
