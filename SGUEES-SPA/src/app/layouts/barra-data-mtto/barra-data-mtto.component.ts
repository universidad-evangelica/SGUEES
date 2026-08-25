import { CommonModule } from '@angular/common';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  EventEmitter,
  HostBinding,
  Input,
  NgModule,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
} from '@angular/core';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxTabPanelModule } from 'devextreme-angular/ui/tab-panel';
import { DxToolbarModule } from 'devextreme-angular/ui/toolbar';
import {
  BreadcrumbItem,
  PageHeaderModule,
} from 'src/app/shared/components/library/page-header/page-header.component';
import { MttoPageContextService } from 'src/app/layouts/mtto-page-context.service';
import { BarraRibbonTabDirective } from './barra-ribbon-tab.directive';
import { buildEstadoToolbarOptions, computeToolbarBtnWidth } from 'src/app/shared/mtto/mtto-grid.helpers';
import { DataLookupModule } from 'src/app/layouts/data-lookup/data-lookup.component';

export type { BreadcrumbItem } from 'src/app/shared/components/library/page-header/page-header.component';

export type BarraLayoutMode = 'legacy' | 'header-only';

/** Config de un combo (app-data-lookup / DropDownBox) en la barra (máx. 4: combox1–combox4). */
export interface BarraMttoCombox {
  label?: string;
  /** Catálogo del lookup (mismo `model` de app-data-lookup). */
  model: any[];
  value: any;
  valueExpr?: string;
  displayExpr?: string;
  showClearButton?: boolean;
  lookupColumns?: any[] | null;
  selectedRowKeys?: (rows: any[]) => any;
  dropDownWidth?: number | string | null;
  /** Ancho del control en el toolbar. */
  width?: number;
}

/**
 * FASE 5.5: opciones DX estables (no crear objetos en template — evita loop CD + DevExtreme).
 * FASE 8B: layoutMode header-only delega browse toolbar al grid unificado.
 */
