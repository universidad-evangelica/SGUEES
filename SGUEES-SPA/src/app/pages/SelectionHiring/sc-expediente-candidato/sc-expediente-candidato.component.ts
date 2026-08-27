import { Component, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DxDataGridComponent } from 'devextreme-angular';
import { MessageService } from 'primeng/api';
import { forkJoin, of } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import {
	ScPersonaCompetencia,
	ScPersonaDatos,
	ScPersonaEstudio,
	ScPersonaExperiencia,
	ScPersonaFamiliar,
	ScPersonaFamiliarUees,
	ScPersonaHijo,
	ScPersonaIdioma,
} from '../sc-solicitud-empleo/models/sc-persona-datos';
import { ScSolicitudEmpleoService } from '../sc-solicitud-empleo/sc-solicitud-empleo.service';
import { ScExpedienteCandidato } from './models/sc-expediente-candidato';
import { ScExpedienteEntrevista } from './sc-expediente-entrevista/models/sc-expediente-entrevista';
import { ScExpedienteSolicitud } from './sc-expediente-solicitud/models/sc-expediente-solicitud';
import { ScExpedienteCandidatoService } from './sc-expediente-candidato.service';
import { confirm } from 'devextreme/ui/dialog';

@Component({
	selector: 'app-sc-expediente-candidato',
	templateUrl: './sc-expediente-candidato.component.html',
	styleUrls: ['./sc-expediente-candidato.component.scss'],
})
export class ScExpedienteCandidatoComponent extends CBaseComponent implements OnInit, OnDestroy {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;
	@ViewChild('gridSolicitudes', { static: false }) gridSolicitudes?: DxDataGridComponent;

