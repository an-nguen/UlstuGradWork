import { CdkMenuTrigger } from '@angular/cdk/menu';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  HostListener,
  input,
  model,
  output,
  TemplateRef,
  viewChild,
  ViewContainerRef,
} from '@angular/core';
import { MatTooltip } from '@angular/material/tooltip';
import { MatIcon } from '@angular/material/icon';
import { WordDto } from '@core/dtos/BookManager.Application.Common.DTOs';
import { MatButtonModule } from '@angular/material/button';
import { LoadingSpinnerOverlayComponent } from '@shared/components/loading-spinner-overlay/loading-spinner-overlay.component';
import { MatFormField } from '@angular/material/form-field';
import { MatOption, MatSelect } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Overlay, OverlayModule, OverlayPositionBuilder, OverlayRef } from '@angular/cdk/overlay';
import { CdkPortal, TemplatePortal } from '@angular/cdk/portal';

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
    MatFormField,
    MatSelect,
    MatOption,
    ReactiveFormsModule,
    FormsModule,
    OverlayModule,
    CdkPortal,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TooltipMenuComponent {

  protected readonly WORD_BREAK_PATTERN = new RegExp(`(-)\n`, 'gm');
  protected readonly NEW_LINE_PATTERN = new RegExp(`(\n|\r\n|\r)`, 'gm');
  protected readonly DEFINITION_POPUP_HEIGHT = 240;
  protected readonly TOOLTIP_CONTAINER_WIDTH = 320;

  public contextMenuTemplateRef = viewChild<TemplateRef<unknown>>('contextMenu');
  public selectedDefinitionProvider = model<string | null>(null);
  public wordDefinitionEntries = input<WordDto[]>([]);
  public haveDefinitions = computed(() => {
    const entries = this.wordDefinitionEntries();
    return entries.length > 0;
  });
  public definitionLoading = input<boolean>(false);
  public definitionProviders = input<string[]>([]);
  public isDefinitionMenuOpen = input<boolean>(false);
  public isWordInDictionary = input<boolean>(false);
  public selectionEvent = output<string | null>();
  public textCopyEvent = output<string>();
  public translationBtnClickEvent = output<string>();
  public definitionBtnClickEvent = output<string>();
  public textSumBtnClickEvent = output<string>();
  public definitionAddBtnClickEvent = output<WordDto[]>();

  public flexDirection: 'column' | 'column-reverse' = 'column';

  private _selectedText?: string;
  private _overlayRef: OverlayRef | null = null;

  constructor(
    private readonly _overlayPositionBuilder: OverlayPositionBuilder,
    private readonly _overlay: Overlay,
    private readonly _window: Window,
    private readonly _vcr: ViewContainerRef,
    private readonly _cdr: ChangeDetectorRef,
  ) {
  }

  @HostListener('mousedown')
  public clearSelection(): void {
    const selection = this._window.getSelection();
    selection?.removeAllRanges();
    this.selectionEvent.emit(null);
    this.closeContextMenu();
  }

  @HostListener('mouseup', ['$event'])
  public showTooltipMenu(e: MouseEvent) {
    const selection = this._window.getSelection();
    const selectedText = selection?.toString().trim();
    this.selectionEvent.emit(selectedText ?? null);
    if (!selection || !selectedText || selection.rangeCount === 0) {
      return;
    }

    console.log('selection:', selection);
    console.log('range:', selection.getRangeAt(0));
    console.log('focusNode: ', selection.focusNode);
    console.log('anchorNode: ', selection.anchorNode);
    if (selection.focusNode instanceof Text && selection.focusNode.parentElement) {
      const focusElement = selection.focusNode.parentElement;
      const anchorElement = selection.anchorNode!.parentElement as Element;
      const willBeOffscreen = this.willBeOffscreenByHeight(e);
      this._setDefMenuFlexDirection(willBeOffscreen);
      const positionStrategy = willBeOffscreen
        ? this._overlayPositionBuilder.flexibleConnectedTo(anchorElement)
          .withPositions([
            {
              originX: 'start',
              originY: 'top',
              overlayX: 'center',
              overlayY: 'bottom',
              offsetX: e.offsetX,
            },
          ])
        : this._overlayPositionBuilder.flexibleConnectedTo(focusElement)
          .withPositions([
            {
              originX: 'start',
              originY: 'bottom',
              overlayX: 'center',
              overlayY: 'top',
              offsetX: e.offsetX,
            },
          ]);

      this._overlayRef = this._overlay.create({
        positionStrategy,
        scrollStrategy: this._overlay.scrollStrategies.close(),
      });
      const portal = new TemplatePortal(this.contextMenuTemplateRef()!, this._vcr);
      this._selectedText = this._processText(selectedText);
      this._overlayRef.attach(portal);
    }
  }

  @HostListener('scroll', ['$event'])
  @HostListener('wheel', ['$event'])
  public closeContextMenu(): void {
    if (this._overlayRef) {
      this._overlayRef.dispose();
      this._overlayRef = null;
    }
  }

  public willBeOffscreenByHeight(e: MouseEvent): boolean {
    return e.clientY + this.DEFINITION_POPUP_HEIGHT > window.innerHeight;
  }

  public emitTranslationBtnClickEvent(): void {
    if (!this._selectedText) return;
    this.translationBtnClickEvent.emit(this._selectedText);
    this.closeContextMenu();
  }

  public emitTextCopyEvent(): void {
    if (!this._selectedText) return;
    this.textCopyEvent.emit(this._selectedText);
    this.closeContextMenu();
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
    this.closeContextMenu();
  }

  private _processText(value: string): string {
    return value.trim()
      .replace(this.WORD_BREAK_PATTERN, '')
      .replace(this.NEW_LINE_PATTERN, ' ');
  }

  private _setDefMenuFlexDirection(reverse: boolean): void {
    this.flexDirection = reverse ? 'column-reverse' : 'column';
  }

}
