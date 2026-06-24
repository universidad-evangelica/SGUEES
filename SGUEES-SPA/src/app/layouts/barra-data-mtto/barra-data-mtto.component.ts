import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  NgModule,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { DxButtonModule } from 'devextreme-angular/ui/button';
import { DxToolbarModule } from 'devextreme-angular/ui/toolbar';
import {
  BreadcrumbItem,
  PageHeaderModule,
} from 'src/app/shared/components/library/page-header/page-header.component';
import { MttoPageContextService } from 'src/app/layouts/mtto-page-context.service';

export type { BreadcrumbItem } from 'src/app/shared/components/library/page-header/page-header.component';

export type BarraLayoutMode = 'legacy' | 'header-only';

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
export class BarraDataMttoComponent implements OnInit, OnChanges, OnDestroy {
  @Input() tituloVentana: string = '';
  @Input() subTituloVentana: string = '';
  @Input() subtitle?: string;
  @Input() eyebrow?: string;
  @Input() breadcrumbs?: BreadcrumbItem[];
  /** Fase 8B: header-only = toolbar browse en grid; legacy = comportamiento 7A. */
  @Input() layoutMode: BarraLayoutMode = 'header-only';
  @Input() isBrowse: boolean = false;
  @Input() isForm: boolean = false;
  @Input() permiteAdd: boolean = false;
  @Input() showRefresh: boolean = false;
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

  @Input() btn1: string = '';
  @Input() btn1Icon: string = '';
  @Input() btn1Location: string = 'before';
  @Input() btn1Type: string = 'default';
  @Input() btn1Height: number = 36;
  @Input() btn1Width: number = 0;
  @Input() btn1Mode: string = 'contained';
  @Output() btn1Click = new EventEmitter<any>();

  @Input() btn2: string = '';
  @Input() btn2Icon: string = '';
  @Input() btn2Location: string = 'before';
  @Input() btn2Type: string = 'default';
  @Input() btn2Height: number = 36;
  @Input() btn2Width: number = 0;
  @Input() btn2Mode: string = 'contained';
  @Output() btn2Click = new EventEmitter<any>();

  @Input() btn3: string = '';
  @Input() btn3Icon: string = '';
  @Input() btn3Location: string = 'before';
  @Input() btn3Type: string = 'default';
  @Input() btn3Height: number = 36;
  @Input() btn3Width: number = 0;
  @Input() btn3Mode: string = 'contained';
  @Output() btn3Click = new EventEmitter<any>();

  @Input() btn4: string = '';
  @Input() btn4Icon: string = '';
  @Input() btn4Location: string = 'before';
  @Input() btn4Type: string = 'default';
  @Input() btn4Height: number = 36;
  @Input() btn4Width: number = 0;
  @Input() btn4Mode: string = 'contained';
  @Output() btn4Click = new EventEmitter<any>();

  @Input() btn5: string = '';
  @Input() btn5Icon: string = '';
  @Input() btn5Location: string = 'before';
  @Input() btn5Type: string = 'default';
  @Input() btn5Height: number = 36;
  @Input() btn5Width: number = 0;
  @Input() btn5Mode: string = 'contained';
  @Output() btn5Click = new EventEmitter<any>();

  @Input() btn6: string = '';
  @Input() btn6Icon: string = '';
  @Input() btn6Location: string = 'before';
  @Input() btn6Type: string = 'default';
  @Input() btn6Height: number = 36;
  @Input() btn6Width: number = 0;
  @Input() btn6Mode: string = 'contained';
  @Output() btn6Click = new EventEmitter<any>();

  optNuevo: Record<string, unknown> = {};
  optGuardar: Record<string, unknown> = {};
  optCancelar: Record<string, unknown> = {};
  optRefresh: Record<string, unknown> = {};
  optBtn1: Record<string, unknown> = {};
  optBtn2: Record<string, unknown> = {};
  optBtn3: Record<string, unknown> = {};
  optBtn4: Record<string, unknown> = {};
  optBtn5: Record<string, unknown> = {};
  optBtn6: Record<string, unknown> = {};
  optFechaInicial: Record<string, unknown> = {};
  optFechaFinal: Record<string, unknown> = {};

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

  /** Muestra page-header enterprise (oculto en browse header-only sin meta). */
  get showPageHeader(): boolean {
    if (this.isHeaderOnlyBrowseHidden) {
      return false;
    }
    return !!(this.tituloVentana?.trim() || this.hasHeaderMeta);
  }

  get isHeaderOnlyMode(): boolean {
    return this.layoutMode === 'header-only';
  }

  get isHeaderOnlyBrowseHidden(): boolean {
    return this.isHeaderOnlyMode && this.isBrowse && !this.hasHeaderMeta;
  }

