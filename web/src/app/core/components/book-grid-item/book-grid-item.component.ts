import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  input,
  output,
} from '@angular/core';
import { BookDto } from '@core/dtos/BookManager.Application.Common.DTOs';

@Component({
  selector: 'app-book-grid-item',
  templateUrl: './book-grid-item.component.html',
  styleUrl: './book-grid-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookGridItemComponent {
  
  public bookItem = input.required<BookDto>();

  public openEvent = output();
  public editEvent = output();
  public deleteEvent = output();

  @HostListener('click')
  public emitOpenEvent(): void {
    this.openEvent.emit();
  }

  public emitEditEvent(): void {
    this.editEvent.emit();
  }

  public emitDeleteEvent(): void {
    this.deleteEvent.emit();
  }
  
}
