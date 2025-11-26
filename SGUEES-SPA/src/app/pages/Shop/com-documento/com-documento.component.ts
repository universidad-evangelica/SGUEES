import { DateTime } from 'luxon';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/internal/operators/take';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ComDocumento } from './models/com-documento';
import { ComDocumentoService } from './com-documento.service';
import { IParam } from 'src/app/FxAPI/IParam';
import { custom } from 'devextreme/ui/dialog';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ComDocumentoCr } from './models/com-documento-cr';
import { ComDocumentoAnularCr } from './models/com-documento-anular-cr';

@Component({
	selector: 'app-com-documento',
	templateUrl: './com-documento.component.html',
	styleUrls: ['./com-documento.component.scss'],
})

export class ComDocumentoComponent extends CBaseComponent implements OnInit {
  @ViewChild('dataComJson', { static: false })
  dataComJson!: DxDataGridComponent;
  @ViewChild('fileInput') fileInput!: ElementRef
  @ViewChild('fileInput') fileInputPDF!: ElementRef

  //#region <Declarando Variales>
  mCORR_TIPO_DOC: any;
  mCORR_TIENDA: any;
  mCORR_PROVEEDOR: any;
  mCORR_CONDICION_PAGO: any;
  mESTADO_DOCUMENTO: any;
  mCORR_TIPO_GASTO: any;
  mCORR_TIPO_PAGO: any;
  mCORR_MOVIMIENTO: any;
  mCORR_MONEDA: any;
  mESTADO_ADMINISTRATIVO: any;
  mCORR_TIPO_INVALIDACION: any;
  mCORR_DOCUMENTO_REEMPLAZA: any;
  mCORR_TIPO_OPERACION: any;
  mCORR_TIPO_GASTO_ISR: any;
  readOnly = false;
  mCOM_DOCUMENTO_TOTAL: any;
  ES_ELECTRONICO = false;
  btnAplicar = '';
  btnGenerarCR = '';
  btnAnularCR = '';
  popupVisibleJson = false;
  mCOM_JSON: any;
  mCOM_JSON_SELECCIONADO: any;
  focusedRubroGravado = 0;
  vData: any;
  btnDocumentosElectronicos = '';
  mMES_PERIODO: any;
  vFECHA_INICIAL: any;
	vFECHA_FINAL: any;
  popupVisiblePdf=false;
  PDF!: SafeUrl;
  btnVistaPrevia = '';
  mCOM_DOCUMENTO_DETA_DOC: any;
  mCOM_DOCUMENTO_DETA_DOC_DISPONIBLES: any;
  mCOM_DOCUMENTO_RETENCION: any;
  popupVisibleDetaDoc=false;
  popupVisibleCR=false;
  popupVisibleAnularCR=false;
  vFECHA_INICIAL_MODAL: any;
  vFECHA_FINAL_MODAL: any;
  TabComproRete = true;
  TabTotales = true;
  IndexTab = 0;
  mDocumentoCR: ComDocumentoCr = {
  CORR_EMPRESA: 0,
  ANIO_PERIODO: 0,
  MES_PERIODO: 0,
  CORR_DOCUMENTO: 0,
  DESCRIPCION_DOCUMENTO: '',
  ES_NACIONAL: false,
  ES_EXTRANJERO: false
  };
  mDocumentoAnularCR: ComDocumentoAnularCr = {
  CORR_EMPRESA: 0,
  ANIO_PERIODO: 0,
  MES_PERIODO: 0,
  CORR_DOCUMENTO: 0,
  MOTIVO_ANULACION: ''
  };

