import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { filter, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ComCotizacion } from './models/com-cotizacion';
import { ComCotizacionService } from './com-cotizacion.service';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { custom } from 'devextreme/ui/dialog';
import { ComCotizacionDoc } from './com-cotizacion-doc/models/com-cotizacion-doc';
import { DxFormComponent } from 'devextreme-angular/ui/form';
import { ComCotizacionDeta } from './com-cotizacion-deta/models/com-cotizacion-deta';
import { ComCotizacionComentario } from './com-cotizacion-comentario/models/com-cotizacion-comentario';
import { TabConfig } from './com-cotizacion-comentario/models/tab-config';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
	selector: 'app-com-cotizacion',
	templateUrl: './com-cotizacion.component.html',
	styleUrls: ['./com-cotizacion.component.scss'],
})
export class ComCotizacionComponent extends CBaseComponent implements OnInit {

  @ViewChild('DataCotizaDeta', { static: false }) DataCotizaDeta!: DxDataGridComponent;
  @ViewChild('fDocumento', { static: false }) dataDocForm!: DxFormComponent;
  @ViewChild('fComentario', { static: false }) dataComentarioForm!: DxFormComponent;
  @ViewChild('gData', { static: false }) gdata!: DxDataGridComponent;

	//#region <Declarando Variales>
	mESTADO_COTIZACION: any;
  mCORR_UNIDAD_MEDIDA: any;
  mCOM_COTIZACION_DETA: any;
  mCOM_COTIZACION_DOC: any;
  mCLASE_COMENTARIO: any;
	readOnly = false;
  btnAplicar = 'Aplicar';
  popupVisiblePdf=false;
  popupVisibleDoc=false;
  popupVisibleComentario=false;
  muestraClaseComentario=false;
  mDocumento: ComCotizacionDoc = {
    CORR_EMPRESA: this.appInfoService.CORR_EMPRESA,
    ANIO_PERIODO: 0,
    CORR_SOLI_COTIZACION: 0,
    CORR_DOCUMENTO: 0,
    NOMBRE_DOCUMENTO: '',
    DESCRIPCION_DOCUMENTO: '',
    CORR_TIPO_DOCUMENTO: 0,
    NOMBRE_TIPO_DOCUMENTO: ''
  };
  mComentario: ComCotizacionComentario = {
    CORR_EMPRESA: this.appInfoService.CORR_EMPRESA,
    ANIO_PERIODO: 0,
    CORR_COTIZACION: 0,
    CORR_COMENTARIO: 0,
    CLASE_COMENTARIO: 'EX',
    COMENTARIO: '',
    USUARIO_CREA: '',
    FECHA_CREA: new Date,
    ESTACION_CREA: '',
    USUARIO_ACTU: '',
    FECHA_ACTU: new Date,
    ESTACION_ACTU: ''
  };
  mCORR_TIPO_DOCUMENTO: any;
  vNOMBRE_ARCHIVO = '';
  fileDoc: any;
  modelDeta: ComCotizacionDeta = {
    CORR_EMPRESA: 0,
    ANIO_PERIODO: 0,
    CORR_COTIZACION: 0,
    CORR_COTIZACION_DETA: 0,
    CODIGO_ITEM: '',
    NOMBRE_ITEM: '',
    CANTIDAD: 0,
    CORR_UNIDAD_MEDIDA: 0,
    PRECIO_UNITARIO: 0,
    MONTO_SUBTOTAL: 0,
    OBSERVACIONES: '',
    MARCA: '',
    ESTADO_SOLI_COTIZACION: '',
    NOMBRE_ESTADO_SOLI_COTIZACION: '',
    USUARIO_CREA: '',
    FECHA_CREA: new Date(),
    ESTACION_CREA: '',
    USUARIO_ACTU: '',
    FECHA_ACTU: new Date(),
    ESTACION_ACTU: '',
    CORR_DOCUMENTO: 0,
    NOMBRE_ARCHIVO: ''
  }
  insertDetaDoc=false;
  mCOM_COTIZACION_COMENTARIO: any;
  tabs: TabConfig[] = [
    { name: 'Desde Dispositivo', value: ['file'] },
    { name: 'Desde la Web', value: ['url'] },
    { name: 'Ambos', value: ['file', 'url'] },
  ];
  mCORR_CONDICION_PAGO: any;
  PDF!: SafeUrl;

