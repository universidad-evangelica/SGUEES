import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { MessageService } from 'primeng/api';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ScSolicitudEmpleo } from './models/sc-solicitud-empleo';
import { ScSolicitudEmpleoToken } from './models/sc-solicitud-empleo-token';
import { ScPersonaDatos } from './models/sc-persona-datos';
import { ScSolicitudEmpleoService } from './sc-solicitud-empleo.service';
import { confirm } from 'devextreme/ui/dialog';

@Component({
	selector: 'app-sc-solicitud-empleo',
	templateUrl: './sc-solicitud-empleo.component.html',
	styleUrls: ['./sc-solicitud-empleo.component.scss'],
})
export class ScSolicitudEmpleoComponent extends CBaseComponent implements OnInit {
	//#region <Declarando Variales>
	//this para insertar otros iconos en options de la tabla
	customButtons: any[] = [];
	tokens: ScSolicitudEmpleoToken[] = [];
	tokenColumns: any[] = [];
	generandoToken = false;
	personaDatos: ScPersonaDatos | null = null;
	personaDatosItems: any[] = [];
	cargandoPersonaDatos = false;
	// #endregion

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScSolicitudEmpleoService,
		private messageService: MessageService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
		this.tokenColumns = this.service.getTokenColumns();
		this.personaDatosItems = this.service.getPersonaDatosItems();
		//seccion customButtons en options
		// this.customButtons = [
		// 	{
		// 		//Reactivar
		// 		hint: 'Reactivar registro',
		// 		icon: 'refresh',
		// 		stylingMode: 'text',

		// 		visible: (e: any) =>
		// 			e.row?.data?.ACTIVO === false,

		// 		onClick: this.reactivar
		// 	},

		// 	{
		// 		//Desactivar
		// 		hint: 'Inactivar registro',
		// 		icon: 'close',
		// 		stylingMode: 'text',

		// 		visible: (e: any) =>
		// 			e.row?.data?.ACTIVO === true,

		// 		onClick: this.desactivar
		// 	}
		// ];
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
	fillParam(xCORR_SOLICITUD_EMPLEO?: number): any {
		if (xCORR_SOLICITUD_EMPLEO == undefined) {
			xCORR_SOLICITUD_EMPLEO = 0;
		}
		return {
			CORR_SOLICITUD_EMPLEO: xCORR_SOLICITUD_EMPLEO,
		};
	}

