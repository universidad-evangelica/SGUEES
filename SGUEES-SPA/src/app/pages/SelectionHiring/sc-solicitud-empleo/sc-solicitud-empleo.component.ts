import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { MessageService } from 'primeng/api';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ScSolicitudEmpleo } from './models/sc-solicitud-empleo';
import { ScSolicitudEmpleoToken } from './models/sc-solicitud-empleo-token';
import {
	ScPersonaCompetencia,
	ScPersonaDatos,
	ScPersonaEstudio,
	ScPersonaExperiencia,
	ScPersonaFamiliar,
	ScPersonaFamiliarUees,
	ScPersonaHijo,
	ScPersonaIdioma,
} from './models/sc-persona-datos';
import { ScSolicitudEmpleoService } from './sc-solicitud-empleo.service';
import { confirm } from 'devextreme/ui/dialog';

@Component({
	selector: 'app-sc-solicitud-empleo',
	templateUrl: './sc-solicitud-empleo.component.html',
	styleUrls: ['./sc-solicitud-empleo.component.scss'],
})
export class ScSolicitudEmpleoComponent extends CBaseComponent implements OnInit, OnDestroy {
	//#region <Declarando Variales>
	//this para insertar otros iconos en options de la tabla
	customButtons: any[] = [];
	tokens: ScSolicitudEmpleoToken[] = [];
	tokenColumns: any[] = [];
	generandoToken = false;
	personaDatos: ScPersonaDatos | null = null;
	familiares: ScPersonaFamiliar[] = [];
	hijos: ScPersonaHijo[] = [];
	estudios: ScPersonaEstudio[] = [];
	idiomas: ScPersonaIdioma[] = [];
	competencias: ScPersonaCompetencia[] = [];
	experiencias: ScPersonaExperiencia[] = [];
	familiaresUees: ScPersonaFamiliarUees[] = [];
	cargandoPersonaDatos = false;
	fotoPersonaUrl: string | null = null;
	fotoPreviewVisible = false;
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
	}

	//#region <Inicializando Opciones>
	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	ngOnDestroy(): void {
		this.revocarFotoPersona();
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
				DUI: xModel.DUI,
				NOMBRE: xModel.NOMBRE,
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
				DUI: '',
				NOMBRE: '',
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

			case 'COMPLETADO':
				return 'estado-success';

			case 'ENVIADO':
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
		this.revocarFotoPersona();
		this.personaDatos = null;
		this.familiares = [];
		this.hijos = [];
		this.estudios = [];
		this.idiomas = [];
		this.competencias = [];
		this.experiencias = [];
		this.familiaresUees = [];
		this.cargandoPersonaDatos = false;
	}

	abrirFotoPreview(): void {
		if (!this.fotoPersonaUrl) {
			return;
		}
		this.fotoPreviewVisible = true;
	}

	cerrarFotoPreview(): void {
		this.fotoPreviewVisible = false;
	}

	@HostListener('document:keydown.escape')
	cerrarFotoPreviewConEscape(): void {
		if (this.fotoPreviewVisible) {
			this.cerrarFotoPreview();
		}
	}

	private revocarFotoPersona(): void {
		this.cerrarFotoPreview();
		if (this.fotoPersonaUrl) {
			URL.revokeObjectURL(this.fotoPersonaUrl);
			this.fotoPersonaUrl = null;
		}
	}

	private cargarFotoPersona(corrPersonaDatos: number, fotoUrl?: string): void {
		this.revocarFotoPersona();
		if (corrPersonaDatos <= 0 || !`${fotoUrl ?? ''}`.trim()) {
			return;
		}

		this.service
			.getPersonaFoto(corrPersonaDatos)
			.pipe(take(1))
			.subscribe({
				next: (blob) => {
					if (blob && blob.size > 0 && (blob.type || '').startsWith('image/')) {
						this.fotoPersonaUrl = URL.createObjectURL(blob);
					}
				},
				error: () => {
					this.fotoPersonaUrl = null;
				},
			});
	}

	textoLectura(valor: any): string {
		if (valor === null || valor === undefined) {
			return '—';
		}
		const texto = String(valor).trim();
		return texto.length > 0 ? texto : '—';
	}

	siNo(valor: boolean | null | undefined): string {
		return valor ? 'Sí' : 'No';
	}

	fechaLectura(valor: string | Date | null | undefined): string {
		if (!valor) {
			return '—';
		}
		const fecha = valor instanceof Date ? valor : new Date(valor);
		if (Number.isNaN(fecha.getTime())) {
			return '—';
		}
		const dd = String(fecha.getDate()).padStart(2, '0');
		const mm = String(fecha.getMonth() + 1).padStart(2, '0');
		const yyyy = fecha.getFullYear();
		return `${dd}/${mm}/${yyyy}`;
	}

	fechaHoraLectura(valor: string | Date | null | undefined): string {
		if (!valor) {
			return '—';
		}
		const fecha = valor instanceof Date ? valor : new Date(valor);
		if (Number.isNaN(fecha.getTime())) {
			return '—';
		}
		const dd = String(fecha.getDate()).padStart(2, '0');
		const mm = String(fecha.getMonth() + 1).padStart(2, '0');
		const yyyy = fecha.getFullYear();
		const hh = String(fecha.getHours()).padStart(2, '0');
		const mi = String(fecha.getMinutes()).padStart(2, '0');
		return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
	}

	montoLectura(valor: number | null | undefined): string {
		if (valor === null || valor === undefined || Number.isNaN(Number(valor))) {
			return '—';
		}
		return Number(valor).toLocaleString('es-SV', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		});
	}

	etiquetaFamiliar(tipo: string): string {
		switch ((tipo || '').toUpperCase()) {
			case 'PADRE':
				return 'Padre';
			case 'MADRE':
				return 'Madre';
			case 'ESPOSO':
				return 'Esposo(a)';
			default:
				return this.textoLectura(tipo);
		}
	}

	private asArray<T>(data: any): T[] {
		return Array.isArray(data) ? data : [];
	}

	private emptyResult() {
		return of({ Result: true, Data: [] } as any);
	}

	consultarPersonaDatos(): void {
		const corrPersonaDatos = this.model?.CORR_PERSONA_DATOS ?? 0;
		if (corrPersonaDatos <= 0) {
			this.limpiarPersonaDatos();
			return;
		}

		this.cargandoPersonaDatos = true;
		const coleccion = (controller: string) =>
			this.service.getPersonaColeccion(controller, corrPersonaDatos).pipe(catchError(() => this.emptyResult()));

		forkJoin({
			persona: this.service.getPersonaDatos(corrPersonaDatos),
			familiares: coleccion('SC_PERSONA_FAMILIAR'),
			hijos: coleccion('SC_PERSONA_HIJOS'),
			estudios: coleccion('SC_PERSONA_ESTUDIO'),
			idiomas: coleccion('SC_PERSONA_IDIOMAS'),
			competencias: coleccion('SC_PERSONA_COMPETENCIAS_TECNICAS'),
			experiencias: coleccion('SC_PERSONA_EXPERIENCIA_LABORAL'),
			familiaresUees: coleccion('SC_PERSONA_FAMILIAR_UEES'),
		})
			.pipe(take(1))
			.subscribe({
				next: (response) => {
					if (response.persona?.Result && response.persona?.Data) {
						this.personaDatos = response.persona.Data;
						this.cargarFotoPersona(corrPersonaDatos, this.personaDatos?.FOTO_URL);
					} else {
						this.personaDatos = null;
						this.revocarFotoPersona();
					}
					this.familiares = this.asArray(response.familiares?.Data);
					this.hijos = this.asArray(response.hijos?.Data);
					this.estudios = this.asArray(response.estudios?.Data);
					this.idiomas = this.asArray(response.idiomas?.Data);
					this.competencias = this.asArray(response.competencias?.Data);
					this.experiencias = this.asArray(response.experiencias?.Data);
					this.familiaresUees = this.asArray(response.familiaresUees?.Data);
					this.cargandoPersonaDatos = false;
				},
				error: (error: any) => {
					this.limpiarPersonaDatos();
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
			item.ESTADO_TOKEN === 'GENERADO' || item.ESTADO_TOKEN === 'ENVIADO'
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
		if (!this.service.esValido(this.model, this.notifyFx.bind(this))) {
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
		this.dataForm.instance.getEditor('DUI')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_PERSONA_DATOS')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ACTIVO')?.option('readOnly', true);
	}

	override habilitar(): void {
		setTimeout(() => this.aplicarEstadoCamposIdentidad());
	}

	private aplicarEstadoCamposIdentidad(): void {
		const personaCompleta = (this.model?.CORR_PERSONA_DATOS ?? 0) > 0;
		this.dataForm?.instance?.getEditor('DUI')?.option('readOnly', personaCompleta);
		this.dataForm?.instance?.getEditor('NOMBRE')?.option('readOnly', personaCompleta);
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
