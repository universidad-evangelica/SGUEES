import { Component, Input,NgModule, OnInit,TemplateRef, ViewChild  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { custom } from 'devextreme/ui/dialog';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ComOrdenCompra } from './models/com-orden-compra';
// import { ComOrdenCompraDetaUpdate } from './com-orden-compra-deta/models/com-orden-compra-deta-update';
import { ComOrdenCompraService } from './com-orden-compra.service';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
// import { ComOrdenCompraSoliCotizacion } from './models/com-orden-compra_soli_cotizacion';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
	selector: 'app-com-orden-compra',
	templateUrl: './com-orden-compra.component.html',
	styleUrls: ['./com-orden-compra.component.scss'],
})

export class ComOrdenCompraComponent extends CBaseComponent implements OnInit {
	@ViewChild('dataSolicitudDisponible', { static: false }) dataSolicitudDisponible!: DxDataGridComponent;
  @ViewChild('DataCuadroComparativoDeta', { static: false }) DataCuadroComparativoDeta!: DxDataGridComponent;
  @ViewChild('DataSoliCotizaDeta', { static: false }) DataSoliCotizaDeta!: DxDataGridComponent;
  @ViewChild('DataComSoliCotizaProveedor', { static: false }) DataComSoliCotizaProveedor!: DxDataGridComponent;
  @ViewChild('selectionCellTemplate', { static: true }) selectionCellTemplate: TemplateRef<any>;
  @ViewChild('dataRowTemplate', { static: true }) dataRowTemplate!: TemplateRef<any>;

	//#region <Declarando Variales>
	mESTADO_COM_ORDEN_COMPRA: any;
	readOnly = false;
  vFECHA_INICIAL_MODAL: any;
	vFECHA_FINAL_MODAL: any;
  mCOM_COM_ORDEN_COMPRA_DETA: any;
  vFECHA_INICIAL: any;
	vFECHA_FINAL: any;
  popupVisiblePdf=false;
  vPDF: any;
  PDF!: SafeUrl;
  mCOM_COM_ORDEN_COMPRA_AUTORIZACIONES: any;
  FilterValue: any =null;
	// #endregion

  constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ComOrdenCompraService,
    private sanitization: DomSanitizer
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
    this.OnValueChangeFECHA_INICIAL_MODAL = this.OnValueChangeFECHA_INICIAL_MODAL.bind(this);
		this.OnValueChangeFECHA_FINAL_MODAL = this.OnValueChangeFECHA_FINAL_MODAL.bind(this);
	}

	//#region <Inicializando Opciones>
	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {
    this.vFECHA_INICIAL = this.appInfoService.dateAdd(this.appInfoService.getDate(), 'day', -7);
		this.vFECHA_FINAL = this.appInfoService.getDate();
  }
	// #endregion

	//#region <Manejo de Combos>
	llenaComboBox() {
		this.getESTADO_COM_ORDEN_COMPRA();
	}

	getESTADO_COM_ORDEN_COMPRA() {
		// this.appInfoService
		// 	.getLookUp('COM_COM_ORDEN_COMPRA', 'COM_LISTA', 'GetESTADO_COM_ORDEN_COMPRA', undefined, environment.UrlCOMPRASAPI)
		// 	.pipe(take(1))
		// 	.subscribe({
		// 		next: (response: any) => {
		// 			if (response.Result) {
		// 				this.mESTADO_COM_ORDEN_COMPRA = response.Data;
		// 			}
		// 		},
		// 		error: (error: any) => {
		// 			this.notifyFx(error, NotifyType.Error);
		// 		},
		// 	});
	}
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xANIO_PERIODO?: number, xCORR_CUADRO_COMPARATIVO?: number, xNUMERO_ORDEN_COMPRA?: number): any {
		if (xCORR_CUADRO_COMPARATIVO == undefined) {
      xANIO_PERIODO = 0;
			xCORR_CUADRO_COMPARATIVO = 0;
		}
		return {
      ANIO_PERIODO: xANIO_PERIODO,
			CORR_CUADRO_COMPARATIVO: xCORR_CUADRO_COMPARATIVO,
      NUMERO_ORDEN_COMPRA: xNUMERO_ORDEN_COMPRA,
      FECHA_INICIAL: this.vFECHA_INICIAL.toISOString(),
			FECHA_FINAL: this.vFECHA_FINAL.toISOString(),
      OPCION_CONSULTA: this.appInfoService.getTipoUsuario()==6? 1 : 0,
		};
	}

	override fillData(xModel?: ComOrdenCompra): ComOrdenCompra {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				ANIO_PERIODO: xModel.ANIO_PERIODO,
        CORR_CUADRO_COMPARATIVO: xModel.CORR_CUADRO_COMPARATIVO,
        NUMERO_ORDEN_COMPRA: xModel.NUMERO_ORDEN_COMPRA,
        FECHA_ORDEN_COMPRA: xModel.FECHA_ORDEN_COMPRA,
        NOMBRE_PROVEEDOR: xModel.NOMBRE_PROVEEDOR,
        DIRECCION_PROVEEDOR: xModel.DIRECCION_PROVEEDOR,
        NOMBRE_COMERCIAL: xModel.NOMBRE_COMERCIAL,
        ACTIVIDAD_ECONOMICA: xModel.ACTIVIDAD_ECONOMICA,
        NOMBRE_CONTACTO: xModel.NOMBRE_CONTACTO,
        CORREO_ELECTRONICO_PROVEEDOR: xModel.CORREO_ELECTRONICO_PROVEEDOR,
        TELEFONO_PROVEEDOR: xModel.TELEFONO_PROVEEDOR,
        CONDICION_PAGO: xModel.CONDICION_PAGO,
        NUMERO_SOLI_COTIZACION: xModel.NUMERO_SOLI_COTIZACION,
        NOMBRE_DEPARTAMENTO: xModel.NOMBRE_DEPARTAMENTO,
				OBSERVACIONES: xModel.OBSERVACIONES,
        SUB_TOTAL: xModel.SUB_TOTAL,
        TOTAL_IMPUESTO: xModel.TOTAL_IMPUESTO,
        TOTAL_ORDEN: xModel.TOTAL_ORDEN,
			};
		} else {
			return {
				CORR_EMPRESA: 0,
        ANIO_PERIODO: 0,
        CORR_CUADRO_COMPARATIVO: 0,
        NUMERO_ORDEN_COMPRA: 0,
        FECHA_ORDEN_COMPRA: new Date(),
        NOMBRE_PROVEEDOR: '',
        DIRECCION_PROVEEDOR: '',
        NOMBRE_COMERCIAL: '',
        ACTIVIDAD_ECONOMICA: '',
        NOMBRE_CONTACTO: '',
        CORREO_ELECTRONICO_PROVEEDOR: '',
        TELEFONO_PROVEEDOR: '',
        CONDICION_PAGO: '',
        NUMERO_SOLI_COTIZACION: '',
        NOMBRE_DEPARTAMENTO: '',
        OBSERVACIONES: '',
        SUB_TOTAL: 0,
        TOTAL_IMPUESTO: 0,
        TOTAL_ORDEN: 0,
			};
		}
	}

  override focusedRowChanged(e: any) {
    this.model = e.row.data;
  }

  override nuevo(): void {
		super.nuevo();
	}

  override editarClick(e: any) {
		super.editarClick(e);
    this.consultarCOM_ORDEN_COMPRA_DETA();
    this.consultarCOM_ORDEN_COMPRA_AUTORIZACIONES();
    if (e.row.data.ESTADO_COM_ORDEN_COMPRA != "DI") {
			setTimeout(() => {
				this.bloquear();
			});
	  }
	}

  override rowDblClick(e: any) {
		super.rowDblClick(e);
    this.consultarCOM_ORDEN_COMPRA_DETA();
    this.consultarCOM_ORDEN_COMPRA_AUTORIZACIONES();
    setTimeout(() => {
      this.bloquear();
    });
	}

  override getPermiteEditar(e: any): boolean {
		if (this.permiteEdit && (e.row.data.ESTADO_COM_ORDEN_COMPRA === 'DI' )) {
			return true;
		}
		return false;
	}

  override getPermiteDele(e: any): boolean {
		if (this.permiteDele && e.row.data.ESTADO_COM_ORDEN_COMPRA === 'DI') {
			return true;
		}
		return false;
	}

	consultar() {
		this.service
			.getAll(this.fillParam())
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.models = response.Data;
            if (this.appInfoService.getTipoUsuario() != 6) {
              this.FilterValue=['USUARIO_CREA_SOLI', '=', this.appInfoService.getUsuario()]
            }
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

consultarCOM_ORDEN_COMPRA_DETA() {
  this.service
    .getAllCOM_ORDEN_COMPRA_DETA({ ANIO_PERIODO: this.model.ANIO_PERIODO, CORR_CUADRO_COMPARATIVO: this.model.CORR_CUADRO_COMPARATIVO, NUMERO_ORDEN_COMPRA: this.model.NUMERO_ORDEN_COMPRA })
    .pipe(take(1))
    .subscribe({
      next: (response: any) => {
        if (response.Result) {
          this.mCOM_COM_ORDEN_COMPRA_DETA = response.Data;
        }
      },
      error: (error: any) => {
        this.notifyFx(error, NotifyType.Error);
      },

    });
}

	guardar(): void {
		if (!this.service.esValido(this.model, this.notifyFx)) {
			return;
		}

		this.loadingVisible = true;
		if (this.banderaMtto === UpdateType.Add) {
			this.service
				.insert(this.model)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.models.push(response.Data);
							this.model = response.Data;
							this.AsignaStatus(UpdateType.Browse);
							this.notifyFx('Registro creado con exito!', NotifyType.Success);
						} else {
							this.notifyFx(response.ErrorMessage, NotifyType.Error);
						}
						this.loadingVisible = false;
					},
					error: (error: any) => {
						this.notifyFx(error, NotifyType.Error);
						this.loadingVisible = false;
					},
				});
		} else if (this.banderaMtto === UpdateType.Update) {
			this.service
				.update(this.model)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.model = response.Data;
							const vIndex = this.models.findIndex((item: any) => item.CORR_COM_ORDEN_COMPRA === response.Data.CORR_COM_ORDEN_COMPRA);
							this.models[vIndex] = response.Data;
							this.AsignaStatus(UpdateType.Browse);
							this.notifyFx('Registro modificado con exito!', NotifyType.Success);
						} else {
							this.notifyFx(response.ErrorMessage, NotifyType.Error);
						}
						this.loadingVisible = false;
					},
					error: (error: any) => {
						this.notifyFx(error, NotifyType.Error);
						this.loadingVisible = false;
					},
				});
		}
	}

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_COM_ORDEN_COMPRA === this.modelUpdate.CORR_COM_ORDEN_COMPRA);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.ANIO_PERIODO,e.data.CORR_COM_ORDEN_COMPRA))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.notifyFx('Registro eliminado con exito!', NotifyType.Success);
						e.component.refresh();
					} else {
						e.cancel = true;
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
					}
				},
				error: (error: any) => {
					e.cancel = true;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('ANIO_PERIODO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_COM_ORDEN_COMPRA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FECHA_ORDEN_COMPRA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NUMERO_ORDEN_COMPRA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_PROVEEDOR')?.option('readOnly', true);
		this.dataForm.instance.getEditor('DIRECCION_PROVEEDOR')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_COMERCIAL')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ACTIVIDAD_ECONOMICA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_CONTACTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORREO_ELECTRONICO_PROVEEDOR')?.option('readOnly', true);
		this.dataForm.instance.getEditor('TELEFONO_PROVEEDOR')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CONDICION_PAGO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NUMERO_SOLI_COTIZACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_DEPARTAMENTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('OBSERVACIONES')?.option('readOnly', true);
		this.dataForm.instance.getEditor('SUB_TOTAL')?.option('readOnly', true);
    this.dataForm.instance.getEditor('TOTAL_IMPUESTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('TOTAL_ORDEN')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_COM_ORDEN_COMPRA')?.focus();
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}

  selectedLookUpCORR_UNIDAD_MEDIDA(vRow: any): any {
		return vRow[0].CORR_UNIDAD_MEDIDA;
	}

  OnValueChangeFECHA_INICIAL_MODAL(e: any) {
		this.vFECHA_INICIAL_MODAL = e.value;
	}

	OnValueChangeFECHA_FINAL_MODAL(e: any) {
		this.vFECHA_FINAL_MODAL = e.value;
	}



  //#region <Visualizar Pdf>
  obtenerPDF() {
    this.loadingVisible = true;
    this.service
      .getPDF(this.fillParam(this.model.ANIO_PERIODO,this.model.CORR_CUADRO_COMPARATIVO,this.model.NUMERO_ORDEN_COMPRA))
      .pipe(take(1))
      .subscribe({
        next: (vPDF: any) => {
          if (vPDF != undefined) {
            this.PDF = this.sanitization.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(vPDF));
            this.popupVisiblePdf = true;
          } else {
            this.notifyFx("Error al generar PDF", NotifyType.Error);
            this.popupVisiblePdf = false;
          }
          this.loadingVisible = false;
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
          this.loadingVisible = false;
        },
      });
  }

  descargarPDF() {
    this.loadingVisible = true;
    this.appInfoService.downloadFile(this.vPDF, 'CuadroComparativoNo.'+this.model.ANIO_PERIODO.toString()+'-'+this.model.CORR_COM_ORDEN_COMPRA.toString()+'.pdf');
    this.popupVisiblePdf = false;
    this.loadingVisible = false;

  }
  hidePdfPopup() {
    this.popupVisiblePdf = false;
    this.LimpiarPdf();
  }

  LimpiarPdf() {
    //this.vPDF = null;
    this.PDF = null;
  }
  //#endregion

  //#region <Autorizaciones>
  consultarCOM_ORDEN_COMPRA_AUTORIZACIONES() {
    this.service
      .getAllCOM_ORDEN_COMPRA_AUTORIZACIONES({ ANIO_PERIODO: this.model.ANIO_PERIODO, CORR_CUADRO_COMPARATIVO: this.model.CORR_CUADRO_COMPARATIVO })
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.mCOM_COM_ORDEN_COMPRA_AUTORIZACIONES = response.Data;
          }
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
        },

      });
  }
  //#endregion

}
