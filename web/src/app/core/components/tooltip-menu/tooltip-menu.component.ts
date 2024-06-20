import { CdkMenuTrigger } from '@angular/cdk/menu';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  HostListener,
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
import { debounceTime, fromEvent, map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BreakpointObserver } from '@angular/cdk/layout';
import { TooltipMenuEventService } from '@core/services/tooltip-menu-event.service';
import { TooltipMenuStateService } from '@core/stores/tooltip-menu.state';

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

  public readonly definitionLoading = this._state.isDefinitionLoadingSignal;
  public readonly definitionProviders = this._state.definitionProvidersSignal;
  public readonly isDefinitionPanelOpen = this._state.isDefinitionPanelOpenSignal;
  public readonly foundWords = this._state.savedWordsSignal;
  public readonly definitionEntries = this._state.definitionEntriesSignal;

  public contextMenuTemplateRef = viewChild<TemplateRef<unknown>>('contextMenu');
  public haveDefinitions = computed(() => {
    const entries = this._state.definitionEntriesSignal();
    return entries.length > 0;
  });
  public flexDirection: 'column' | 'column-reverse' = 'column';

  private _overlayRef: OverlayRef | null = null;
  private _selectedText?: string;
  private _pointerPosition?: { x: number, y: number, offsetX: number, offsetY: number };
  private _isTouchscreen = false;

  constructor(
    private readonly _eventService: TooltipMenuEventService,
    private readonly _state: TooltipMenuStateService,
    private readonly _breakpointObserver: BreakpointObserver,
    private readonly _overlayPositionBuilder: OverlayPositionBuilder,
    private readonly _overlay: Overlay,
    private readonly _window: Window,
    private readonly _vcr: ViewContainerRef
  ) {
    fromEvent(document, 'selectionchange')
      .pipe(
        debounceTime(400),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        if (this._isTouchscreen) {
          this.showTooltipMenuOnMobile();
        }
      });
    this._breakpointObserver.observe('(pointer:coarse)')
      .pipe(
        map((state) => state.matches),
        takeUntilDestroyed()
      )
      .subscribe((isMatch) => {
        this._isTouchscreen = isMatch;
      });
  }

  public get currentDefinitionProvider(): string | null {
    return this._state.currentDefinitionProvider;
  }

  public set currentDefinitionProvider(value: string | null) {
    this._state.currentDefinitionProvider = value;
  }

  @HostListener("pointermove", ['$event'])
  public updatePointerPosition({ x, y, offsetX, offsetY }: PointerEvent): void {
    this._pointerPosition = { x, y, offsetX, offsetY };
  }

  @HostListener("pointerdown", ["$event"])
  public clearSelection(e: PointerEvent): void {
    if (e.button === 2) {
      return;
    }
    const selection = this._window.getSelection();
    selection?.removeAllRanges();
    this._eventService.emitSelectionEvent(null);
    this.closeContextMenu();
  }

  @HostListener("pointerup", ['$event'])
  public showTooltipMenu(e: PointerEvent) {
    if (this._overlayRef) {
      this.closeContextMenu();
    }
    const selection = this._window.getSelection();
    const selectedText = selection?.toString().trim();
    this._eventService.emitSelectionEvent(selectedText ?? null);
    if (!selection || !selectedText || selection.rangeCount === 0) {
      return;
    }

    const origin = { x: e.x, y: e.y, height: e.height, width: e.width };
    const willBeOffscreen = this._willBeOffscreenByHeight();
    this._setDefMenuFlexDirection(willBeOffscreen);
    const positionStrategy = willBeOffscreen || this._isTouchscreen
      ? this._overlayPositionBuilder.flexibleConnectedTo(origin)
        .withPositions([
          {
            originX: 'start',
            originY: 'top',
            overlayX: 'center',
            overlayY: 'bottom',
          },
        ])
      : this._overlayPositionBuilder.flexibleConnectedTo(origin)
        .withPositions([
          {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'center',
            overlayY: 'top',
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

  @HostListener('scroll', ['$event'])
  @HostListener('wheel', ['$event'])
  public closeContextMenu(): void {
    this._overlayRef?.dispose();
    this._overlayRef = null;
  }

  public showTooltipMenuOnMobile(): void {
    const selection = window.getSelection();
    if (this._overlayRef) {
      this.closeContextMenu();
    }
    const selectedText = selection?.toString().trim();
    this._eventService.emitSelectionEvent(selectedText ?? null);
    if (!selection || !selectedText) return;

    const rangeRect = selection.getRangeAt(0).getBoundingClientRect();
    console.log('rangeRect', rangeRect);
    const willBeOffscreen = this._willBeOffscreenByHeight();
    this._setDefMenuFlexDirection(willBeOffscreen);
    const positionStrategy = this._overlayPositionBuilder.flexibleConnectedTo(rangeRect)
      .withPositions([
        {
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom',
        },
      ]);
    this._overlayRef = this._overlay.create({
      positionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
    });
    const portal = new TemplatePortal(this.contextMenuTemplateRef()!, this._vcr);
    this._selectedText = this._processText(selectedText);
    this._overlayRef.attach(portal);
  }

  public isWordInDictionary(word: string): boolean {
    return this._state.savedWords.includes(word);
  }

  public emitTranslationBtnClickEvent(): void {
    if (!this._selectedText) return;
    this._eventService.emitTranslationEvent(this._selectedText);
    this.closeContextMenu();
  }

  public emitTextCopyEvent(): void {
    if (!this._selectedText) return;
    this._eventService.emitTextCopyEvent(this._selectedText);
    this.closeContextMenu();
  }

  public emitTextSumBtnClickEvent(): void {
    if (!this._selectedText) return;
    this._eventService.emitTextSummarizationEvent(this._selectedText);
  }

  public emitDefinitionBtnClickEvent(): void {
    if (!this._selectedText) return;
    this._eventService.emitDefineEvent(this._selectedText);
  }

  public emitWordAddBtnClickEvent(word: WordDto): void {
    if (!this._selectedText) return;
    this._eventService.emitAddDefinitionEvent(word);
  }

  public emitWordDelBtnClickEvent(word: WordDto): void {
    if (!this._selectedText) return;
    this._eventService.emitDeleteDefinitionEvent(word);
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

  private _willBeOffscreenByHeight(): boolean {
    return (this._pointerPosition?.y ?? 0) + this.DEFINITION_POPUP_HEIGHT > window.innerHeight;
  }

}