@Component({
  selector: 'app-barra-data-mtto',
  templateUrl: './barra-data-mtto.component.html',
  styleUrls: ['./barra-data-mtto.component.scss'],
  host: { class: 'sguees-barra-mtto-premium sguees-mtto-chrome' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BarraDataMttoComponent implements OnInit, OnChanges, OnDestroy, AfterContentInit {
  @Input() tituloVentana: string = '';
  @Input() subTituloVentana: string = '';
  @Input() subtitle?: string;
  @Input() eyebrow?: string;
  @Input() breadcrumbs?: BreadcrumbItem[];
  /** Fase 8B: header-only = toolbar browse en grid; legacy = comportamiento 7A. */
  @Input() layoutMode: BarraLayoutMode = 'header-only';
  /** Browse con pestañas: Principal (toolbar estándar) + extras proyectadas desde el hijo. */
  @Input() showRibbon = false;
  @Input() ribbonPrincipalTitle = 'Principal';
  @Input() isBrowse: boolean = false;
  @Input() isForm: boolean = false;
  @Input() permiteAdd: boolean = false;
  @Input() showRefresh: boolean = true;
  @Input() showExport = false;
  @Input() permiteExport = true;
  @Input() showEstadoToolbar = false;
  @Input() campoEstado = '';
  @Input() puedeCambiarEstado = true;
  @Input() focusedRow: Record<string, unknown> | null = null;
  @Input() showDates: boolean = false;
  @Input() items: any[] = [];
  @Input() FECHA_INICIAL: Date = new Date();
  @Output() FECHA_INICIALChange = new EventEmitter<any>();
  @Input() FECHA_FINAL: Date = new Date();
  @Output() FECHA_FINALChange = new EventEmitter<any>();
  @Output() nuevo = new EventEmitter<any>();
  @Output() guardar = new EventEmitter<any>();
  @Output() cancelar = new EventEmitter<any>();
  @Output() consultar = new EventEmitter<any>();
  @Output() exportar = new EventEmitter<any>();
  @Output() activarInactivar = new EventEmitter<void>();

  @Input() btn1: string = '';
  @Input() btn1Icon: string = '';
  @Input() btn1Location: string = 'before';
  @Input() btn1Type: string = 'default';
  @Input() btn1Height: number = 44;
  @Input() btn1Width: number = 0;
  @Input() btn1Mode: string = 'contained';
  @Output() btn1Click = new EventEmitter<any>();

  @Input() btn2: string = '';
  @Input() btn2Icon: string = '';
  @Input() btn2Location: string = 'before';
  @Input() btn2Type: string = 'default';
  @Input() btn2Height: number = 44;
  @Input() btn2Width: number = 0;
  @Input() btn2Mode: string = 'contained';
  @Output() btn2Click = new EventEmitter<any>();

  @Input() btn3: string = '';
  @Input() btn3Icon: string = '';
  @Input() btn3Location: string = 'before';
  @Input() btn3Type: string = 'default';
  @Input() btn3Height: number = 44;
  @Input() btn3Width: number = 0;
  @Input() btn3Mode: string = 'contained';
  @Output() btn3Click = new EventEmitter<any>();

  @Input() btn4: string = '';
  @Input() btn4Icon: string = '';
  @Input() btn4Location: string = 'before';
  @Input() btn4Type: string = 'default';
  @Input() btn4Height: number = 44;
  @Input() btn4Width: number = 0;
  @Input() btn4Mode: string = 'contained';
  @Output() btn4Click = new EventEmitter<any>();

  @Input() btn5: string = '';
  @Input() btn5Icon: string = '';
  @Input() btn5Location: string = 'before';
  @Input() btn5Type: string = 'default';
  @Input() btn5Height: number = 44;
  @Input() btn5Width: number = 0;
  @Input() btn5Mode: string = 'contained';
  @Output() btn5Click = new EventEmitter<any>();

  @Input() btn6: string = '';
  @Input() btn6Icon: string = '';
  @Input() btn6Location: string = 'before';
  @Input() btn6Type: string = 'default';
  @Input() btn6Height: number = 44;
  @Input() btn6Width: number = 0;
  @Input() btn6Mode: string = 'contained';
  @Output() btn6Click = new EventEmitter<any>();

  // Qué hace: hasta 4 combos de filtro en el header (mismo patrón de slots que btn1–btn6).
  @Input() combox1: BarraMttoCombox | null = null;
  @Input() combox2: BarraMttoCombox | null = null;
  @Input() combox3: BarraMttoCombox | null = null;
  @Input() combox4: BarraMttoCombox | null = null;
  @Output() combox1Change = new EventEmitter<any>();
  @Output() combox2Change = new EventEmitter<any>();
  @Output() combox3Change = new EventEmitter<any>();
  @Output() combox4Change = new EventEmitter<any>();

  optNuevo: Record<string, unknown> = {};
  optGuardar: Record<string, unknown> = {};
  optCancelar: Record<string, unknown> = {};
  optRefresh: Record<string, unknown> = {};
  optExport: Record<string, unknown> = {};
  optBtn1: Record<string, unknown> = {};
  optBtn2: Record<string, unknown> = {};
  optBtn3: Record<string, unknown> = {};
  optBtn4: Record<string, unknown> = {};
  optBtn5: Record<string, unknown> = {};
  optBtn6: Record<string, unknown> = {};
  optFechaInicial: Record<string, unknown> = {};
  optFechaFinal: Record<string, unknown> = {};
  optActivar: Record<string, unknown> = {};
  optDesactivar: Record<string, unknown> = {};

  ribbonTabIndex = 0;

  @ContentChildren(BarraRibbonTabDirective)
  ribbonTabDirectives!: QueryList<BarraRibbonTabDirective>;

  private ribbonTabsSubscribed = false;

  /** Subtítulo para page-header / contexto: `subtitle` tiene prioridad sobre `subtituloVentana`. */
  get resolvedSubtitle(): string {
    const explicit = this.subtitle?.trim();
    if (explicit) {
      return explicit;
    }
    return this.subTituloVentana?.trim() ?? '';
  }

  get hasHeaderMeta(): boolean {
    return !!(this.eyebrow?.trim() || this.breadcrumbs?.length);
  }

  /** Muestra page-header enterprise (título arriba, toolbar abajo). */
  get showPageHeader(): boolean {
    return !!(this.tituloVentana?.trim() || this.hasHeaderMeta);
  }

  /**
   * Fila de acciones.
   * header-only browse: acciones en el grid unificado (sin segunda barra vacía),
   * salvo fechas/botones extra / ribbon que aún viven en la barra.
   * header-only consulta/edición: Guardar-Cancelar en barra.
   */
  get showToolbarRow(): boolean {
    if (this.showRibbonBrowse) {
      return false;
    }
    if (!this.isBrowse) {
      return true;
    }
    if (this.isHeaderOnlyMode) {
      return this.browseNeedsBarraToolbar;
    }
    return true;
  }

  /** Browse con ribbon: pestaña Principal + extras del hijo. */
  get showRibbonBrowse(): boolean {
    return this.showRibbon && this.isBrowse;
  }

  get showCombox1(): boolean {
    return this.isBrowse && !!this.combox1;
  }
  get showCombox2(): boolean {
    return this.isBrowse && !!this.combox2;
  }
  get showCombox3(): boolean {
    return this.isBrowse && !!this.combox3;
  }
  get showCombox4(): boolean {
    return this.isBrowse && !!this.combox4;
  }

  /** Fila de combox visible en browse cuando hay al menos un slot configurado. */
  get showComboxRow(): boolean {
    return (
      this.isBrowse &&
      (!!this.combox1 || !!this.combox2 || !!this.combox3 || !!this.combox4)
    );
  }

  get visibleRibbonTabs(): BarraRibbonTabDirective[] {
    return (
      this.ribbonTabDirectives?.filter(
        (tab) => tab.barraRibbonTabVisible !== false && !!tab.title?.trim(),
      ) ?? []
    );
  }

  /** Browse con fechas, btn1–6, combos o ribbon: la barra sigue mostrando toolbar. */
  get browseNeedsBarraToolbar(): boolean {
    return (
      this.showRibbon ||
      this.showDates ||
      this.showExport ||
      this.effectiveShowEstadoToolbar ||
      !!this.btn1 ||
      !!this.btn2 ||
      !!this.btn3 ||
      !!this.btn4 ||
      !!this.btn5 ||
      !!this.btn6 ||
      !!this.combox1 ||
      !!this.combox2 ||
      !!this.combox3 ||
      !!this.combox4
    );
  }

  /** Separador tras Nuevo / Guardar-Cancelar cuando hay más acciones a la izquierda (sin combox: van en fila aparte). */
  get showPrimaryToolbarDivider(): boolean {
    if (!this.isBrowse) {
      return true;
    }
    return (
      this.permiteAdd ||
      this.effectiveShowEstadoToolbar ||
      !!this.btn1 ||
      !!this.btn2 ||
      !!this.btn3 ||
      !!this.btn4 ||
      !!this.btn5 ||
      !!this.btn6
    );
  }

  get effectiveShowEstadoToolbar(): boolean {
    return this.isBrowse && this.showEstadoToolbar && !!this.campoEstado?.trim();
  }

  get isHeaderOnlyMode(): boolean {
    return this.layoutMode === 'header-only';
  }

  @HostBinding('class.sguees-barra-mtto--browse')
  get hostBrowse(): boolean {
    return this.isBrowse;
  }

  /** Browse + header-only: solo título; toolbar del grid (si no hay fechas/btn extra). */
  @HostBinding('class.sguees-barra-mtto--header-only-browse')
  get hostHeaderOnlyBrowse(): boolean {
    return this.isHeaderOnlyMode && this.isBrowse && !this.browseNeedsBarraToolbar;
  }

  @HostBinding('class.sguees-barra-mtto--header-only-edit')
  get hostHeaderOnlyEdit(): boolean {
    return this.isHeaderOnlyMode && !this.isBrowse;
  }

  @HostBinding('class.sguees-barra-mtto--legacy')
  get hostLegacy(): boolean {
    return this.layoutMode === 'legacy';
  }

  @HostBinding('class.sguees-barra-mtto--ribbon')
  get hostRibbon(): boolean {
    return this.showRibbonBrowse;
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private pageContext: MttoPageContextService,
  ) {
    this.OnNuevo = this.OnNuevo.bind(this);
    this.OnGuardar = this.OnGuardar.bind(this);
    this.OnCancelar = this.OnCancelar.bind(this);
    this.OnConsultar = this.OnConsultar.bind(this);
    this.OnExportar = this.OnExportar.bind(this);
    this.Onbtn1Click = this.Onbtn1Click.bind(this);
    this.Onbtn2Click = this.Onbtn2Click.bind(this);
    this.Onbtn3Click = this.Onbtn3Click.bind(this);
    this.Onbtn4Click = this.Onbtn4Click.bind(this);
    this.Onbtn5Click = this.Onbtn5Click.bind(this);
    this.Onbtn6Click = this.Onbtn6Click.bind(this);
    this.OnValueChangeFECHA_INICIAL = this.OnValueChangeFECHA_INICIAL.bind(this);
    this.OnValueChangeFECHA_FINAL = this.OnValueChangeFECHA_FINAL.bind(this);
    this.OnActivarInactivar = this.OnActivarInactivar.bind(this);
  }

  ngOnInit(): void {
    this.syncPageContext();
    this.rebuildToolbarOptions();
  }

  ngAfterContentInit(): void {
    this.bindRibbonTabChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const headerContextChange =
      changes['tituloVentana'] ||
      changes['subtitle'] ||
      changes['subTituloVentana'] ||
      changes['eyebrow'] ||
      changes['breadcrumbs'] ||
      changes['layoutMode'] ||
      changes['permiteAdd'] ||
      changes['showRefresh'] ||
      changes['isBrowse'] ||
      changes['showRibbon'];

    if (headerContextChange) {
      this.syncPageContext();
      this.cdr.markForCheck();
    }
    if (
      changes['isBrowse'] ||
      changes['isForm'] ||
      changes['permiteAdd'] ||
      changes['showRefresh'] ||
      changes['showDates'] ||
      changes['layoutMode'] ||
      changes['showRibbon'] ||
      changes['showExport'] ||
      changes['permiteExport'] ||
      changes['showEstadoToolbar'] ||
      changes['campoEstado'] ||
      changes['puedeCambiarEstado'] ||
      changes['focusedRow'] ||
      changes['btn1'] ||
      changes['btn2'] ||
      changes['btn3'] ||
      changes['btn4'] ||
      changes['btn5'] ||
      changes['btn6'] ||
      changes['combox1'] ||
      changes['combox2'] ||
      changes['combox3'] ||
      changes['combox4'] ||
      changes['FECHA_INICIAL'] ||
      changes['FECHA_FINAL']
    ) {
      this.rebuildToolbarOptions();
    }
  }

  ngOnDestroy(): void {
    this.pageContext.reset();
  }

  private syncPageContext(): void {
    const unifiedBrowse =
      this.isHeaderOnlyMode && this.isBrowse && !this.browseNeedsBarraToolbar;
    this.pageContext.updateFromBarra(
      {
        titulo: this.tituloVentana?.trim() ?? '',
        subtitle: this.resolvedSubtitle,
        permiteAdd: this.permiteAdd,
        showRefresh: this.showRefresh,
        unifiedToolbar: unifiedBrowse,
        // Título permanece en page-header de la barra; el grid solo lleva acciones.
        embedTitleInGrid: false,
        isBrowse: this.isBrowse,
      },
      {
        add: () => this.nuevo.emit(),
        refresh: () => this.consultar.emit(),
      },
    );
  }

  private rebuildToolbarOptions(): void {
    const base = { stylingMode: 'contained', height: 44 };
    const browseToolbarInBarra =
      this.isBrowse && (!this.isHeaderOnlyMode || this.browseNeedsBarraToolbar);

    this.optNuevo = {
      ...base,
      icon: 'plus',
      text: 'Nuevo',
      type: 'default',
      width: computeToolbarBtnWidth('Nuevo'),
      elementAttr: { class: 'sguees-barra-btn-standard' },
      onClick: this.OnNuevo,
      visible: browseToolbarInBarra && this.permiteAdd && this.isBrowse,
    };
    this.optGuardar = {
      ...base,
      icon: 'save',
      text: 'Guardar',
      type: 'success',
      width: computeToolbarBtnWidth('Guardar'),
      elementAttr: { class: 'sguees-barra-btn-standard' },
      onClick: this.OnGuardar,
    };
    this.optCancelar = {
      ...base,
      icon: 'clear',
      text: 'Cancelar',
      type: 'danger',
      width: computeToolbarBtnWidth('Cancelar'),
      elementAttr: { class: 'sguees-barra-btn-standard' },
      onClick: this.OnCancelar,
    };
    this.optRefresh = {
      text: 'Refresh',
      icon: 'refresh',
      onClick: this.OnConsultar,
      visible: browseToolbarInBarra && this.isBrowse && this.showRefresh,
      stylingMode: 'text',
      height: 44,
    };
    this.optExport = {
      text: 'Exportar',
      icon: 'exportxlsx',
      type: 'default',
      stylingMode: 'outlined',
      height: 44,
      width: computeToolbarBtnWidth('Exportar', 180),
      onClick: this.OnExportar,
      visible: browseToolbarInBarra && this.isBrowse && this.showExport,
      disabled: !this.permiteExport,
      elementAttr: { class: 'sguees-barra-btn-export sguees-barra-btn-standard' },
      hint: this.permiteExport
        ? 'Exportar'
        : 'No tiene permiso para exportar registros.',
    };
    this.optBtn1 = this.buildExtraBtn(
      this.btn1, this.btn1Icon, this.btn1Type, this.btn1Mode, this.Onbtn1Click, this.btn1Height, this.btn1Width,
      browseToolbarInBarra,
    );
    this.optBtn2 = this.buildExtraBtn(
      this.btn2, this.btn2Icon, this.btn2Type, this.btn2Mode, this.Onbtn2Click, this.btn2Height, this.btn2Width,
      browseToolbarInBarra,
    );
    this.optBtn3 = this.buildExtraBtn(
      this.btn3, this.btn3Icon, this.btn3Type, this.btn3Mode, this.Onbtn3Click, this.btn3Height, this.btn3Width,
      browseToolbarInBarra,
    );
    this.optBtn4 = this.buildExtraBtn(
      this.btn4, this.btn4Icon, this.btn4Type, this.btn4Mode, this.Onbtn4Click, this.btn4Height, this.btn4Width,
      browseToolbarInBarra,
    );
    this.optBtn5 = this.buildExtraBtn(
      this.btn5, this.btn5Icon, this.btn5Type, this.btn5Mode, this.Onbtn5Click, this.btn5Height, this.btn5Width,
      browseToolbarInBarra,
    );
    this.optBtn6 = this.buildExtraBtn(
      this.btn6, this.btn6Icon, this.btn6Type, this.btn6Mode, this.Onbtn6Click, this.btn6Height, this.btn6Width,
      browseToolbarInBarra,
    );

    this.optFechaInicial = {
      useMaskBehavior: true,
      type: 'date',
      displayFormat: 'dd/MM/yyyy',
      width: 156,
      height: 44,
      visible: browseToolbarInBarra && this.isBrowse && this.showDates,
      value: this.FECHA_INICIAL,
      onValueChanged: this.OnValueChangeFECHA_INICIAL,
      elementAttr: { class: 'sguees-barra-datebox' },
    };
    this.optFechaFinal = {
      useMaskBehavior: true,
      type: 'date',
      displayFormat: 'dd/MM/yyyy',
      width: 156,
      height: 44,
      visible: browseToolbarInBarra && this.isBrowse && this.showDates,
      value: this.FECHA_FINAL,
      onValueChanged: this.OnValueChangeFECHA_FINAL,
      elementAttr: { class: 'sguees-barra-datebox' },
    };

    if (this.effectiveShowEstadoToolbar) {
      const estadoOpts = buildEstadoToolbarOptions({
        campoEstado: this.campoEstado,
        focusedRow: this.focusedRow,
        puedeCambiarEstado: this.puedeCambiarEstado,
        onActivarInactivar: this.OnActivarInactivar,
      });
      this.optActivar = estadoOpts.optActivar;
      this.optDesactivar = estadoOpts.optDesactivar;
    } else {
      this.optActivar = { visible: false };
      this.optDesactivar = { visible: false };
    }

    this.cdr.markForCheck();
  }

  private buildExtraBtn(
    text: string,
    icon: string,
    type: string,
    mode: string,
    onClick: () => void,
    height = 44,
    width = 0,
    browseToolbarInBarra = true,
  ): Record<string, unknown> {
    const opt: Record<string, unknown> = {
      stylingMode: mode || 'contained',
      height,
      icon,
      text,
      type,
      onClick,
      visible: text !== '' && (browseToolbarInBarra || !this.isBrowse),
      elementAttr: { class: 'sguees-barra-btn-standard sguees-barra-btn-action' },
    };
    const resolvedWidth = computeToolbarBtnWidth(text, width);
    if (resolvedWidth) {
      opt.width = resolvedWidth;
    }
    return opt;
  }

  OnNuevo(): void {
    this.nuevo.emit();
  }
  OnGuardar(): void {
    this.guardar.emit();
  }
  OnCancelar(): void {
    this.cancelar.emit();
  }
  OnConsultar(): void {
    this.pageContext.triggerRefresh();
  }
  OnExportar(): void {
    if (!this.permiteExport) {
      return;
    }
    this.pageContext.triggerExport();
    this.exportar.emit();
  }
  OnActivarInactivar(): void {
    this.activarInactivar.emit();
  }
  Onbtn1Click(): void {
    this.btn1Click.emit();
  }
  Onbtn2Click(): void {
    this.btn2Click.emit();
  }
  Onbtn3Click(): void {
    this.btn3Click.emit();
  }
  Onbtn4Click(): void {
    this.btn4Click.emit();
  }
  Onbtn5Click(): void {
    this.btn5Click.emit();
  }
  Onbtn6Click(): void {
    this.btn6Click.emit();
  }

  // Qué hace: emite el valor del combo (app-data-lookup); ignora si no cambió.
  onCombox1Changed(value: any): void {
    this.emitComboxChange(this.combox1, value, this.combox1Change);
  }
  onCombox2Changed(value: any): void {
    this.emitComboxChange(this.combox2, value, this.combox2Change);
  }
  onCombox3Changed(value: any): void {
    this.emitComboxChange(this.combox3, value, this.combox3Change);
  }
  onCombox4Changed(value: any): void {
    this.emitComboxChange(this.combox4, value, this.combox4Change);
  }

  private emitComboxChange(
    config: BarraMttoCombox | null,
    next: any,
    output: EventEmitter<any>,
  ): void {
    if (!config) {
      return;
    }
    const prev = config.value ?? null;
    const same =
      next === prev ||
      (next == null && (prev == null || prev === '')) ||
      String(next ?? '') === String(prev ?? '');
    if (same) {
      return;
    }
    output.emit(next ?? null);
  }

  OnValueChangeFECHA_INICIAL(e: { value?: Date }): void {
    this.FECHA_INICIALChange.emit(e.value);
  }
  OnValueChangeFECHA_FINAL(e: { value?: Date }): void {
    this.FECHA_FINALChange.emit(e.value);
  }

  onRibbonTabChanged(e: { component?: { option: (name: string) => number } }): void {
    const index = e?.component?.option('selectedIndex');
    if (typeof index === 'number') {
      this.ribbonTabIndex = index;
    }
  }

  private bindRibbonTabChanges(): void {
    if (this.ribbonTabsSubscribed || !this.ribbonTabDirectives) {
      return;
    }
    this.ribbonTabsSubscribed = true;
    this.clampRibbonTabIndex();
    this.ribbonTabDirectives.changes.subscribe(() => {
      this.clampRibbonTabIndex();
      this.cdr.markForCheck();
    });
  }

  private clampRibbonTabIndex(): void {
    const maxIndex = this.visibleRibbonTabs.length;
    if (this.ribbonTabIndex > maxIndex) {
      this.ribbonTabIndex = 0;
    }
  }
}

@NgModule({
  imports: [
    DxButtonModule,
    DxTabPanelModule,
    DxToolbarModule,
    CommonModule,
    PageHeaderModule,
    DataLookupModule,
  ],
  declarations: [BarraDataMttoComponent, BarraRibbonTabDirective],
  exports: [BarraDataMttoComponent, BarraRibbonTabDirective],
})
export class BarraDataMttoModule {}