	protected override etiquetaRegistro = 'el expediente de candidato';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 15;
	protected override mttoPageSizes = [15, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_EXPEDIENTE_CANDIDATO';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	/** Avatar del resumen: usa fotoPersonaUrl (misma carga que expediente completo). */
	solicitudes: ScExpedienteSolicitud[] = [];
	solicitudColumns: any[] = [];
	solicitudSearchText = '';

	/** Workspace expediente completo (slide-over desde la derecha). */
	workspaceCompletoVisible = false;
	workspaceCompletoAbierto = false;
	private workspaceCloseTimer: ReturnType<typeof setTimeout> | null = null;

	/** Workspace detalle solicitud asociada (slide-over desde abajo). */
	workspaceSolicitudVisible = false;
	workspaceSolicitudAbierto = false;
	corrExpedienteSolicitudSeleccionada = 0;
	solicitudSeleccionada: ScExpedienteSolicitud | null = null;
	private workspaceSolicitudCloseTimer: ReturnType<typeof setTimeout> | null = null;

	/** Tab Entrevistas (workspace solicitud). */
	entrevistas: ScExpedienteEntrevista[] = [];
	entrevistaColumns: any[] = [];
	entrevistaModel: ScExpedienteEntrevista = this.fillEntrevistaData();
	guardandoEntrevista = false;
	tipoEntrevistaOptions: Array<{ value: string; text: string }> = [];
	estadoEntrevistaOptions: Array<{ value: string; text: string }> = [];
	resultadoEntrevistaOptions: Array<{ value: string; text: string }> = [];

	get editandoEntrevista(): boolean {
		return (this.entrevistaModel?.CORR_EXPEDIENTE_ENTREVISTA ?? 0) > 0;
	}
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
	editarPersonaVisible = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de Expediente de Candidato';

	/** Muestra tarjeta resumen cuando el expediente ya tiene PK. */
	get mostrarResumenExpediente(): boolean {
		return (this.model?.CORR_EXPEDIENTE_CANDIDATO ?? 0) > 0;
	}

	/** Iniciales para avatar del resumen cuando no hay foto. */
	get inicialesPersonaResumen(): string {
		if (this.personaDatos) {
			const nombre = (this.personaDatos.NOMBRE1 || '').trim();
			const apellido = (this.personaDatos.APELLIDO1 || '').trim();
			const inicialNombre = nombre ? nombre.charAt(0).toUpperCase() : '';
			const inicialApellido = apellido ? apellido.charAt(0).toUpperCase() : '';
			const iniciales = `${inicialNombre}${inicialApellido}`;
			if (iniciales) {
				return iniciales;
			}
		}
		const nombreVista = (this.model?.NOMBRE_PERSONA || '').trim();
		if (!nombreVista) {
			return '?';
		}
		const partes = nombreVista.split(/\s+/).filter(Boolean);
		const a = partes[0]?.charAt(0).toUpperCase() ?? '';
		const b = partes.length > 1 ? partes[partes.length - 1].charAt(0).toUpperCase() : '';
		return `${a}${b}` || '?';
	}

	/** FECHA_ACTU con respaldo en FECHA_CREA para el encabezado. */
	get ultimaActualizacion(): Date | string | null | undefined {
		return this.model?.FECHA_ACTU || this.model?.FECHA_CREA || null;
	}

	/**
	 * CORR_SOLICITUD_EMPLEO para el modal de edición (misma API que sc-solicitud-empleo).
	 * Usa la primera solicitud asociada al expediente si existe.
	 */
	get corrSolicitudEmpleoParaEdicion(): number {
		const primera = this.solicitudes?.[0];
		return Number(primera?.CORR_SOLICITUD_EMPLEO ?? 0);
	}

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScExpedienteCandidatoService,
		private solicitudService: ScSolicitudEmpleoService,
		private messageService: MessageService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
		this.solicitudColumns = this.service.getSolicitudColumns();
		this.entrevistaColumns = this.service.getEntrevistaColumns();
		this.tipoEntrevistaOptions = this.service.getTipoEntrevistaOptions();
		this.estadoEntrevistaOptions = this.service.getEstadoEntrevistaOptions();
		this.resultadoEntrevistaOptions = this.service.getResultadoEntrevistaOptions();
	}

	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.consultar();
	}

	ngOnDestroy(): void {
		this.clearWorkspaceCloseTimer();
		this.clearWorkspaceSolicitudCloseTimer();
		this.revocarFotoPersona();
	}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
			this.solicitudes = [];
			this.limpiarBusquedaSolicitudes();
			this.cerrarWorkspaceCompleto(false);
			this.cerrarWorkspaceSolicitud(false);
			this.limpiarPersonaDatos();
		}
	}

	fillParam(xCORR_EXPEDIENTE_CANDIDATO?: number): any {
		return { CORR_EXPEDIENTE_CANDIDATO: xCORR_EXPEDIENTE_CANDIDATO ?? 0 };
	}

	override fillData(xModel?: ScExpedienteCandidato): ScExpedienteCandidato {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_EXPEDIENTE_CANDIDATO: xModel.CORR_EXPEDIENTE_CANDIDATO,
				CORR_PERSONA_DATOS: xModel.CORR_PERSONA_DATOS,
				FECHA_GENERACION: xModel.FECHA_GENERACION,
				ACTIVO: xModel.ACTIVO,
				DUI_PERSONA: xModel.DUI_PERSONA,
				NOMBRE_PERSONA: xModel.NOMBRE_PERSONA,
				USUARIO_CREA: xModel.USUARIO_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
			};
		}

		return {
			CORR_EMPRESA: 1,
			CORR_EXPEDIENTE_CANDIDATO: 0,
			CORR_PERSONA_DATOS: 0,
			FECHA_GENERACION: new Date(),
			ACTIVO: true,
			DUI_PERSONA: '',
			NOMBRE_PERSONA: '',
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: new Date(),
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: new Date(),
		};
	}

	consultar(resetPage = false): void {
		this.consultarMtto({
			load: () => this.service.getAll(this.fillParam()),
			onData: () => {
				this.ordenarModelsPorCorr();
				this.refrescarGridTrasCarga(resetPage);
			},
		});
	}

	private ordenarModelsPorCorr(): void {
		if (!Array.isArray(this.models)) {
			return;
		}
		this.models = [...this.models].sort(
			(a, b) => Number(b.CORR_EXPEDIENTE_CANDIDATO) - Number(a.CORR_EXPEDIENTE_CANDIDATO)
		);
	}

	private refrescarGridTrasCarga(resetPage = false): void {
		setTimeout(() => {
			this.dataGrid?.refreshData(resetPage);
		}, 0);
	}

	/**
	 * Carga solicitudes vinculadas al expediente abierto.
	 * Equivalente a consultarToken() en sc-solicitud-empleo (Bitácora).
	 */
	consultarSolicitudes(): void {
		const corrExpediente = this.model?.CORR_EXPEDIENTE_CANDIDATO ?? 0;
		if (corrExpediente <= 0) {
			this.solicitudes = [];
			return;
		}

		this.service
			.getAllSolicitud(corrExpediente)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.solicitudes = response.Data ?? [];
					} else {
						this.solicitudes = [];
					}
					if (this.solicitudSearchText) {
						setTimeout(() => this.onSolicitudSearchChanged({ value: this.solicitudSearchText }));
					}
				},
				error: () => {
					this.solicitudes = [];
				},
			});
	}

	override rowDblClick(e: any): void {
		const rowData = e?.data ?? e?.row?.data;
		if (rowData) {
			this.model = this.fillData(rowData);
			this.modelUpdate = this.fillData(rowData);
		}
		super.rowDblClick(e);
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
			this.bloquear();
			this.consultarSolicitudes();
			this.consultarPersonaDatos();
		});
	}

	onEditClick(e: any): void {
		if (!e?.row?.data) {
			return;
		}

		this.model = this.fillData(e.row.data);
		this.editarClick(e);
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
			this.habilitar();
			this.consultarSolicitudes();
			this.consultarPersonaDatos();
		});
	}

	override nuevo(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		super.nuevo();
		this.solicitudes = [];
		this.cerrarWorkspaceCompleto(false);
		this.cerrarWorkspaceSolicitud(false);
		this.limpiarPersonaDatos();
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
			this.habilitar();
		});
	}

	guardar(): void {
		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
			onSuccess: () => this.consultarSolicitudes(),
		});
	}

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_EXPEDIENTE_CANDIDATO === this.modelUpdate.CORR_EXPEDIENTE_CANDIDATO);
		this.solicitudes = [];
		this.limpiarBusquedaSolicitudes();
		this.cerrarWorkspaceCompleto(false);
		this.cerrarWorkspaceSolicitud(false);
		this.limpiarPersonaDatos();
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_EXPEDIENTE_CANDIDATO)),
		});
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_EXPEDIENTE_CANDIDATO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_PERSONA_DATOS')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_PERSONA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('DUI_PERSONA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FECHA_GENERACION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ACTIVO')?.option('readOnly', true);
	}

	override habilitar(): void {
		const esNuevo = this.banderaMtto === UpdateType.Add;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_EXPEDIENTE_CANDIDATO')?.option('readOnly', true);
			this.dataForm.instance.getEditor('CORR_PERSONA_DATOS')?.option('readOnly', !esNuevo);
			this.dataForm.instance.getEditor('NOMBRE_PERSONA')?.option('readOnly', true);
			this.dataForm.instance.getEditor('DUI_PERSONA')?.option('readOnly', true);
			this.dataForm.instance.getEditor('FECHA_GENERACION')?.option('readOnly', true);
			this.dataForm.instance.getEditor('ACTIVO')?.option('readOnly', true);
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_PERSONA_DATOS')?.focus();
		});
	}

	/** Texto seguro para campos de solo lectura en el resumen. */
	textoLectura(valor: unknown): string {
		if (valor === null || valor === undefined) {
			return '—';
		}
		const texto = String(valor).trim();
		return texto.length > 0 ? texto : '—';
	}

	/** Fecha/hora para metadatos del encabezado (dd/MM/yyyy HH:mm). */
	fechaHoraLectura(valor: Date | string | null | undefined): string {
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
		const min = String(fecha.getMinutes()).padStart(2, '0');
		return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
	}

	/** Abre workspace de expediente completo (cubre barra mtto + contenido). */
	verExpedienteCompleto(): void {
		if ((this.model?.CORR_EXPEDIENTE_CANDIDATO ?? 0) <= 0) {
			return;
		}
		this.cerrarWorkspaceSolicitud(false);
		this.clearWorkspaceCloseTimer();
		this.workspaceCompletoVisible = true;
		// Siguiente frame: aplica --open para animar entrada desde la derecha.
		requestAnimationFrame(() => {
			this.workspaceCompletoAbierto = true;
		});
		this.consultarPersonaDatos();
	}

	/** Cierra workspace con animación hacia la derecha y vuelve al resumen. */
	volverAlResumen(): void {
		this.cerrarWorkspaceCompleto(true);
	}

	private cerrarWorkspaceCompleto(animar: boolean): void {
		this.editarPersonaVisible = false;
		this.cerrarFotoPreview();
		this.clearWorkspaceCloseTimer();

		if (!animar || !this.workspaceCompletoVisible) {
			this.workspaceCompletoAbierto = false;
			this.workspaceCompletoVisible = false;
			return;
		}

		this.workspaceCompletoAbierto = false;
		// Tras la transición CSS se remueve del DOM (sin franja residual).
		this.workspaceCloseTimer = setTimeout(() => {
			this.workspaceCompletoVisible = false;
			this.workspaceCloseTimer = null;
		}, 300);
	}

	private clearWorkspaceCloseTimer(): void {
		if (this.workspaceCloseTimer) {
			clearTimeout(this.workspaceCloseTimer);
			this.workspaceCloseTimer = null;
		}
	}

	/** Abre workspace de detalle de una solicitud asociada (entra desde abajo). */
	onSolicitudRowClick(e: any): void {
		const rowData = e?.data as ScExpedienteSolicitud | undefined;
		const corr = Number(rowData?.CORR_EXPEDIENTE_SOLICITUD ?? 0);
		if (corr <= 0) {
			return;
		}
		// Ignora clics en elementos interactivos del pager/header si DevExtreme los propaga.
		if (e?.rowType && e.rowType !== 'data') {
			return;
		}

		this.cerrarWorkspaceCompleto(false);
		this.clearWorkspaceSolicitudCloseTimer();
		this.solicitudSeleccionada = rowData ?? null;
		this.corrExpedienteSolicitudSeleccionada = corr;
		this.nuevaEntrevista();
		this.workspaceSolicitudVisible = true;
		requestAnimationFrame(() => {
			this.workspaceSolicitudAbierto = true;
		});
		this.consultarEntrevistas();
	}

	/** Cierra workspace de solicitud y vuelve al resumen. */
	volverDesdeSolicitud(): void {
		this.cerrarWorkspaceSolicitud(true);
	}

	private cerrarWorkspaceSolicitud(animar: boolean): void {
		this.clearWorkspaceSolicitudCloseTimer();

		if (!animar || !this.workspaceSolicitudVisible) {
			this.workspaceSolicitudAbierto = false;
			this.workspaceSolicitudVisible = false;
			this.corrExpedienteSolicitudSeleccionada = 0;
			this.solicitudSeleccionada = null;
			this.entrevistas = [];
			this.nuevaEntrevista();
			return;
		}

		this.workspaceSolicitudAbierto = false;
		this.workspaceSolicitudCloseTimer = setTimeout(() => {
			this.workspaceSolicitudVisible = false;
			this.corrExpedienteSolicitudSeleccionada = 0;
			this.solicitudSeleccionada = null;
			this.entrevistas = [];
			this.nuevaEntrevista();
			this.workspaceSolicitudCloseTimer = null;
		}, 300);
	}

	private clearWorkspaceSolicitudCloseTimer(): void {
		if (this.workspaceSolicitudCloseTimer) {
			clearTimeout(this.workspaceSolicitudCloseTimer);
			this.workspaceSolicitudCloseTimer = null;
		}
	}

	/** Carga entrevistas de la solicitud abierta en el workspace. */
	consultarEntrevistas(): void {
		const corrExpediente = this.model?.CORR_EXPEDIENTE_CANDIDATO ?? 0;
		const corrSolicitud = this.solicitudSeleccionada?.CORR_SOLICITUD_EMPLEO ?? 0;
		if (corrExpediente <= 0 || corrSolicitud <= 0) {
			this.entrevistas = [];
			return;
		}

		this.service
			.getAllEntrevista(corrExpediente, corrSolicitud)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.entrevistas = response?.Result ? response.Data ?? [] : [];
				},
				error: () => {
					this.entrevistas = [];
				},
			});
	}

	fillEntrevistaData(xModel?: ScExpedienteEntrevista): ScExpedienteEntrevista {
		if (xModel) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_EXPEDIENTE_CANDIDATO: xModel.CORR_EXPEDIENTE_CANDIDATO,
				CORR_EXPEDIENTE_ENTREVISTA: xModel.CORR_EXPEDIENTE_ENTREVISTA,
				CORR_SOLICITUD_EMPLEO: xModel.CORR_SOLICITUD_EMPLEO,
				TIPO_ENTREVISTA: xModel.TIPO_ENTREVISTA,
				FECHA_ENTREVISTA: xModel.FECHA_ENTREVISTA,
				ENTREVISTADOR: xModel.ENTREVISTADOR,
				ESTADO_ENTREVISTA: xModel.ESTADO_ENTREVISTA,
				RESULTADO_ENTREVISTA: xModel.RESULTADO_ENTREVISTA ?? '',
				RESUMEN_ENTREVISTA: xModel.RESUMEN_ENTREVISTA ?? '',
			};
		}

		return {
			CORR_EMPRESA: this.model?.CORR_EMPRESA ?? 1,
			CORR_EXPEDIENTE_CANDIDATO: this.model?.CORR_EXPEDIENTE_CANDIDATO ?? 0,
			CORR_EXPEDIENTE_ENTREVISTA: 0,
			CORR_SOLICITUD_EMPLEO: this.solicitudSeleccionada?.CORR_SOLICITUD_EMPLEO ?? 0,
			TIPO_ENTREVISTA: '',
			FECHA_ENTREVISTA: new Date(),
			ENTREVISTADOR: '',
			ESTADO_ENTREVISTA: 'PROGRAMADA',
			RESULTADO_ENTREVISTA: '',
			RESUMEN_ENTREVISTA: '',
		};
	}

	nuevaEntrevista(): void {
		this.entrevistaModel = this.fillEntrevistaData();
	}

	editarEntrevista(row: ScExpedienteEntrevista): void {
		if (!row) {
			return;
		}
		this.entrevistaModel = this.fillEntrevistaData(row);
	}

	onEntrevistaRowClick(e: any): void {
		if (e?.rowType && e.rowType !== 'data') {
			return;
		}
		this.editarEntrevista(e?.data);
	}

	guardarEntrevista(): void {
		if (this.guardandoEntrevista) {
			return;
		}

		this.entrevistaModel.CORR_EXPEDIENTE_CANDIDATO = this.model?.CORR_EXPEDIENTE_CANDIDATO ?? 0;
		this.entrevistaModel.CORR_SOLICITUD_EMPLEO = this.solicitudSeleccionada?.CORR_SOLICITUD_EMPLEO ?? 0;

		if (!this.service.esValidoEntrevista(this.entrevistaModel, this.notifyFx.bind(this))) {
			return;
		}

		const esNuevo = (this.entrevistaModel.CORR_EXPEDIENTE_ENTREVISTA ?? 0) <= 0;
		this.guardandoEntrevista = true;
		const req = esNuevo
			? this.service.insertEntrevista(this.entrevistaModel)
			: this.service.updateEntrevista(this.entrevistaModel);

		req.pipe(take(1)).subscribe({
			next: (response: any) => {
				this.guardandoEntrevista = false;
				if (!response?.Result) {
					this.notifyFx(response?.ErrorMessage || 'No se pudo guardar la entrevista.', NotifyType.Error);
					return;
				}
				this.notifyFx(esNuevo ? 'Entrevista registrada.' : 'Entrevista actualizada.', NotifyType.Success);
				this.nuevaEntrevista();
				this.consultarEntrevistas();
			},
			error: (err: any) => {
				this.guardandoEntrevista = false;
				this.notifyFx(err?.error?.ErrorMessage || err?.message || 'Error al guardar la entrevista.', NotifyType.Error);
			},
		});
	}

	async eliminarEntrevista(row: ScExpedienteEntrevista): Promise<void> {
		const corr = Number(row?.CORR_EXPEDIENTE_ENTREVISTA ?? 0);
		const corrExpediente = this.model?.CORR_EXPEDIENTE_CANDIDATO ?? 0;
		if (corr <= 0 || corrExpediente <= 0) {
			return;
		}

		const ok = await confirm(
			`¿Eliminar la entrevista #${corr}?`,
			'Confirmar eliminación'
		);
		if (!ok) {
			return;
		}

		this.service
			.deleteEntrevista(corrExpediente, corr)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (!response?.Result) {
						this.notifyFx(response?.ErrorMessage || 'No se pudo eliminar la entrevista.', NotifyType.Error);
						return;
					}
					this.notifyFx('Entrevista eliminada.', NotifyType.Success);
					if (this.entrevistaModel.CORR_EXPEDIENTE_ENTREVISTA === corr) {
						this.nuevaEntrevista();
					}
					this.consultarEntrevistas();
				},
				error: (err: any) => {
					this.notifyFx(err?.error?.ErrorMessage || err?.message || 'Error al eliminar la entrevista.', NotifyType.Error);
				},
			});
	}

	consultarPersonaDatos(): void {
		const corrPersonaDatos = this.model?.CORR_PERSONA_DATOS ?? 0;
		if (corrPersonaDatos <= 0) {
			this.limpiarPersonaDatos();
			return;
		}

		this.cargandoPersonaDatos = true;
		const coleccion = (controller: string) =>
			this.solicitudService.getPersonaColeccion(controller, corrPersonaDatos).pipe(catchError(() => this.emptyResult()));

		forkJoin({
			persona: this.solicitudService.getPersonaDatos(corrPersonaDatos),
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

	abrirEditarPersona(): void {
		if (!this.permiteEdit || this.cargandoPersonaDatos || (this.personaDatos?.CORR_PERSONA_DATOS ?? 0) <= 0) {
			return;
		}
		this.editarPersonaVisible = true;
	}

	onPersonaDatosGuardados(): void {
		this.consultarPersonaDatos();
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
	onEscape(): void {
		if (this.fotoPreviewVisible) {
			this.cerrarFotoPreview();
			return;
		}
		// Escape no cierra el workspace (solo el botón Volver), según requerimiento.
	}

	private limpiarPersonaDatos(): void {
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

		this.solicitudService
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

	private asArray<T>(data: any): T[] {
		return Array.isArray(data) ? data : [];
	}

	private emptyResult() {
		return of({ Result: true, Data: [] } as any);
	}

	/** Filtra el grid hijo desde la búsqueda del encabezado. */
	onSolicitudSearchChanged(e: { value?: string }): void {
		this.gridSolicitudes?.instance?.searchByText(e?.value ?? '');
	}

	private limpiarBusquedaSolicitudes(): void {
		this.solicitudSearchText = '';
		this.gridSolicitudes?.instance?.searchByText('');
	}

	/** En pausa: alta manual desde esta pantalla pendiente; hoy se usa Asociar Expediente. */
	nuevaSolicitudPausa(): void {
		// Sin acción por ahora.
	}
}
