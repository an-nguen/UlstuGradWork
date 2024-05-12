import { CdkMenuTrigger } from '@angular/cdk/menu';
import { ChangeDetectionStrategy, Component, HostListener, output, viewChild } from '@angular/core';

@Component({
  selector: '[app-tooltip-menu]',
  templateUrl: './tooltip-menu.component.html',
  styleUrl: './tooltip-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TooltipMenuComponent {

  protected readonly WORD_BREAK_PATTERN = new RegExp(`([\s-]?)\n`, 'gm');

  public contextMenuTrigger = viewChild(CdkMenuTrigger);

  public selectionEvent = output<string | null>();
  public textCopyEvent = output<string>();
  public translationBtnClickEvent = output<string>();
  public definitionBtnClickEvent = output<string>();

  private _selectedText?: string;

  constructor(
    private readonly _window: Window,
  ) { }

  @HostListener('mousedown')
  public clearSelection(): void {
    const selection = this._window.getSelection();
    this.contextMenuTrigger()?.close();
    selection?.removeAllRanges();
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
    contextMenuTrigger.menuPosition.splice(0, contextMenuTrigger.menuPosition.length);
    contextMenuTrigger.menuPosition.push({
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'top',
      offsetX: e.pageX,
      offsetY: e.pageY
    });

    console.log(selectedText);
    this._selectedText = this._processText(selectedText);
    contextMenuTrigger.open();
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

  public emitDefinitionBtnClickEvent(): void {
    if (!this._selectedText) return;
    this.textCopyEvent.emit(this._selectedText);
  }

  private _processText(value: string): string {
    return value.trim().replace(this.WORD_BREAK_PATTERN, '').replace('\n', '');
  }

}
