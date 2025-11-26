import { Component, OnInit,ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ComProveedorActu } from './models/com-proveedor-actu';
import { ComProveedorActuService } from './com-proveedor-actu.service';
import { IParam } from 'src/app/FxAPI/IParam';
import { DxFormComponent } from 'devextreme-angular/ui/form';
import { ComProveedorActuDoc } from './com-proveedor-actu-doc/models/com-proveedor-actu-doc';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
	selector: 'app-com-proveedor-actu',
	templateUrl: './com-proveedor-actu.component.html',
	styleUrls: ['./com-proveedor-actu.component.scss'],
})
export class ComProveedorActuComponent extends CBaseComponent implements OnInit {

  @ViewChild('fDocumento', { static: false }) dataDocForm!: DxFormComponent;

  //#region <Declarando Variales>
	mCORR_TIPO_DIP: any;
	mCORR_ACTIVIDAD_ECONOMICA: any;
	mCODIGO_PAIS: any;
	mCODIGO_DEPTO: any;
	mCODIGO_MUNICIPIO: any;
	mCORR_FORMA_PAGO: any;
	mCORR_BANCO: any;
	mESTADO_PROVEEDOR: any;
	mESTADO_PROVEEDOR_WEB: any;
  mTIPO_PERSONERIA: any;
	readOnly = false;
  mostrarNatural = false;
  mCOM_PROVEEDOR_USUARIO: any;
  mESTADO_USUARIO: any;
  mCORR_TIPO_DOCUMENTO: any;
  popupVisibleDoc=false;
  fileDoc: any;
  vNOMBRE_ARCHIVO = '';
  mCOM_PROVEEDOR_DOC: any;
  mDocumento: ComProveedorActuDoc={
    CORR_EMPRESA: this.appInfoService.CORR_EMPRESA,
    CORR_PROVEEDOR: 0,
    CORR_DOCUMENTO: 0,
    NOMBRE_DOCUMENTO: '',
    DESCRIPCION_DOCUMENTO: '',
    CORR_TIPO_DOCUMENTO: 0,
    NOMBRE_TIPO_DOCUMENTO: '',
    RUTA_DOCUMENTO: '',
    NOMBRE_ARCHIVO: '',
  };
  PDF!: SafeUrl;
  popupVisiblePdf=false;
	// #endregion

  constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ComProveedorActuService,
    private sanitization: DomSanitizer

	) {
		super(appInfoService, router);
		// this.columns = this.service.getColumns();
		// this.summary = this.service.getSummary();
		//this.items = this.service.getItems();
    this.selectedLookUpTIPO_PERSONERIA = this.selectedLookUpTIPO_PERSONERIA.bind(this);
    this.selectedLookUpCODIGO_DEPTO = this.selectedLookUpCODIGO_DEPTO.bind(this);
    this.guardar = this.guardar.bind(this);
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
		this.getCORR_TIPO_DIP();
		this.getCORR_ACTIVIDAD_ECONOMICA();
		this.getCODIGO_PAIS();
		this.getCODIGO_DEPTO();
		this.getCODIGO_MUNICIPIO('');
		this.getCORR_FORMA_PAGO();
		this.getCORR_BANCO();
		this.getESTADO_PROVEEDOR();
		this.getESTADO_PROVEEDOR_WEB();
    this.getTIPO_PERSONERIA();
    this.getESTADO_USUARIO();
    this.getCORR_TIPO_DOCUMENTO();
	}

	getCORR_TIPO_DIP() {
		this.appInfoService
			.getLookUp('COM_PROVEEDOR_ACTU', 'GEN_TIPO_DIP', 'GetCORR_TIPO_DIP', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_TIPO_DIP = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	getCORR_ACTIVIDAD_ECONOMICA() {
		this.appInfoService
			.getLookUp('COM_PROVEEDOR_ACTU', 'COM_ACTIVIDAD_ECONOMICA', 'GetCORR_ACTIVIDAD_ECONOMICA', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_ACTIVIDAD_ECONOMICA = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	getCODIGO_PAIS() {
		this.appInfoService
			.getLookUp('COM_PROVEEDOR_ACTU', 'GEN_PAIS', 'GetCODIGO_PAIS', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCODIGO_PAIS = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	getCODIGO_DEPTO() {
		this.appInfoService
			.getLookUp('COM_PROVEEDOR_ACTU', 'GEN_DEPTO', 'GetCODIGO_DEPTO', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCODIGO_DEPTO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	getCODIGO_MUNICIPIO(CODIGO_DEPTO: string) {
    let xWhere: IParam[] = [{ Parameter: 'CODIGO_DEPTO', Value: CODIGO_DEPTO }];
		this.appInfoService
			.getLookUp('COM_PROVEEDOR_ACTU', 'GEN_MUNICIPIO', 'GetCODIGO_MUNICIPIO', xWhere, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCODIGO_MUNICIPIO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	getCORR_FORMA_PAGO() {
		this.appInfoService
			.getLookUp('COM_PROVEEDOR_ACTU', 'GEN_FORMA_PAGO', 'GetCORR_FORMA_PAGO', undefined, environment.UrlCOMPRASAPI)
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
	getCORR_BANCO() {
		this.appInfoService
			.getLookUp('COM_PROVEEDOR_ACTU', 'COM_BANCO', 'GetCORR_BANCO', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_BANCO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	getESTADO_PROVEEDOR() {
		this.appInfoService
			.getLookUp('COM_PROVEEDOR_ACTU', 'GEN_LISTA', 'GetESTADO_PROVEEDOR', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mESTADO_PROVEEDOR = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	getESTADO_PROVEEDOR_WEB() {
		this.appInfoService
			.getLookUp('COM_PROVEEDOR_ACTU', 'GEN_LISTA', 'GetESTADO_PROVEEDOR_WEB', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mESTADO_PROVEEDOR_WEB = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
  getTIPO_PERSONERIA() {
		this.appInfoService
			.getLookUp('COM_PROVEEDOR_ACTU', 'GEN_LISTA', 'GetTIPO_PERSONERIA', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mTIPO_PERSONERIA = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
  getESTADO_USUARIO() :void {
		this.appInfoService
			.getLookUp('COM_PROVEEDOR_ACTU', 'GEN_LISTA', 'GetESTADO_USUARIO', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mESTADO_USUARIO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
  getCORR_TIPO_DOCUMENTO() {
		this.appInfoService
			.getLookUp('COM_PROVEEDOR_ACTU', 'COM_TIPO_DOC_FISICO', 'GetCORR_TIPO_DOCUMENTO', undefined, environment.UrlCOMPRASAPI)
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
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xCORR_PROVEEDOR?: number): any {
		if (xCORR_PROVEEDOR == undefined) {
			xCORR_PROVEEDOR = 0;
		}
		return {
			CORR_PROVEEDOR: xCORR_PROVEEDOR,
		};
	}

	override fillData(xModel?: ComProveedorActu): ComProveedorActu {
		if (xModel !== undefined) {
			return {
				CORR_PROVEEDOR: xModel.CORR_PROVEEDOR,
				CODIGO_PROVEEDOR: xModel.CODIGO_PROVEEDOR,
				TIPO_PERSONERIA: xModel.TIPO_PERSONERIA,
				NOMBRE_TIPO_PERSONERIA: xModel.NOMBRE_TIPO_PERSONERIA,
				NOMBRE_PROVEEDOR: xModel.NOMBRE_PROVEEDOR,
				PRIMER_NOMBRE: xModel.PRIMER_NOMBRE,
				SEGUNDO_NOMBRE: xModel.SEGUNDO_NOMBRE,
				PRIMER_APELLIDO: xModel.PRIMER_APELLIDO,
				SEGUNDO_APELLIDO: xModel.SEGUNDO_APELLIDO,
				NOMBRE_COMERCIAL: xModel.NOMBRE_COMERCIAL,
				CORR_TIPO_DIP: xModel.CORR_TIPO_DIP,
				NOMBRE_TIPO_DIP: xModel.NOMBRE_TIPO_DIP,
				NUMERO_DIP: xModel.NUMERO_DIP,
				NUMERO_NRC: xModel.NUMERO_NRC,
				NUMERO_NIT: xModel.NUMERO_NIT,
				CORR_ACTIVIDAD_ECONOMICA: xModel.CORR_ACTIVIDAD_ECONOMICA,
				NOMBRE_ACTIVIDAD_ECONOMICA: xModel.NOMBRE_ACTIVIDAD_ECONOMICA,
				DIRECCION_PROVEEDOR: xModel.DIRECCION_PROVEEDOR,
				CODIGO_PAIS: xModel.CODIGO_PAIS,
				NOMBRE_PAIS: xModel.NOMBRE_PAIS,
				CODIGO_DEPTO: xModel.CODIGO_DEPTO,
				NOMBRE_DEPTO: xModel.NOMBRE_DEPTO,
				CODIGO_MUNICIPIO: xModel.CODIGO_MUNICIPIO,
				NOMBRE_MUNICIPIO: xModel.NOMBRE_MUNICIPIO,
				NOMBRE_CONTACTO: xModel.NOMBRE_CONTACTO,
				TELEFONO_FIJO: xModel.TELEFONO_FIJO,
				TELEFONO_MOVIL: xModel.TELEFONO_MOVIL,
				CORREO_ELECTRONICO_1: xModel.CORREO_ELECTRONICO_1,
				CORREO_ELECTRONICO_2: xModel.CORREO_ELECTRONICO_2,
				CORR_FORMA_PAGO: xModel.CORR_FORMA_PAGO,
				NOMBRE_FORMA_PAGO: xModel.NOMBRE_FORMA_PAGO,
				CUENTA_BANCARIA: xModel.CUENTA_BANCARIA,
				CORR_BANCO: xModel.CORR_BANCO,
				NOMBRE_BANCO: xModel.NOMBRE_BANCO,
				ESTADO_PROVEEDOR: xModel.ESTADO_PROVEEDOR,
				NOMBRE_ESTADO_PROVEEDOR: xModel.NOMBRE_ESTADO_PROVEEDOR,
				ESTADO_PROVEEDOR_WEB: xModel.ESTADO_PROVEEDOR_WEB,
				NOMBRE_ESTADO_PROVEEDOR_WEB: xModel.NOMBRE_ESTADO_PROVEEDOR_WEB,
				USUARIO_CREA: xModel.USUARIO_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
			};
		} else {
			return {
				CORR_PROVEEDOR: 0,
				CODIGO_PROVEEDOR: '',
				TIPO_PERSONERIA: '',
				NOMBRE_TIPO_PERSONERIA: '',
				NOMBRE_PROVEEDOR: '',
				PRIMER_NOMBRE: '',
				SEGUNDO_NOMBRE: '',
				PRIMER_APELLIDO: '',
				SEGUNDO_APELLIDO: '',
				NOMBRE_COMERCIAL: '',
				CORR_TIPO_DIP: 0,
				NOMBRE_TIPO_DIP: '',
				NUMERO_DIP: '',
				NUMERO_NRC: '',
				NUMERO_NIT: '',
				CORR_ACTIVIDAD_ECONOMICA: '',
				NOMBRE_ACTIVIDAD_ECONOMICA: '',
				DIRECCION_PROVEEDOR: '',
				CODIGO_PAIS: '',
				NOMBRE_PAIS: '',
				CODIGO_DEPTO: '',
				NOMBRE_DEPTO: '',
				CODIGO_MUNICIPIO: '',
				NOMBRE_MUNICIPIO: '',
				NOMBRE_CONTACTO: '',
				TELEFONO_FIJO: '',
				TELEFONO_MOVIL: '',
				CORREO_ELECTRONICO_1: '',
				CORREO_ELECTRONICO_2: '',
				CORR_FORMA_PAGO: 0,
				NOMBRE_FORMA_PAGO: '',
				CUENTA_BANCARIA: '',
				CORR_BANCO: 0,
				NOMBRE_BANCO: '',
				ESTADO_PROVEEDOR: '',
				NOMBRE_ESTADO_PROVEEDOR: '',
				ESTADO_PROVEEDOR_WEB: '',
				NOMBRE_ESTADO_PROVEEDOR_WEB: '',
				USUARIO_CREA: '',
				FECHA_CREA: new Date(),
				ESTACION_CREA: '',
				USUARIO_ACTU: '',
				FECHA_ACTU: new Date(),
				ESTACION_ACTU: '',
			};
		}
	}

	consultar() {
    this.loadingVisible = true;
    this.AsignaStatus(UpdateType.Browse);
		this.service
			.get(this.fillParam())
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
            if (response.Data != null) {
              //this.models = response.Data;
              this.model = response.Data;
              this.AsignaStatus(UpdateType.Update);
              this.getCODIGO_MUNICIPIO(this.model.CODIGO_DEPTO);
              this.consultarDocumentos(this.model.CORR_PROVEEDOR);
            }
					}
          this.loadingVisible = false;
				},
				error: (error: any) => {
          this.loadingVisible = false;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

  // override editarClick(e: any) {
	// 	super.editarClick(e);
	// }

  // override rowDblClick(e: any) {
	// 	super.rowDblClick(e);
	// }

  onClickGuardar() {
    this.guardar();
  }

	guardar(xTieneDetalle?: Function, data?: any): void {
		if (!this.service.esValido(this.model, this.notifyFx)) {
			return;
		}

		this.loadingVisible = true;
		// if (this.banderaMtto === UpdateType.Add) {
		// 	this.service
		// 		.insert(this.model)
		// 		.pipe(take(1))
		// 		.subscribe({
		// 			next: (response: any) => {
		// 				if (response.Result) {
		// 					this.models.push(response.Data);
    //           this.model = response.Data;
    //           if (xTieneDetalle) {
		// 						this.AsignaStatus(UpdateType.Update);
		// 						data.CORR_PROVEEDOR = response.Data.CORR_PROVEEDOR;
		// 						xTieneDetalle(data);
		// 					} else {
		// 						this.AsignaStatus(UpdateType.Browse);
		// 						this.notifyFx('Registro creado con exito!', NotifyType.Success);
		// 					}
		// 				} else {
		// 					this.notifyFx(response.ErrorMessage, NotifyType.Error);
		// 				}
		// 				this.loadingVisible = false;
		// 			},
		// 			error: (error: any) => {
		// 				this.notifyFx(error, NotifyType.Error);
		// 				this.loadingVisible = false;
		// 			},
		// 		});
		// } else
    if (this.banderaMtto === UpdateType.Update) {
			this.service
				.update(this.model)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.model = response.Data;
							// const vIndex = this.models.findIndex((item: any) => item.CORR_PROVEEDOR === response.Data.CORR_PROVEEDOR);
							// this.models[vIndex] = response.Data;
							// this.AsignaStatus(UpdateType.Browse);
              this.AsignaStatus(UpdateType.Update);
							this.notifyFx('Registro actualizado con exito!', NotifyType.Success);
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

	// override cancelar(): void {
	// 	super.cancelar((item: any) => item.CORR_PROVEEDOR === this.modelUpdate.CORR_PROVEEDOR);
	// }

	// rowRemoving(e: any) {
	// 	this.service
	// 		.delete(this.fillParam(e.data.CORR_PROVEEDOR))
	// 		.pipe(take(1))
	// 		.subscribe({
	// 			next: (response: any) => {
	// 				if (response.Result) {
	// 					this.notifyFx('Registro eliminado con exito!', NotifyType.Success);
	// 					e.component.refresh();
	// 				} else {
	// 					e.cancel = true;
	// 					this.notifyFx(response.ErrorMessage, NotifyType.Error);
	// 				}
	// 			},
	// 			error: (error: any) => {
	// 				e.cancel = true;
	// 				this.notifyFx(error, NotifyType.Error);
	// 			},
	// 		});
	// }

	// override bloquear(): void {
	// 	this.dataForm.instance.getEditor('CORR_PROVEEDOR')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('CODIGO_PROVEEDOR')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('TIPO_PERSONERIA')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('NOMBRE_PROVEEDOR')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('PRIMER_NOMBRE')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('SEGUNDO_NOMBRE')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('PRIMER_APELLIDO')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('SEGUNDO_APELLIDO')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('NOMBRE_COMERCIAL')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('CORR_TIPO_DIP')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('NUMERO_DIP')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('NUMERO_NRC')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('NUMERO_NIT')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('CORR_ACTIVIDAD_ECONOMICA')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('DIRECCION_PROVEEDOR')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('CODIGO_PAIS')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('CODIGO_DEPTO')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('CODIGO_MUNICIPIO')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('NOMBRE_CONTACTO')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('TELEFONO_FIJO')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('TELEFONO_MOVIL')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('CORREO_ELECTRONICO_1')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('CORREO_ELECTRONICO_2')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('CORR_FORMA_PAGO')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('CUENTA_BANCARIA')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('CORR_BANCO')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('ESTADO_PROVEEDOR')?.option('readOnly', true);
	// 	this.dataForm.instance.getEditor('ESTADO_PROVEEDOR_WEB')?.option('readOnly', true);
	// 	this.readOnly = true;
	// }

	override habilitar(): void {
		this.readOnly = false;
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_PROVEEDOR')?.focus();
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}

  selectedLookUpCORR_BANCO(vRow: any): any {
		return vRow[0].CORR_BANCO;
	}

  selectedLookUpCORR_FORMA_PAGO(vRow: any): any {
		return vRow[0].CORR_FORMA_PAGO;
	}

  selectedLookUpCODIGO_MUNICIPIO(vRow: any): any {
		return vRow[0].CODIGO_MUNICIPIO;
	}

  selectedLookUpCODIGO_DEPTO(vRow: any): any {
    this.getCODIGO_MUNICIPIO(vRow[0].CODIGO_DEPTO);
		return vRow[0].CODIGO_DEPTO;
	}

  selectedLookUpCODIGO_PAIS(vRow: any): any {
		return vRow[0].CODIGO_PAIS;
	}

  selectedLookUpCORR_ACTIVIDAD_ECONOMICA(vRow: any): any {
		return vRow[0].CORR_ACTIVIDAD_ECONOMICA;
	}

  selectedLookUpCORR_TIPO_DIP(vRow: any): any {
		return vRow[0].CORR_TIPO_DIP;
	}

  selectedLookUpTIPO_PERSONERIA(vRow: any): any
  {
    if (vRow[0].Key !== null)
    {
      if (vRow[0].Key == 'N') {
        this.mostrarNatural = true;
      } else {
        this.mostrarNatural = false;
      }
    }

		return vRow[0].Key;
	}

  //#region <COM_PROVEEDOR_DOC>
  gDataProveedorActuDocRowDblClick(e: any) {
    if (e.rowType === 'data') {
      this.loadingVisible = true;
      const param = {
        CORR_EMPRESA: this.appInfoService.CORR_EMPRESA,
        CORR_PROVEEDOR: this.model.CORR_PROVEEDOR,
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
            this.loadingVisible = false;
            this.popupVisiblePdf = true;
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
    }
  }

  gDataProveedorActuDocRowRemoving(e: any) {
    const isCanceled = new Promise((resolve, reject) => {
    if (this.model.ESTADO_SOLI_COTIZACION != 'DI') {
        this.loadingVisible = false;
        reject('No se puede eliminar el Documento, Debe estar en Digitado...');
        return;
    }
    this.loadingVisible = true;
    this.service
      .deleteCOM_PROVEEDOR_DOC(e.data)
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
        formData.append('CORR_PROVEEDOR', this.model.CORR_PROVEEDOR.toString());
        formData.append('CORR_DOCUMENTO', '0');
        formData.append('NOMBRE_DOCUMENTO', this.mDocumento.NOMBRE_DOCUMENTO.toString());
        formData.append('DESCRIPCION_DOCUMENTO', this.mDocumento.DESCRIPCION_DOCUMENTO.toString());
        formData.append('CORR_TIPO_DOCUMENTO', this.mDocumento.CORR_TIPO_DOCUMENTO.toString());
        formData.append('RUTA_DOCUMENTO', '-');
        formData.append('NOMBRE_ARCHIVO',  this.vNOMBRE_ARCHIVO);
        formData.append('FOTO_DOCUMENTO', this.fileDoc, this.fileDoc.name);
        this.service.insertDoc(formData).pipe(take(1)).subscribe(
          (response: any) => {
            if (response.Result) {
              this.notifyFx('Documento guardado con exito!', NotifyType.Success);
              this.LimpiarDoc();
              this.consultarDocumentos(this.model.CORR_PROVEEDOR);
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
        this.popupVisibleDoc = false;
      } else {
        this.notifyFx('Debe seleccionar un PDF con máximo de 10 MB de peso', NotifyType.Error);
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
      if (file.size<=10485760)
      {
        this.fileDoc = file;
        this.vNOMBRE_ARCHIVO = this.fileDoc.name;
      } else {
        this.notifyFx('Debe seleccionar un archivo con máximo de 10 MB de peso', NotifyType.Error);
      }
    }
  }

  selectedLookUpCORR_TIPO_DOCUMENTO(vRow: any): any {
    return vRow[0].CORR_TIPO_DOCUMENTO;
  }

  consultarDocumentos(vCORR_PROVEEDOR:any): void {
    this.service
    .getAllCOM_PROVEEDOR_DOC({ CORR_PROVEEDOR: vCORR_PROVEEDOR })
    .pipe(take(1))
    .subscribe({
      next: (response: any) => {
        if (response.Result) {
          this.mCOM_PROVEEDOR_DOC = response.Data;
        }
      },
      error: (error: any) => {
        this.notifyFx(error, NotifyType.Error);
      },

    });
  }
  //#endregion

}
