import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ComSoliCotizacion } from './models/com-soli-cotizacion';
import { ComSoliCotizacionService } from './com-soli-cotizacion.service';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { ComSoliCotizacionDeta } from './com-soli-cotizacion-deta/models/com-soli-cotizacion-deta';
import { ComSoliCotizacionDetaEnca } from './models/com-soli-cotizacion-deta-enca';
import { ComSoliCotizacionProveedor } from './com-soli-cotizacion-proveedor/models/com-soli-cotizacion-proveedor';
import { custom } from 'devextreme/ui/dialog';
import { ComSoliCotizacionDoc } from './com-soli-cotizacion-doc/models/com-soli-cotizacion-doc';
import { DxFormComponent } from 'devextreme-angular/ui/form';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-com-soli-cotizacion',
  templateUrl: './com-soli-cotizacion.component.html',
  styleUrls: ['./com-soli-cotizacion.component.scss'],
})
export class ComSoliCotizacionComponent
  extends CBaseComponent
  implements OnInit
{
  @ViewChild('dataSolicitudDetaDisponible', { static: false })
  dataSolicitudDetaDisponible!: DxDataGridComponent;
  @ViewChild('dataSolicitudDisponible', { static: false })
  dataSolicitudDisponible!: DxDataGridComponent;
  @ViewChild('DataSoliCotizaDeta', { static: false })
  DataSoliCotizaDeta!: DxDataGridComponent;
  @ViewChild('DataComSoliCotizaProveedor', { static: false })
  DataComSoliCotizaProveedor!: DxDataGridComponent;
  @ViewChild('dataProveedorDisponible', { static: false })
  dataProveedorDisponible!: DxDataGridComponent;
  @ViewChild('fDocumento', { static: false }) dataDocForm!: DxFormComponent;
  @ViewChild('fEliminarComentario', { static: false }) dataEliminarComentarioForm!: DxFormComponent;


  //#region <Declarando Variales>
  mCORR_SOLI_COMPRA: any;
  mESTADO_SOLI_COTIZACION: any;
  mCORR_UNIDAD_MEDIDA: any;
  readOnly = false;
  mCOM_SOLICITUD_DISPONIBLE: any;
  mCOM_SOLICITUD_DETA_DISPONIBLE: any;
  mCOM_SOLI_COTIZACION_DETA: any;
  mCOM_SOLI_COTIZACION_PROVEEDOR: any;
  mCOM_PROVEEDOR_DISPONIBLE: any;
  mCOM_SOLI_COTIZACION_DOC: any;
  mCORR_TIPO_DOCUMENTO: any;
  mCORR_TIPO_SOLI_COTIZA: any;
  vFECHA_INICIAL_MODAL: any;
  vFECHA_FINAL_MODAL: any;
  vANIO_PERIODO_SOLI_COMPRA_MODAL: any;
  vCORR_SOLI_COMPRA_MODAL: number = 0;
  popupVisible = false;
  popupVisibleProveedor = false;
  popupVisibleDoc = false;
  popupVisibleVistaPrevia = false;
  insertDetaDoc = false;
  vANIO_PERIODO_SOLI_COMPRA: number;
  vCORR_SOLI_COMPRA: number;
  vFECHA_INICIAL: any;
  vFECHA_FINAL: any;
  btnSolicitar = '';
  btnAplicar = '';
  btnAnular = 'Anular';
  fileDoc: any;
  vNOMBRE_ARCHIVO = '';
  mDocumento: ComSoliCotizacionDoc = {
    CORR_EMPRESA: this.appInfoService.CORR_EMPRESA,
    ANIO_PERIODO: 0,
    CORR_SOLI_COTIZACION: 0,
    CORR_DOCUMENTO: 0,
    NOMBRE_DOCUMENTO: '',
    DESCRIPCION_DOCUMENTO: '',
    CORR_TIPO_DOCUMENTO: 0,
    NOMBRE_TIPO_DOCUMENTO: '',
  };
  modelDeta: ComSoliCotizacionDeta = {
    CORR_EMPRESA: 0,
    ANIO_PERIODO: 0,
    CORR_SOLI_COTIZACION: 0,
    CORR_SOLI_COTIZACION_DETA: 0,
    CODIGO_ITEM: '',
    NOMBRE_ITEM: '',
    CANTIDAD: 0,
    CORR_UNIDAD_MEDIDA: 0,
    OBSERVACIONES: '',
    ESTADO_SOLI_COTIZACION: '',
    USUARIO_CREA: '',
    FECHA_CREA: new Date(),
    ESTACION_CREA: '',
    USUARIO_ACTU: '',
    FECHA_ACTU: new Date(),
    ESTACION_ACTU: '',
    SELECCION: false,
    CORR_DOCUMENTO: 0,
    NOMBRE_ARCHIVO: ''
  };
  modelProveedor: ComSoliCotizacionProveedor = {
    CORR_EMPRESA: 0,
    ANIO_PERIODO: 0,
    CORR_SOLI_COTIZACION: 0,
    CORR_PROVEEDOR: 0,
    CODIGO_PROVEEDOR: '',
    NOMBRE_PROVEEDOR: '',
    USUARIO_CREA: '',
    ESTACION_CREA: '',
    FECHA_CREA: new Date(),
    SELECCION: false,
    ESTADO_COTIZACION: '',
    NOMBRE_ESTADO_COTIZACION: '',
    FECHA_COTIZACION: new Date(),
    USUARIO_COTIZA: '',
    PLAZO_ENTREGA: '',
    OBSERVACIONES: '',
    GENERAR_COTIZACION: false,
    CORR_CONDICION_PAGO: 0,
    CORR_FORMA_PAGO: 0,
  };
  readOnlyProveedor = false;
  btnAnularDeta = 'Anular';
  btnAnularDetaProveedor = 'Anular';
  PDF!: SafeUrl;
  popupVisiblePdf=false;
  esExpress = false;
  mCORR_CONDICION_PAGO: any;
  mCORR_FORMA_PAGO: any;
  popupVisibleEliminarComentario=false;
  eEventoEliminar: any;
  // #endregion

  constructor(
    public override appInfoService: AppInfoService,
    public override router: ActivatedRoute,
    private service: ComSoliCotizacionService,
    private sanitization: DomSanitizer
  ) {
    super(appInfoService, router);
    this.columns = this.service.getColumns();
    this.summary = this.service.getSummary();
    this.items = this.service.getItems();
    this.RefrescarSolicitud = this.RefrescarSolicitud.bind(this);
    this.OnValueChangeFECHA_INICIAL_MODAL = this.OnValueChangeFECHA_INICIAL_MODAL.bind(this);
    this.OnValueChangeFECHA_FINAL_MODAL = this.OnValueChangeFECHA_FINAL_MODAL.bind(this);
    this.OnValueChangeANIO_PERIODO_SOLI_COMPRA_MODAL = this.OnValueChangeANIO_PERIODO_SOLI_COMPRA_MODAL.bind(this);
    this.OnValueChangeCORR_SOLI_COMPRA_MODAL = this.OnValueChangeCORR_SOLI_COMPRA_MODAL.bind(this);
    this.selectedLookUpCORR_TIPO_SOLI_COTIZA = this.selectedLookUpCORR_TIPO_SOLI_COTIZA.bind(this);
    this.guardarPopup = this.guardarPopup.bind(this);
    this.hidePopup = this.hidePopup.bind(this);
    this.guardarPopupProveedor = this.guardarPopupProveedor.bind(this);
    this.hidePopupProveedor = this.hidePopupProveedor.bind(this);
    this.hideEliminacionComentarioPopup = this.hideEliminacionComentarioPopup.bind(this);
  }

  //#region <Inicializando Opciones>
  ngOnInit(): void {
    this.inicializaOpciones();
    this.llenaComboBox();
    this.consultar();
  }

  inicializaOpciones() {
    this.vFECHA_INICIAL = this.appInfoService.dateAdd(
      this.appInfoService.getDate(),
      'day',
      -30
    );
    this.vFECHA_FINAL = this.appInfoService.getDate();
  }

  // #endregion

  //#region <Manejo de Combos>
  llenaComboBox() {
    this.getESTADO_SOLI_COTIZACION();
    this.getCORR_UNIDAD_MEDIDA();
    this.getCORR_TIPO_DOCUMENTO();
    this.getCORR_TIPO_SOLI_COTIZA();
    this.getCORR_FORMA_PAGO();
    this.getCORR_CONDICION_PAGO();
  }

  getESTADO_SOLI_COTIZACION() {
    this.appInfoService
      .getLookUp(
        'COM_SOLI_COTIZACION',
        'COM_LISTA',
        'GetESTADO_SOLI_COTIZACION',
        undefined,
        environment.UrlCOMPRASAPI
      )
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.mESTADO_SOLI_COTIZACION = response.Data;
          }
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
        },
      });
  }

  getCORR_UNIDAD_MEDIDA() {
    this.appInfoService
      .getLookUp(
        'COM_SOLI_COTIZACION',
        'COM_UNIDAD_MEDIDA',
        'GetCORR_UNIDAD_MEDIDA',
        undefined,
        environment.UrlCOMPRASAPI
      )
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
      .getLookUp(
        'COM_SOLI_COTIZACION',
        'COM_TIPO_DOC_FISICO',
        'GetCORR_TIPO_DOCUMENTO',
        undefined,
        environment.UrlCOMPRASAPI
      )
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

  getCORR_TIPO_SOLI_COTIZA() {
    this.appInfoService
      .getLookUp(
        'COM_SOLI_COTIZACION',
        'COM_TIPO_SOLI_COTIZA',
        'GetCORR_TIPO_SOLI_COTIZA',
        undefined,
        environment.UrlCOMPRASAPI
      )
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.mCORR_TIPO_SOLI_COTIZA = response.Data;
          }
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
        },
      });
  }

  getCORR_FORMA_PAGO() {
		this.appInfoService
			.getLookUp('COM_SOLI_COTIZACION', 'GEN_FORMA_PAGO', 'GetCORR_FORMA_PAGO', undefined, environment.UrlCOMPRASAPI)
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

  getCORR_CONDICION_PAGO() {
		this.appInfoService
			.getLookUp('COM_SOLI_COTIZACION', 'COM_CONDICION_PAGO', 'getCORR_CONDICION_PAGO', undefined, environment.UrlCOMPRASAPI)
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
  //#endregion

  //#region <Metodos Mtto>
  fillParam(xANIO_PERIODO?: number, xCORR_SOLI_COTIZACION?: number,xJUSTIFICACION_ELIMINAR?:String): any {
    if (xCORR_SOLI_COTIZACION == undefined) {
      xCORR_SOLI_COTIZACION = 0;
    }
    return {
      ANIO_PERIODO: xANIO_PERIODO,
      CORR_SOLI_COTIZACION: xCORR_SOLI_COTIZACION,
      FECHA_INICIAL: this.vFECHA_INICIAL.toISOString(),
      FECHA_FINAL: this.vFECHA_FINAL.toISOString(),
      JUSTIFICACION_ELIMINAR: xJUSTIFICACION_ELIMINAR
    };
  }

  override fillData(xModel?: ComSoliCotizacion): ComSoliCotizacion {
    if (xModel !== undefined) {
      return {
        CORR_EMPRESA: xModel.CORR_EMPRESA,
        ANIO_PERIODO: xModel.ANIO_PERIODO,
        CORR_SOLI_COTIZACION: xModel.CORR_SOLI_COTIZACION,
        NUMERO_SOLI_COTIZACION: xModel.NUMERO_SOLI_COTIZACION,
        FECHA_SOLI_COTIZACION: xModel.FECHA_SOLI_COTIZACION,
        FECHA_LIMITE_COTIZACION: xModel.FECHA_LIMITE_COTIZACION,
        FECHA_SOLICITUD_COMPRA: xModel.FECHA_SOLICITUD_COMPRA,
        CODIGO_DEPTO: xModel.CODIGO_DEPTO,
        NOMBRE_DEPTO: xModel.NOMBRE_DEPTO,
        USUARIO_SOLI: xModel.USUARIO_SOLI,
        OBSERVACIONES: xModel.OBSERVACIONES,
        ESTADO_SOLI_COTIZACION: xModel.ESTADO_SOLI_COTIZACION,
        NOMBRE_ESTADO_SOLI_COTIZACION: xModel.NOMBRE_ESTADO_SOLI_COTIZACION,
        USUARIO_CREA: xModel.USUARIO_CREA,
        FECHA_CREA: xModel.FECHA_CREA,
        ESTACION_CREA: xModel.ESTACION_CREA,
        USUARIO_ACTU: xModel.USUARIO_ACTU,
        FECHA_ACTU: xModel.FECHA_ACTU,
        ESTACION_ACTU: xModel.ESTACION_ACTU,
        NUMERO_SOLI_COMPRA: xModel.NUMERO_SOLI_COMPRA,
        NOMBRE_PROVEEDOR: xModel.NOMBRE_PROVEEDOR,
        CORR_TIPO_SOLI_COTIZA: xModel.CORR_TIPO_SOLI_COTIZA,
        NOMBRE_TIPO_SOLI_COTIZA: xModel.NOMBRE_TIPO_SOLI_COTIZA,
        CLASE_SOLI_COTIZA: xModel.CLASE_SOLI_COTIZA
      };
    } else {
      return {
        CORR_EMPRESA: 1,
        ANIO_PERIODO: this.appInfoService.toYear(new Date()),
        CORR_SOLI_COTIZACION: 0,
        NUMERO_SOLI_COTIZACION: '',
        FECHA_SOLI_COTIZACION: new Date(),
        FECHA_LIMITE_COTIZACION: new Date(),
        CODIGO_DEPTO: '',
        NOMBRE_DEPTO: '',
        FECHA_SOLICITUD_COMPRA: new Date(),
        USUARIO_SOLI: '',
        OBSERVACIONES: '',
        ESTADO_SOLI_COTIZACION: '',
        NOMBRE_ESTADO_SOLI_COTIZACION: '',
        USUARIO_CREA: '',
        FECHA_CREA: new Date(),
        ESTACION_CREA: '',
        USUARIO_ACTU: '',
        FECHA_ACTU: new Date(),
        ESTACION_ACTU: '',
        NUMERO_SOLI_COMPRA: '',
        NOMBRE_PROVEEDOR: '',
        CORR_TIPO_SOLI_COTIZA: 1,
        NOMBRE_TIPO_SOLI_COTIZA: '',
        CLASE_SOLI_COTIZA: ''
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
          }
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
        },
      });
  }

  consultarCOM_SOLI_COTIZACION_DETA() {
    this.service
      .getAllCOM_SOLI_COTIZACION_DETA({
        ANIO_PERIODO: this.model.ANIO_PERIODO,
        CORR_SOLI_COTIZACION: this.model.CORR_SOLI_COTIZACION,
      })
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.mCOM_SOLI_COTIZACION_DETA = response.Data;
          }
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
        },
      });
  }

  ConsultarProveedores(xANIO_PERIODO: Number, xCORR_SOLI_COTIZACION: Number) {
    this.service
      .getAllCOM_SOLI_COTIZACION_PROVEEDOR({
        ANIO_PERIODO: xANIO_PERIODO,
        CORR_SOLI_COTIZACION: xCORR_SOLI_COTIZACION,
      })
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.mCOM_SOLI_COTIZACION_PROVEEDOR = response.Data;
          }
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
        },
      });
  }

  override focusedRowChanged(e: any) {
    this.model = e.row.data;
    this.esExpress = (this.model.CLASE_SOLI_COTIZA == 'EX')
    this.refrescarBotones();
  }

  refrescarBotones()
  {
    if (this.banderaMtto !== UpdateType.Browse)
      {
        if (this.model.ESTADO_SOLI_COTIZACION == 'DI') {
          this.btnSolicitar = 'Solicitar';
          this.btnAplicar = '';
          this.btnAnular = 'Anular';
        } else if (this.model.ESTADO_SOLI_COTIZACION == 'SO') {
          this.btnSolicitar = '';
          this.btnAplicar = 'Aplicar';
          this.btnAnular = 'Anular';
        } else {
          this.btnSolicitar = '';
          this.btnAplicar = '';
          this.btnAnular = '';
        }
      } else {
        this.btnSolicitar = '';
        this.btnAplicar = '';
        this.btnAnular = '';
      }
  }

  override nuevo(): void {
    super.nuevo();
    this.AgregarSolicitud();
  }

  override editarClick(e: any) {
    super.editarClick(e);
    this.refrescarBotones();
    this.consultarCOM_SOLI_COTIZACION_DETA();
    this.ConsultarProveedores(
      this.model.ANIO_PERIODO,
      this.model.CORR_SOLI_COTIZACION
    );
    this.consultarDocumentos();
    if (e.row.data.ESTADO_SOLI_COTIZACION != 'DI') {
      setTimeout(() => {
        this.bloquear();
      });
    }
    if (
      this.model.ESTADO_SOLI_COTIZACION == 'SO' ||
      this.model.ESTADO_SOLI_COTIZACION == 'DI'
    ) {
      this.readOnlyProveedor = true;
    } else {
      this.readOnlyProveedor = false;
    }
  }

  override rowDblClick(e: any) {
    super.rowDblClick(e);
    this.refrescarBotones();
    this.consultarCOM_SOLI_COTIZACION_DETA();
    this.ConsultarProveedores(
      this.model.ANIO_PERIODO,
      this.model.CORR_SOLI_COTIZACION
    );
    this.consultarDocumentos();
    if (e.Data.ESTADO_SOLI_COTIZACION != 'DI') {
      setTimeout(() => {
        this.bloquear();
      });
    }
  }

  override getPermiteEditar(e: any): boolean {
    if (this.permiteEdit && e.row.data.ESTADO_SOLI_COTIZACION === 'DI') {
      return true;
    }
    return false;
  }

  override getPermiteDele(e: any): boolean {
    if (this.permiteDele && e.row.data.ESTADO_SOLI_COTIZACION === 'DI') {
      return true;
    }
    return false;
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
              this.refrescarBotones();
              this.consultar();
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
              const vIndex = this.models.findIndex(
                (item: any) =>
                  item.CORR_SOLI_COTIZACION ===
                  response.Data.CORR_SOLI_COTIZACION
              );
              this.models[vIndex] = response.Data;
              this.AsignaStatus(UpdateType.Browse);
              this.refrescarBotones();
              this.consultar();
              this.notifyFx(
                'Registro modificado con exito!',
                NotifyType.Success
              );
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

  GuardarSinCerrar() {
    this.service
        .update(this.model)
        .pipe(take(1))
        .subscribe({
          next: (response: any) => {
            if (response.Result) {
              this.model = response.Data;
              const vIndex = this.models.findIndex(
                (item: any) => item.CORR_SOLI_COTIZACION === response.Data.CORR_SOLI_COTIZACION
              );
              this.models[vIndex] = response.Data;
            } else {
              this.notifyFx(response.ErrorMessage, NotifyType.Error);
            }
          },
          error: (error: any) => {
            this.notifyFx(error, NotifyType.Error);
          },
        });
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
				const vIndex = this.models.findIndex((item: any) => item.CORR_SOLI_COTIZACION === this.modelUpdate.CORR_SOLI_COTIZACION);
				this.models[vIndex] = this.modelUpdate;
				cancelRow();
			});
		} else {
			cancelRow();
		}
	}

  rowRemoving(e: any) {
    this.popupVisibleEliminarComentario=true;
    this.eEventoEliminar=e;
  }

  override bloquear(): void {
    this.dataForm.instance.getEditor('ANIO_PERIODO')?.option('readOnly', true);
    this.dataForm.instance
      .getEditor('CORR_SOLI_COTIZACION')
      ?.option('readOnly', true);
    this.dataForm.instance
      .getEditor('FECHA_SOLI_COTIZACION')
      ?.option('readOnly', true);
    this.dataForm.instance.getEditor('CODIGO_DEPTO')?.option('readOnly', true);
    this.dataForm.instance.getEditor('NOMBRE_DEPTO')?.option('readOnly', true);
    this.dataForm.instance
      .getEditor('CORR_SOLI_COMPRA')
      ?.option('readOnly', true);
    this.dataForm.instance.getEditor('USUARIO_SOLI')?.option('readOnly', true);
    this.dataForm.instance
      .getEditor('ESTADO_SOLI_COTIZACION')
      ?.option('readOnly', true);
    if (this.model.ESTADO_SOLI_COTIZACION == 'DI') {
      this.dataForm.instance
        .getEditor('OBSERVACIONES')
        ?.option('readOnly', false);
      this.dataForm.instance
        .getEditor('FECHA_LIMITE_COTIZACION')
        ?.option('readOnly', false);
    } else {
      this.dataForm.instance
        .getEditor('OBSERVACIONES')
        ?.option('readOnly', true);
      this.dataForm.instance
        .getEditor('FECHA_LIMITE_COTIZACION')
        ?.option('readOnly', true);
    }

    this.readOnly = true;
    if (
      this.model.ESTADO_SOLI_COTIZACION == 'SO' ||
      this.model.ESTADO_SOLI_COTIZACION == 'DI'
    ) {
      this.readOnlyProveedor = true;
    } else {
      this.readOnlyProveedor = false;
    }
  }

  override habilitar(): void {
    this.readOnly = false;
  }

  override setFocus() {
    setTimeout(() => {
      this.dataForm.instance.getEditor('OBSERVACIONES')?.focus();
    });
  }
  //#endregion

  selectedLookUpLista(vRow: any): any {
    return vRow[0].Key;
  }

  selectedLookUpCORR_UNIDAD_MEDIDA(vRow: any): any {
    return vRow[0].CORR_UNIDAD_MEDIDA;
  }

  selectedLookUpNOMBRE_UNIDAD_MEDIDA(vRow: any): any {
    return vRow[0].NOMBRE_UNIDAD_MEDIDA;
  }

  selectedLookUpmESTADO_SOLI_COTIZACION_DETA(vRow: any): any {
    return vRow[0].Key;
  }

  selectedLookUpCORR_TIPO_SOLI_COTIZA(vRow: any): any {

    this.esExpress = (vRow[0].CLASE_SOLI_COTIZA == 'EX');

    return vRow[0].CORR_TIPO_SOLI_COTIZA;
  }
  selectedLookUpCORR_FORMA_PAGO(vRow: any): any {
		return vRow[0].CORR_FORMA_PAGO;
	}
  selectedLookUpCORR_CONDICION_PAGO(vRow: any): any {
		return vRow[0].CORR_CONDICION_PAGO;
	}
  //#region <COM_SOLI_COTIZACION_DETA>
  editarDetaClick(e: any): void {
    e.event.preventDefault();
    e.component.editRow(e.row.rowIndex);
  }

  gDataComSoliCoticionDetaRowUpdated(e: any) {
    const isCanceled = new Promise((resolve, reject) => {
      if (e.data.ESTADO_SOLI_COTIZACION != 'DI') {
        this.loadingVisible = false;
        reject(
          'El estado de la solicitud debe estar en Digitado para modificaciones..'
        );
        return;
      }
      this.loadingVisible = true;

      //Guardando encabezado para actualizar el tipo de cotización
      this.GuardarSinCerrar();

      this.service
        .updateCOM_SOLI_COTIZACION_DETA(e.data)
        .pipe(take(1))
        .subscribe({
          next: (response: any) => {
            if (response.Result) {
              this.loadingVisible = false;
              this.notifyFx(
                'Registro Actualizado con exito!',
                NotifyType.Success
              );
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

  gDataComSoliCotizacionDetaRowRemoving(e: any) {
    const isCanceled = new Promise((resolve, reject) => {
      if (this.model.ESTADO_SOLI_COTIZACION != 'DI') {
        this.loadingVisible = false;
        reject('No se puede eliminar la solicitud, Debe estar en Digitado...');
        return;
      }
      this.loadingVisible = true;
      this.service
        .deleteCOM_SOLI_COTIZACION_DETA(e.data)
        .pipe(take(1))
        .subscribe({
          next: (response: any) => {
            if (response.Result) {
              this.loadingVisible = false;
              this.notifyFx(
                'Registro eliminado con exito!',
                NotifyType.Success
              );
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

  gDataComSoliCotizaProveedorRowRemoving(e: any) {
    const isCanceled = new Promise((resolve, reject) => {
      if (this.model.ESTADO_SOLI_COTIZACION != 'DI') {
        this.loadingVisible = false;
        reject('No se puede eliminar la solicitud, Debe estar en Digitado...');
        return;
      }
      this.loadingVisible = true;
      this.service
        .deleteCOM_SOLI_COTIZACION_PROVEEDOR(e.data)
        .pipe(take(1))
        .subscribe({
          next: (response: any) => {
            if (response.Result) {
              this.loadingVisible = false;
              this.notifyFx(
                'Registro eliminado con exito!',
                NotifyType.Success
              );
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
  gDataComSoliCotizaProveedorRowUpdated(e: any) {
    const isCanceled = new Promise((resolve, reject) => {
      if (this.model.ESTADO_SOLI_COTIZACION != 'DI') {
        this.loadingVisible = false;
        reject(
          'El estado de la solicitud debe estar en Digitado para modificaciones..'
        );
        return;
      }
      this.loadingVisible = true;

      this.service
        .updateCOM_SOLI_COTIZACION_PROVEEDOR(e.data)
        .pipe(take(1))
        .subscribe({
          next: (response: any) => {
            if (response.Result) {
              this.loadingVisible = false;
              this.notifyFx(
                'Registro Actualizado con exito!',
                NotifyType.Success
              );
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
  AnularDeta(e: any): void {
    if (this.modelDeta.CORR_SOLI_COTIZACION_DETA <= 0) {
      this.notifyFx(
        'Debe selecionar el detale que desea anular..',
        NotifyType.Error
      );
      this.loadingVisible = false;
      return;
    }
    const confirpreli = custom({
      title: 'Confirmación de Solicitud de Cotización',
      messageHtml: '¿Realmente Quiere Anular el detalle de la solicitud?',
      buttons: [
        {
          text: 'Si',
          onClick: (e: any) => {
            this.loadingVisible = true;
            if (this.model.CORR_SOLI_COTIZACION > 0) {
              this.service
                .AnularDeta(this.modelDeta)
                .pipe(take(1))
                .subscribe({
                  next: (response: any) => {
                    if (response.Result) {
                      this.notifyFx(
                        'Detalle Anulado con exito..!',
                        NotifyType.Success
                      );
                      this.model.ESTADO_SOLI_COTIZACION =
                        response.Data.ESTADO_SOLI_COTIZACION;
                      this.model.NOMBRE_ESTADO_SOLI_COTIZACION =
                        response.Data.NOMBRE_ESTADO_SOLI_COTIZACION;
                      this.consultarCOM_SOLI_COTIZACION_DETA();
                      this.ConsultarProveedores(
                        this.model.ANIO_PERIODO,
                        this.model.CORR_SOLI_COTIZACION
                      );
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

  gDataComSoliCotizaDetaFocusedRowChanged(e: any) {
    this.modelDeta.CORR_EMPRESA = this.appInfoService.CORR_EMPRESA;
    this.modelDeta.ANIO_PERIODO = this.model.ANIO_PERIODO;
    this.modelDeta.CORR_SOLI_COTIZACION = this.model.CORR_SOLI_COTIZACION;
    this.modelDeta.CORR_SOLI_COTIZACION_DETA =
      e.row.data.CORR_SOLI_COTIZACION_DETA;
    this.modelDeta.CORR_DOCUMENTO = e.row.data.CORR_DOCUMENTO;
    this.modelDeta.NOMBRE_ARCHIVO = e.row.data.NOMBRE_ARCHIVO;
  }
  //#endregion

  ConsultarSolicitudDisponible() {
    this.loadingVisible = true;
    this.service
      .getAllSOLICITUD_COMPRA_DISPONIBLE({
        FECHA_INICIAL: this.vFECHA_INICIAL_MODAL.toISOString(),
        FECHA_FINAL: this.vFECHA_FINAL_MODAL.toISOString(),
        ANIO_PERIODO: this.model.ANIO_PERIODO,
        CORR_SOLI_COTIZACION: this.model.CORR_SOLI_COTIZACION,
        ANIO_PERIODO_SOLI_COMPRA: this.vANIO_PERIODO_SOLI_COMPRA_MODAL.getFullYear(),
        CORR_SOLI_COMPRA: Number(this.vCORR_SOLI_COMPRA_MODAL),
      })
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            if (response.Data.length > 0)
            {
              this.mCOM_SOLICITUD_DISPONIBLE = response.Data;
              this.mCOM_SOLICITUD_DETA_DISPONIBLE = null;
              this.dataSolicitudDisponible.focusedRowIndex = -1;
            } else {
              this.mCOM_SOLICITUD_DISPONIBLE = null;
              this.mCOM_SOLICITUD_DETA_DISPONIBLE = null;
              this.dataSolicitudDisponible.instance.refresh(true);
            }
            this.loadingVisible = false;
          }
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
          this.loadingVisible = false;
        },
      });
  }

  ConsultarSolicitudDetaDisponible(
    xANIO_PERIODO_SOLI_COMPRA: Number,
    xCORR_SOLI_COMPRA
  ) {
    this.service
      .getAllSOLICITUD_COMPRA_DETA_DISPONIBLE({
        ANIO_PERIODO_SOLI_COMPRA: xANIO_PERIODO_SOLI_COMPRA,
        CORR_SOLI_COMPRA: xCORR_SOLI_COMPRA,
        ANIO_PERIODO: this.model.ANIO_PERIODO,
        CORR_SOLI_COTIZACION: this.model.CORR_SOLI_COTIZACION,
      })
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.mCOM_SOLICITUD_DETA_DISPONIBLE = response.Data;
          }
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
        },
      });
  }

  OnValueChangeFECHA_INICIAL_MODAL(e: any) {
    this.vFECHA_INICIAL_MODAL = e.value;
  }

  OnValueChangeANIO_PERIODO_SOLI_COMPRA_MODAL(e: any) {
    this.vANIO_PERIODO_SOLI_COMPRA_MODAL = e.value;
  }

  OnValueChangeCORR_SOLI_COMPRA_MODAL(e: any) {
    this.vCORR_SOLI_COMPRA_MODAL = e.value;
  }

  OnValueChangeFECHA_FINAL_MODAL(e: any) {
    this.vFECHA_FINAL_MODAL = e.value;
  }

  focusedRowChangedSolicitudDisponible(e: any) {
    if (this.dataSolicitudDisponible.focusedRowIndex >= 0) {
      if (this.banderaMtto === UpdateType.Add) {
        this.model = e.row.data;
      }
      this.vANIO_PERIODO_SOLI_COMPRA = e.row.data.ANIO_PERIODO_SOLI_COMPRA;
      this.vCORR_SOLI_COMPRA = e.row.data.CORR_SOLI_COMPRA;
      this.ConsultarSolicitudDetaDisponible(
        this.vANIO_PERIODO_SOLI_COMPRA,
        this.vCORR_SOLI_COMPRA
      );
      this.dataSolicitudDetaDisponible.focusedRowIndex = 0;
      //this.vFECHA_GENERACION=e.row.data.FECHA_GENERACION;
    } else {
      this.mCOM_SOLICITUD_DETA_DISPONIBLE = null;
    }
  }

  AgregarSolicitud() {
    this.vANIO_PERIODO_SOLI_COMPRA_MODAL = this.appInfoService.dateAdd(
      this.appInfoService.getDate(),
      'day',
      -1
    );
    this.vFECHA_INICIAL_MODAL = this.appInfoService.dateAdd(
      this.appInfoService.getDate(),
      'day',
      -1
    );
    this.vFECHA_FINAL_MODAL = this.appInfoService.getDate();
    this.popupVisible = true;
    this.ConsultarSolicitudDisponible();
  }

  RefrescarSolicitud(): void {
    this.ConsultarSolicitudDisponible();
  }

  guardarPopup() {
    if (this.banderaMtto === UpdateType.Add) {
      this.model.ANIO_PERIODO = this.appInfoService.toYear(new Date());
      this.model.ESTADO_SOLI_COTIZACION = 'DI';
      this.model.FECHA_LIMITE_COTIZACION = this.appInfoService.dateAdd(
        this.appInfoService.getDate(),
        'day',
        3
      );
      this.model.FECHA_SOLI_COTIZACION = new Date();
    }

    this.GuardarModal();
  }

  hidePopup() {
    if (this.banderaMtto == UpdateType.Add) {
      this.confirmaCancelar(() => {
        this.popupVisible = false;
        this.AsignaStatus(UpdateType.Browse);
        this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
      });
    } else if (this.banderaMtto == UpdateType.Update) {
      this.confirmaCancelar(() => {
        this.popupVisible = false;
        //this.AsignaStatus(UpdateType.Browse);
        //this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
      });
    }
  }

  GuardarModal() {
    if (
      this.mCOM_SOLICITUD_DETA_DISPONIBLE.filter(
        (y: ComSoliCotizacionDeta) => y.SELECCION === true
      ).length > 0
    ) {
      if (
        this.mCOM_SOLICITUD_DETA_DISPONIBLE.filter(
          (y: ComSoliCotizacionDeta) => y.SELECCION === true && y.CANTIDAD <= 0
        ).length > 0
      ) {
        this.notifyFx(
          'Debe asignar una cantidad mayor a cero en los detalles seleccionados..',
          NotifyType.Error
        );
        return;
      }

      this.loadingVisible = true;

      this.mCOM_SOLICITUD_DETA_DISPONIBLE.forEach((x: any) => {
        const vCorrUnidad = this.mCORR_UNIDAD_MEDIDA.filter(
          (y: any) => y.NOMBRE_UNIDAD_MEDIDA === x.NOMBRE_UNIDAD_MEDIDA
        );

        if (vCorrUnidad.length > 0) {
          x.CORR_UNIDAD_MEDIDA = vCorrUnidad[0].CORR_UNIDAD_MEDIDA;
        } else {
          x.CORR_UNIDAD_MEDIDA = 1;
        }
      });

      var mSOLI_COTIZACION_DETA_ENCA: ComSoliCotizacionDetaEnca = {
        CORR_EMPRESA: this.model.CORR_EMPRESA,
        ANIO_PERIODO: this.model.ANIO_PERIODO,
        CORR_SOLI_COTIZACION: this.model.CORR_SOLI_COTIZACION,
        FECHA_SOLI_COTIZACION: this.model.FECHA_SOLI_COTIZACION,
        FECHA_LIMITE_COTIZACION: this.model.FECHA_LIMITE_COTIZACION,
        CODIGO_DEPTO: this.model.CODIGO_DEPTO,
        NOMBRE_DEPTO: this.model.NOMBRE_DEPTO,
        ANIO_PERIODO_SOLI_COMPRA: this.vANIO_PERIODO_SOLI_COMPRA,
        CORR_SOLI_COMPRA: this.vCORR_SOLI_COMPRA,
        USUARIO_SOLI: this.model.USUARIO_SOLI,
        OBSERVACIONES: this.model.OBSERVACIONES,
        ESTADO_SOLI_COTIZACION: 'DI',
        FECHA_SOLICITUD_COMPRA: this.model.FECHA_SOLICITUD_COMPRA,
        USUARIO_CREA: this.model.USUARIO_CREA,
        ESTACION_CREA: this.model.ESTACION_CREA,
        FECHA_CREA: this.model.FECHA_CREA,
        USUARIO_ACTU: this.model.USUARIO_ACTU,
        ESTACION_ACTU: this.model.ESTACION_ACTU,
        FECHA_ACTU: this.model.FECHA_ACTU,
        CORR_TIPO_SOLI_COTIZA: 1,
        DETA: this.mCOM_SOLICITUD_DETA_DISPONIBLE.filter(
          (y: ComSoliCotizacionDeta) => y.SELECCION === true
        ),
      };

      if (this.banderaMtto === UpdateType.Add) {
        this.service
          .insertCOM_SOLI_COTIZACION_ENCA_DETA(mSOLI_COTIZACION_DETA_ENCA)
          .pipe(take(1))
          .subscribe({
            next: (response: any) => {
              if (response.Result) {
                this.AsignaStatus(UpdateType.Update);
                this.model = response.Data;
                this.notifyFx('Registro creado con exito!', NotifyType.Success);
                this.popupVisible = false;
                this.loadingVisible = false;
                this.consultarCOM_SOLI_COTIZACION_DETA();
                this.consultarDocumentos();
                this.ConsultarProveedores(
                  this.model.ANIO_PERIODO,
                  this.model.CORR_SOLI_COTIZACION
                );
                this.refrescarBotones()
                this.bloquear();
                this.readOnly = false;
              } else {
                this.notifyFx(response.ErrorMessage, NotifyType.Error);
              }
            },
            error: (error: any) => {
              this.notifyFx(error, NotifyType.Error);
              this.loadingVisible = false;
            },
          });
      } else if (this.banderaMtto === UpdateType.Update) {
        this.service
          .UpdateCOM_SOLI_COTIZACION_ENCA_DETA(mSOLI_COTIZACION_DETA_ENCA)
          .pipe(take(1))
          .subscribe({
            next: (response: any) => {
              if (response.Result) {
                this.AsignaStatus(UpdateType.Update);
                this.model = response.Data;
                this.notifyFx(
                  'Registro agregado con exito!',
                  NotifyType.Success
                );
                this.popupVisible = false;
                this.loadingVisible = false;
                this.consultarCOM_SOLI_COTIZACION_DETA();
                this.consultarDocumentos();
                this.ConsultarProveedores(
                  this.model.ANIO_PERIODO,
                  this.model.CORR_SOLI_COTIZACION
                );
                this.refrescarBotones();
                this.bloquear();
                this.readOnly = false;
              } else {
                this.notifyFx(response.ErrorMessage, NotifyType.Error);
              }
            },
            error: (error: any) => {
              this.notifyFx(error, NotifyType.Error);
              this.loadingVisible = false;
            },
          });
      }
    } else {
      this.notifyFx('Debe Seleccionar Un Detalle', NotifyType.Error);
    }
  }

  //#region proveedor
  AgregarProveedor() {
    this.popupVisibleProveedor = true;
    this.ConsultarProveedoresDisponible(
      this.model.ANIO_PERIODO,
      this.model.CORR_SOLI_COTIZACION
    );
  }

  guardarPopupProveedor() {
    if (
      this.mCOM_PROVEEDOR_DISPONIBLE.filter(
        (y: ComSoliCotizacionProveedor) => y.SELECCION === true
      ).length > 0
    ) {
      this.loadingVisible = true;

      if (this.banderaMtto === UpdateType.Update) {
        this.service
          .insertCOM_SOLI_COTIZACION_PROVEEDOR(
            this.mCOM_PROVEEDOR_DISPONIBLE.filter(
              (y: ComSoliCotizacionProveedor) => y.SELECCION === true
            )
          )
          .pipe(take(1))
          .subscribe({
            next: (response: any) => {
              if (response.Result) {
                this.AsignaStatus(UpdateType.Update);
                this.mCOM_SOLI_COTIZACION_PROVEEDOR = response.Data;
                this.notifyFx('Registro creado con exito!', NotifyType.Success);
                this.popupVisibleProveedor = false;
                this.loadingVisible = false;
                this.ConsultarProveedores(
                  this.model.ANIO_PERIODO,
                  this.model.CORR_SOLI_COTIZACION
                );
                // this.bloquear();
              } else {
                this.notifyFx(response.ErrorMessage, NotifyType.Error);
                this.loadingVisible = false;
              }
            },
            error: (error: any) => {
              this.notifyFx(error, NotifyType.Error);
              this.loadingVisible = false;
            },
          });
      } else if (this.model.ESTADO_SOLI_COTIZACION === 'SO') {
        this.mCOM_PROVEEDOR_DISPONIBLE.forEach((x: any) => {
          x.GENERAR_COTIZACION = true;
        });
        this.service
          .insertCOM_SOLI_COTIZACION_PROVEEDOR(
            this.mCOM_PROVEEDOR_DISPONIBLE.filter(
              (y: ComSoliCotizacionProveedor) => y.SELECCION === true
            )
          )
          .pipe(take(1))
          .subscribe({
            next: (response: any) => {
              if (response.Result) {
                this.AsignaStatus(UpdateType.Update);
                this.mCOM_SOLI_COTIZACION_PROVEEDOR = response.Data;
                this.notifyFx('Registro creado con exito!', NotifyType.Success);
                this.popupVisibleProveedor = false;
                this.loadingVisible = false;
                this.ConsultarProveedores(
                  this.model.ANIO_PERIODO,
                  this.model.CORR_SOLI_COTIZACION
                );
                // this.bloquear();
              } else {
                this.notifyFx(response.ErrorMessage, NotifyType.Error);
                this.loadingVisible = false;
              }
            },
            error: (error: any) => {
              this.notifyFx(error, NotifyType.Error);
              this.loadingVisible = false;
            },
          });
      }
    } else {
      this.notifyFx('Debe Seleccionar Un Proveedor', NotifyType.Error);
    }
  }

  hidePopupProveedor() {
    this.confirmaCancelar(() => {
      this.popupVisibleProveedor = false;
      //this.AsignaStatus(UpdateType.Browse);
      //this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
    });
  }

  hidePopupVistaPrevia() {
    this.confirmaCancelar(() => {
      this.popupVisibleVistaPrevia = false;
      //this.AsignaStatus(UpdateType.Browse);
      //this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
    });
  }

  ConsultarProveedoresDisponible(
    xANIO_PERIODO: Number,
    xCORR_SOLI_COTIZACION: Number
  ) {
    this.loadingVisible = true;
    this.service
      .getAll_PROVEEDOR_DISPONIBLES({
        ANIO_PERIODO: xANIO_PERIODO,
        CORR_SOLI_COTIZACION: xCORR_SOLI_COTIZACION,
      })
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.mCOM_PROVEEDOR_DISPONIBLE = response.Data;
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
  }

  HabilitarDetaProveedor(e: any): void {
    if (this.modelProveedor.CORR_PROVEEDOR <= 0) {
      this.notifyFx(
        'Debe selecionar el detale que desea habilitar..',
        NotifyType.Error
      );
      this.loadingVisible = false;
      return;
    }
    if (this.modelProveedor.ESTADO_COTIZACION != 'AP') {
      this.notifyFx('La cotización no esta aplicada..', NotifyType.Error);
      this.loadingVisible = false;
      return;
    }
    // if (this.model.ESTADO_SOLI_COTIZACION != 'SO') {
    //   this.notifyFx(
    //     'La solicitud de cotización no esta solicitado..',
    //     NotifyType.Error
    //   );
    //   this.loadingVisible = false;
    //   return;
    // }
    const confirpreli = custom({
      title: 'Confirmación de Solicitud de Cotización',
      messageHtml: '¿Realmente Quiere Habilitar el detalle ?',
      buttons: [
        {
          text: 'Si',
          onClick: (e: any) => {
            this.loadingVisible = true;
            if (this.model.CORR_SOLI_COTIZACION > 0) {
              this.service
                .HabilitarCOM_SOLI_COTIZACION_PROVEEDOR(this.modelProveedor)
                .pipe(take(1))
                .subscribe({
                  next: (response: any) => {
                    if (response.Result) {
                      this.notifyFx(
                        'Detalle Anulado con exito..!',
                        NotifyType.Success
                      );
                      this.ConsultarProveedores(
                        this.model.ANIO_PERIODO,
                        this.model.CORR_SOLI_COTIZACION
                      );
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

  AnularDetaProveedor(e: any): void {
    if (this.modelProveedor.CORR_PROVEEDOR <= 0) {
      this.notifyFx(
        'Debe selecionar el detale que desea anular..',
        NotifyType.Error
      );
      this.loadingVisible = false;
      return;
    }
    const confirpreli = custom({
      title: 'Confirmación de Solicitud de Cotización',
      messageHtml: '¿Realmente Quiere Anular el detalle ?',
      buttons: [
        {
          text: 'Si',
          onClick: (e: any) => {
            this.loadingVisible = true;
            if (this.model.CORR_SOLI_COTIZACION > 0) {
              this.service
                .AnularCOM_SOLI_COTIZACION_PROVEEDOR(this.modelProveedor)
                .pipe(take(1))
                .subscribe({
                  next: (response: any) => {
                    if (response.Result) {
                      this.notifyFx(
                        'Detalle Anulado con exito..!',
                        NotifyType.Success
                      );
                      this.ConsultarProveedores(
                        this.model.ANIO_PERIODO,
                        this.model.CORR_SOLI_COTIZACION
                      );
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

  gDataComSoliCotizaProveedorFocusedRowChanged(e: any) {
    this.modelProveedor.CORR_EMPRESA = this.appInfoService.CORR_EMPRESA;
    this.modelProveedor.ANIO_PERIODO = this.model.ANIO_PERIODO;
    this.modelProveedor.CORR_SOLI_COTIZACION = this.model.CORR_SOLI_COTIZACION;
    this.modelProveedor.CORR_PROVEEDOR = e.row.data.CORR_PROVEEDOR;
    this.modelProveedor.ESTADO_COTIZACION = e.row.data.ESTADO_COTIZACION;
  }
  //#endregion

  Solicitar(): void {
    const confirpreli = custom({
      title: 'Confirmación de Solicitud de Cotización',
      messageHtml: '¿Realmente Quiere Solicitar la cotizaciones?',
      buttons: [
        {
          text: 'Si',
          onClick: (e: any) => {
            this.loadingVisible = true;
            if (this.banderaMtto === UpdateType.Update) {
              if (this.mCOM_SOLI_COTIZACION_PROVEEDOR.length <= 0) {
                this.notifyFx(
                  'Debe asignar un proveedor para solicitar la cotización..',
                  NotifyType.Error
                );
                this.loadingVisible = false;
                return;
              }
              //this.guardar();
              //this.GuardarSinCerrar();
            }
            if (this.model.CORR_SOLI_COTIZACION > 0) {
              this.service
              .update(this.model)
              .pipe(take(1))
              .subscribe({
                next: (response: any) => {
                  if (response.Result) {
                    this.model = response.Data;
                    const vIndex = this.models.findIndex(
                      (item: any) => item.CORR_SOLI_COTIZACION === response.Data.CORR_SOLI_COTIZACION
                    );
                    this.models[vIndex] = response.Data;
                    this.service
                    .Solicitar(this.model)
                    .pipe(take(1))
                    .subscribe({
                      next: (response: any) => {
                        if (response.Result) {
                          this.notifyFx(
                            'Solicitado con exito..!',
                            NotifyType.Success
                          );
                          this.model = response.Data;
                          const vIndex = this.models.findIndex(
                            (item: any) => item.CORR_SOLI_COTIZACION === response.Data.CORR_SOLI_COTIZACION
                          );
                          this.models[vIndex] = response.Data;
                          this.ConsultarProveedores(this.model.ANIO_PERIODO, this.model.CORR_SOLI_COTIZACION);
                          this.consultarCOM_SOLI_COTIZACION_DETA();
                          this.consultarDocumentos();
                          this.refrescarBotones();
                          this.banderaMtto = UpdateType.Not_Defined;
                          if (this.model.ESTADO_SOLI_COTIZACION != 'DI') {
                            setTimeout(() => {
                              this.bloquear();
                            });
                          }
                          if (
                            this.model.ESTADO_SOLI_COTIZACION == 'SO' ||
                            this.model.ESTADO_SOLI_COTIZACION == 'DI'
                          ) {
                            this.readOnlyProveedor = true;
                          } else {
                            this.readOnlyProveedor = false;
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
            }
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

  Aplicar(): void {
    const confirpreli = custom({
      title: 'Confirmación de Solicitud de Cotización',
      messageHtml: '¿Realmente Quiere Aplicar la Solicitud de Cotización?',
      buttons: [
        {
          text: 'Si',
          onClick: (e: any) => {
            this.loadingVisible = true;
            //if (this.banderaMtto === UpdateType.Update) {
            //  this.GuardarSinCerrar();
            //}
            if (this.model.CORR_SOLI_COTIZACION > 0) {
              this.service
                .Aplicar(this.model)
                .pipe(take(1))
                .subscribe({
                  next: (response: any) => {
                    if (response.Result) {
                      this.notifyFx(
                        'Aplicado con exito..!',
                        NotifyType.Success
                      );
                      this.model = response.Data;
                      const vIndex = this.models.findIndex(
                        (item: any) => item.CORR_SOLI_COTIZACION === response.Data.CORR_SOLI_COTIZACION
                      );
                      this.models[vIndex] = response.Data;
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

  Cancelar(): void {
    const confirpreli = custom({
      title: 'Confirmación de Solicitud de Cotización',
      messageHtml: '¿Realmente Quiere Cancelar la solicitud de cotización?',
      buttons: [
        {
          text: 'Si',
          onClick: (e: any) => {
            this.loadingVisible = true;
            // if (this.banderaMtto === UpdateType.Update)
            // {
            //   if(this.mCOM_SOLI_COTIZACION_PROVEEDOR.length <= 0)
            //   {
            //     this.notifyFx('Debe asignar un proveedor para solicitar la cotización..', NotifyType.Error);
            //     this.loadingVisible = false;
            //     return;
            //   }
            //   this.guardar();
            // }
            // if(this.model.CORR_SOLI_COTIZACION>0)
            // {
            //   this.service
            //   .Solicitar(this.model)
            //   .pipe(take(1))
            //   .subscribe({
            //     next: (response: any) => {
            //       if (response.Result) {
            //         this.notifyFx('Solicitado con exito..!', NotifyType.Success);
            //         this.consultar();
            //       } else {
            //         this.notifyFx(response.ErrorMessage, NotifyType.Error);
            //       }
            //       this.loadingVisible = false;
            //     },
            //     error: (error: any) => {
            //       this.notifyFx(error, NotifyType.Error);
            //       this.loadingVisible = false;
            //     },
            //   });
            // }
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

  descargarPDF() {
    this.loadingVisible = true;
    this.service
      .getPDF(
        this.fillParam(this.model.ANIO_PERIODO, this.model.CORR_SOLI_COTIZACION)
      )
      .pipe(take(1))
      .subscribe({
        next: (vPDF: any) => {
          if (vPDF != null) {
            this.PDF = this.sanitization.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(vPDF));
            this.popupVisiblePdf = true;
          } else {
            this.notifyFx("Error al generar PDF", NotifyType.Error);
          }
          this.loadingVisible = false;
          /*this.appInfoService.downloadFile(
            vPDF,
            'SolicitudCotizacionNo.' +
              this.model.ANIO_PERIODO.toString() +
              -+this.model.CORR_SOLI_COTIZACION.toString() +
              '.pdf'
          );*/
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
          this.loadingVisible = false;
        },
      });
  }

  gDataSoliCotizacionDocRowDblClick(e: any) {
    if (e.rowType === 'data') {
      this.loadingVisible = true;
      const param = {
        ANIO_PERIODO: this.model.ANIO_PERIODO,
        CORR_SOLI_COTIZACION: this.model.CORR_SOLI_COTIZACION,
        CORR_DOCUMENTO: e.data.CORR_DOCUMENTO,
        NOMBRE_ARCHIVO: e.data.NOMBRE_ARCHIVO,
      };
      this.service
        .getDoc(param)
        .pipe(take(1))
        .subscribe({
          next: (vDoc: any) => {
            if (vDoc != undefined) {
              this.PDF = this.sanitization.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(vDoc));
              this.loadingVisible = false;
              this.popupVisiblePdf = true;
            } else {
              this.notifyFx('Error al generar documento', NotifyType.Error);
            }
            this.loadingVisible = false;
          },
          error: (error: any) => {
            this.loadingVisible = false;
            this.notifyFx(error.error, NotifyType.Error);
          },
        });
    }
  }

  gDataSoliCotizacionDocRowRemoving(e: any) {
    const isCanceled = new Promise((resolve, reject) => {
      if (this.model.ESTADO_SOLI_COTIZACION != 'DI') {
        this.loadingVisible = false;
        reject('No se puede eliminar el Documento, Debe estar en Digitado...');
        return;
      }
      this.loadingVisible = true;
      this.service
        .deleteCOM_SOLI_COTIZACION_DOC(e.data)
        .pipe(take(1))
        .subscribe({
          next: (response: any) => {
            if (response.Result) {
              this.loadingVisible = false;
              this.notifyFx(
                'Registro eliminado con exito!',
                NotifyType.Success
              );
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
        this.notifyFx(
          'Debe ingresar un nombre para el documento',
          NotifyType.Error
        );
        return;
      }
      if (this.mDocumento.CORR_TIPO_DOCUMENTO == 0) {
        this.notifyFx(
          'Debe seleccionar un tipo de documento',
          NotifyType.Error
        );
        return;
      }
      if (this.fileDoc.size <= 0) {
        this.notifyFx('Debe seleccionar un documento', NotifyType.Error);
        return;
      }
      if (this.fileDoc.size <= 10485760) {
        this.loadingVisible = true;
        const formData = new FormData();
        formData.append(
          'CORR_EMPRESA',
          this.appInfoService.CORR_EMPRESA.toString()
        );
        formData.append('ANIO_PERIODO', this.model.ANIO_PERIODO.toString());
        formData.append(
          'CORR_SOLI_COTIZACION',
          this.model.CORR_SOLI_COTIZACION.toString()
        );
        formData.append('CORR_DOCUMENTO', '0');
        formData.append(
          'NOMBRE_DOCUMENTO',
          this.mDocumento.NOMBRE_DOCUMENTO.toString()
        );
        formData.append(
          'DESCRIPCION_DOCUMENTO',
          this.mDocumento.DESCRIPCION_DOCUMENTO.toString()
        );
        formData.append(
          'CORR_TIPO_DOCUMENTO',
          this.mDocumento.CORR_TIPO_DOCUMENTO.toString()
        );
        formData.append('RUTA_DOCUMENTO', '-');
        formData.append('NOMBRE_ARCHIVO', this.vNOMBRE_ARCHIVO);
        formData.append('FOTO_DOCUMENTO', this.fileDoc, this.fileDoc.name);

        if (this.insertDetaDoc == false) {
          this.service
            .insertDoc(formData)
            .pipe(take(1))
            .subscribe(
              (response: any) => {
                if (response.Result) {
                  this.notifyFx(
                    'Documento guardado con exito!',
                    NotifyType.Success
                  );
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
        } else {
          formData.append(
            'CORR_SOLI_COTIZACION_DETA',
            this.modelDeta.CORR_SOLI_COTIZACION_DETA.toString()
          );
          this.service
            .insertDetaDoc(formData)
            .pipe(take(1))
            .subscribe(
              (response: any) => {
                if (response.Result) {
                  this.notifyFx(
                    'Documento guardado con exito!',
                    NotifyType.Success
                  );
                  this.modelDeta.CORR_DOCUMENTO = response.Data.CORR_DOCUMENTO;
                  this.LimpiarDoc();
                  this.consultarCOM_SOLI_COTIZACION_DETA();
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
        this.notifyFx(
          'Debe seleccionar un PDF con máximo de 10 MB de peso',
          NotifyType.Error
        );
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
    if (file) {
      if (file.size <= 2097152)
      {
        this.fileDoc = file;
        this.vNOMBRE_ARCHIVO = this.fileDoc.name;
        this.mDocumento.NOMBRE_DOCUMENTO = this.fileDoc.name;
        if (this.mCORR_TIPO_DOCUMENTO.length>0)
        {
          this.mDocumento.CORR_TIPO_DOCUMENTO = this.mCORR_TIPO_DOCUMENTO[0].CORR_TIPO_DOCUMENTO;
        }
      } else {
        this.notifyFx(
          'Debe seleccionar un archivo con máximo de 2 MB de peso',
          NotifyType.Error
        );
      }
    }
  }

  selectedLookUpCORR_TIPO_DOCUMENTO(vRow: any): any {
    return vRow[0].CORR_TIPO_DOCUMENTO;
  }

  consultarDocumentos(): void {
    this.service
      .getAllCOM_SOLI_COTIZACION_DOC({
        ANIO_PERIODO: this.model.ANIO_PERIODO,
        CORR_SOLI_COTIZACION: this.model.CORR_SOLI_COTIZACION,
      })
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.mCOM_SOLI_COTIZACION_DOC = response.Data;
          }
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
        },
      });
  }

  Anular(): void {
    const confirpreli = custom({
      title: 'Confirmación de Solicitud de Cotización',
      messageHtml: '¿Realmente Quiere Anular la cotizacion?',
      buttons: [
        {
          text: 'Si',
          onClick: (e: any) => {
            this.loadingVisible = true;
            if (this.banderaMtto === UpdateType.Update) {
              this.guardar();
            }
            if (this.model.CORR_SOLI_COTIZACION > 0) {
              this.service
                .Anular(this.model)
                .pipe(take(1))
                .subscribe({
                  next: (response: any) => {
                    if (response.Result) {
                      this.notifyFx('Anulado con exito..!', NotifyType.Success);
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

  //#region <COM_SOLI_COTIZACION_DETA_DOC>
  gDataComSoliCotizaDetaRowDblClick(e: any) {
    if (e.rowType === 'data') {
      if (this.modelDeta.CORR_DOCUMENTO>0) {

        this.loadingVisible = true;
        const param = {
          ANIO_PERIODO: this.model.ANIO_PERIODO,
          CORR_SOLI_COTIZACION: this.model.CORR_SOLI_COTIZACION,
          CORR_SOLI_COTIZACION_DETA: this.modelDeta.CORR_SOLI_COTIZACION_DETA,
          CORR_DOCUMENTO: this.modelDeta.CORR_DOCUMENTO,
          NOMBRE_ARCHIVO: this.modelDeta.NOMBRE_ARCHIVO,
        };
        this.service
        .getDetaDoc(param)
        .pipe(take(1))
        .subscribe({
          next: (vDoc: any) => {
            if (vDoc != undefined) {
              this.PDF = this.sanitization.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(vDoc));
              //this.appInfoService.downloadFile(vDoc,'DOC-' +e.data.ANIO_PERIODO +'-' +e.data.CORR_SOLI_COTIZACION +'-' +e.data.CORR_SOLI_COTIZACION_DETA +'-' +e.data.CORR_DOCUMENTO +'-'  e.data.NOMBRE_ARCHIVO);
            } else {
              this.notifyFx('Error al generar documento', NotifyType.Error);
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
    if (this.modelDeta.CORR_SOLI_COTIZACION_DETA <= 0) {
      this.notifyFx(
        'Debe selecionar el detale que desea eliminar su documento..',
        NotifyType.Error
      );
      this.loadingVisible = false;
      return;
    }
    if (this.model.ESTADO_SOLI_COTIZACION != 'DI') {
      this.loadingVisible = false;
      this.notifyFx(
        'No se puede eliminar el Documento, Debe estar en Digitado...',
        NotifyType.Error
      );
      return;
    }
    this.loadingVisible = true;
    this.service
      .deleteCOM_SOLI_COTIZACION_DETA_DOC(this.modelDeta)
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.loadingVisible = false;
            this.modelDeta.CORR_DOCUMENTO = 0;
            this.consultarCOM_SOLI_COTIZACION_DETA();
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
  gDataComSoliCotizaDetaCellPrepared (e: any) {
    if(e.rowType === 'header') {
      if (e.column.dataField === "PRECIO_UNITARIO")
      {
        e.cellElement.bgColor="darkgoldenrod";
      }
    }
  }
  //#region <Agregar Justificacion Eliminacion>
  guardarEliminarComentarioPopup() {
    if (this.model.COMENTARIO == '') {
      this.notifyFx('Debe Digitar un Motivo', NotifyType.Error);
      return;
    }

    this.loadingVisible = true;
    this.service
			.delete(this.fillParam(this.eEventoEliminar.data.ANIO_PERIODO,this.eEventoEliminar.data.CORR_SOLI_COTIZACION,this.model.JUSTIFICACION_ELIMINAR))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.notifyFx('Registro eliminado con exito!', NotifyType.Success);
						this.eEventoEliminar.component.refresh();
					} else {
						this.eEventoEliminar.cancel = true;
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
					}
				},
				error: (error: any) => {
					this.eEventoEliminar.cancel = true;
					this.notifyFx(error, NotifyType.Error);
				},
			});
    this.loadingVisible = false;
    this.popupVisibleEliminarComentario = false;
  }

  hideEliminacionComentarioPopup() {
    this.popupVisibleEliminarComentario = false;
    this.loadingVisible = false;
    this.consultar();
    this.LimpiarEliminarComentario();
  }

  LimpiarEliminarComentario() {
    this.dataEliminarComentarioForm.instance.clear();
  }
  //#endregion

  selectTodos() {
    this.mCOM_SOLICITUD_DETA_DISPONIBLE.forEach((x: any) => {
      x.SELECCION = true;
    });
  }

  selectNinguno() {
    this.mCOM_SOLICITUD_DETA_DISPONIBLE.forEach((x: any) => {
      x.SELECCION = false;
    });
  }
}