	override fillData(xModel?: ScSolicitudEmpleo): ScSolicitudEmpleo {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_SOLICITUD_EMPLEO: xModel.CORR_SOLICITUD_EMPLEO,
				FECHA_GENERACION: xModel.FECHA_GENERACION,
				CORREO_INVITACION: xModel.CORREO_INVITACION,
				CORR_PERSONA_DATOS: xModel.CORR_PERSONA_DATOS,
				ACTIVO: xModel.ACTIVO,
				USUARIO_CREA: xModel.USUARIO_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
			};
		} else {
			return {
				CORR_EMPRESA: 1,
				CORR_SOLICITUD_EMPLEO: 0,
				FECHA_GENERACION: new Date(),
				CORREO_INVITACION: '',
				CORR_PERSONA_DATOS: 0,
				ACTIVO: true,
				USUARIO_CREA: '',
				ESTACION_CREA: '',
				FECHA_CREA: new Date(),
				USUARIO_ACTU: '',
				ESTACION_ACTU: '',
				FECHA_ACTU: new Date(),
			};
		}
	}

	getEstadoClass(estado: string): string {

		switch ((estado || '').toUpperCase()) {

			case 'UTILIZADO':
				return 'estado-success';

			case 'PENDIENTE':
				return 'estado-info';

			case 'EXPIRADO':
				return 'estado-danger';

			case 'REVOCADO':
				return 'estado-warning';

			default:
				return 'estado-default';
		}

	}

	get tienePersonaDatos(): boolean {
		return (this.personaDatos?.CORR_PERSONA_DATOS ?? 0) > 0;
	}

	get nombreCompletoPersona(): string {
		if (!this.personaDatos) {
			return '';
		}

		return [this.personaDatos.NOMBRE1, this.personaDatos.NOMBRE2, this.personaDatos.APELLIDO1, this.personaDatos.APELLIDO2]
			.filter((parte) => !!parte && String(parte).trim().length > 0)
			.join(' ');
	}

	get inicialesPersona(): string {
		const nombre = (this.personaDatos?.NOMBRE1 || '').trim();
		const apellido = (this.personaDatos?.APELLIDO1 || '').trim();
		const inicialNombre = nombre ? nombre.charAt(0).toUpperCase() : '';
		const inicialApellido = apellido ? apellido.charAt(0).toUpperCase() : '';
		return `${inicialNombre}${inicialApellido}` || '?';
	}

	limpiarPersonaDatos(): void {
		this.personaDatos = null;
		this.cargandoPersonaDatos = false;
	}

	consultarPersonaDatos(): void {
		const corrPersonaDatos = this.model?.CORR_PERSONA_DATOS ?? 0;
		if (corrPersonaDatos <= 0) {
			this.limpiarPersonaDatos();
			return;
		}

		this.cargandoPersonaDatos = true;
		this.service
			.getPersonaDatos(corrPersonaDatos)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result && response.Data) {
						this.personaDatos = response.Data;
					} else {
						this.personaDatos = null;
					}
					this.cargandoPersonaDatos = false;
				},
				error: (error: any) => {
					this.personaDatos = null;
					this.cargandoPersonaDatos = false;
					this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
				},
			});
	}

	override nuevo(): void {
		super.nuevo();
		this.tokens = [];
		this.limpiarPersonaDatos();
	}

	override editarClick(e: any): void {
		super.editarClick(e);
		this.consultarPersonaDatos();
		this.consultarToken();
	}

	override rowDblClick(e: any): void {
		super.rowDblClick(e);
		this.consultarPersonaDatos();
		this.consultarToken();
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
					//this.notifyFx(error, NotifyType.Error);
					this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
				},
			});
	}

	consultarToken(): void {
		const corrSolicitudEmpleo = this.model?.CORR_SOLICITUD_EMPLEO ?? 0;
		if (corrSolicitudEmpleo <= 0) {
			this.tokens = [];
			return;
		}

		this.service
			.getAllToken(corrSolicitudEmpleo)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.tokens = response.Data ?? [];
					}
				},
				error: (error: any) => {
					this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
				},
			});
	}

	tabSelectionChanged(e: any): void {
		if (e.component.option('selectedIndex') === 1) {
			this.consultarToken();
		}
	}

	puedeGenerarToken(): boolean {
		if (!this.permiteEdit || this.generandoToken || (this.model?.CORR_SOLICITUD_EMPLEO ?? 0) <= 0) {
			return false;
		}

		if ((this.model?.CORR_PERSONA_DATOS ?? 0) > 0 || !this.model?.CORREO_INVITACION) {
			return false;
		}

		return this.modelUpdate?.CORREO_INVITACION === undefined ||
			this.model.CORREO_INVITACION === this.modelUpdate.CORREO_INVITACION;
	}

	async generarToken(): Promise<void> {
		if (!this.puedeGenerarToken()) {
			this.messageService.add({
				severity: 'warn',
				summary: 'Solicitud de empleo',
				detail: 'Guarde la solicitud y el correo de invitación antes de generar el token.',
			});
			return;
		}

		const tokenVigente = this.tokens.some((item) =>
			item.ESTADO_TOKEN === 'GENERADO' || item.ESTADO_TOKEN === 'PENDIENTE'
		);
		if (tokenVigente) {
			const aceptar = await confirm(
				'Existe un token vigente. Al generar uno nuevo, el anterior será revocado. ¿Desea continuar?',
				'Confirmación'
			);
			if (!aceptar) {
				return;
			}
		}

		this.generandoToken = true;
		this.loadingVisible = true;
		this.service
			.generarToken(this.model.CORR_SOLICITUD_EMPLEO)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.model.FECHA_GENERACION = response.Data?.FECHA_GENERACION ?? this.model.FECHA_GENERACION;
						this.modelUpdate.FECHA_GENERACION = this.model.FECHA_GENERACION;
						const index = this.models.findIndex((item: ScSolicitudEmpleo) =>
							item.CORR_SOLICITUD_EMPLEO === this.model.CORR_SOLICITUD_EMPLEO
						);
						if (index >= 0) {
							this.models[index] = {
								...this.models[index],
								FECHA_GENERACION: this.model.FECHA_GENERACION,
							};
						}
						this.messageService.add({
							severity: 'success',
							summary: 'Éxito',
							detail: 'Token generado y correo de invitación enviado.',
						});
						this.consultarToken();
					} else {
						this.messageService.add({ severity: 'error', summary: 'Error', detail: response.ErrorMessage });
					}
					this.generandoToken = false;
					this.loadingVisible = false;
				},
				error: (error: any) => {
					this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
					this.generandoToken = false;
					this.loadingVisible = false;
					this.consultarToken();
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
							//this.notifyFx('Registro creado con exito!', NotifyType.Success);
							this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Registro creado con exito!' });
						} else {
							//this.notifyFx(response.ErrorMessage, NotifyType.Error);
							this.messageService.add({ severity: 'error', summary: 'Error', detail: response.ErrorMessage });
						}
						this.loadingVisible = false;
					},
					error: (error: any) => {
						//this.notifyFx(error, NotifyType.Error);
						this.messageService.add({ severity: 'error', summary: 'Error', detail: error });

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
							const vIndex = this.models.findIndex((item: any) => item.CORR_SOLICITUD_EMPLEO === response.Data.CORR_SOLICITUD_EMPLEO);
							this.models[vIndex] = response.Data;
							this.AsignaStatus(UpdateType.Browse);
							//this.notifyFx('Registro modificado con exito!', NotifyType.Success);
							this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Registro modificado con exito!' });
						} else {
							//this.notifyFx(response.ErrorMessage, NotifyType.Error);
							this.messageService.add({ severity: 'error', summary: 'Error', detail: response.ErrorMessage });
						}
						this.loadingVisible = false;
					},
					error: (error: any) => {
						//this.notifyFx(error, NotifyType.Error);
						this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
						this.loadingVisible = false;
					},
				});
		}
	}

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_SOLICITUD_EMPLEO === this.modelUpdate.CORR_SOLICITUD_EMPLEO);
	}

	rowRemoving(e: any) {
		this.service
			.delete(this.fillParam(e.data.CORR_SOLICITUD_EMPLEO))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						//this.notifyFx('Registro eliminado con exito!', NotifyType.Success);
						this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Registro eliminado con exito!' });
						e.component.refresh();
					} else {
						e.cancel = true;
						//this.notifyFx(response.ErrorMessage, NotifyType.Error);
						this.messageService.add({ severity: 'error', summary: 'Error', detail: response.ErrorMessage });
					}
				},
				error: (error: any) => {
					e.cancel = true;
					//this.notifyFx(error, NotifyType.Error);
					this.messageService.add({ severity: 'error', summary: 'Error', detail: error });
				},
			});
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_SOLICITUD_EMPLEO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FECHA_GENERACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORREO_INVITACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_PERSONA_DATOS')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ACTIVO')?.option('readOnly', true);
	}

	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_SOLICITUD_EMPLEO')?.focus();
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}

	// desactivar = (e: any) => {
	// 	confirm('¿Está seguro que desea <b>inactivar</b> este registro?', 'Confirmación')
	// 		.then((aceptar: boolean) => {
	// 			if (!aceptar) {
	// 				return;
	// 			}
	// 	this.service
	// 		.desactivate(this.fillParam(e.row.data.CORR_TIPO_VACANTE))
	// 		.pipe(take(1))
	// 		.subscribe({
	// 			next: (response: any) => {
	// 				if (response.Result) {
	// 					//this.notifyFx('Registro inactivado!', NotifyType.Success);
	// 					this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Registro inactivado!' });
	// 					this.consultar();          // ← refresca para que el icono desaparezca
	// 			} else {
	// 				this.messageService.add({ severity: 'error', summary: 'Error', detail: response.ErrorMessage });
	// 			}
	// 		},
	// 			error: (error: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: error }),
	// 		});
	// 	})
	// }

	// reactivar = (e: any) => {
	// 	confirm('¿Está seguro que desea <b>reactivar</b> este registro?', 'Confirmación')
	// 		.then((aceptar: boolean) => {
	// 			if (!aceptar) {
	// 				return;
	// 			}					
	// 		this.service
	// 		.reactivate(this.fillParam(e.row.data.CORR_TIPO_VACANTE))
	// 		.pipe(take(1))
	// 		.subscribe({
	// 			next: (response: any) => {
	// 				if (response.Result) {
	// 					//this.notifyFx('Registro reactivado!', NotifyType.Success);
	// 					this.messageService.add({ severity: 'success', summary: 'Éxito', detail: 'Registro reactivado!' });
	// 					this.consultar();          // ← refresca para que el icono desaparezca
	// 			} else {
	// 				this.messageService.add({ severity: 'error', summary: 'Error', detail: response.ErrorMessage });
	// 			}
	// 		},
	// 			error: (error: any) => this.messageService.add({ severity: 'error', summary: 'Error', detail: error }),
	// 		});
	// 	})
	// }
}
