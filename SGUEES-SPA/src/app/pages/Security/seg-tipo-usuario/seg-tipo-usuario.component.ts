import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { SegTipoUsuario } from './models/seg-tipo-usuario';
import { SegTipoUsuarioService } from './seg-tipo-usuario.service';

@Component({
	selector: 'app-seg-tipo-usuario',
	templateUrl: './seg-tipo-usuario.component.html',
	styleUrls: ['./seg-tipo-usuario.component.scss'],
})
export class SegTipoUsuarioComponent extends CBaseComponent implements OnInit {
  //#region <Declarando Variales>
  mSEG_TIPO_USUARIO_OPCION: any;
  readOnly = false;
  // #endregion
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: SegTipoUsuarioService
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
	}

	//#endregion

	//#region <Metodos Mtto>
	fillParam(xTIPO_USUARIO?: number): any {
		if (xTIPO_USUARIO == undefined) {
			xTIPO_USUARIO = 0;
		}
		return {
			TIPO_USUARIO: xTIPO_USUARIO,
		};
	}

	override fillData(xModel?: SegTipoUsuario): SegTipoUsuario {
		if (xModel !== undefined) {
			return {
				TIPO_USUARIO: xModel.TIPO_USUARIO,
				NOMBRE_TIPO_USUARIO: xModel.NOMBRE_TIPO_USUARIO,
				USUARIO_CREA: xModel.USUARIO_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
			};
		} else {
			return {
				TIPO_USUARIO: 0,
				NOMBRE_TIPO_USUARIO: '',
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

  override nuevo(): void {
    super.nuevo();
    this.consultarSEG_TIPO_USUARIO_OPCION();
  }
  override editarClick(e: any) {
		super.editarClick(e);
		this.consultarSEG_TIPO_USUARIO_OPCION();

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
                data.TIPO_USUARIO = this.model.TIPO_USUARIO;
                xTieneDetalle(data);
              }
              else{
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
							const vIndex = this.models.findIndex((item: any) => item.TIPO_USUARIO === response.Data.TIPO_USUARIO);
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
		super.cancelar((item: any) => item.TIPO_USUARIO === this.modelUpdate.TIPO_USUARIO);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.TIPO_USUARIO))
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
		this.dataForm.instance.getEditor('TIPO_USUARIO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_TIPO_USUARIO')?.option('readOnly', true);
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('TIPO_USUARIO')?.focus();
		});
	}
	//#endregion

  //#region "Detalle Opciones"
  consultarSEG_TIPO_USUARIO_OPCION() {
		this.service
			.getAllSEG_TIPO_USUARIO_OPCION({ TIPO_USUARIO: this.model.TIPO_USUARIO})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mSEG_TIPO_USUARIO_OPCION = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},

			});

	}
  gDataSegTipoUsuarioOpcionRowInserting(e: any) {
		const isCanceled = new Promise((resolve, reject) => {
			this.loadingVisible = true;

			let insertDeta = (data: any) => {
				this.service
					.insertUpdateSEG_TIPO_USUARIO_OPCION(data)
					.pipe(take(1))
					.subscribe({
						next: (response: any) => {
							if (response.Result) {
                this.mSEG_TIPO_USUARIO_OPCION=response.Data;
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
				e.data.TIPO_USUARIO = this.model.TIPO_USUARIO;
				insertDeta(e.data);
			}
		});
		e.cancel = isCanceled;
	}
  //#endregion
}