  mostrarDetaDoc = false;
  tituloGridDetaDoc = '';
  // #endregion
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ComDocumentoService,
    private sanitization: DomSanitizer
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
    this.selectedLookUpCORR_PROVEEDOR = this.selectedLookUpCORR_PROVEEDOR.bind(this);
    this.selectedLookUpCORR_CONDICION_PAGO = this.selectedLookUpCORR_CONDICION_PAGO.bind(this);
    this.customizeItem = this.customizeItem.bind(this);
    this.DIAS_CREDITOValueChanged = this.DIAS_CREDITOValueChanged.bind(this);
    this.gDataComDocumentoTotalRowUpdated = this.gDataComDocumentoTotalRowUpdated.bind(this);
    this.selectedLookUpCORR_TIPO_DOC = this.selectedLookUpCORR_TIPO_DOC.bind(this);
    this.selectedLookUpCORR_TIPO_GASTO = this.selectedLookUpCORR_TIPO_GASTO.bind(this);
    this.guardarDocPopup = this.guardarDocPopup.bind(this);
    this.hideDocPopup = this.hideDocPopup.bind(this);
    this.guardarDetaDocPopup = this.guardarDetaDocPopup.bind(this);
    this.hideDetaDocPopup = this.hideDetaDocPopup.bind(this);
    this.OnValueChangeFECHA_INICIAL_MODAL = this.OnValueChangeFECHA_INICIAL_MODAL.bind(this);
    this.OnValueChangeFECHA_FINAL_MODAL = this.OnValueChangeFECHA_FINAL_MODAL.bind(this);
    this.selectTodos = this.selectTodos.bind(this);
    this.selectNinguno = this.selectNinguno.bind(this);
    this.consultarCOM_DOCUMENTO_DETA_DOC_DISPONIBLES = this.consultarCOM_DOCUMENTO_DETA_DOC_DISPONIBLES.bind(this);
	}


	//#region <Inicializando Opciones>
	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {
    this.vFECHA_INICIAL = this.appInfoService.dateAdd(this.appInfoService.getDate(), 'day', -30);
		this.vFECHA_FINAL = this.appInfoService.getDate();
  }
	// #endregion

	//#region <Manejo de Combos>
	llenaComboBox() {
		this.getCORR_TIPO_DOC();
		this.getCORR_PROVEEDOR();
    this.getCORR_PROVEEDOR_COMPRAS()
		this.getCORR_CONDICION_PAGO();
		this.getESTADO_DOCUMENTO();
		this.getCORR_TIPO_GASTO();
		this.getESTADO_ADMINISTRATIVO();
    this.getMES_PERIDO();
	}

	getCORR_TIPO_DOC() {
    let xWhere: IParam[] = [{ Parameter: 'USAR_COMPRAS', Value: true }];
		this.appInfoService
			.getLookUp('COM_DOCUMENTO', 'GEN_TIPO_DOCUMENTO', 'GetCORR_TIPO_DOC', xWhere, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_TIPO_DOC = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	getCORR_PROVEEDOR() {
		this.appInfoService
			.getLookUp('COM_DOCUMENTO', 'COM_PROVEEDOR', 'GetCORR_PROVEEDOR', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_PROVEEDOR = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

  	getCORR_PROVEEDOR_COMPRAS() {
		this.appInfoService
			.getLookUp('COM_DOCUMENTO', 'COM_PROVEEDOR', 'GetCORR_PROVEEDOR_COMPRAS', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_PROVEEDOR = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	getCORR_CONDICION_PAGO() {
		this.appInfoService
			.getLookUp('COM_DOCUMENTO', 'COM_CONDICION_PAGO', 'GetCORR_CONDICION_PAGO', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_CONDICION_PAGO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	getESTADO_DOCUMENTO() {
		this.appInfoService
			.getLookUp('COM_DOCUMENTO', 'COM_LISTA', 'GetESTADO_DOCUMENTO', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mESTADO_DOCUMENTO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	getCORR_TIPO_GASTO() {
		this.appInfoService
			.getLookUp('COM_DOCUMENTO', 'GEN_TIPO_GASTO', 'GetCORR_TIPO_GASTO', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_TIPO_GASTO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	getESTADO_ADMINISTRATIVO() {
		this.appInfoService
			.getLookUp('COM_DOCUMENTO', 'COM_LISTA', 'GetESTADO_ADMINISTRATIVO', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mESTADO_ADMINISTRATIVO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
  getMES_PERIDO() {
      this.appInfoService
        .getLookUp('COM_DOCUMENTO', 'GEN_LISTA', 'GetMES', undefined, environment.UrlGENERALAPI)
        .pipe(take(1))
        .subscribe({
          next: (response: any) => {
            if (response.Result) {
              this.mMES_PERIODO = response.Data;
            }
          },
          error: (error: any) => {
            this.notifyFx(error, NotifyType.Error);
          },
        });
    }
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xANIO_PERIODO?: number, xMES_PERIDO?: number, xCORR_DOCUMENTO?: number): any {
		if (xCORR_DOCUMENTO == undefined) {
      xANIO_PERIODO = this.appInfoService.toYear(new Date());
      xMES_PERIDO = this.appInfoService.toMonth(new Date());
			xCORR_DOCUMENTO = 0;
		}
		return {
      ANIO_PERIODO: xANIO_PERIODO,
			MES_PERIODO: xMES_PERIDO,
			CORR_DOCUMENTO: xCORR_DOCUMENTO,
      FECHA_INICIAL: this.vFECHA_INICIAL.toISOString(),
			FECHA_FINAL: this.vFECHA_FINAL.toISOString(),
		};
	}

	override fillData(xModel?: ComDocumento): ComDocumento {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				ANIO_PERIODO: xModel.ANIO_PERIODO,
				MES_PERIODO: xModel.MES_PERIODO,
				CORR_TIPO_DOC: xModel.CORR_TIPO_DOC,
				NOMBRE_TIPO_DOC: xModel.NOMBRE_TIPO_DOC,
				NOMBRE_CORTO_TIPO_DOC: xModel.NOMBRE_CORTO_TIPO_DOC,
				CLASE_DOCUMENTO: xModel.CLASE_DOCUMENTO,
				SUMA_RESTA: xModel.SUMA_RESTA,
				CORR_DOCUMENTO: xModel.CORR_DOCUMENTO,
        NUMERO_DOCUMENTO_CORR: xModel.NUMERO_DOCUMENTO_CORR,
				NUMERO_DOCUMENTO: xModel.NUMERO_DOCUMENTO,
				FECHA_DOCUMENTO: xModel.FECHA_DOCUMENTO,
				FECHA_VENCIMIENTO: xModel.FECHA_VENCIMIENTO,
				CORR_TIENDA: xModel.CORR_TIENDA,
				CORR_PROVEEDOR: xModel.CORR_PROVEEDOR,
				NOMBRE_PROVEEDOR: xModel.NOMBRE_PROVEEDOR,
				DESCRIPCION_PARTIDA: xModel.DESCRIPCION_PARTIDA,
				CORR_CONDICION_PAGO: xModel.CORR_CONDICION_PAGO,
				NOMBRE_CONDICION_PAGO: xModel.NOMBRE_CONDICION_PAGO,
				DIAS_CREDITO: xModel.DIAS_CREDITO,
				ESTADO_DOCUMENTO: xModel.ESTADO_DOCUMENTO,
				NOMBRE_ESTADO_DOCUMENTO: xModel.NOMBRE_ESTADO_DOCUMENTO,
				ESTA_CONTABILIZADO: xModel.ESTA_CONTABILIZADO,
				TOTAL_DOCUMENTO: xModel.TOTAL_DOCUMENTO,
				TOTAL_NETO: xModel.TOTAL_NETO,
				SALDO_DOCUMENTO: xModel.SALDO_DOCUMENTO,
				CORR_TIPO_GASTO: xModel.CORR_TIPO_GASTO,
				NOMBRE_TIPO_GASTO: xModel.NOMBRE_TIPO_GASTO,
				CANTIDAD: xModel.CANTIDAD,
				USUARIO_CREA: xModel.USUARIO_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
				CORR_MOVIMIENTO: xModel.CORR_MOVIMIENTO,
				CORR_MONEDA: xModel.CORR_MONEDA,
				FACTOR_CAMBIO: xModel.FACTOR_CAMBIO,
				OPERADOR: xModel.OPERADOR,
				SERIE: xModel.SERIE,
				NUMERO_UNICO: xModel.NUMERO_UNICO,
				ESTADO_ADMINISTRATIVO: xModel.ESTADO_ADMINISTRATIVO,
				NOMBRE_ESTADO_ADMINISTRATIVO: xModel.NOMBRE_ESTADO_ADMINISTRATIVO,
				CODIGO_GENERACION: xModel.CODIGO_GENERACION,
				NUMERO_CONTROL: xModel.NUMERO_CONTROL,
				SELLO_RECEPCION: xModel.SELLO_RECEPCION,
        ANIO_PERIODO_IVA: xModel.ANIO_PERIODO_IVA,
        MES_PERIODO_IVA: xModel.MES_PERIODO_IVA,
			};
		} else {
			return {
				CORR_EMPRESA: 1,
				ANIO_PERIODO: this.appInfoService.toYear(new Date()),
				MES_PERIODO: this.appInfoService.toMonth(new Date()),
				CORR_TIPO_DOC: 0,
				NOMBRE_TIPO_DOC: '',
				NOMBRE_CORTO_TIPO_DOC: '',
				CLASE_DOCUMENTO: '',
				SUMA_RESTA: 0,
				CORR_DOCUMENTO: 0,
        NUMERO_DOCUMENTO_CORR: '',
				NUMERO_DOCUMENTO: '',
				FECHA_DOCUMENTO: new Date(),
				FECHA_VENCIMIENTO: new Date(),
				CORR_TIENDA: 1,
				CORR_PROVEEDOR: 0,
				NOMBRE_PROVEEDOR: '',
				DESCRIPCION_PARTIDA: '',
				CORR_CONDICION_PAGO: 0,
				NOMBRE_CONDICION_PAGO: '',
				DIAS_CREDITO: 0,
				ESTADO_DOCUMENTO: 'DI',
				NOMBRE_ESTADO_DOCUMENTO: '',
				ESTA_CONTABILIZADO: false,
				TOTAL_DOCUMENTO: 0,
				TOTAL_NETO: 0,
				SALDO_DOCUMENTO: 0,
				CORR_TIPO_GASTO: 0,
				NOMBRE_TIPO_GASTO: '',
				CANTIDAD: 0,
				USUARIO_CREA: '',
				FECHA_CREA: new Date(),
				ESTACION_CREA: '',
				USUARIO_ACTU: '',
				FECHA_ACTU: new Date(),
				ESTACION_ACTU: '',
				CORR_MOVIMIENTO: 0,
				CORR_MONEDA: 1,
				FACTOR_CAMBIO: 1,
				OPERADOR: '*',
				SERIE: '',
				NUMERO_UNICO: 0,
				ESTADO_ADMINISTRATIVO: '',
				NOMBRE_ESTADO_ADMINISTRATIVO: '',
				CODIGO_GENERACION: '',
				NUMERO_CONTROL: '',
				SELLO_RECEPCION: '',
        ANIO_PERIODO_IVA: this.appInfoService.toYear(new Date()),
				MES_PERIODO_IVA: this.appInfoService.toMonth(new Date()),
			};
		}
	}

  override nuevo(): void {
    super.nuevo();
    this.consultarCOM_DOCUMENTO_TOTAL();
    this.consultarCOM_DOCUMENTO_DETA_DOC();
    this.consultarCOM_DOCUMENTO_CR();
    this.refrescarBotones();
    this.btnDocumentosElectronicos = 'Doc. Electrónicos';
  }

  override editarClick(e: any): void {
    this.model=e.row.data;
    super.editarClick(e);
    this.consultarCOM_DOCUMENTO_TOTAL();
    this.consultarCOM_DOCUMENTO_DETA_DOC();
    this.consultarCOM_DOCUMENTO_CR();
    this.refrescarBotones();
    if (this.model.ESTADO_DOCUMENTO != 'DI' && this.model.ESTADO_DOCUMENTO != 'SO') {
			setTimeout(() => {
				this.bloquear();
			});
		}
    if (this.model.CODIGO_GENERACION !== '')
    {
      this.btnVistaPrevia = 'Vista Legible';
    }
  }

  override rowDblClick(e: any): void {
    super.rowDblClick(e);
    this.consultarCOM_DOCUMENTO_TOTAL();
    this.consultarCOM_DOCUMENTO_DETA_DOC();
    this.consultarCOM_DOCUMENTO_CR();
    this.refrescarBotones();
    if (this.model.ESTADO_DOCUMENTO != 'DI' && this.model.ESTADO_DOCUMENTO != 'SO') {
			setTimeout(() => {
				this.bloquear();
			});
		}
    if (this.model.CODIGO_GENERACION !== '') {
      this.btnVistaPrevia = 'Vista Legible';
    }
  }
  override getPermiteEditar(e: any): boolean {
    if (this.permiteEdit && (e.row.data.ESTADO_DOCUMENTO === 'DI' || e.row.data.ESTADO_DOCUMENTO === 'SO' )) {
			return true;
		}
		return false;
  }

  override getPermiteDele(e: any): boolean {
    if (this.permiteDele && (e.row.data.ESTADO_DOCUMENTO === 'DI' || e.row.data.ESTADO_DOCUMENTO === 'SO' )) {
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
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	guardar(xTieneDetalle?: Function, data?: any): void {
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
						if (response.Result && response.ErrorCode === 0) {
							this.models.push(response.Data);
							this.model = response.Data;
              if (xTieneDetalle) {
                this.AsignaStatus(UpdateType.Update);
								data.CORR_DOCUMENTO = response.Data.CORR_DOCUMENTO;
								xTieneDetalle(data);
							} else {
                this.AsignaStatus(UpdateType.Browse);
								this.notifyFx('Registro creado con exito!', NotifyType.Success);
                this.refrescarBotones();
							}
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
						if (response.Result && response.ErrorCode === 0) {
							this.model = response.Data;
							const vIndex = this.models.findIndex((item: any) => item.ANIO_PERIODO === response.Data.ANIO_PERIODO &&
                                                                  item.MES_PERIODO === response.Data.MES_PERIODO &&
                                                                  item.CORR_DOCUMENTO === response.Data.CORR_DOCUMENTO);
							this.models[vIndex] = response.Data;
							this.AsignaStatus(UpdateType.Browse);
							this.notifyFx('Registro modificado con exito!', NotifyType.Success);
              this.refrescarBotones();
              this.consultar();
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
    this.btnDocumentosElectronicos = '';
    this.btnVistaPrevia = '';
	}

  guardarSinSalir(): void {
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
						if (response.Result && response.ErrorCode === 0) {
              this.models.push(response.Data);
							this.model = response.Data;
              this.AsignaStatus(UpdateType.Update);
              const vIndex = this.models.findIndex((item: any) => item.ANIO_PERIODO === response.Data.ANIO_PERIODO &&
                                                                  item.MES_PERIODO === response.Data.MES_PERIODO &&
                                                                  item.CORR_DOCUMENTO === response.Data.CORR_DOCUMENTO);
							this.models[vIndex] = response.Data;
              this.consultarCOM_DOCUMENTO_TOTAL();
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
  guardarSinSalirDetaDoc(): void {
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
						if (response.Result && response.ErrorCode === 0) {
              this.models.push(response.Data);
							this.model = response.Data;
              this.AsignaStatus(UpdateType.Update);
              this.model.CORR_DOCUMENTO = response.Data.CORR_DOCUMENTO;
              this.consultarCOM_DOCUMENTO_DETA_DOC_DISPONIBLES();

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
		}else if (this.banderaMtto === UpdateType.Update) {
      this.service
				.update(this.model)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result && response.ErrorCode === 0) {
							this.model = response.Data;
              const vIndex = this.models.findIndex((item: any) => item.ANIO_PERIODO === response.Data.ANIO_PERIODO &&
                                                                  item.MES_PERIODO === response.Data.MES_PERIODO &&
                                                                  item.CORR_DOCUMENTO === response.Data.CORR_DOCUMENTO);
							this.models[vIndex] = response.Data;
              this.consultarCOM_DOCUMENTO_DETA_DOC_DISPONIBLES();
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
  refrescarBotones()
  {
    if (this.banderaMtto !== UpdateType.Browse)
      {
        if (this.model.ESTADO_DOCUMENTO == 'DI') {
          this.btnAplicar = 'Aplicar';
        } else {
          this.btnAplicar = '';
        }
        if (this.model.ESTADO_DOCUMENTO == 'AP') {
          this.btnGenerarCR = 'Generar CR';
          this.btnAnularCR = 'Anular CR';
        } else {
          this.btnGenerarCR = '';
          this.btnAnularCR = '';
        }
      } else {
        this.btnAplicar = '';
        this.btnDocumentosElectronicos = '';
        this.btnVistaPrevia = '';
        this.btnGenerarCR = '';
        this.btnAnularCR = '';
      }

  }
	override cancelar(): void {
		const cancelRow = () => {
			this.AsignaStatus(UpdateType.Browse);
			this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
      this.refrescarBotones();
		};
		if (this.banderaMtto === UpdateType.Add || this.banderaMtto === UpdateType.Update) {
			this.confirmaCancelar(() => {
				this.model = this.modelUpdate;
				const vIndex = this.models.findIndex((item: any) => item.ANIO_PERIODO === this.modelUpdate.ANIO_PERIODO &&
                                                                  item.MES_PERIODO === this.modelUpdate.MES_PERIODO &&
                                                                  item.CORR_DOCUMENTO === this.modelUpdate.CORR_DOCUMENTO);
				this.models[vIndex] = this.modelUpdate;
				cancelRow();
			});
		} else {
			cancelRow();
		}
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.ANIO_PERIODO, e.data.MES_PERIODO, e.data.CORR_DOCUMENTO))
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
		this.dataForm.instance.getEditor('MES_PERIODO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_DOCUMENTO')?.option('readOnly', true);
    this.dataForm.instance.getEditor('NUMERO_DOCUMENTO_CORR')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_TIPO_DOC')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NUMERO_DOCUMENTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FECHA_DOCUMENTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FECHA_VENCIMIENTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_TIENDA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_PROVEEDOR')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_PROVEEDOR')?.option('readOnly', true);
		this.dataForm.instance.getEditor('DESCRIPCION_PARTIDA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_CONDICION_PAGO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('DIAS_CREDITO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTADO_DOCUMENTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTA_CONTABILIZADO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('TOTAL_DOCUMENTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('TOTAL_NETO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('SALDO_DOCUMENTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_TIPO_GASTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_TIPO_PAGO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CANTIDAD')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_MOVIMIENTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTA_PROVISIONADO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_MONEDA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FACTOR_CAMBIO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('OPERADOR')?.option('readOnly', true);
		this.dataForm.instance.getEditor('SERIE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NUMERO_UNICO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTADO_ADMINISTRATIVO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO_GENERACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NUMERO_CONTROL')?.option('readOnly', true);
		this.dataForm.instance.getEditor('SELLO_RECEPCION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_TIPO_INVALIDACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FECHA_ANULACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('HORA_ANULACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('MOTIVO_INVALIDACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ANIO_PERIODO_REEMPLAZA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('MES_PERIODO_REEMPLAZA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_DOCUMENTO_REEMPLAZA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NUMERO_DUI_SOLICITA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_SOLICITA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NUMERO_DUI_RESPONSABLE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_RESPONSABLE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO_GENERACION_INVALIDACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('SELLO_RECEPCION_INVALIDACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_TIPO_OPERACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_TIPO_GASTO_ISR')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_TIPO_DOC')?.focus();
		});
	}
  override focusedRowChanged(e: any): void {
    this.model = e.row.data;
    this.modelUpdate = e.row.data;
    this.mostrarDetaDoc=(this.model.CLASE_DOCUMENTO === "NCR" || this.model.CLASE_DOCUMENTO === "NDB")
    this.tituloGridDetaDoc = this.mostrarDetaDoc ? 'Documentos Asociados' : '';
    this.refrescarBotones();
  }
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}

  selectedLookUpCORR_TIPO_DOC(vRow: any): any {
    this.ES_ELECTRONICO = vRow[0].ES_ELECTRONICO;
    if (this.banderaMtto === UpdateType.Add) {
      this.model.CORR_TIPO_DOC=vRow[0].CORR_TIPO_DOC;
      this.consultarCOM_DOCUMENTO_TOTAL_PREVIEW();
    }
    this.mostrarDetaDoc=(vRow[0].CLASE_DOCUMENTO === "NCR" || vRow[0].CLASE_DOCUMENTO === "NDB")
    this.tituloGridDetaDoc = this.mostrarDetaDoc ? 'Documentos Asociados' : '';
    return vRow[0].CORR_TIPO_DOC;
  }

  selectedLookUpCORR_PROVEEDOR(vRow: any): any {
    if(vRow[0].CORR_CONDICION_PAGO !==0){
      this.model.CORR_CONDICION_PAGO = vRow[0].CORR_CONDICION_PAGO;
      this.model.DIAS_CREDITO = this.mCORR_CONDICION_PAGO.find((item: any) => item.CORR_CONDICION_PAGO === vRow[0].CORR_CONDICION_PAGO).DIAS_CREDITO;
      // this.model.FECHA_VENCIMIENTO = this.model.DIAS_CREDITO>0?this.appInfoService.dateAdd(this.model.FECHA_DOCUMENTO, 'day', this.model.DIAS_CREDITO):this.model.FECHA_DOCUMENTO;
    }
    return vRow[0].CORR_PROVEEDOR;
  }

  selectedLookUpCORR_CONDICION_PAGO(vRow: any): any {
      this.model.DIAS_CREDITO = vRow[0].DIAS_CREDITO;
      // this.model.FECHA_VENCIMIENTO = this.appInfoService.getDate(this.appInfoService.dateAdd(this.model.FECHA_DOCUMENTO, 'day',  vRow[0].DIAS_CREDITO));
    return vRow[0].CORR_CONDICION_PAGO;
  }

  selectedLookUpCORR_TIPO_GASTO(vRow: any): any {
    if (this.banderaMtto === UpdateType.Add) {
      this.model.CORR_TIPO_GASTO=vRow[0].CORR_TIPO_GASTO;
      this.consultarCOM_DOCUMENTO_TOTAL_PREVIEW();
    }
    return vRow[0].CORR_TIPO_GASTO;
  }
  DIAS_CREDITOValueChanged(e: any) {
    if (e.value !== 0) {
      this.model.FECHA_VENCIMIENTO = this.appInfoService.dateAdd(this.model.FECHA_VENCIMIENTO,'day', e.value);
    }
  }

  customizeItem(item: any) {
		if (item && item.itemType === 'simple') {
			if (item.dataField === 'SERIE' || item.dataField === 'NUMERO_DOCUMENTO' || item.dataField === 'NUMERO_UNICO') {
				item.visible = !this.ES_ELECTRONICO;
      } else if(item.dataField === 'CODIGO_GENERACION' || item.dataField === 'SELLO_RECEPCION' || item.dataField === 'NUMERO_CONTROL'){
        item.visible = this.ES_ELECTRONICO;
      }
		}
	}

  Aplicar(): void {
      const confirpreli = custom({
        title: 'Confirmación de Aplicar',
        messageHtml: '¿Realmente Quiere Aplicar el documento?',
        buttons: [
          {
            text: 'Si',
            onClick: (e: any) => {
              this.loadingVisible = true;
              this.service
              .update(this.model)
              .pipe(take(1))
              .subscribe({
                next: (response: any) => {
                  if (response.Result) {
                    this.service
                    .Aplicar(this.model)
                    .pipe(take(1))
                    .subscribe({
                      next: (response: any) => {
                        if (response.Result) {
                          this.notifyFx('Aplicado con exito..!', NotifyType.Success);
                          this.model = response.Data;
                          const vIndex = this.models.findIndex((item: any) => item.ANIO_PERIODO === response.Data.ANIO_PERIODO &&
                                                                              item.MES_PERIODO === response.Data.MES_PERIODO &&
                                                                              item.CORR_DOCUMENTO === response.Data.CORR_DOCUMENTO);
                          this.models[vIndex] = response.Data;
                          this.habilitar();
                          this.refrescarBotones();
                          this.banderaMtto = UpdateType.Not_Defined;
                          if (this.model.ESTADO_DOCUMENTO != 'DI' && this.model.ESTADO_DOCUMENTO != 'SO') {
                            setTimeout(() => {
                              this.bloquear();
                            });
                          }
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
                  } else {
                    this.notifyFx(response.ErrorMessage, NotifyType.Error);
                  }
                },
                error: (error: any) => {
                  this.notifyFx(error, NotifyType.Error);
                },
              });
            },
          },
          {
            text: 'No',
            onClick: (e: any) => false,
          },
        ],
      });
      confirpreli.show().then((dialogResult: any) => {});
  }

 //#region <Totales>
  consultarCOM_DOCUMENTO_TOTAL() {
    this.service
      .getAllCOM_DOCUMENTO_TOTAL({ANIO_PERIODO: this.model.ANIO_PERIODO, MES_PERIODO: this.model.MES_PERIODO,CORR_DOCUMENTO: this.model.CORR_DOCUMENTO})
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.mCOM_DOCUMENTO_TOTAL = response.Data;
            if (this.mCOM_DOCUMENTO_TOTAL.length === 0) {
              this.consultarCOM_DOCUMENTO_TOTAL_PREVIEW();
            }
          }
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
        },
      });
  }

  consultarCOM_DOCUMENTO_TOTAL_PREVIEW() {
    this.service
      .getAllCOM_DOCUMENTO_TOTAL_PREV({ANIO_PERIODO: this.model.ANIO_PERIODO, MES_PERIODO: this.model.MES_PERIODO,CORR_DOCUMENTO: this.model.CORR_DOCUMENTO,CORR_TIPO_GASTO: this.model.CORR_TIPO_GASTO,CORR_TIPO_DOC: this.model.CORR_TIPO_DOC})
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.mCOM_DOCUMENTO_TOTAL = response.Data;
          }
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
        },
      });
  }

  consultarCOM_DOCUMENTO_CR() {
		this.service
			.getAllCOM_DOCUMENTO_CR({ANIO_PERIODO: this.model.ANIO_PERIODO, MES_PERIODO: this.model.MES_PERIODO,CORR_DOCUMENTO: this.model.CORR_DOCUMENTO})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCOM_DOCUMENTO_RETENCION = response.Data;
            console.log('Componente inicializado', this.mCOM_DOCUMENTO_RETENCION)
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},

			});
	}

  gDataComDocumentoTotalRowUpdated(e: any) {
    if (e.data.PERMITE_EDITAR) {
      const isCanceled = new Promise((resolve, reject) => {
      this.loadingVisible = true;
      let insertDeta = (data: any) => {
        this.service
          .updateCOM_DOCUMENTO_TOTAL(data)
          .pipe(take(1))
          .subscribe({
            next: (response: any) => {
              if (!response.Result) {
                this.notifyFx(response.ErrorMessage, NotifyType.Error);
                resolve(false);
              }
              this.consultarCOM_DOCUMENTO_TOTAL();
              this.loadingVisible = false;
            },
            error: (error: any) => {
              this.notifyFx(error, NotifyType.Error);
              this.loadingVisible = false;
              reject(error);
            },
        });
      }
      if (this.banderaMtto === UpdateType.Add) {
        if (!this.service.esValido(this.model, this.notifyFx)) {
          this.loadingVisible = false;
          reject('Debe completar la información del documento');
        }
        this.guardar(insertDeta, e.data);
      } else if (this.banderaMtto === UpdateType.Update) {
        e.data.CORR_DOCUMENTO = this.model.CORR_DOCUMENTO;
        insertDeta(e.data);
      }
    });
    e.cancel = isCanceled;
      this.consultarCOM_DOCUMENTO_TOTAL();
    }
  }
  //#endregion

//#region <Documentos Electronicos>
  consultarCOM_JSON() {
    this.service
      .getAllCOM_JSON({OPCION_CONSULTA:2})
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.mCOM_JSON = response.Data;
          }
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
        },
      });
  }
  MostrarDocumentosElectronicos() {
    this.popupVisibleJson = true;
    this.consultarCOM_JSON();
  }

  guardarDocPopup() {
    this.model=this.mCOM_JSON_SELECCIONADO;
    this.model.CREADO_DESDE_JSON=true;
    this.guardarSinSalir();
    this.popupVisibleJson = false;
    this.btnDocumentosElectronicos = '';
    this.btnVistaPrevia = 'Vista Legible';
  }

  hideDocPopup() {
    this.popupVisibleJson = false;
  }

  focusedRowChangedComJson(e: any) {
    if (this.dataComJson.focusedRowIndex >= 0 && e.row.rowType === 'data') {
      if (this.banderaMtto === UpdateType.Add) {
        this.mCOM_JSON_SELECCIONADO = e.row.data;
      }
    } else {
      this.mCOM_JSON_SELECCIONADO = null;
    }
  }


  onFileChanged(event:any) {
    var selectedFile = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsText(selectedFile, "UTF-8");
    fileReader.onload = () => {
     this.vData = JSON.parse(fileReader.result?.toString() || '{}');
     if(this.vData?.identificacion.tipoDte==="01"){
        this.service
        .GenerarFE(JSON.parse(fileReader.result?.toString() || '{}'))
        .pipe(take(1))
        .subscribe({
          next: (response: any) => {
            if (response.Result) {
              this.notifyFx('Json Cargado con exito!', NotifyType.Success);
              this.consultarCOM_JSON();
            } else {
              this.notifyFx(response.ErrorMessage, NotifyType.Error);
            }
            if (this.fileInput) {
            this.fileInput.nativeElement.value = '';
        }
          },
          error: (error: any) => {
            this.notifyFx(error, NotifyType.Error);
            if (this.fileInput) {
              this.fileInput.nativeElement.value = '';
             }
          },
        });
      }else if(this.vData?.identificacion.tipoDte==="03"){
        this.service
        .GenerarCCF(JSON.parse(fileReader.result?.toString() || '{}'))
        .pipe(take(1))
        .subscribe({
          next: (response: any) => {
            if (response.Result) {
              this.notifyFx('Json Cargado con exito!', NotifyType.Success);
              this.consultarCOM_JSON();
            } else {
              this.notifyFx(response.ErrorMessage, NotifyType.Error);
            }
            if (this.fileInput) {
              this.fileInput.nativeElement.value = '';
            }
          },
          error: (error: any) => {
            this.notifyFx(error, NotifyType.Error);
            if (this.fileInput) {
              this.fileInput.nativeElement.value = '';
            }
          },
        });
      }else if (this.vData?.identificacion.tipoDte==="09"){
        this.service
        .GenerarDLCE(JSON.parse(fileReader.result?.toString() || '{}'))
        .pipe(take(1))
        .subscribe({
          next: (response: any) => {
            if (response.Result) {
              this.notifyFx('Json Cargado con exito!', NotifyType.Success);
              this.consultarCOM_JSON();
            } else {
              this.notifyFx(response.ErrorMessage, NotifyType.Error);
            }
            if (this.fileInput) {
              this.fileInput.nativeElement.value = '';
            }
          },
          error: (error: any) => {
            this.notifyFx(error, NotifyType.Error);
            if (this.fileInput) {
              this.fileInput.nativeElement.value = '';
            }
          },
        });

      }
    }
    fileReader.onerror = (error:any) => {
      this.notifyFx(error, NotifyType.Error);
      if (this.fileInput) {
        this.fileInput.nativeElement.value = '';
      }
    }
  }
  onFileChangedPDF(event:any) {
    var selectedFile = event.target.files[0];
    const fileReader = new FileReader();

    if (this.mCOM_JSON_SELECCIONADO == undefined)
    {
      this.notifyFx("Debe seleccionar un documento!", NotifyType.Error);
      fileReader.onerror = (error:any) => {
        this.notifyFx(error, NotifyType.Error);
        if (this.fileInputPDF) {
          this.fileInputPDF.nativeElement.value = '';
        }
      }
    }
    else
    {
      fileReader.readAsDataURL(selectedFile);
      fileReader.onload = () => {
        const formData = new FormData();
          formData.append('CORR_EMPRESA', this.mCOM_JSON_SELECCIONADO.CORR_EMPRESA_FE.toString());
          formData.append('CORR_DOCUMENTO', this.mCOM_JSON_SELECCIONADO.CORR_DOCUMENTO_FE.toString());
          formData.append('NOMBRE_DOCUMENTO', selectedFile.name);
          formData.append('DESCRIPCION_DOCUMENTO', selectedFile.name.toString());
          formData.append('CORR_TIPO_DOCUMENTO', '1');
          formData.append('RUTA_DOCUMENTO', '-');
          formData.append('NOMBRE_ARCHIVO',  selectedFile.name);
          formData.append('FOTO_DOCUMENTO', selectedFile, selectedFile.name);
        this.service
        .postPDF(formData)
        .pipe(take(1))
        .subscribe({
          next: (response: any) => {
            if (response.Result) {
              this.notifyFx('PDF Cargado con exito!', NotifyType.Success);
            } else {
              this.notifyFx(response.ErrorMessage, NotifyType.Error);
            }
            if (this.fileInputPDF) {
              this.fileInputPDF.nativeElement.value = '';
            }
          },
          error: (error: any) => {
            this.notifyFx(error, NotifyType.Error);
            if (this.fileInputPDF) {
              this.fileInputPDF.nativeElement.value = '';
            }
          },
        });
      }
      fileReader.onerror = (error:any) => {
        this.notifyFx(error, NotifyType.Error);
        if (this.fileInputPDF) {
          this.fileInputPDF.nativeElement.value = '';
        }
      }
    }
  }

  gDataComJsonDocRowDblClick(e: any) {
    /*if (e.rowType === 'data') {
        this.loadingVisible = true;
        const param = {
          CORR_EMPRESA: e.data.CORR_EMPRESA_FE,
          CORR_DOCUMENTO: e.data.CORR_DOCUMENTO_FE
        };
        this.service
        .getDoc(param)
        .pipe(take(1))
        .subscribe({
          next: (vDoc: any) => {
            if (vDoc != undefined) {
              this.PDF = this.sanitization.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(vDoc));
            } else {
              this.notifyFx("Error al generar documento", NotifyType.Error);
            }
            this.loadingVisible = false;
          },
          error: (error: any) => {
            this.loadingVisible = false;
            this.notifyFx(error.error, NotifyType.Error);
          },
        });
        this.popupVisiblePdf = true;
      }*/
  }

  MostrarVistaPreviaModal() {
    this.loadingVisible = true;
    const param = {
      CORR_EMPRESA: this.mCOM_JSON_SELECCIONADO.CORR_EMPRESA_FE,
      CORR_DOCUMENTO: this.mCOM_JSON_SELECCIONADO.CORR_DOCUMENTO_FE
    };
    this.service
      .getDoc(param)
      .pipe(take(1))
      .subscribe({
        next: (vDoc: any) => {
          if (vDoc != undefined) {
            this.PDF = this.sanitization.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(vDoc));
          } else {
            this.notifyFx("Error al generar documento", NotifyType.Error);
          }
          this.loadingVisible = false;
        },
        error: (error: any) => {
          this.loadingVisible = false;
          this.notifyFx(error.error, NotifyType.Error);
        },
    });
    this.popupVisiblePdf = true;
  }

  MostrarVistaPrevia() {
    this.loadingVisible = true;
    const param = {
      CORR_EMPRESA: this.model.CORR_EMPRESA_FE,
      CORR_DOCUMENTO: this.model.CORR_DOCUMENTO_FE
    };
    this.service
    .getDoc(param)
    .pipe(take(1))
    .subscribe({
      next: (vDoc: any) => {
        if (vDoc != undefined) {
          this.PDF = this.sanitization.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(vDoc));
        } else {
          this.notifyFx("Error al generar documento", NotifyType.Error);
        }
        this.loadingVisible = false;
      },
      error: (error: any) => {
        this.loadingVisible = false;
        this.notifyFx(error.error, NotifyType.Error);
      },
    });
    this.popupVisiblePdf = true;
  }
//#endregion
//#region <Metodos Detalle de Documentos>
  consultarCOM_DOCUMENTO_DETA_DOC() {
    this.service
      .getAllCOM_DOCUMENTO_DETA_DOC({
        ANIO_PERIODO: this.model.ANIO_PERIODO,
        MES_PERIODO: this.model.MES_PERIODO,
        CORR_DOCUMENTO: this.model.CORR_DOCUMENTO
      })
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.mCOM_DOCUMENTO_DETA_DOC = response.Data;
          } else {
            this.notifyFx(response.ErrorMessage, NotifyType.Error);
          }
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
        },
      });
  }
  consultarCOM_DOCUMENTO_DETA_DOC_DISPONIBLES() {
    this.service
      .getAllCOM_DOCUMENTO_DETA_DOC_DISPONIBLES({
        FECHA_INICIAL: this.vFECHA_INICIAL_MODAL.toISOString(),
        FECHA_FINAL: this.vFECHA_FINAL_MODAL.toISOString(),
        ANIO_PERIODO: this.model.ANIO_PERIODO,
        MES_PERIODO: this.model.MES_PERIODO,
        CORR_DOCUMENTO: this.model.CORR_DOCUMENTO,
        CORR_PROVEEDOR: this.model.CORR_PROVEEDOR,
      })
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.mCOM_DOCUMENTO_DETA_DOC_DISPONIBLES = response.Data;
          } else {
            this.notifyFx(response.ErrorMessage, NotifyType.Error);
          }
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
        },
      });
  }
  MostrarDetalleDocumentos() {
    this.vFECHA_INICIAL_MODAL = this.appInfoService.dateAdd(
      this.appInfoService.getDate(),
      'month',
      -1
    );
    this.vFECHA_FINAL_MODAL = this.appInfoService.getDate();
    this.popupVisibleDetaDoc = true;
    this.guardarSinSalirDetaDoc();
  }
  guardarDetaDocPopup() {
    this.guardarDetaDoc();
    this.popupVisibleDetaDoc = false;
  }

  hideDetaDocPopup() {
    this.popupVisibleDetaDoc = false;
  }
  OnValueChangeFECHA_INICIAL_MODAL(e: any) {
    this.vFECHA_INICIAL_MODAL = e.value;
  }

  OnValueChangeFECHA_FINAL_MODAL(e: any) {
    this.vFECHA_FINAL_MODAL = e.value;
  }
  selectTodos() {
    this.mCOM_DOCUMENTO_DETA_DOC_DISPONIBLES.forEach((x: any) => {
      x.SELECCION = true;
      x.MONTO_INGRESO = x.MONTO_INICIAL;
    });
  }

  selectNinguno() {
    this.mCOM_DOCUMENTO_DETA_DOC_DISPONIBLES.forEach((x: any) => {
      x.SELECCION = false;
      x.MONTO_INGRESO = 0;
    });
  }

  guardarDetaDoc(){
    if(
      this.mCOM_DOCUMENTO_DETA_DOC_DISPONIBLES.filter((x: any) => x.SELECCION).length >= 0
    ){
      this.mCOM_DOCUMENTO_DETA_DOC_DISPONIBLES
      .filter((x: any) => x.SELECCION)
      .forEach((x: any) => {
        x.ANIO_PERIODO = this.model.ANIO_PERIODO;
        x.MES_PERIODO = this.model.MES_PERIODO;
        x.CORR_DOCUMENTO = this.model.CORR_DOCUMENTO;
        this.service
        .insertCOM_DOCUMENTO_DETA_DOC(x)
        .pipe(take(1))
        .subscribe({
          next: (response: any) => {
            if (response.Result) {
              this.notifyFx('Detalle de Documento agregado con exito!', NotifyType.Success);
              this.consultarCOM_DOCUMENTO_DETA_DOC();
              this.consultarCOM_DOCUMENTO_TOTAL();
            } else {
              this.notifyFx(response.ErrorMessage, NotifyType.Error);
            }
          },
          error: (error: any) => {
            this.notifyFx(error, NotifyType.Error);
          },
        });
      });
    }
    else{
      this.notifyFx('Debe seleccionar al menos un documento', NotifyType.Error);
      return;
    }
    this.popupVisibleDetaDoc = false;
  }

  gDataComDocumentoDetaDocRowRemoving(e: any) {
    const isCanceled = new Promise((resolve, reject) => {
      if (this.model.ESTADO_DOCUMENTO != 'DI') {
        this.loadingVisible = false;
        reject('No se puede eliminar el documento Debe estar en Digitado...');
        return;
      }
      this.loadingVisible = true;
      this.service
        .deleteCOM_DOCUMENTO_DETA_DOC(e.data)
        .pipe(take(1))
        .subscribe({
          next: (response: any) => {
            if (response.Result) {
              this.loadingVisible = false;
              this.notifyFx(
                'Registro eliminado con exito!',
                NotifyType.Success
              );
              this.consultarCOM_DOCUMENTO_DETA_DOC();
              this.consultarCOM_DOCUMENTO_TOTAL();
              resolve(false);
            } else {
              this.loadingVisible = false;
              reject(response.ErrorMessage);
            }
          },
          error: (error: any) => {
            e.cancel = true;
            this.loadingVisible = false;
            this.notifyFx(error, NotifyType.Error);
          },
        });
    });
    e.cancel = isCanceled;
  }
  MontoIngresoSetCellValue(newData: any, value: any, currentRowData: any) {
    const column = this as any;

    newData.MONTO_FINAL = (currentRowData.MONTO_INICIAL - (value * currentRowData.SUMA_RESTA)).toFixed(2);
    if(!currentRowData.SELECCION){newData.SELECCION = value > 0 }


    column.defaultSetCellValue(newData, value);
  }
  SeleccionSetCellValue(newData: any, value: any, currentRowData: any) {
    const column = this as any;

    if (value && currentRowData.MONTO_INGRESO === 0) {
      newData.MONTO_INGRESO = currentRowData.MONTO_INICIAL;
      newData.MONTO_FINAL = currentRowData.MONTO_INICIAL - (currentRowData.MONTO_INICIAL * currentRowData.SUMA_RESTA);
    } else if (!value) {
      newData.MONTO_INGRESO = 0;
      newData.MONTO_FINAL = currentRowData.MONTO_INICIAL * currentRowData.SUMA_RESTA;
    }

    column.defaultSetCellValue(newData, value);
  }
