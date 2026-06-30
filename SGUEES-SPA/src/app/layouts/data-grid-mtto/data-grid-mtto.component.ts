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

import { exportDataGrid } from 'devextreme/excel_exporter';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver-es';

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
  /** null = adoptar contexto barra (header-only). false = toolbar legacy 7B. */
  @Input() unifiedToolbar: boolean | null = null;
  @Input() searchPlaceholder = 'Buscar...';
  @Input() remoteOperations: boolean | Record<string, unknown> = false;
  @Input() pageSize = 5;
  @Input() allowedPageSizes: number[] = [5, 10, 25, 50, 100];
  @Input() repaintChangesOnly: boolean | null = null;
  @Input() searchBoxOptions: Record<string, unknown> | null = null;
  @Input() estadoSelectOptions: Record<string, unknown> | null = null;
  @Input() exportFileName = 'Data';
  @Input() headerFilterLoader?: RemoteHeaderFilterLoader;
  @Input() syncHeaderFilterWithPage = false;

  optRefresh: Record<string, unknown> = {};
  optAdd: Record<string, unknown> = {};
  permissionTooltipTarget: HTMLElement | null = null;
  permissionTooltipVisible = false;
  permissionTooltipMessage = '';
  resolvedGridHeight: string | number = 670;
  hasFocusedRow = false;
  filterSyncEnabled = false;
  gridVisible = true;
  activePageSize = 5;
  displayColumns: any[] = [];

  private actionColumnsReady = false;
  private showEditActions = true;
  private showDeleteActions = true;
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
    return this.showExport;
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

  get isRemoteHeaderFilterActive(): boolean {
    if (this.remoteOperations === true) {
      return true;
    }
    if (this.remoteOperations && typeof this.remoteOperations === 'object') {
      const ops = this.remoteOperations as Record<string, unknown>;
      return !!(ops['paging'] || ops['filtering']);
    }
    return false;
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
  }

  ngOnInit(): void {
    this.activePageSize = this.pageSize;
    this.rebuildToolbarOptions();
    this.contextSub = this.pageContext.changes$.subscribe(() => {
      this.permiteAddEffective = this.pageContext.snapshot.permiteAdd;
      this.rebuildToolbarOptions();
      this.cdr.markForCheck();
    });
    this.permiteAddEffective = this.pageContext.snapshot.permiteAdd;
    this.resolveGridHeight();
    this.columnHidingActive = this.columnHidingEnabled;
    this.filterSyncEnabled = this.filterValue != null && this.filterValue !== '';
    this.resolveActionVisibility();
    this.ensureActionColumns();
    this.resolveDisplayColumns();
    this.updateFocusedRowState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gridHeight']) {
      this.resolveGridHeight();
    }
    if (changes['pageSize'] && !changes['pageSize'].firstChange) {
      this.activePageSize = this.pageSize;
    }
    if (changes['columnHidingEnabled']) {
      this.columnHidingActive = this.columnHidingEnabled;
    }
    if (changes['filterValue']) {
      this.filterSyncEnabled = this.filterValue != null && this.filterValue !== '';
    }
    if (changes['permiteEditar'] || changes['permiteDele']) {
      this.resolveActionVisibility();
      this.syncActionButtonsVisibility();
    }
    if (changes['models']) {
      this.updateFocusedRowState();
    }
    if (
      changes['showRefresh'] ||
      changes['showAdd'] ||
      changes['permitePrint'] ||
      changes['titulo'] ||
      changes['subtitle'] ||
      changes['unifiedToolbar']
    ) {
      this.rebuildToolbarOptions();
    }
    if (changes['columns'] || changes['headerFilterLoader'] || changes['remoteOperations'] || changes['syncHeaderFilterWithPage']) {
      this.resolveDisplayColumns();
    }
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.contextSub?.unsubscribe();
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
      onClick: this.onRefreshClick,
    };
    this.optAdd = {
      text: 'Agregar registro',
      icon: 'add',
      type: 'default',
      stylingMode: 'contained',
      elementAttr: canAdd ? undefined : { class: 'sguees-action-no-add' },
      hint: canAdd ? 'Agregar registro' : 'No tiene permiso para crear registros.',
      onClick: this.onAddClick,
    };
  }

  onRefreshClick(): void {
    this.refresh.emit();
    this.pageContext.triggerRefresh();
  }

  onAddClick(): void {
    if (!this.permiteAddEffective) {
      return;
    }
    this.add.emit();
    this.pageContext.triggerAdd();
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
    this.showEditActions =
      typeof this.permiteEditar === 'function'
        ? (this.permiteEditar as (e: unknown) => boolean)({})
        : !!this.permiteEditar;
    this.showDeleteActions =
      typeof this.permiteDele === 'function'
        ? (this.permiteDele as (e: unknown) => boolean)({})
        : !!this.permiteDele;
  }

  private updateFocusedRowState(): void {
    this.hasFocusedRow = Array.isArray(this.models) && this.models.length > 0;
  }

  private resolveDisplayColumns(): void {
    if (!this.columns?.length) {
      this.displayColumns = [];
      return;
    }

    if (this.headerFilterLoader && this.isRemoteHeaderFilterActive) {
      this.displayColumns = attachRemoteHeaderFilters([...this.columns], this.headerFilterLoader);
      return;
    }

    this.displayColumns = this.columns;
  }

  refreshHeaderFilterDataSources(): void {
    if (this.syncHeaderFilterWithPage && this.isRemotePagingActive) {
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
      if (!current?.sortOrder) {
        return column;
      }

      return {
        ...column,
        sortOrder: current.sortOrder,
        sortIndex: current.sortIndex,
      };
    });

    if (grid && this.displayColumns.length) {
      grid.option('columns', [...this.displayColumns]);
    }

    this.cdr.markForCheck();
  }

  syncPageHeaderFilters(grid?: any): void {
    const instance = grid ?? this.gData?.instance;
    if (!instance || !this.syncHeaderFilterWithPage || !this.isRemotePagingActive || !this.columns?.length) {
      return;
    }

    syncHeaderFiltersFromPageData(instance, this.columns);
    this.cdr.markForCheck();
  }

  private ensureActionColumns(): void {
    if (!this.columns || this.actionColumnsReady) {
      return;
    }
    if (
      this.columns.some(
        (c: { name?: string }) => c?.name === 'btnAcciones' || c?.name === 'btnEditar',
      )
    ) {
      this.actionColumnsReady = true;
      this.syncActionButtonsVisibility();
      return;
    }
    this.columns.push({
      type: 'buttons',
      name: 'btnAcciones',
      caption: 'Options',
      width: 125,
      minWidth: 125,
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
          visible: this.showEditActions,
          onClick: this.OneditClick,
        },
        {
          name: 'delete',
          hint: 'Eliminar registro',
          icon: 'trash',
          stylingMode: 'text',
          cssClass: 'sguees-grid-action-delete',
          visible: this.showDeleteActions,
        },

        // Botones personalizados enviados desde el componente hijo
        ...this.customButtons,
      ],
    });
    this.actionColumnsReady = true;
  }

  private syncActionButtonsVisibility(): void {
    if (!this.columns) {
      return;
      }
        const merged = this.columns.find((c: { name?: string }) => c?.name === 'btnAcciones');
        if (merged?.buttons?.length) {

      for (const button of merged.buttons) {

        if (button.icon === 'edit') {
          button.visible = this.showEditActions;
        }

        if (button.name === 'delete') {
          button.visible = this.showDeleteActions;
        }

      }

      return;
    }
  }

  OnrowDblClick(e: any): void {
    this.rowDblClick.emit(e);
  }

  OnrowRemoving(e: any): void {
    this.rowRemoving.emit(e);
  }

  OnfocusedRowChanged(e: any): void {
    if (!e?.row?.data) {
      return;
    }
    this.focusedRowChanged.emit(e);
  }

  OnRowClick(e: any): void {
    this.rowClick.emit(e);
  }

  OneditClick(e: any): void {
    this.editClick.emit(e);
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
      this.activePageSize = Number(e.value) || this.pageSize;
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

      if (this.isRemotePagingActive) {
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
      this.refreshHeaderFilterDataSources();
      return;
    }

    if (fullName === 'filterValue') {
      this.refreshHeaderFilterDataSources();
    }
  }

  OnContentReady(e: any): void {
    const gridElement = e?.element as HTMLElement | undefined;
    if (!gridElement) {
      return;
    }
    this.bindPermissionTooltipHandlers(gridElement);
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

  onExporting(e: any): void {
    if (!this.permitePrint) {
      e.cancel = true;
      return;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    function setAlternatingRowsBackground(gridCell: any, excelCell: any): void {
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
    }

    exportDataGrid({
      worksheet,
      component: e.component,
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
}

@NgModule({
  imports: [DxDataGridModule, DxSelectBoxModule, DxTextBoxModule, DxTooltipModule, CommonModule, EmptyStateModule],
  declarations: [DataGridMttoComponent],
  exports: [DataGridMttoComponent],
})
export class DataGridMttoModule {}