  FilterValue: any =null;
  mCORR_FORMA_PAGO: any;
	// #endregion

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ComCotizacionService,
    private sanitization: DomSanitizer
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
    this.AgregarComentario = this.AgregarComentario.bind(this);
	}

	//#region <Inicializando Opciones>
	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {}
	// #endregion

	//#region <Manejo de Combos>
	llenaComboBox() {
		this.getESTADO_COTIZACION();
		this.getCORR_UNIDAD_MEDIDA();
    this.getCORR_TIPO_DOCUMENTO();
    this.getCLASE_COMENTARIO();
    this.getCORR_CONDICION_PAGO();
    this.getCORR_FORMA_PAGO();
	}

  getESTADO_COTIZACION() {
		this.appInfoService
			.getLookUp('COM_COTIZACION', 'COM_LISTA', 'GetESTADO_COTIZACION', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mESTADO_COTIZACION = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

  getCORR_UNIDAD_MEDIDA() {
		this.appInfoService
			.getLookUp('COM_COTIZACION', 'COM_UNIDAD_MEDIDA', 'GetCORR_UNIDAD_MEDIDA', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_UNIDAD_MEDIDA = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
  getCORR_TIPO_DOCUMENTO() {
		this.appInfoService
			.getLookUp('COM_COTIZACION', 'COM_TIPO_DOC_FISICO', 'GetCORR_TIPO_DOCUMENTO', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_TIPO_DOCUMENTO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
  getCLASE_COMENTARIO() {
		this.appInfoService
			.getLookUp('COM_COTIZACION', 'COM_LISTA', 'GetCLASE_COMENTARIO', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCLASE_COMENTARIO = response.Data;
					} else {
            this.notifyFx(response.ErrorMessage, NotifyType.Error);
          }
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
  getCORR_CONDICION_PAGO() {
		this.appInfoService
			.getLookUp('COM_COTIZACION', 'COM_CONDICION_PAGO', 'getCORR_CONDICION_PAGO', undefined, environment.UrlCOMPRASAPI)
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
  getCORR_FORMA_PAGO() {
		this.appInfoService
			.getLookUp('COM_COTIZACION', 'GEN_FORMA_PAGO', 'GetCORR_FORMA_PAGO', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_FORMA_PAGO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xANIO_PERIODO?: number,xCORR_COTIZACION?: number): any {
		if (xCORR_COTIZACION == undefined) {
			xCORR_COTIZACION = 0;
		}
		return {
      ANIO_PERIODO: xANIO_PERIODO,
			CORR_COTIZACION: xCORR_COTIZACION,
		};
	}

	override fillData(xModel?: ComCotizacion): ComCotizacion {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				ANIO_PERIODO: xModel.ANIO_PERIODO,
				CORR_COTIZACION: xModel.CORR_COTIZACION,
        NUMERO_COTIZACION:xModel.NUMERO_COTIZACION,
				FECHA_COTIZACION: xModel.FECHA_COTIZACION,
				CORR_PROVEEDOR: xModel.CORR_PROVEEDOR,
				NOMBRE_PROVEEDOR: xModel.NOMBRE_PROVEEDOR,
				USUARIO_COTIZA: xModel.USUARIO_COTIZA,
				OBSERVACIONES: xModel.OBSERVACIONES,
				OBSERVACIONES_PROVEEDOR: xModel.OBSERVACIONES_PROVEEDOR,
				PLAZO_ENTREGA: xModel.PLAZO_ENTREGA,
				ESTADO_COTIZACION: xModel.ESTADO_COTIZACION,
				NOMBRE_ESTADO_COTIZACION: xModel.NOMBRE_ESTADO_COTIZACION,
				ANIO_PERIODO_SOLI_COTI: xModel.ANIO_PERIODO_SOLI_COTI,
				CORR_SOLI_COTIZACION: xModel.CORR_SOLI_COTIZACION,
				USUARIO_CREA: xModel.USUARIO_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
        NUMERO_SOLI_COTIZACION: xModel.NUMERO_SOLI_COTIZACION,
        NUMERO_SOLI_COMPRA: xModel.NUMERO_SOLI_COMPRA,
        CORR_CONDICION_PAGO: xModel.CORR_CONDICION_PAGO,
        NOMBRE_CONDICION_PAGO: xModel.NOMBRE_CONDICION_PAGO
			};
		} else {
			return {
				CORR_EMPRESA: 1,
				ANIO_PERIODO: this.appInfoService.toYear(new Date()),
				CORR_COTIZACION: 0,
        NUMERO_COTIZACION: '',
				FECHA_COTIZACION: new Date(),
				CORR_PROVEEDOR: 0,
				NOMBRE_PROVEEDOR: '',
				USUARIO_COTIZA: '',
				OBSERVACIONES: '',
				OBSERVACIONES_PROVEEDOR: '',
				PLAZO_ENTREGA: '',
				ESTADO_COTIZACION: '',
				NOMBRE_ESTADO_COTIZACION: '',
				ANIO_PERIODO_SOLI_COTI: 0,
				CORR_SOLI_COTIZACION: 0,
				USUARIO_CREA: '',
				FECHA_CREA: new Date(),
				ESTACION_CREA: '',
				USUARIO_ACTU: '',
				FECHA_ACTU: new Date(),
				ESTACION_ACTU: '',
        NUMERO_SOLI_COTIZACION: '',
        NUMERO_SOLI_COMPRA: '',
        CORR_CONDICION_PAGO: 0,
        NOMBRE_CONDICION_PAGO: ''
			};
		}
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
  consultarCOM_COTIZACION_DETA() {
		this.service
			.getAllCOM_COTIZACION_DETA({ ANIO_PERIODO: this.model.ANIO_PERIODO, CORR_COTIZACION: this.model.CORR_COTIZACION })
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCOM_COTIZACION_DETA = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},

			});
	}

  consultarCOM_COTIZACION_COMENTARIO() {
		this.service
			.getAllCOM_COTIZACION_COMENTARIO({ ANIO_PERIODO: this.model.ANIO_PERIODO, CORR_COTIZACION: this.model.CORR_COTIZACION })
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCOM_COTIZACION_COMENTARIO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},

			});
	}

  override focusedRowChanged(e: any) {
    this.model = e.row.data;
    this.refrescarBotones();
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
              this.refrescarBotones();
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
							const vIndex = this.models.findIndex((item: any) => item.CORR_COTIZACION === response.Data.CORR_COTIZACION);
							this.models[vIndex] = response.Data;
							this.AsignaStatus(UpdateType.Browse);
							this.notifyFx('Registro modificado con exito!', NotifyType.Success);
              this.refrescarBotones();
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
        if (this.model.ESTADO_COTIZACION == 'DI') {
          this.btnAplicar = '';
        } else if (this.model.ESTADO_COTIZACION == 'SO') {
          this.btnAplicar = 'Aplicar';
        } else {
          this.btnAplicar = '';
        }
      } else {
        this.btnAplicar = '';
      }
  }

  override nuevo(): void {
		super.nuevo();
    this.refrescarBotones();
	}

  override editarClick(e: any) {
		super.editarClick(e);
    this.consultarCOM_COTIZACION_DETA();
    this.consultarCOM_COTIZACION_COMENTARIO();
    this.consultarDocumentos();
    this.refrescarBotones();
    if (this.model.ESTADO_COTIZACION != 'DI' && this.model.ESTADO_COTIZACION != 'SO') {
			setTimeout(() => {
				this.bloquear();
			});
    }
	}

  override rowDblClick(e: any) {
		super.rowDblClick(e);
    this.consultarCOM_COTIZACION_DETA();
    this.consultarCOM_COTIZACION_COMENTARIO();
    this.consultarDocumentos();
    this.refrescarBotones();
    if (this.model.ESTADO_COTIZACION != 'DI' && this.model.ESTADO_COTIZACION != 'SO') {
			setTimeout(() => {
				this.bloquear();
			});
		}
	}


  override getPermiteEditar(e: any): boolean {
		if (this.permiteEdit && (e.row.data.ESTADO_COTIZACION === 'DI' || e.row.data.ESTADO_COTIZACION === 'SO' )) {
			return true;
		}
		return false;
	}

  override getPermiteDele(e: any): boolean {
		return false;
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
				const vIndex = this.models.findIndex((item: any) => item.CORR_COTIZACION === this.modelUpdate.CORR_COTIZACION);
				this.models[vIndex] = this.modelUpdate;
				cancelRow();
			});
		} else {
			cancelRow();
		}
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.ANIO_PERIODO,e.data.CORR_COTIZACION))
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
		this.dataForm.instance.getEditor('CORR_COTIZACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FECHA_COTIZACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_PROVEEDOR')?.option('readOnly', true);
		this.dataForm.instance.getEditor('USUARIO_COTIZA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('OBSERVACIONES')?.option('readOnly', true);
		this.dataForm.instance.getEditor('OBSERVACIONES_PROVEEDOR')?.option('readOnly', true);
		this.dataForm.instance.getEditor('PLAZO_ENTREGA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTADO_COTIZACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ANIO_PERIODO_SOLI_COTI')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_SOLI_COTIZACION')?.option('readOnly', true);
    this.dataForm.instance.getEditor('CORR_CONDICION_PAGO')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_COTIZACION')?.focus();
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}
  selectedLookUpCORR_CONDICION_PAGO(vRow: any): any {
		return vRow[0].CORR_CONDICION_PAGO;
	}
  selectedLookUpCORR_FORMA_PAGO(vRow: any): any {
		return vRow[0].CORR_FORMA_PAGO;
	}
   //#region <COM_SOLI_COTIZACION_DETA>
   editarDetaClick(e: any): void  {
    e.event.preventDefault();
      e.component.editRow(e.row.rowIndex);
    };

	gDataComCoticionDetaRowUpdated(e: any) {
		const isCanceled = new Promise((resolve, reject) => {
			// if (e.data.ESTADO_SOLI_COTIZACION != 'DI' || e.data.ESTADO_SOLI_COTIZACION != 'SO') {
			// 	this.loadingVisible = false;
			// 	reject('El estado de la cotización NO acepta modificaciones..');
			// 	return;
			// }
		this.loadingVisible = true;
		this.service
			.updateCOM_COTIZACION_DETA(e.data)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.loadingVisible = false;
						this.notifyFx('Registro Actualizado con exito!', NotifyType.Success);
						resolve(false);
					}
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(error, NotifyType.Error);
				},
			});
		});
		e.cancel = isCanceled;
	}

	gDataComCotizacionDetaRowRemoving(e: any) {
		const isCanceled = new Promise((resolve, reject) => {
		if (e.data.ESTADO_SOLI_COTIZACION != 'DI' || e.data.ESTADO_SOLI_COTIZACION != 'SO') {
				this.loadingVisible = false;
				reject('No se puede eliminar la cotización...');
				return;
		}
		this.loadingVisible = true;
		this.service
			.deleteCOM_COTIZACION_DETA(e.data)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.loadingVisible = false;
						this.notifyFx('Registro eliminado con exito!', NotifyType.Success);
						resolve(false);
					} else {
						this.loadingVisible = false;
						//this.notifyFx(response.ErrorMessage, NotifyType.Error);
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

  selectedLookUpCORR_UNIDAD_MEDIDA(vRow: any): any {
		return vRow[0].CORR_UNIDAD_MEDIDA;
	}

  selectedLookUpmESTADO_COTIZACION_DETA(vRow: any): any {
		return vRow[0].Key;
	}

  gDataComCotizacionDetaFocusedRowChanged(e: any) {
    this.modelDeta.CORR_EMPRESA = this.appInfoService.CORR_EMPRESA;
    this.modelDeta.ANIO_PERIODO = this.model.ANIO_PERIODO;
    this.modelDeta.CORR_COTIZACION = this.model.CORR_COTIZACION;
    this.modelDeta.CORR_COTIZACION_DETA = e.row.data.CORR_COTIZACION_DETA;
    this.modelDeta.CORR_DOCUMENTO=e.row.data.CORR_DOCUMENTO;
    this.modelDeta.NOMBRE_ARCHIVO=e.row.data.NOMBRE_ARCHIVO;
  }
  //#endregion

  Aplicar(): void {
    const confirpreli = custom({
      title: 'Confirmación de Aplicar de Cotización',
      messageHtml: '¿Realmente Quiere Aplicar la cotizaciones?',
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
                        const vIndex = this.models.findIndex((item: any) => item.CORR_COTIZACION === response.Data.CORR_COTIZACION);
                        this.models[vIndex] = response.Data;
                        this.habilitar();
                        this.refrescarBotones();
                        this.banderaMtto = UpdateType.Not_Defined;
                        if (this.model.ESTADO_COTIZACION != 'DI' && this.model.ESTADO_COTIZACION != 'SO') {
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

  CantidadsetCellValue(newData: any, value: any, currentRowData: any) {
		const column = this as any;

    newData.MONTO_SUBTOTAL = (value * currentRowData.PRECIO_UNITARIO).toFixed(2);

    column.defaultSetCellValue(newData, value);
	}

  PreciosetCellValue(newData: any, value: any, currentRowData: any) {
		const column = this as any;

    newData.MONTO_SUBTOTAL = (currentRowData.CANTIDAD * value).toFixed(2);

    column.defaultSetCellValue(newData, value);
	}

  MontoSubTotalCellValue(newData: any, value: any, currentRowData: any) {
		const column = this as any;

    newData.PRECIO_UNITARIO = (value / currentRowData.CANTIDAD).toFixed(2);

    column.defaultSetCellValue(newData, value);
	}
  //#region <COM_COTIZACION_DOC>
  gDataCotizacionDocRowDblClick(e: any) {
    if (e.rowType === 'data') {
      this.loadingVisible = true;
      const param = {
        ANIO_PERIODO: this.model.ANIO_PERIODO,
        CORR_COTIZACION: this.model.CORR_COTIZACION,
        CORR_DOCUMENTO: e.data.CORR_DOCUMENTO,
        NOMBRE_ARCHIVO: e.data.NOMBRE_ARCHIVO
      };
      this.service
      .getDoc(param)
      .pipe(take(1))
      .subscribe({
        next: (vDoc: any) => {
          if (vDoc != undefined) {
            this.PDF = this.sanitization.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(vDoc));
            // this.appInfoService.downloadFile(vDoc, 'DOC-'+e.data.ANIO_PERIODO+'-'+e.data.CORR_COTIZACION+'-'+e.data.CORR_DOCUMENTO+'-'+e.data.NOMBRE_ARCHIVO);
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
  }

  gDataCotizacionDocRowRemoving(e: any) {
    const isCanceled = new Promise((resolve, reject) => {
    if (this.model.ESTADO_COTIZACION != 'DI' && this.model.ESTADO_COTIZACION != 'SO') {
        this.loadingVisible = false;
        reject('Ya No se permite eliminar el Documento');
        return;
    }
    this.loadingVisible = true;
    this.service
      .deleteCOM_COTIZACION_DOC(e.data)
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.loadingVisible = false;
            this.notifyFx('Registro eliminado con exito!', NotifyType.Success);
            resolve(false);
          } else {
            this.loadingVisible = false;
            this.notifyFx(response.ErrorMessage, NotifyType.Error);
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

  AgregarDocumento(e: any) {
    this.popupVisibleDoc = true;
  }

  guardarDocPopup() {
    if (this.fileDoc) {
      if (this.mDocumento.NOMBRE_DOCUMENTO == '') {
        this.notifyFx('Debe ingresar un nombre para el documento', NotifyType.Error);
        return;
      }
      if (this.mDocumento.CORR_TIPO_DOCUMENTO == 0) {
        this.notifyFx('Debe seleccionar un tipo de documento', NotifyType.Error);
        return;
      }
      if (this.fileDoc.size<=0) {
        this.notifyFx('Debe seleccionar un documento', NotifyType.Error);
        return;
      }
      if (this.fileDoc.size<=10485760) {
        this.loadingVisible = true;
        const formData = new FormData();
        formData.append('CORR_EMPRESA', this.appInfoService.CORR_EMPRESA.toString());
        formData.append('ANIO_PERIODO', this.model.ANIO_PERIODO.toString());
        formData.append('CORR_COTIZACION', this.model.CORR_COTIZACION.toString());
        formData.append('CORR_DOCUMENTO', '0');
        formData.append('NOMBRE_DOCUMENTO', this.mDocumento.NOMBRE_DOCUMENTO.toString());
        formData.append('DESCRIPCION_DOCUMENTO', this.mDocumento.DESCRIPCION_DOCUMENTO.toString());
        formData.append('CORR_TIPO_DOCUMENTO', this.mDocumento.CORR_TIPO_DOCUMENTO.toString());
        formData.append('RUTA_DOCUMENTO', '-');
        formData.append('NOMBRE_ARCHIVO',  this.vNOMBRE_ARCHIVO);
        formData.append('FOTO_DOCUMENTO', this.fileDoc, this.fileDoc.name);

        if (this.insertDetaDoc==false) {
          this.service.insertDoc(formData).pipe(take(1)).subscribe(
            (response: any) => {
              if (response.Result) {
                this.notifyFx('Documento guardado con exito!', NotifyType.Success);
                this.LimpiarDoc();
                this.consultarDocumentos();
              } else {
                this.notifyFx(response.ErrorMessage, NotifyType.Error);
              }
              this.loadingVisible = false;
            },
            (error: any) => {
              this.notifyFx(error, NotifyType.Error);
              this.loadingVisible = false;
            }
          );

        }else {

          formData.append('CORR_COTIZACION_DETA', this.modelDeta.CORR_COTIZACION_DETA.toString());
          this.service.insertDetaDoc(formData).pipe(take(1)).subscribe(
            (response: any) => {
              if (response.Result) {
                this.modelDeta.CORR_DOCUMENTO = response.Data.CORR_DOCUMENTO;
                this.notifyFx('Documento guardado con exito!', NotifyType.Success);
                this.LimpiarDoc();
                this.consultarCOM_COTIZACION_DETA();
              } else {
                this.notifyFx(response.ErrorMessage, NotifyType.Error);
              }
              this.loadingVisible = false;
            },
            (error: any) => {
              this.notifyFx(error, NotifyType.Error);
              this.loadingVisible = false;
            }
          );
        }
        this.popupVisibleDoc = false;
      } else {
        this.notifyFx('Debe seleccionar un PDF con máximo de 2 MB de peso', NotifyType.Error);
      }
    }
  }

  hideDocPopup() {
    this.popupVisibleDoc = false;
    this.LimpiarDoc();
  }

  LimpiarDoc() {
    this.dataDocForm.instance.clear();
    this.vNOMBRE_ARCHIVO = '';
    this.fileDoc = null;
  }

  onDocSelected(e: any) {
    const file: File = e.target.files[0];
    if (file)
    {
      if (file.size<=2097152)
      {
        this.fileDoc = file;
        this.vNOMBRE_ARCHIVO = this.fileDoc.name;
        this.mDocumento.NOMBRE_DOCUMENTO = this.fileDoc.name;
        if (this.mCORR_TIPO_DOCUMENTO.length>0)
        {
          this.mDocumento.CORR_TIPO_DOCUMENTO = this.mCORR_TIPO_DOCUMENTO[0].CORR_TIPO_DOCUMENTO;
        }
      } else {
        this.notifyFx('Debe seleccionar un archivo con máximo de 2 MB de peso', NotifyType.Error);
      }
    }
  }

  selectedLookUpCORR_TIPO_DOCUMENTO(vRow: any): any {
    return vRow[0].CORR_TIPO_DOCUMENTO;
  }

  consultarDocumentos(): void {
    this.service
    .getAllCOM_COTIZACION_DOC({ ANIO_PERIODO: this.model.ANIO_PERIODO, CORR_COTIZACION: this.model.CORR_COTIZACION })
    .pipe(take(1))
    .subscribe({
      next: (response: any) => {
        if (response.Result) {
          this.mCOM_COTIZACION_DOC = response.Data;
        }
      },
      error: (error: any) => {
        this.notifyFx(error, NotifyType.Error);
      },

    });
  }
  //#endregion

  //#region <COM_COTIZACION_DETA_DOC>
  gDataComCotizacionDetaRowDblClick(e: any) {
    if (e.rowType === 'data') {
      if (this.modelDeta.CORR_DOCUMENTO > 0){

        this.loadingVisible = true;
        const param = {
          ANIO_PERIODO: this.model.ANIO_PERIODO,
          CORR_COTIZACION: this.model.CORR_COTIZACION,
          CORR_COTIZACION_DETA: this.modelDeta.CORR_COTIZACION_DETA,
          CORR_DOCUMENTO: this.modelDeta.CORR_DOCUMENTO,
          NOMBRE_ARCHIVO: this.modelDeta.NOMBRE_ARCHIVO
        };
        this.service
        .getDetaDoc(param)
        .pipe(take(1))
        .subscribe({
          next: (vDoc: any) => {
            if (vDoc != undefined) {
              this.PDF = this.sanitization.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(vDoc));
              // this.appInfoService.downloadFile(vDoc, 'DOC-'+e.data.ANIO_PERIODO+'-'+e.data.CORR_COTIZACION+'-'+e.data.CORR_COTIZACION_DETA+'-'+e.data.CORR_DOCUMENTO+'-'+e.data.NOMBRE_ARCHIVO);
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
    }
  }

  gDataCotizacionDetaDocEliminar(e: any) {
    if(this.modelDeta.CORR_COTIZACION_DETA <= 0)
    {
      this.notifyFx('Debe selecionar el detale que desea eliminar su documento..', NotifyType.Error);
      this.loadingVisible = false;
      return;
    }
    if (this.model.ESTADO_COTIZACION != 'DI' && this.model.ESTADO_COTIZACION != 'SO') {
        this.loadingVisible = false;
        this.notifyFx('No se puede eliminar el Documento, Debe estar en Digitado...', NotifyType.Error);
        return;
    }
    this.loadingVisible = true;
    this.service
      .deleteCOM_COTIZACION_DETA_DOC(this.modelDeta)
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.loadingVisible = false;
            this.modelDeta.CORR_DOCUMENTO = 0;
            this.consultarCOM_COTIZACION_DETA();
            this.notifyFx('Registro eliminado con exito!', NotifyType.Success);
          } else {
            this.loadingVisible = false;
            this.notifyFx(response.ErrorMessage, NotifyType.Error);
          }
        },
        error: (error: any) => {
          e.cancel = true;
          this.loadingVisible = false;
          this.notifyFx(error, NotifyType.Error);
        },
      });
  }

  AgregarDocumentoDeta(e: any) {
    if(this.modelDeta.CORR_DOCUMENTO > 0)
    {
      this.notifyFx('Este Detalle ya tiene un documento asociado..', NotifyType.Error);
      return;
    }
    this.popupVisibleDoc = true;
    this.insertDetaDoc = true;
  }

  hideDocDetaPopup() {
    this.popupVisibleDoc = false;
    this.LimpiarDoc();
  }

  //#endregion

  AgregarComentario(e: any) {
    this.mComentario.ANIO_PERIODO = this.model.ANIO_PERIODO;
    this.mComentario.CORR_COTIZACION = this.model.CORR_COTIZACION;
    this.mComentario.USUARIO_CREA = this.appInfoService.getUsuario();
    this.mComentario.CLASE_COMENTARIO = this.mCLASE_COMENTARIO[1].Key;
    this.popupVisibleComentario = true;
    this.muestraClaseComentario = (this.appInfoService.getTipoUsuario() != 6)
  }

  guardarComentarioPopup() {
    if (this.mComentario.CLASE_COMENTARIO == '') {
      this.notifyFx('Debe seleccionar la clase del comentario', NotifyType.Error);
      return;
    }
    if (this.mComentario.COMENTARIO == '') {
      this.notifyFx('Debe Digitar un Comentario', NotifyType.Error);
      return;
    }

    this.loadingVisible = true;
    this.service
			.insertCOM_COTIZACION_COMENTARIO(this.mComentario)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.notifyFx('Comentario Agregado con exito!', NotifyType.Success);
            this.LimpiarDoc();
            this.consultarCOM_COTIZACION_COMENTARIO();
          } else {
            this.notifyFx(response.ErrorMessage, NotifyType.Error);
          }
          this.loadingVisible = false;
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(error, NotifyType.Error);
				},
			});

    this.popupVisibleComentario = false;
  }

  hideComentarioPopup() {
    this.popupVisibleComentario = false;
    this.LimpiarComentario();
  }

  LimpiarComentario() {
    this.dataComentarioForm.instance.clear();
  }

  gDataComCotizacionDetaCellPrepared (e: any) {
    if(e.rowType === 'header') {
      if (e.column.dataField === "PRECIO_UNITARIO")
      {
        e.cellElement.bgColor="darkgoldenrod";
      }
    }
  }
}
