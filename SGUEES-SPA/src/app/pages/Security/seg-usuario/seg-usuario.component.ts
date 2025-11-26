import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { SegUsuario } from './models/seg-usuario';
import { SegUsuarioService } from './seg-usuario.service';

@Component({
	selector: 'app-seg-usuario',
	templateUrl: './seg-usuario.component.html',
	styleUrls: ['./seg-usuario.component.scss'],
})
export class SegUsuarioComponent extends CBaseComponent implements OnInit {
  //#region <Declarando Variales>
	mESTADO_USUARIO: any;
	mTIPO_USUARIO: any;
  mSEG_USUARIO_OPCION: any;
	readOnly = false;
	// #endregion
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: SegUsuarioService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
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
		this.getESTADO_USUARIO();
		this.getTIPO_USUARIO();
	}

	getESTADO_USUARIO() :void {
		this.appInfoService
			.getLookUp('SEG_USUARIO', 'GEN_LISTA', 'GetESTADO_USUARIO', undefined, environment.UrlCOMPRASAPI)
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
	getTIPO_USUARIO(): void {
		this.appInfoService
			.getLookUp('SEG_USUARIO', 'SEG_TIPO_USUARIO', 'GetTIPO_USUARIO', undefined, environment.UrlCOMPRASAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mTIPO_USUARIO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	//#endregion

	//#region <Metodos Mtto>
	fillParam(xLOGIN_SISTEMA?: string): any {
		if (xLOGIN_SISTEMA == undefined) {
			xLOGIN_SISTEMA = "";
		}
		return {
			LOGIN_SISTEMA: xLOGIN_SISTEMA,
		};
	}

	override fillData(xModel?: SegUsuario): SegUsuario {
		if (xModel !== undefined) {
			return {
				LOGIN_SISTEMA: xModel.LOGIN_SISTEMA,
				NOMBRE_USUARIO: xModel.NOMBRE_USUARIO,
				CORREO_ELECTRONICO: xModel.CORREO_ELECTRONICO,
				TIPO_USUARIO: xModel.TIPO_USUARIO,
				NOMBRE_TIPO_USUARIO: xModel.NOMBRE_TIPO_USUARIO,
				ESTADO_USUARIO: xModel.ESTADO_USUARIO,
				NOMBRE_ESTADO_USUARIO: xModel.NOMBRE_ESTADO_USUARIO,
				IDIOMA: xModel.IDIOMA,
				USUARIO_CREA: xModel.USUARIO_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
        DETALLE: xModel.DETALLE,
			};
		} else {
			return {
				LOGIN_SISTEMA: '',
				NOMBRE_USUARIO: '',
				CORREO_ELECTRONICO: '',
				TIPO_USUARIO: 0,
				NOMBRE_TIPO_USUARIO: '',
				ESTADO_USUARIO: 0,
				NOMBRE_ESTADO_USUARIO: '',
				IDIOMA: 'es-SV',
				USUARIO_CREA: '',
				FECHA_CREA: new Date(),
				ESTACION_CREA: '',
				USUARIO_ACTU: '',
				FECHA_ACTU: new Date(),
				ESTACION_ACTU: '',
        DETALLE: [],
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
  consultarSEG_USUARIO_OPCION() {
		this.service
			.getAllSEG_USUARIO_OPCION({ LOGIN_SISTEMA: this.model.LOGIN_SISTEMA})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mSEG_USUARIO_OPCION = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},

			});

	}

  override nuevo(): void {
    super.nuevo();
    this.consultarSEG_USUARIO_OPCION();
  }
  override editarClick(e: any) {
		super.editarClick(e);
		this.consultarSEG_USUARIO_OPCION();

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
						if (response.Result) {
							this.models.push(response.Data);
							this.model = response.Data;
							if (xTieneDetalle) {
                this.AsignaStatus(UpdateType.Update);
                data.LOGIN_SISTEMA = this.model.LOGIN_SISTEMA;
                xTieneDetalle(data);
              }else{
							  this.AsignaStatus(UpdateType.Browse);
							  this.notifyFx('Registro creado con exito!', NotifyType.Success);
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
						if (response.Result) {
							this.model = response.Data;
							const vIndex = this.models.findIndex((item: any) => item.LOGIN_SISTEMA === response.Data.LOGIN_SISTEMA);
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
		super.cancelar((item: any) => item.LOGIN_SISTEMA === this.modelUpdate.LOGIN_SISTEMA);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.LOGIN_SISTEMA))
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
		this.dataForm.instance.getEditor('LOGIN_SISTEMA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_USUARIO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CLAVE_USUARIO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CLAVE_USUARIO_SAL')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORREO_ELECTRONICO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('TIPO_USUARIO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTADO_USUARIO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('IDIOMA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_EMPLEADO')?.option('readOnly', true);
		this.readOnly = true;
	}

	override habilitar(): void {
		this.readOnly = false;
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('LOGIN_SISTEMA')?.focus();
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}
  selectedLookUpTIPO_USUARIO(vRow: any): any {
		return vRow[0].TIPO_USUARIO;
	}

  //#region "Detalle Opciones"
  gDataVenDocumentoDetaRowInserting(e: any) {
		const isCanceled = new Promise((resolve, reject) => {
			this.loadingVisible = true;

			let insertDeta = (data: any) => {
        // Esto parte es de revisar es para agregar la opcion al usuario con todo los permisos
        // if (e.data.LOGIN_SISTEMA === this.model.LOGIN_SISTEMA && data.NUEVO === false && data.MODIFICAR === false && data.ELIMINAR === false && data.IMPRIMIR === false) {
        //   data.SELECCION = false;
        // }
        // if (data.SELECCION === true && data.NUEVO === false && data.MODIFICAR === false && data.ELIMINAR === false && data.IMPRIMIR === false ) {
        //   data.NUEVO = true;
        //   data.MODIFICAR = true;
        //   data.ELIMINAR = true;
        //   data.IMPRIMIR = true;
        // }
				this.service
					.insertUpdateSEG_USUARIO_OPCION(data)
					.pipe(take(1))
					.subscribe({
						next: (response: any) => {
							if (response.Result) {
                this.mSEG_USUARIO_OPCION=response.Data;
								this.loadingVisible = false;
								this.notifyFx('Registro guardado con exito!', NotifyType.Success);
								resolve(false);
							}
						},
						error: (error: any) => {
							this.loadingVisible = false;
							this.notifyFx(error, NotifyType.Error);
							reject(error);
						},
					});
			};

			if (this.banderaMtto === UpdateType.Add) {
				if (!this.service.esValido(this.model, this.notifyFx)) {
					this.loadingVisible = false;
					reject('Debe completar la información del Usuario');
				}
				this.guardar(insertDeta, e.data);
			} else if (this.banderaMtto === UpdateType.Update) {
				e.data.LOGIN_SISTEMA = this.model.LOGIN_SISTEMA;
				insertDeta(e.data);
			}
		});
		e.cancel = isCanceled;
	}
  //#endregion
}