  @HostBinding('class.sguees-barra-mtto--header-only-browse-hidden')
  get hostBrowseHidden(): boolean {
    return this.isHeaderOnlyBrowseHidden;
  }

  @HostBinding('class.sguees-barra-mtto--header-only-edit')
  get hostHeaderOnlyEdit(): boolean {
    return this.isHeaderOnlyMode && !this.isBrowse;
  }

  @HostBinding('class.sguees-barra-mtto--legacy')
  get hostLegacy(): boolean {
    return this.layoutMode === 'legacy';
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private pageContext: MttoPageContextService,
  ) {
    this.OnNuevo = this.OnNuevo.bind(this);
    this.OnGuardar = this.OnGuardar.bind(this);
    this.OnCancelar = this.OnCancelar.bind(this);
    this.OnConsultar = this.OnConsultar.bind(this);
    this.Onbtn1Click = this.Onbtn1Click.bind(this);
    this.Onbtn2Click = this.Onbtn2Click.bind(this);
    this.Onbtn3Click = this.Onbtn3Click.bind(this);
    this.Onbtn4Click = this.Onbtn4Click.bind(this);
    this.Onbtn5Click = this.Onbtn5Click.bind(this);
    this.Onbtn6Click = this.Onbtn6Click.bind(this);
    this.OnValueChangeFECHA_INICIAL = this.OnValueChangeFECHA_INICIAL.bind(this);
    this.OnValueChangeFECHA_FINAL = this.OnValueChangeFECHA_FINAL.bind(this);
  }

  ngOnInit(): void {
    this.syncPageContext();
    this.rebuildToolbarOptions();
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
      changes['isBrowse'];

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
      changes['btn1'] ||
      changes['btn2'] ||
      changes['btn3'] ||
      changes['btn4'] ||
      changes['btn5'] ||
      changes['btn6'] ||
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
    this.pageContext.updateFromBarra(
      {
        titulo: this.tituloVentana?.trim() ?? '',
        subtitle: this.resolvedSubtitle,
        permiteAdd: this.permiteAdd,
        showRefresh: this.showRefresh,
        unifiedToolbar: this.layoutMode === 'header-only',
        isBrowse: this.isBrowse,
      },
      {
        add: () => this.nuevo.emit(),
        refresh: () => this.consultar.emit(),
      },
    );
  }

  private rebuildToolbarOptions(): void {
    const base = { stylingMode: 'contained', height: 36 };
    const browseToolbarInBarra = this.layoutMode === 'legacy';

    this.optNuevo = {
      ...base,
      icon: 'plus',
      text: 'Nuevo',
      type: 'default',
      onClick: this.OnNuevo,
      visible: browseToolbarInBarra && this.permiteAdd && this.isBrowse,
    };
    this.optGuardar = {
      ...base,
      icon: 'save',
      text: 'Guardar',
      type: 'success',
      onClick: this.OnGuardar,
    };
    this.optCancelar = {
      ...base,
      icon: 'clear',
      text: 'Cancelar',
      type: 'danger',
      onClick: this.OnCancelar,
    };
    this.optRefresh = {
      text: 'Refresh',
      icon: 'refresh',
      onClick: this.OnConsultar,
      visible: browseToolbarInBarra && this.isBrowse && this.showRefresh,
      stylingMode: 'text',
      height: 36,
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
      width: '120',
      visible: browseToolbarInBarra && this.isBrowse && this.showDates,
      value: this.FECHA_INICIAL,
      onValueChanged: this.OnValueChangeFECHA_INICIAL,
    };
    this.optFechaFinal = {
      useMaskBehavior: true,
      type: 'date',
      displayFormat: 'dd/MM/yyyy',
      width: '120',
      visible: browseToolbarInBarra && this.isBrowse && this.showDates,
      value: this.FECHA_FINAL,
      onValueChanged: this.OnValueChangeFECHA_FINAL,
    };

    this.cdr.markForCheck();
  }

  private buildExtraBtn(
    text: string,
    icon: string,
    type: string,
    mode: string,
    onClick: () => void,
    height = 36,
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
    };
    if (width > 0) {
      opt.width = width;
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
    this.consultar.emit();
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
  OnValueChangeFECHA_INICIAL(e: { value?: Date }): void {
    this.FECHA_INICIALChange.emit(e.value);
  }
  OnValueChangeFECHA_FINAL(e: { value?: Date }): void {
    this.FECHA_FINALChange.emit(e.value);
  }
}

@NgModule({
  imports: [DxButtonModule, DxToolbarModule, CommonModule, PageHeaderModule],
  declarations: [BarraDataMttoComponent],
  exports: [BarraDataMttoComponent],
})
export class BarraDataMttoModule {}
