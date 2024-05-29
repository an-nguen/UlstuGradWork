import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  input,
  output,
} from '@angular/core';
import { BookDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { MatIconAnchor } from '@angular/material/button';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatIcon } from '@angular/material/icon';
import { NgOptimizedImage } from '@angular/common';

@Component({
  selector: 'app-book-grid-item',
  templateUrl: './book-grid-item.component.html',
  styleUrl: './book-grid-item.component.scss',
  standalone: true,
  imports: [
    MatIconAnchor,
    MatMenuTrigger,
    MatIcon,
    MatMenu,
    NgOptimizedImage,
    MatMenuItem,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookGridItemComponent {
  
  public bookItem = input.required<BookDto>();
  public isEditButtonVisible = input<boolean>(true);
  public isDeleteButtonVisible = input<boolean>(true);
  public isInfoButtonVisible = input<boolean>(true);
  
  public openEvent = output();
  public infoEvent = output();
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

  public emitInfoClickEvent() {
    this.infoEvent.emit();
  }
  
}
