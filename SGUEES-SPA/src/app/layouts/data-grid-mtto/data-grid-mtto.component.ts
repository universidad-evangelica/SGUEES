import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  NgModule,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridComponent, DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { DxSelectBoxModule } from 'devextreme-angular/ui/select-box';
import { DxTextBoxModule } from 'devextreme-angular/ui/text-box';
import { DxTooltipModule } from 'devextreme-angular/ui/tooltip';
import { EmptyStateModule } from 'src/app/shared/components/library/empty-state/empty-state.component';
import { MttoPageContextService } from 'src/app/layouts/mtto-page-context.service';
import { Subscription } from 'rxjs';
import {
  RemoteHeaderFilterLoader,
  attachRemoteHeaderFilters,
  syncHeaderFiltersFromPageData,
} from 'src/app/shared/utils/remote-header-filter.util';
import { buildEstadoToolbarOptions } from 'src/app/shared/mtto/mtto-grid.helpers';

import { exportDataGrid } from 'devextreme/excel_exporter';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver-es';
import { PagerPageSize } from 'devextreme/common/grids';

@Component({
  selector: 'app-data-grid-mtto',
  templateUrl: './data-grid-mtto.component.html',
  styleUrls: ['./data-grid-mtto.component.scss'],
  host: {
    class: 'sguees-data-grid-mtto-host sguees-data-grid-mtto-premium',
    '[class.sguees-data-grid-mtto-host--unified]': 'isUnifiedActive',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataGridMttoComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('gData', { static: false }) gData?: DxDataGridComponent;

  @Input() models!: any;
  @Input() columns: any;
  @Input() summary: any;
  //botones customizables adicionales
  @Input() customButtons: any[] = [];
  @Input() isBrowse: boolean = true;
  @Input() keyExpr: string | string[] = '';
  @Input() gridHeight: string | number = 670;
  @Input() columnAutoWidth = false;
  @Input() columnHidingEnabled = false;
  @Input() responsiveColumnHiding = false;
  columnHidingActive = false;
  @Input() permiteEditar: boolean | Function = true;
  @Input() permiteDele: boolean | Function = true;
  @Input() permitePrint = true;
  @Output() rowDblClick = new EventEmitter<any>();
  @Output() rowClick = new EventEmitter<any>();
  @Output() rowRemoving = new EventEmitter<any>();
  @Output() focusedRowChanged = new EventEmitter<any>();
  @Output() editClick = new EventEmitter<any>();
  @Output() emptyCtaClick = new EventEmitter<void>();
  @Output() refresh = new EventEmitter<void>();
  @Output() add = new EventEmitter<void>();
  @Input() filterValue: any = null;
  /** null = auto: sincroniza filter row / header filter con panel inferior cuando showFilterPanel. */
  @Input() filterSyncEnabled: boolean | null = null;
  @Input() showEmptyState = false;
  @Input() emptyTitle = 'Sin registros';
  @Input() emptyMessage = 'No hay datos para mostrar. Use «Nuevo» o actualice la consulta.';
  @Input() emptyIcon = 'inactivefolder';
  @Input() emptyCtaLabel = '';
  @Input() emptyCtaIcon = 'plus';
  @Input() loading = false;
  @Input() compactDensity = true;

  /** Fase 8A — header en toolbar (override; si vacío usa contexto barra). */
  @Input() titulo?: string;
  @Input() subtitle?: string;
  @Input() showAdd?: boolean;
  @Input() showSearch = true;
  @Input() showRefresh?: boolean;
  @Input() showExport = true;
  @Input() showColumnChooser = false;
  /** Panel de agrupación (arrastrar columnas). Con toolbar custom DX 24 requiere ítem `groupPanel`. */
  @Input() showGrouping = false;
  /** Barra inferior con filtros activos y acción limpiar. */
  @Input() showFilterPanel = true;
  /**
   * Grid estilo AdminFE: sin `<dxo-toolbar>` custom.
   * Acciones en barra/ribbon; DX pinta group panel, export, etc. nativamente.
   */
  @Input() nativeToolbar = false;
  /** null = adoptar contexto barra (header-only). false = toolbar legacy 7B. */
  @Input() unifiedToolbar: boolean | null = null;
  @Input() searchPlaceholder = 'Buscar...';
  @Input() remoteOperations: boolean | Record<string, unknown> = false;
  @Input() pageSize = 15;
  @Input() allowedPageSizes: (number | PagerPageSize)[] = [5, 10, 25, 50, 100];
  /**
   * A+P híbrido: el selector del pager (abajo) elige el lote API;
   * las filas visibles siguen siendo `pageSize` (ej. 15).
   */
  @Input() hybridPaging = false;
  @Input() apiPageSize = 50;
  @Input() apiPageSizes: (number | 'all')[] = [50, 100, 'all'];
  @Input() repaintChangesOnly: boolean | null = null;
  @Input() searchBoxOptions: Record<string, unknown> | null = null;
  @Input() estadoSelectOptions: Record<string, unknown> | null = null;
  @Input() exportFileName = 'Data';
  /** false cuando el hijo confirma en rowRemoving (evita doble diálogo DevExtreme + confirmaAccion). */
  @Input() confirmDelete = true;
  /** Selección múltiple con casillas (procesos batch: contabilizar, autorizar, etc.). */
  @Input() selectionMode: 'none' | 'multiple' = 'none';
  @Input() headerFilterLoader?: RemoteHeaderFilterLoader;
  /** null = auto (A+P sin filtro remoto: header filter desde página cargada). */
  @Input() syncHeaderFilterWithPage: boolean | null = null;
  /** v1.1 — Activar/Desactivar en toolbar junto a Agregar (fila seleccionada). */
  @Input() showEstadoToolbar = false;
  /** null = auto: con nativeToolbar el estado va en barra/ribbon, no en grid. */
  @Input() showEstadoToolbarInGrid: boolean | null = null;
  @Input() campoEstado = '';
  @Input() puedeCambiarEstado = true;
  /** PK a restaurar al volver a browse (ej. tras cancelar Nuevo). */
  @Input() focusedRowKey: unknown = null;
  /**
   * Slot HTML opcional a la izquierda del toolbar del grid (Tipo C: Procesos Contables, etc.).
   * Definir el markup en el hijo con `<ng-template>` — no armar botones en arrays TS.
   */
  @Input() toolbarBeforeTemplate: TemplateRef<unknown> | null = null;
  @Output() activarInactivar = new EventEmitter<void>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() apiPageSizeChange = new EventEmitter<number>();

  optRefresh: Record<string, unknown> = {};
  optAdd: Record<string, unknown> = {};
  optActivar: Record<string, unknown> = {};
  optDesactivar: Record<string, unknown> = {};
  focusedRowData: Record<string, unknown> | null = null;
  permissionTooltipTarget: HTMLElement | null = null;
  permissionTooltipVisible = false;
  permissionTooltipMessage = '';
  resolvedGridHeight: string | number = 670;
  hasFocusedRow = false;
  gridVisible = true;
  activePageSize = 5;
  displayColumns: any[] = [];

  readonly onCustomizeFilterPanelText = (e: { filterValue?: unknown; text?: string }): string => {
    if (e.filterValue == null) {
      return 'Crear filtro';
    }
    return e.text ? `Filtro: ${e.text}` : 'Filtros activos';
  };

  get effectiveFilterSyncEnabled(): boolean {
    if (this.filterSyncEnabled !== null) {
      return this.filterSyncEnabled;
    }
    return this.showFilterPanel;
  }

  private showEditActions = true;
  private showDeleteActions = true;
  private hybridSuppressPageSizeEmit = false;
  private contextSub?: Subscription;
  private permiteAddEffective = false;
  private pageSizeRepaintTimer?: ReturnType<typeof setTimeout>;
  private permissionTooltipHideTimer?: ReturnType<typeof setTimeout>;
  private permissionTooltipGridElement?: HTMLElement;
  private readonly permissionTooltipMessages: Record<string, string> = {
    'sguees-action-no-edit': 'No tiene permiso para editar registros.',
    'sguees-action-no-delete': 'No tiene permiso para eliminar registros.',
    'sguees-action-no-activate': 'No tiene permiso para activar registros.',
    'sguees-action-no-deactivate': 'No tiene permiso para desactivar registros.',
    'sguees-action-no-add': 'No tiene permiso para crear registros.',
    'sguees-action-no-export': 'No tiene permiso para exportar registros.',
  };

  get showPrimaryToolbarDivider(): boolean {
    return this.effectiveShowEstadoToolbarInGrid;
  }

  get isEmptyData(): boolean {
    return Array.isArray(this.models) && this.models.length === 0;
  }

  get isUnifiedActive(): boolean {
    if (this.unifiedToolbar === false) {
      return false;
    }
    if (this.unifiedToolbar === true) {
      return true;
    }
    return this.pageContext.snapshot.unifiedToolbar;
  }

  get resolvedTitulo(): string {
    return (this.titulo?.trim() || this.pageContext.snapshot.titulo || '').trim();
  }

  /** Título embebido: input explícito del grid, o contexto si la barra no muestra page-header. */
  get showUnifiedTitle(): boolean {
    if (!this.isUnifiedActive || !this.resolvedTitulo) {
      return false;
    }
    if (this.titulo?.trim()) {
      return true;
    }
    return this.pageContext.snapshot.embedTitleInGrid;
  }

  /** 8D: subtítulo explícito o contexto; si vacío no se muestra línea. */
  get resolvedSubtitle(): string {
    if (this.subtitle !== undefined && this.subtitle !== null) {
      return `${this.subtitle}`.trim();
    }
    return (this.pageContext.snapshot.subtitle || '').trim();
  }

  get effectiveShowAdd(): boolean {
    if (this.showAdd === false) {
      return false;
    }
    if (this.showAdd === true) {
      return true;
    }
    return this.isUnifiedActive && this.permiteAddEffective;
  }

  get effectiveShowRefresh(): boolean {
    if (this.showRefresh === false) {
      return false;
    }
    if (this.showRefresh === true) {
      return true;
    }
    if (this.isUnifiedActive) {
      return true;
    }
    return false;
  }

  get effectiveShowExport(): boolean {
    return this.showExport && !this.nativeToolbar;
  }

  /** Export Excel habilitado en DX aunque el botón viva en barra/ribbon. */
  get exportFeatureEnabled(): boolean {
    return !!this.permitePrint && (this.showExport || this.nativeToolbar);
  }

  /** Toolbar nativa DX oculta si export/búsqueda/chooser viven en barra o están apagados. */
  get shouldHideNativeHeaderToolbar(): boolean {
    if (!this.nativeToolbar) {
      return false;
    }
    // Panel de agrupación vive en header-panel; no ocultar toolbar si hay grouping.
    if (this.showGrouping) {
      return false;
    }
    return !this.effectiveShowExport && !this.showColumnChooser && !this.effectiveShowSearch;
  }

  /** Con nativeToolbar + grouping: toolbar mínima solo con groupPanel (acciones en ribbon). */
  get useCustomToolbar(): boolean {
    return !this.nativeToolbar || this.showGrouping;
  }

  get effectiveShowSearch(): boolean {
    return this.showSearch;
  }

  get showActionsDivider(): boolean {
    return (
      this.effectiveShowRefresh ||
      this.effectiveShowExport ||
      this.showColumnChooser ||
      this.effectiveShowSearch
    );
  }

  get focusedRowEnabled(): boolean {
    if (this.showEstadoToolbar && this.isBrowse) {
      return true;
    }
    return this.hasFocusedRow;
  }

  get effectiveShowEstadoToolbar(): boolean {
    return this.isBrowse && this.showEstadoToolbar && !!this.campoEstado;
  }

  get effectiveShowEstadoToolbarInGrid(): boolean {
    if (!this.effectiveShowEstadoToolbar) {
      return false;
    }
    if (this.showEstadoToolbarInGrid !== null) {
      return this.showEstadoToolbarInGrid;
    }
    return !this.nativeToolbar;
  }

  get isRemotePagingActive(): boolean {
    if (this.remoteOperations === true) {
      return true;
    }
    return !!(
      this.remoteOperations &&
      typeof this.remoteOperations === 'object' &&
      (this.remoteOperations as Record<string, unknown>)['paging']
    );
  }

  /** A+: oculto. A+P / híbrido: selector en el pager inferior. */
  get effectiveShowPageSizeSelector(): boolean {
    return this.isRemotePagingActive || this.hybridPaging;
  }

  /** Híbrido: opciones del pager = lotes API; si no, allowedPageSizes normal. */
  get effectiveAllowedPageSizes(): (number | PagerPageSize)[] {
    if (this.hybridPaging) {
      return (this.apiPageSizes ?? []) as (number | PagerPageSize)[];
    }
    return this.allowedPageSizes;
  }

  /** Filas visibles reales en modo híbrido (no el pageSize del pager/lote). */
  get displayPageSize(): number {
    return this.pageSize > 0 ? this.pageSize : 15;
  }

  get isRemoteFilteringActive(): boolean {
    if (this.remoteOperations === true) {
      return true;
    }
    if (this.remoteOperations && typeof this.remoteOperations === 'object') {
      return !!(this.remoteOperations as Record<string, unknown>)['filtering'];
    }
    return false;
  }

  /** A+P estándar: filter row en cliente — header filter con valores de la página actual. */
  get effectiveSyncHeaderFilterWithPage(): boolean {
    if (this.syncHeaderFilterWithPage !== null) {
      return this.syncHeaderFilterWithPage;
    }
    return this.isRemotePagingActive && !this.isRemoteFilteringActive;
  }

  get isRemoteHeaderFilterActive(): boolean {
    return this.isRemoteFilteringActive || !!this.headerFilterLoader;
  }

  get effectiveRepaintChangesOnly(): boolean {
    if (this.repaintChangesOnly !== null) {
      return this.repaintChangesOnly;
    }
    return !this.isRemotePagingActive;
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private pageContext: MttoPageContextService,
  ) {
    this.OneditClick = this.OneditClick.bind(this);
    this.onRefreshClick = this.onRefreshClick.bind(this);
    this.onAddClick = this.onAddClick.bind(this);
    this.onActivarInactivarClick = this.onActivarInactivarClick.bind(this);
    this.isEditActionVisible = this.isEditActionVisible.bind(this);
    this.isDeleteActionVisible = this.isDeleteActionVisible.bind(this);
  }

  /** Solo filas de datos (no encabezado / pie de grupo). */
  private isGridDataRow(e: any): boolean {
    const rowType = e?.row?.rowType;
    if (rowType) {
      return rowType === 'data';
    }
    return !!(e?.row?.data ?? e?.data);
  }

  isEditActionVisible(e: any): boolean {
    if (!this.isGridDataRow(e)) {
      return false;
    }
    if (typeof this.permiteEditar === 'function') {
      return (this.permiteEditar as (row: unknown) => boolean)(e);
    }
    return this.showEditActions;
  }

  isDeleteActionVisible(e: any): boolean {
    if (!this.isGridDataRow(e)) {
      return false;
    }
    if (typeof this.permiteDele === 'function') {
      return (this.permiteDele as (row: unknown) => boolean)(e);
    }
    return this.showDeleteActions;
  }

  ngOnInit(): void {
    this.activePageSize = this.hybridPaging
      ? this.apiPageSize > 0
        ? this.apiPageSize
        : this.displayPageSize
      : this.pageSize;
    this.rebuildToolbarOptions();
    this.contextSub = this.pageContext.changes$.subscribe(() => {
      this.permiteAddEffective = this.pageContext.snapshot.permiteAdd;
      this.rebuildToolbarOptions();
      this.cdr.markForCheck();
    });
    this.permiteAddEffective = this.pageContext.snapshot.permiteAdd;
    this.registerPageContextHandlers();
    this.resolveGridHeight();
    this.columnHidingActive = this.columnHidingEnabled;
    this.resolveActionVisibility();
    this.resolveDisplayColumns();
    this.updateFocusedRowState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gridHeight']) {
      this.resolveGridHeight();
    }
    if (changes['pageSize'] && !changes['pageSize'].firstChange) {
      if (!this.hybridPaging) {
        this.activePageSize = this.pageSize;
      }
    }
    if (changes['apiPageSize'] && this.hybridPaging) {
      this.activePageSize =
        this.apiPageSize > 0 ? this.apiPageSize : this.displayPageSize;
    }
    if (changes['columnHidingEnabled']) {
      this.columnHidingActive = this.columnHidingEnabled;
    }
    if (changes['permiteEditar'] || changes['permiteDele'] || changes['customButtons']) {
      this.resolveActionVisibility();
      this.syncActionButtonsVisibility();
      this.resolveDisplayColumns();
    }
    if (changes['models']) {
      this.updateFocusedRowState();
    }
    if (changes['isBrowse'] && !changes['isBrowse'].firstChange) {
      this.handleBrowseModeChange();
    }
    if (changes['focusedRowKey'] && this.isBrowse) {
      setTimeout(() => this.handleBrowseModeChange(), 0);
    }
    if (
      changes['showRefresh'] ||
      changes['showAdd'] ||
      changes['permitePrint'] ||
      changes['titulo'] ||
      changes['subtitle'] ||
      changes['unifiedToolbar'] ||
      changes['showEstadoToolbar'] ||
      changes['showEstadoToolbarInGrid'] ||
      changes['nativeToolbar'] ||
      changes['campoEstado'] ||
      changes['puedeCambiarEstado']
    ) {
      this.rebuildToolbarOptions();
    }
    if (
      changes['columns'] ||
      changes['customButtons'] ||
      changes['headerFilterLoader'] ||
      changes['remoteOperations'] ||
      changes['syncHeaderFilterWithPage'] ||
      changes['showGrouping']
    ) {
      this.resolveDisplayColumns();
    }
    if (
      changes['showGrouping'] ||
      changes['nativeToolbar'] ||
      changes['showExport']
    ) {
      this.syncNativeHeaderToolbar();
    }
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.contextSub?.unsubscribe();
    this.pageContext.registerGridHandlers();
    if (this.pageSizeRepaintTimer) {
      clearTimeout(this.pageSizeRepaintTimer);
    }
    if (this.permissionTooltipHideTimer) {
      clearTimeout(this.permissionTooltipHideTimer);
    }
    this.unbindPermissionTooltipHandlers();
  }

  private rebuildToolbarOptions(): void {
    const canAdd = !!this.permiteAddEffective;
    this.optRefresh = {
      text: 'Actualizar',
      icon: 'refresh',
      stylingMode: 'text',
      height: 44,
      onClick: this.onRefreshClick,
    };
    this.optAdd = {
      text: 'Nuevo',
      icon: 'plus',
      type: 'default',
      stylingMode: 'contained',
      height: 44,
      elementAttr: canAdd ? undefined : { class: 'sguees-action-no-add' },
      hint: canAdd ? 'Nuevo' : 'No tiene permiso para crear registros.',
      onClick: this.onAddClick,
    };

    if (this.effectiveShowEstadoToolbarInGrid) {
      const estadoOpts = buildEstadoToolbarOptions({
        campoEstado: this.campoEstado,
        focusedRow: this.isBrowse ? this.focusedRowData : null,
        puedeCambiarEstado: this.puedeCambiarEstado,
        onActivarInactivar: this.onActivarInactivarClick,
      });
      this.optActivar = estadoOpts.optActivar;
      this.optDesactivar = estadoOpts.optDesactivar;
    } else {
      this.optActivar = { visible: false };
      this.optDesactivar = { visible: false };
    }
  }

  onActivarInactivarClick(): void {
    this.activarInactivar.emit();
  }

  /** Actualiza la fila enfocada del toolbar tras Activar/Desactivar (mismo CORR). */
  actualizarFocusedRowData(data: Record<string, unknown> | null | undefined): void {
    if (!this.isBrowse || !data || !this.keyExpr) {
      return;
    }

    const keyField = this.keyExpr as string;
    const key = data[keyField];
    const focusedKey = this.focusedRowData?.[keyField] ?? this.focusedRowKey;
    if (!this.isValidFocusedRowKey(key) || key !== focusedKey) {
      return;
    }

    this.focusedRowData = { ...data };
    this.rebuildToolbarOptions();
    this.cdr.markForCheck();
  }

  onRefreshClick(): void {
    this.refresh.emit();
  }

  private shouldHandleBarraRefresh(): boolean {
    if (this.showRefresh === false) {
      return false;
    }
    if (this.showRefresh === true) {
      return true;
    }
    return this.isUnifiedActive;
  }

  onAddClick(): void {
    if (!this.permiteAddEffective) {
      return;
    }
    this.add.emit();
    // Plantilla A+ enlaza (add) y barra (nuevo); no disparar ambos.
    if (!this.add.observed) {
      this.pageContext.triggerAdd();
    }
  }

  refreshData(resetPage = true): void {
    const grid = this.gData?.instance;
    if (!grid) {
      return;
    }

    if (resetPage) {
      grid.pageIndex(0);
    }
    grid.refresh();
  }

  private resolveGridHeight(): void {
    if (typeof this.gridHeight === 'number') {
      this.resolvedGridHeight = this.gridHeight;
      return;
    }
    if (typeof this.gridHeight === 'string' && !this.gridHeight.includes('calc')) {
      this.resolvedGridHeight = this.gridHeight;
      return;
    }
    this.resolvedGridHeight = Math.min(670, Math.max(320, window.innerHeight - 280));
  }

  private resolveActionVisibility(): void {
    if (typeof this.permiteEditar === 'function') {
      this.showEditActions = true;
    } else {
      this.showEditActions = !!this.permiteEditar;
    }
    if (typeof this.permiteDele === 'function') {
      this.showDeleteActions = true;
    } else {
      this.showDeleteActions = !!this.permiteDele;
    }
  }

  private resolveEditButtonVisible(): boolean | ((e: unknown) => boolean) {
    if (typeof this.permiteEditar === 'function') {
      return this.isEditActionVisible;
    }
    return !!this.permiteEditar;
  }

  private resolveDeleteButtonVisible(): boolean | ((e: unknown) => boolean) {
    if (typeof this.permiteDele === 'function') {
      return this.isDeleteActionVisible;
    }
    return !!this.permiteDele;
  }

  private updateFocusedRowState(): void {
    this.hasFocusedRow = Array.isArray(this.models) && this.models.length > 0;
  }

  private isValidFocusedRowKey(key: unknown): boolean {
    if (key === null || key === undefined) {
      return false;
    }
    if (typeof key === 'number' && key <= 0) {
      return false;
    }
    if (typeof key === 'string' && key.trim() === '') {
      return false;
    }
    return true;
  }

  private handleBrowseModeChange(): void {
    if (!this.isBrowse) {
      this.focusedRowData = null;
      this.rebuildToolbarOptions();
      this.cdr.markForCheck();
      return;
    }

    setTimeout(() => {
      if (!this.isBrowse) {
        return;
      }
      this.applyFocusedRowKey();
      this.syncFocusedRowFromGrid();
    }, 0);
  }

  private applyFocusedRowKey(): void {
    if (!this.isValidFocusedRowKey(this.focusedRowKey)) {
      return;
    }
    const instance = this.gData?.instance;
    if (!instance) {
      return;
    }
    instance.option('focusedRowKey', this.focusedRowKey);
  }

  private syncFocusedRowFromGrid(): void {
    if (!this.isBrowse) {
      this.focusedRowData = null;
      this.rebuildToolbarOptions();
      return;
    }

    const instance = this.gData?.instance;
    if (!instance) {
      this.focusedRowData = null;
      this.rebuildToolbarOptions();
      return;
    }

    const focusedKey = instance.option('focusedRowKey');
    if (!this.isValidFocusedRowKey(focusedKey)) {
      this.focusedRowData = null;
      this.rebuildToolbarOptions();
      this.cdr.markForCheck();
      return;
    }

    const visibleRows = instance.getVisibleRows?.() ?? [];
    const dataRow = visibleRows.find(
      (row: { rowType?: string; key?: unknown; data?: Record<string, unknown> }) =>
        row.rowType === 'data' && row.key === focusedKey
    );
    this.focusedRowData = dataRow?.data ?? null;
    this.rebuildToolbarOptions();
    this.cdr.markForCheck();
  }

  private resolveDisplayColumns(): void {
    if (!this.columns?.length) {
      this.displayColumns = [];
      return;
    }

    let cols = [...this.columns];
    if (this.headerFilterLoader && this.isRemoteHeaderFilterActive) {
      cols = attachRemoteHeaderFilters(cols, this.headerFilterLoader);
    }

    this.displayColumns = this.withActionColumn(cols);
  }

  private withActionColumn(cols: any[]): any[] {
    if (cols.some((c: { name?: string }) => c?.name === 'btnAcciones' || c?.name === 'btnEditar')) {
      return cols;
    }

    return [this.buildActionColumn(), ...cols];
  }

  private buildActionColumn(): Record<string, unknown> {
    const actionWidth = 125 + (this.customButtons?.length ?? 0) * 36;
    return {
      type: 'buttons',
      name: 'btnAcciones',
      caption: 'Options',
      visibleIndex: 0,
      width: actionWidth,
      minWidth: actionWidth,
      allowFiltering: false,
      allowHeaderFiltering: false,
      allowSorting: false,
      allowGrouping: false,
      allowResizing: false,
      fixed: true,
      fixedPosition: 'left',
      alignment: 'center',
      buttons: [
        {
          hint: 'Editar registro',
          icon: 'edit',
          stylingMode: 'text',
          cssClass: 'sguees-grid-action-edit',
          visible: this.resolveEditButtonVisible(),
          onClick: this.OneditClick,
        },
        {
          name: 'delete',
          hint: 'Eliminar registro',
          icon: 'trash',
          stylingMode: 'text',
          cssClass: 'sguees-grid-action-delete',
          visible: this.resolveDeleteButtonVisible(),
        },
        ...this.customButtons,
      ],
    };
  }

  refreshHeaderFilterDataSources(): void {
    if (this.effectiveSyncHeaderFilterWithPage) {
      this.syncPageHeaderFilters();
      return;
    }

    if (!this.headerFilterLoader || !this.isRemoteHeaderFilterActive) {
      return;
    }

    const grid = this.gData?.instance;
    const currentColumns = (grid?.option('columns') as any[]) ?? [];

    this.resolveDisplayColumns();
    this.displayColumns = this.displayColumns.map((column) => {
      if (!column?.dataField) {
        return column;
      }

      const current = currentColumns.find((item) => item?.dataField === column.dataField);
      const currentState = {
        sortOrder: grid?.columnOption(column.dataField, 'sortOrder') ?? current?.sortOrder,
        sortIndex: grid?.columnOption(column.dataField, 'sortIndex') ?? current?.sortIndex,
        filterValue: grid?.columnOption(column.dataField, 'filterValue') ?? current?.filterValue,
        selectedFilterOperation:
          grid?.columnOption(column.dataField, 'selectedFilterOperation') ?? current?.selectedFilterOperation,
        filterValues: grid?.columnOption(column.dataField, 'filterValues') ?? current?.filterValues,
        filterType: grid?.columnOption(column.dataField, 'filterType') ?? current?.filterType,
      };

      if (!current && Object.values(currentState).every((value) => value === undefined)) {
        return column;
      }

      return {
        ...column,
        sortOrder: currentState.sortOrder,
        sortIndex: currentState.sortIndex,
        filterValue: currentState.filterValue,
        selectedFilterOperation: currentState.selectedFilterOperation,
        filterValues: currentState.filterValues,
        filterType: currentState.filterType,
      };
    });

    if (grid && this.displayColumns.length) {
      grid.option('columns', [...this.displayColumns]);
    }

    this.cdr.markForCheck();
  }

  syncPageHeaderFilters(grid?: any): void {
    const instance = grid ?? this.gData?.instance;
    if (!instance || !this.effectiveSyncHeaderFilterWithPage || !this.columns?.length) {
      return;
    }

    syncHeaderFiltersFromPageData(instance, this.columns);
    this.cdr.markForCheck();
  }

  private syncActionButtonsVisibility(): void {
    if (!this.columns) {
      return;
    }
    const merged = this.columns.find((c: { name?: string }) => c?.name === 'btnAcciones');
    if (!merged?.buttons?.length) {
      return;
    }

    for (const button of merged.buttons) {
      if (typeof button.visible === 'function') {
        continue;
      }
      if (button.icon === 'edit') {
        button.visible =
          typeof this.permiteEditar === 'function'
            ? this.resolveEditButtonVisible()
            : this.showEditActions;
      }
      if (button.name === 'delete') {
        button.visible =
          typeof this.permiteDele === 'function'
            ? this.resolveDeleteButtonVisible()
            : this.showDeleteActions;
      }
    }
  }

  OnrowDblClick(e: any): void {
    this.rowDblClick.emit(e);
  }

  OnrowRemoving(e: any): void {
    this.rowRemoving.emit(e);
  }

  OnfocusedRowChanged(e: any): void {
    this.focusedRowData = e?.row?.data ?? null;
    if (this.effectiveShowEstadoToolbar) {
      this.rebuildToolbarOptions();
    }
    if (!e?.row?.data) {
      this.cdr.markForCheck();
      return;
    }
    this.focusedRowChanged.emit(e);
    this.cdr.markForCheck();
  }

  OnRowClick(e: any): void {
    this.rowClick.emit(e);
  }

  OneditClick(e: any): void {
    this.editClick.emit(e);
  }

  /** DevExtreme usa 0 o 'all' para "Todos"; no usar || porque 0 es falsy. */
  private resolveActivePageSize(value: unknown): number {
    if (value === 'all') {
      return 0;
    }
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : this.pageSize;
  }

  OnOptionChanged(e: any): void {
    const fullName = e?.fullName;
    const grid = e.component;
    if (!grid) {
      return;
    }

    const pageSizeChanged = fullName === 'paging.pageSize' && e.value !== e.previousValue;
    const pageIndexChanged = fullName === 'paging.pageIndex' && e.value !== e.previousValue;

    if (pageSizeChanged) {
      if (this.hybridPaging && this.hybridSuppressPageSizeEmit) {
        this.hybridSuppressPageSizeEmit = false;
        this.activePageSize = this.displayPageSize;
        this.cdr.markForCheck();
        return;
      }

      const resolved = this.resolveActivePageSize(e.value);

      if (this.hybridPaging) {
        // Selector inferior = lote API; "Todos" (0) fuerza pageSize de display para no pintar todo.
        this.apiPageSizeChange.emit(resolved);
        if (resolved === 0) {
          this.activePageSize = this.displayPageSize;
          this.hybridSuppressPageSizeEmit = true;
          grid.option('paging.pageSize', this.displayPageSize);
        } else {
          this.activePageSize = resolved;
        }
      } else {
        this.activePageSize = resolved;
        this.pageSizeChange.emit(this.activePageSize);
      }

      grid.pageIndex(0);

      if (this.pageSizeRepaintTimer) {
        clearTimeout(this.pageSizeRepaintTimer);
        this.pageSizeRepaintTimer = undefined;
      }

      const reloadPromise = grid.getDataSource()?.reload();
      const afterPagingChange = () => {
        grid.repaint();
        this.refreshHeaderFilterDataSources();
      };

      if (this.isRemotePagingActive || this.hybridPaging) {
        if (reloadPromise && typeof reloadPromise.then === 'function') {
          reloadPromise.then(afterPagingChange);
        } else {
          this.pageSizeRepaintTimer = setTimeout(afterPagingChange);
        }
        return;
      }

      this.pageSizeRepaintTimer = setTimeout(afterPagingChange);
      return;
    }

    if (pageIndexChanged) {
      if (this.effectiveSyncHeaderFilterWithPage) {
        this.syncPageHeaderFilters(grid);
      }
      return;
    }

    // Filter row A+P (filtering: false): no tocar columnas ni headerFilter — evita reload al API.
    if (fullName === 'filterValue' && this.isRemoteFilteringActive) {
      this.refreshHeaderFilterDataSources();
    }
  }

  OnContentReady(e: any): void {
    const gridElement = e?.element as HTMLElement | undefined;
    if (!gridElement) {
      return;
    }
    this.bindPermissionTooltipHandlers(gridElement);
    this.syncNativeHeaderToolbar(e?.component);
    this.registerPageContextHandlers();
    if (this.effectiveSyncHeaderFilterWithPage) {
      this.syncPageHeaderFilters(e?.component);
    }
    if (this.effectiveShowEstadoToolbar && this.isBrowse) {
      this.syncFocusedRowFromGrid();
    }
    if (this.isUnifiedActive) {
      requestAnimationFrame(() => e?.component?.updateDimensions?.());
    }
  }

  private bindPermissionTooltipHandlers(gridElement: HTMLElement): void {
    if (this.permissionTooltipGridElement === gridElement) {
      return;
    }

    this.unbindPermissionTooltipHandlers();
    this.permissionTooltipGridElement = gridElement;
    gridElement.addEventListener('mouseover', this.onPermissionTargetMouseOver, true);
    gridElement.addEventListener('mouseout', this.onPermissionTargetMouseOut, true);
  }

  private unbindPermissionTooltipHandlers(): void {
    if (!this.permissionTooltipGridElement) {
      return;
    }

    this.permissionTooltipGridElement.removeEventListener('mouseover', this.onPermissionTargetMouseOver, true);
    this.permissionTooltipGridElement.removeEventListener('mouseout', this.onPermissionTargetMouseOut, true);
    this.permissionTooltipGridElement = undefined;
  }

  private readonly onPermissionTargetMouseOver = (event: MouseEvent): void => {
    const target =
      this.resolvePermissionTooltipTarget(event.target) ??
      this.resolvePermissionTooltipTarget(document.elementFromPoint(event.clientX, event.clientY));
    if (!target) {
      return;
    }

    if (this.permissionTooltipHideTimer) {
      clearTimeout(this.permissionTooltipHideTimer);
      this.permissionTooltipHideTimer = undefined;
    }

    const message = this.resolvePermissionTooltipMessage(target);
    if (!message) {
      return;
    }

    this.permissionTooltipTarget = target;
    this.permissionTooltipMessage = message;
    this.permissionTooltipVisible = true;
    this.cdr.markForCheck();
  };

  private readonly onPermissionTargetMouseOut = (event: MouseEvent): void => {
    const fromTarget = this.resolvePermissionTooltipTarget(event.target);
    const toTarget = this.resolvePermissionTooltipTarget(event.relatedTarget);
    if (!fromTarget || fromTarget === toTarget) {
      return;
    }

    if (this.permissionTooltipHideTimer) {
      clearTimeout(this.permissionTooltipHideTimer);
    }

    this.permissionTooltipHideTimer = setTimeout(() => {
      this.permissionTooltipVisible = false;
      this.permissionTooltipTarget = null;
      this.cdr.markForCheck();
    }, 80);
  };

  private resolvePermissionTooltipTarget(eventTarget: EventTarget | null): HTMLElement | null {
    if (!(eventTarget instanceof HTMLElement)) {
      return null;
    }

    const match = eventTarget.closest<HTMLElement>('[class*="sguees-action-no-"]');
    if (!match || !this.permissionTooltipGridElement?.contains(match)) {
      return null;
    }

    return match;
  }

  private resolvePermissionTooltipMessage(target: HTMLElement): string {
    for (const className of Array.from(target.classList)) {
      const message = this.permissionTooltipMessages[className];
      if (message) {
        return message;
      }
    }

    return '';
  }

  OnToolbarPreparing(e: any): void {
    if (this.shouldHideNativeHeaderToolbar) {
      e.toolbarOptions.visible = false;
      return;
    }

    const exportItem = e?.toolbarOptions?.items?.find((item: any) => item?.name === 'exportButton');
    if (!exportItem) {
      return;
    }

    const canExport = !!this.permitePrint;
    const existingClass = String(exportItem.options?.elementAttr?.class || '').replace(/\bsguees-action-no-export\b/g, '').trim();
    exportItem.options = {
      ...(exportItem.options || {}),
      hint: canExport ? 'Exportar' : 'No tiene permiso para exportar registros.',
      elementAttr: {
        ...(exportItem.options?.elementAttr || {}),
        class: canExport ? existingClass : `${existingClass} sguees-action-no-export`.trim(),
      },
    };
  }

  private syncNativeHeaderToolbar(instance?: any): void {
    const grid = instance ?? this.gData?.instance;
    if (!grid || !this.nativeToolbar) {
      return;
    }
    grid.option('toolbar', { visible: !this.shouldHideNativeHeaderToolbar });
  }

  exportGrid(): void {
    if (!this.permitePrint) {
      return;
    }
    const instance = this.gData?.instance;
    if (!instance) {
      return;
    }
    this.runExcelExport(instance);
  }

  private registerPageContextHandlers(): void {
    this.pageContext.registerGridHandlers({
      refresh: () => {
        if (this.shouldHandleBarraRefresh()) {
          this.onRefreshClick();
        }
      },
      export: () => this.exportGrid(),
    });
  }

  private runExcelExport(component: unknown): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    const setAlternatingRowsBackground = (gridCell: any, excelCell: any): void => {
      if (gridCell.rowType === 'header' || gridCell.rowType === 'data') {
        if (excelCell.fullAddress.row % 2 === 0) {
          excelCell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'D3D3D3' },
            bgColor: { argb: 'D3D3D3' },
          };
        }
      }
    };

    exportDataGrid({
      worksheet,
      component: component as Parameters<typeof exportDataGrid>[0]['component'],
      keepColumnWidths: true,
      autoFilterEnabled: true,
      topLeftCell: { row: 1, column: 1 },
      customizeCell: ({ gridCell, excelCell }) => {
        setAlternatingRowsBackground(gridCell, excelCell);
      },
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer: BlobPart) => {
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), `${this.exportFileName}.xlsx`);
      });
    });
  }

  onExporting(e: any): void {
    if (!this.permitePrint) {
      e.cancel = true;
      return;
    }

    e.cancel = true;
    this.runExcelExport(e.component);
  }

  selectAllOnPage(): void {
    const grid = this.gData?.instance;
    if (!grid) {
      return;
    }
    grid.selectAll();
  }

  clearSelection(): void {
    const grid = this.gData?.instance;
    if (!grid) {
      return;
    }
    grid.clearSelection();
  }

  getSelectedRows(): any[] {
    return this.gData?.instance?.getSelectedRowsData?.() ?? [];
  }
}

@NgModule({
  imports: [DxDataGridModule, DxSelectBoxModule, DxTextBoxModule, DxTooltipModule, CommonModule, EmptyStateModule],
  declarations: [DataGridMttoComponent],
  exports: [DataGridMttoComponent],
})
export class DataGridMttoModule {}
