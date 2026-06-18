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
import { EmptyStateModule } from 'src/app/shared/components/library/empty-state/empty-state.component';
import { MttoPageContextService } from 'src/app/layouts/mtto-page-context.service';
import { Subscription } from 'rxjs';

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
  @Input() isBrowse: boolean = true;
  @Input() keyExpr: string | string[] = '';
  @Input() gridHeight: string | number = 670;
  @Input() columnAutoWidth = false;
  @Input() columnHidingEnabled = false;
  @Input() responsiveColumnHiding = false;
  columnHidingActive = false;
  @Input() permiteEditar: boolean | Function = true;
  @Input() permiteDele: boolean | Function = true;
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
  @Input() searchBoxOptions: Record<string, unknown> | null = null;
  @Input() estadoSelectOptions: Record<string, unknown> | null = null;
  @Input() exportFileName = 'Data';

  optRefresh: Record<string, unknown> = {};
  optAdd: Record<string, unknown> = {};
  resolvedGridHeight: string | number = 670;
  hasFocusedRow = false;
  filterSyncEnabled = false;

  private actionColumnsReady = false;
  private showEditActions = true;
  private showDeleteActions = true;
  private contextSub?: Subscription;
  private permiteAddEffective = false;

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
    const explicit = this.subtitle?.trim();
    if (explicit) {
      return explicit;
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

  constructor(
    private cdr: ChangeDetectorRef,
    private pageContext: MttoPageContextService,
  ) {
    this.OneditClick = this.OneditClick.bind(this);
    this.onRefreshClick = this.onRefreshClick.bind(this);
    this.onAddClick = this.onAddClick.bind(this);
  }

  ngOnInit(): void {
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
    this.updateFocusedRowState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gridHeight']) {
      this.resolveGridHeight();
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
      changes['titulo'] ||
      changes['subtitle'] ||
      changes['unifiedToolbar']
    ) {
      this.rebuildToolbarOptions();
    }
    this.cdr.markForCheck();
  }

  ngOnDestroy(): void {
    this.contextSub?.unsubscribe();
  }

  private rebuildToolbarOptions(): void {
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
      disabled: !this.permiteAddEffective,
      onClick: this.onAddClick,
    };
  }

  onRefreshClick(): void {
    this.refresh.emit();
    this.pageContext.triggerRefresh();
  }

  onAddClick(): void {
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
      width: 104,
      minWidth: 104,
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
      ],
    });
    this.actionColumnsReady = true;
  }

  private syncActionButtonsVisibility(): void {
    if (!this.columns) {
      return;
    }
    const merged = this.columns.find((c: { name?: string }) => c?.name === 'btnAcciones');
    if (merged?.buttons?.length === 2 && merged.buttons[1]?.name === 'delete') {
      merged.buttons[0].visible = this.showEditActions;
      merged.buttons[1].visible = this.showDeleteActions;
      return;
    }
    const editCol = this.columns.find((c: { name?: string }) => c?.name === 'btnEditar');
    const delCol = this.columns.find((c: { name?: string }) => c?.name === 'btnEliminar');
    if (editCol?.buttons?.[0]) {
      editCol.buttons[0].visible = this.showEditActions;
    }
    if (delCol?.buttons?.[0]) {
      delCol.buttons[0].visible = this.showDeleteActions;
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

  onExporting(e: any): void {
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
  imports: [DxDataGridModule, DxSelectBoxModule, DxTextBoxModule, CommonModule, EmptyStateModule],
  declarations: [DataGridMttoComponent],
  exports: [DataGridMttoComponent],
})
export class DataGridMttoModule {}