//#endregion
//#region CR
   GenerarCR() {
    this.popupVisibleCR = true;
    this.mDocumentoCR.CORR_EMPRESA = 0
    this.mDocumentoCR.ANIO_PERIODO = 0
    this.mDocumentoCR.MES_PERIODO = 0
    this.mDocumentoCR.CORR_DOCUMENTO = 0
    this.mDocumentoCR.DESCRIPCION_DOCUMENTO = ""
}

guardarDocPopupCR() {
  const nacional = this.mDocumentoCR.ES_NACIONAL === true;
  const extranjero = this.mDocumentoCR.ES_EXTRANJERO === true;
  const descripcion = (this.mDocumentoCR.DESCRIPCION_DOCUMENTO || '').trim();

  if (!nacional && !extranjero) {
    this.notifyFx('Debe seleccionar al menos una opción: Nacional o Extranjero', NotifyType.Error);
    return;
  }

  if (nacional && extranjero) {
    this.notifyFx('Debe seleccionar solo una opción: Nacional o Extranjero', NotifyType.Error);
    return;
  }

  if (!descripcion || descripcion.length < 3) {
    this.notifyFx('Debe ingresar una descripción válida (mínimo 3 caracteres)', NotifyType.Error);
    return;
  }

  this.mDocumentoCR.CORR_EMPRESA = this.model.CORR_EMPRESA
  this.mDocumentoCR.ANIO_PERIODO = this.model.ANIO_PERIODO
  this.mDocumentoCR.MES_PERIODO = this.model.MES_PERIODO
  this.mDocumentoCR.CORR_DOCUMENTO = this.model.CORR_DOCUMENTO

  console.log('Nacional:', nacional);
  console.log('Extranjero:', extranjero);
  console.log('Descripción:', descripcion);
  console.log('MODELO:', this.mDocumentoCR);

    const confirpreli = custom({
    title: 'Confirmación de Generación',
    messageHtml: '¿Realmente Quiere Generar el Comprobante de Retención?',
    buttons: [
      {
        text: 'Si',
        onClick: (e: any) => {
          this.loadingVisible = true;
          this.service
            .GenerarCR(this.mDocumentoCR)
            .pipe(take(1))
            .subscribe({
              next: (response: any) => {
                if (response.Result) {
                  this.notifyFx('Generado con exito..!', NotifyType.Success);
                  this.model = response.Data;
                  const vIndex = this.models.findIndex((item: any) => item.ANIO_PERIODO === response.Data.ANIO_PERIODO &&
                                                                      item.MES_PERIODO === response.Data.MES_PERIODO &&
                                                                      item.CORR_DOCUMENTO === response.Data.CORR_DOCUMENTO);
                  this.models[vIndex] = response.Data;
                  //this.habilitar();
                  this.refrescarBotones();
                  this.consultarCOM_DOCUMENTO_CR();
                  this.banderaMtto = UpdateType.Not_Defined;
                  if (this.model.ESTADO_DOCUMENTO != 'DI' && this.model.ESTADO_DOCUMENTO != 'SO') {
                    setTimeout(() => {
                      this.bloquear();
                    });
                  }
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
        },
      },
      {
        text: 'No',
        onClick: (e: any) => false,
      },
    ],
  });
  confirpreli.show().then((dialogResult: any) => {});
  this.popupVisibleCR = false;
  }

  hideDocPopupCR() {
    this.popupVisibleCR = false;
  }

//#endregion CR

//#region anular CR
   AnularCR() {
    this.popupVisibleAnularCR = true;
    this.mDocumentoAnularCR.CORR_EMPRESA = 0
    this.mDocumentoAnularCR.ANIO_PERIODO = 0
    this.mDocumentoAnularCR.MES_PERIODO = 0
    this.mDocumentoAnularCR.CORR_DOCUMENTO = 0
    this.mDocumentoAnularCR.MOTIVO_ANULACION = ""
}

guardarDocPopupAnularCR() {

  const MotivoAnulacion = (this.mDocumentoAnularCR.MOTIVO_ANULACION || '').trim();

  if (!MotivoAnulacion || MotivoAnulacion.length < 3) {
    this.notifyFx('Debe ingresar un motivo de anulación válida (mínimo 3 caracteres)', NotifyType.Error);
    return;
  }

  this.mDocumentoAnularCR.CORR_EMPRESA = this.model.CORR_EMPRESA
  this.mDocumentoAnularCR.ANIO_PERIODO = this.model.ANIO_PERIODO
  this.mDocumentoAnularCR.MES_PERIODO = this.model.MES_PERIODO
  this.mDocumentoAnularCR.CORR_DOCUMENTO = this.model.CORR_DOCUMENTO


    const confirpreli = custom({
    title: 'Confirmación de Anulación',
    messageHtml: '¿Realmente Quiere Anular el Comprobante de Retención?',
    buttons: [
      {
        text: 'Si',
        onClick: (e: any) => {
          this.loadingVisible = true;
          this.service
            .AnularCR(this.mDocumentoAnularCR)
            .pipe(take(1))
            .subscribe({
              next: (response: any) => {
                if (response.Result) {
                  this.notifyFx('Anulación con exito..!', NotifyType.Success);
                  this.model = response.Data;
                  const vIndex = this.models.findIndex((item: any) => item.ANIO_PERIODO === response.Data.ANIO_PERIODO &&
                                                                      item.MES_PERIODO === response.Data.MES_PERIODO &&
                                                                      item.CORR_DOCUMENTO === response.Data.CORR_DOCUMENTO);
                  this.models[vIndex] = response.Data;
                  //this.habilitar();
                  this.refrescarBotones();
                  this.consultarCOM_DOCUMENTO_CR();
                  this.banderaMtto = UpdateType.Not_Defined;
                  if (this.model.ESTADO_DOCUMENTO != 'DI' && this.model.ESTADO_DOCUMENTO != 'SO') {
                    setTimeout(() => {
                      this.bloquear();
                    });
                  }
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
        },
      },
      {
        text: 'No',
        onClick: (e: any) => false,
      },
    ],
  });
  confirpreli.show().then((dialogResult: any) => {});
  this.popupVisibleAnularCR = false;
  }

  hideDocPopupAnularCR() {
    this.popupVisibleAnularCR = false;
  }

//#endregion anular CR
}
