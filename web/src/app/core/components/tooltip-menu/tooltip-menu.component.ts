import { CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, computed, HostListener, input, output, viewChild } from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { WordDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { MatButtonModule } from '@angular/material/button';
import { LoadingSpinnerOverlayComponent } from '@shared/components/loading-spinner-overlay/loading-spinner-overlay.component';

@Component({
  selector: '[app-tooltip-menu]',
  templateUrl: './tooltip-menu.component.html',
  styleUrl: './tooltip-menu.component.scss',
  standalone: true,
  imports: [
    CdkMenuTrigger,
    MatTooltip,
    MatIcon,
    MatButtonModule,
    LoadingSpinnerOverlayComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipMenuComponent {

  protected readonly WORD_BREAK_PATTERN = new RegExp(`(-)\n`, 'gm');
  protected readonly NEW_LINE_PATTERN = new RegExp(`(\n|\r\n|\r)`, 'gm');
  protected readonly WORD_DEFINITION_POPUP_HEIGHT_PX = 240;

  public contextMenuTrigger = viewChild(CdkMenuTrigger);

  public wordDefinitionEntries = input<WordDto[]>([]);
  public haveDefinitions = computed(() => {
    const entries = this.wordDefinitionEntries();
    return entries.length > 0;
  });
  public definitionLoading = input<boolean>(false);

  public selectionEvent = output<string | null>();
  public textCopyEvent = output<string>();
  public translationBtnClickEvent = output<string>();
  public definitionBtnClickEvent = output<string>();
  public textSumBtnClickEvent = output<string>();
  public definitionAddBtnClickEvent = output<WordDto[]>();

  private _selectedText?: string;

  constructor(
    private readonly _window: Window,
  ) {
  }

  @HostListener('mousedown')
  public clearSelection(): void {
    const selection = this._window.getSelection();
    this.contextMenuTrigger()?.close();
    selection?.removeAllRanges();
    this.selectionEvent.emit(null);
  }

  @HostListener('mouseup', ['$event'])
  public showTooltipMenu(e: MouseEvent) {
    const selection = this._window.getSelection();
    const selectedText = selection?.toString().trim();
    const contextMenuTrigger = this.contextMenuTrigger()!;
    this.selectionEvent.emit(selectedText ?? null);
    if (!selection || !selectedText || selection.rangeCount === 0) {
      return;
    }
    if (!contextMenuTrigger.menuPosition) {
      contextMenuTrigger.menuPosition = [];
    }
    contextMenuTrigger.menuPosition.splice(
      0,
      contextMenuTrigger.menuPosition.length,
    );
    contextMenuTrigger.menuPosition.push(
      {
        originX: 'center',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'top',
        offsetX: e.clientX,
        offsetY: e.clientY,
      },
      {
        originX: 'start',
        originY: 'top',
        overlayX: 'center',
        overlayY: 'bottom',
        offsetX: e.clientX,
        offsetY: e.clientY,
      },
    );
    
    this._selectedText = this._processText(selectedText);
    contextMenuTrigger.open();
  }

  @HostListener('scroll', ['$event'])
  @HostListener('wheel', ['$event'])
  public closeContextMenu(): void {
    if (this.contextMenuTrigger()?.isOpen()) {
      this.contextMenuTrigger()?.close();
    }
  }

  public willBeOffscreenByHeight(e: MouseEvent): boolean {
    return e.clientY + this.WORD_DEFINITION_POPUP_HEIGHT_PX > window.innerHeight;
  }

  public emitTranslationBtnClickEvent(): void {
    if (!this._selectedText) return;
    this.translationBtnClickEvent.emit(this._selectedText);
    this.contextMenuTrigger()?.close();
  }

  public emitTextCopyEvent(): void {
    if (!this._selectedText) return;
    this.textCopyEvent.emit(this._selectedText);
    this.contextMenuTrigger()?.close();
  }

  public emitTextSumBtnClickEvent(): void {
    if (!this._selectedText) return;
    this.textSumBtnClickEvent.emit(this._selectedText);
  }

  public emitDefinitionBtnClickEvent(): void {
    if (!this._selectedText) return;
    this.definitionBtnClickEvent.emit(this._selectedText);
  }

  public emitWordAddBtnClickEvent(): void {
    if (!this._selectedText) return;
    this.definitionAddBtnClickEvent.emit(this.wordDefinitionEntries());
    this.contextMenuTrigger()?.close();
  }

  private _processText(value: string): string {
    return value.trim()
      .replace(this.WORD_BREAK_PATTERN, '')
      .replace(this.NEW_LINE_PATTERN, ' ');
  }

}
