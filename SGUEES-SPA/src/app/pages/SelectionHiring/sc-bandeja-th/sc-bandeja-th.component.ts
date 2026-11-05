import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { confirm } from 'devextreme/ui/dialog';
import { Observable, lastValueFrom } from 'rxjs';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { IResult } from 'src/app/FxAPI/IResult';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AppInfoService } from 'src/app/shared/services/app-info.service';

import {
	ScBandejaItem,
	ScBandejaKpi,
	ScBandejaTab,
	ScBandejaTipo,
} from './models/sc-bandeja-th-item';
import { BANDEJA_ESTADOS_REQUISICION, ScBandejaThService } from './sc-bandeja-th.service';

@Component({
  standalone: false,
	selector: 'app-sc-bandeja-th',
	templateUrl: './sc-bandeja-th.component.html',
	styleUrls: ['./sc-bandeja-th.component.scss'],
})
export class ScBandejaThComponent extends CBaseComponent implements OnInit {
	@ViewChild('gridBandeja', { static: false }) gridBandeja?: DxDataGridComponent;

	/** DataSource del grid en memoria. */
	models: any = [];

	selectedItem: ScBandejaItem | null = null;
	panelOpen = false;
	panelTab: 'RESUMEN' | 'HISTORIAL' = 'RESUMEN';
	bitacoraLoading = false;
	accionEnCurso = false;

	popupObservacionVisible = false;
	popupObservacionTitulo = 'Observación';
	popupObservacionHint = '';
	popupObservacionTexto = '';
	private observacionResolver: ((val: string | null) => void) | null = null;

	popupConfirmarMovVisible = false;
	// Qué hace: Variable de fecha para el popup de confirmación de movimiento.
	// Cómo lo hace: Se define como any para ser compatible con [(value)] de dx-date-box bajo strictTemplates.
	popupFechaEfectiva: any = null;
	// Qué hace: Variable de fecha de ingreso propuesta para contrataciones eventuales en el popup.
	// Cómo lo hace: Se define como any para ser compatible con [(value)] de dx-date-box bajo strictTemplates.
	popupFechaIngresoPropuesta: any = null;
	popupDetalleVisible = false;

	activeTab: ScBandejaTab = 'REQUISICIONES';

	filtroTipo: ScBandejaTipo | 'TODOS' = 'REQUISICION';
	filtroEstado = 'TODOS';
	filtroUnidad = 'TODOS';
	filtroBusqueda = '';
	// Qué hace: Variables de enlace para los filtros de rango de fechas de la bandeja.
	// Cómo lo hace: Se definen como any para permitir null sin violar el tipo Date | number | string de dx-date-box en el template.
	fechaDesde: any = null;
	fechaHasta: any = null;

	kpis: ScBandejaKpi[] = [];
	totalRequisicionesApi = 0;
	totalCandidatosApi = 0;
	totalContratacionesApi = 0;

	readonly tabs: Array<{ id: ScBandejaTab; label: string }> = [
		{ id: 'TODAS', label: 'Todas' },
		{ id: 'REQUISICIONES', label: 'Requisiciones' },
		{ id: 'CANDIDATOS', label: 'Candidatos' },
		{ id: 'CONTRATACIONES', label: 'Contrataciones' },
	];

	readonly tiposFiltro = [
		{ VALUE: 'TODOS', TEXT: 'Todos' },
		{ VALUE: 'REQUISICION', TEXT: 'Requisición' },
		{ VALUE: 'CANDIDATO', TEXT: 'Candidato / Postulante' },
		{ VALUE: 'CONTRATACION', TEXT: 'Contratación' },
	];

	readonly estadosFiltroRequisicion: Array<{ VALUE: string; TEXT: string }> = [
		{ VALUE: 'TODOS', TEXT: 'Todos' },
		...BANDEJA_ESTADOS_REQUISICION.map((e) => ({
			VALUE: String(e.CORR_ESTADO_REQUISICION),
			TEXT: e.ESTADO_REQUISICION,
		})),
	];

	/** Opción A: sin APLICA (va a Contrataciones). NO_APLICA queda en Candidatos. */
	readonly estadosFiltroCandidato: Array<{ VALUE: string; TEXT: string }> = [
		{ VALUE: 'TODOS', TEXT: 'Todos' },
		{ VALUE: 'POSTULANTE', TEXT: 'Postulante' },
		{ VALUE: 'CON_EXPEDIENTE', TEXT: 'Con expediente' },
		{ VALUE: 'EN_SELECCION', TEXT: 'En proceso de selección' },
		{ VALUE: 'NO_APLICA', TEXT: 'Rechazado' },
	];

	readonly estadosFiltroContratacion: Array<{ VALUE: string; TEXT: string }> = [
		{ VALUE: 'TODOS', TEXT: 'Todos' },
		{ VALUE: 'APLICA', TEXT: 'Seleccionado' },
		{ VALUE: 'LISTO_CREAR_USUARIO', TEXT: 'Listo para crear empleado' },
		{ VALUE: 'CONTRATADO', TEXT: 'Contratado' },
	];

	estadosFiltro: Array<{ VALUE: string; TEXT: string }> = this.estadosFiltroRequisicion;

	unidadesFiltro: Array<{ VALUE: string; TEXT: string }> = [{ VALUE: 'TODOS', TEXT: 'Todas' }];

	readonly pageSize = 15;
	readonly allowedPageSizes: (number | 'all')[] = [10, 15, 25, 50, 'all'];

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private navRouter: Router,
		private service: ScBandejaThService
	) {
		super(appInfoService, router);
	}

	ngOnInit(): void {
		this.prefetchTotales();
		this.configurarDataSource();
	}

	/** Totales para tabs/KPIs aunque el stage activo no sea Candidatos. */
	private prefetchTotales(): void {
		lastValueFrom(
			this.service.getRequisiciones({ PAGE: 1, PAGE_SIZE: 1, SORT_DESC: true })
		)
			.then((res) => {
				if (res?.Result) {
					this.totalRequisicionesApi = res.RowsAffected || 0;
					this.recalcularKpis();
				}
			})
			.catch(() => undefined);

		lastValueFrom(this.service.getCandidatos({ PAGE: 1, PAGE_SIZE: 1, SORT_DESC: true }))
			.then((res) => {
				if (res?.Result) {
					this.totalCandidatosApi = res.RowsAffected || 0;
					this.recalcularKpis();
				}
			})
			.catch(() => undefined);

		lastValueFrom(this.service.getContrataciones({ PAGE: 1, PAGE_SIZE: 1, SORT_DESC: true }))
			.then((res) => {
				if (res?.Result) {
					this.totalContratacionesApi = res.RowsAffected || 0;
					this.recalcularKpis();
				}
			})
			.catch(() => undefined);
	}

	get tabCounts(): Record<ScBandejaTab, number> {
		return {
			TODAS:
				this.totalRequisicionesApi + this.totalCandidatosApi + this.totalContratacionesApi,
			REQUISICIONES: this.totalRequisicionesApi,
			CANDIDATOS: this.totalCandidatosApi,
			CONTRATACIONES: this.totalContratacionesApi,
		};
	}

	get usaApiTodas(): boolean {
		return this.activeTab === 'TODAS';
	}

	get usaApiRequisiciones(): boolean {
		return this.activeTab === 'REQUISICIONES';
	}

	get usaApiCandidatos(): boolean {
		return this.activeTab === 'CANDIDATOS';
	}

	get usaApiContrataciones(): boolean {
		return this.activeTab === 'CONTRATACIONES';
	}

	get usaApiGrid(): boolean {
		return (
			this.usaApiTodas ||
			this.usaApiRequisiciones ||
			this.usaApiCandidatos ||
			this.usaApiContrataciones
		);
	}

	get puedeDictaminar(): boolean {
		const item = this.selectedItem;
		return (
			!!item &&
			item.TIPO === 'CANDIDATO' &&
			item.ESTADO_CICLO_CANDIDATO === 'EN_SELECCION' &&
			item.ESTADO_DECISION === 'PENDIENTE'
		);
	}

	// Qué hace: Determina si se puede confirmar el movimiento de personal en contrataciones.
	// Cómo lo hace: Valida que pertenezca a contrataciones y que aún no esté confirmado ni tenga empleado.
	// Qué hace: Identifica si la contratación seleccionada para confirmación es de tipo eventual.
	// Cómo lo hace: Evalúa el tipo de contratación por correlativo (2) o nombre ('EVENTUAL').
	get esEventualConfirmacion(): boolean {
		const item = this.selectedItem;
		if (!item) return false;
		if (item.CORR_TIPO_CONTRATACION === 2) return true;
		const nombre = `${item.NOMBRE_TIPO_CONTRATACION || ''}`.trim().toUpperCase();
		return nombre.includes('EVENTUAL');
	}

	get puedeConfirmarMovimiento(): boolean {
		const item = this.selectedItem;
		if (!item) return false;
		if (item.TIPO !== 'CONTRATACION' && !item.LISTO_CONTRATACION) return false;
		const esConfirmado = item.CONFIRMADO === true || Number(item.CONFIRMADO) === 1;
		const tieneEmpleado = Number(item.CORR_EMPLEADO) > 0;
		return !esConfirmado && !tieneEmpleado;
	}

	// Qué hace: Determina si el candidato seleccionado está listo para crear su usuario/empleado institucional.
	// Cómo lo hace: Valida que pertenezca a contrataciones, esté confirmado o en estado LISTO_CREAR_USUARIO y sin empleado asignado.
	get puedeCrearUsuario(): boolean {
		const item = this.selectedItem;
		if (!item || item.TIPO !== 'CONTRATACION') return false;
		const esAprobado = item.ESTADO_MOVIMIENTO === 'AP';
		const esConfirmado = item.CONFIRMADO === true || Number(item.CONFIRMADO) === 1;
		const tieneEmpleado = Number(item.CORR_EMPLEADO) > 0;
		return (
			(item.ESTADO_CICLO_CANDIDATO === 'LISTO_CREAR_USUARIO' || (esAprobado && esConfirmado)) &&
			!tieneEmpleado
		);
	}

	// Qué hace: Cambia la pestaña activa de la bandeja de TH y recarga los datos correspondientes.
	// Cómo lo hace: Actualiza activeTab, limpia los filtros de la grilla y consulta los registros del tab seleccionado.
	seleccionarTab(tab: ScBandejaTab): void {
		this.activeTab = tab;
		this.gridBandeja?.instance?.clearFilter();
		this.configurarDataSource();
	}

	// Qué hace: Limpia todos los filtros y búsquedas aplicados en la grilla.
	// Cómo lo hace: Invoca clearFilter() en la instancia de dx-data-grid.
	limpiarFiltros(): void {
		this.gridBandeja?.instance?.clearFilter();
	}

	buscar(): void {
		this.configurarDataSource();
	}

	onFocusedRowChanged(e: any): void {
		const key = e?.row?.key ?? e?.component?.option?.('focusedRowKey');
		const rowData = e?.row?.data as ScBandejaItem | undefined;
		if (rowData) {
			this.abrirPanel(rowData);
			return;
		}
		if (!key) {
			return;
		}
	}

	onRowClick(e: any): void {
		const item = e?.data as ScBandejaItem | undefined;
		if (!item) {
			return;
		}
		this.abrirPanel(item);
	}

	abrirPanel(item: ScBandejaItem): void {
		this.selectedItem = { ...item, HISTORIAL: item.HISTORIAL ? [...item.HISTORIAL] : [] };
		this.panelOpen = true;
		this.panelTab = 'RESUMEN';

		if (item.TIPO === 'REQUISICION' && item.CORR_REQUISICION_PERSONAL) {
			this.cargarBitacoraRequisicion(item.CORR_REQUISICION_PERSONAL);
		}
	}

	cerrarPanel(): void {
		this.panelOpen = false;
		this.selectedItem = null;
		this.bitacoraLoading = false;
	}

	setPanelTab(tab: 'RESUMEN' | 'HISTORIAL'): void {
		this.panelTab = tab;
	}

	// Qué hace: Despliega el modal interactivo con el detalle completo de la solicitud/candidato.
	// Cómo lo hace: Activa la bandera popupDetalleVisible en true para el registro seleccionado.
	accionVerDetalle(): void {
		if (!this.selectedItem) {
			return;
		}
		this.popupDetalleVisible = true;
	}

	/** JWT / menú: la opción destino debe incluir permiso R (AuthGuard también valida). */
	private tienePermisoLectura(urlOpcion: string): boolean {
		const permisos = this.appInfoService.getPermiso(urlOpcion);
		return typeof permisos === 'string' && permisos.includes('R');
	}

	accionVerFlujo(): void {
		this.panelTab = 'HISTORIAL';
	}

	// Qué hace: Calcula el texto de plazas disponibles para el modal de detalle.
	// Cómo lo hace: Resta plazas cubiertas del total de plazas de la solicitud.
	getPlazasDisponiblesText(): string {
		const total = Number(this.selectedItem?.CANTIDAD_PLAZAS) || 0;
		const cubiertas = Number(this.selectedItem?.PLAZAS_CUBIERTAS) || 0;
		const disponibles = Math.max(0, total - cubiertas);
		if (disponibles === 1) return '1 plaza disponible';
		if (disponibles > 1) return `${disponibles} plazas disponibles`;
		return total > 0 ? 'Plazas cubiertas' : '—';
	}

	// Qué hace: Calcula el porcentaje de plazas cubiertas para la barra de progreso del modal.
	// Cómo lo hace: Retorna el ratio cubiertas / total limitado entre 0 y 100.
	getPorcentajePlazas(): number {
		const total = Number(this.selectedItem?.CANTIDAD_PLAZAS) || 0;
		const cubiertas = Number(this.selectedItem?.PLAZAS_CUBIERTAS) || 0;
		if (total <= 0) return 0;
		return Math.min(100, Math.round((cubiertas / total) * 100));
	}

	// Qué hace: Cierra el modal y abre la pestaña de historial en el panel lateral.
	// Cómo lo hace: Oculta el popup de detalle y conmuta panelTab a 'HISTORIAL'.
	verFlujoDesdeModal(): void {
		this.popupDetalleVisible = false;
		this.accionVerFlujo();
	}

	/**
	 * TODO (PENDIENTE-ACCIONES.md): ScExpedienteCandidatoService.asociarSolicitud
	 */
	accionAsociarExpediente(): void {
		if (!this.selectedItem || this.selectedItem.ESTADO_CICLO_CANDIDATO !== 'POSTULANTE') {
			return;
		}
		this.notifyFx(
			`Asociar expediente: pendiente de conectar (próxima fase).`,
			NotifyType.Warning,
			{ raw: true }
		);
	}

	/**
	 * TODO (PENDIENTE-ACCIONES.md): ScExpedienteCandidatoService.activarProcesoSeleccion
	 * (estado expediente 2 → EN_SELECCION en todas las requisiciones del expediente)
	 */
	accionActivarSeleccion(): void {
		if (!this.selectedItem || this.selectedItem.ESTADO_CICLO_CANDIDATO !== 'CON_EXPEDIENTE') {
			return;
		}
		this.notifyFx(
			`Activar proceso de selección: pendiente de conectar (próxima fase).`,
			NotifyType.Warning,
			{ raw: true }
		);
	}

	// Qué hace: Registra el dictamen de Aplica o No aplica para un candidato en selección.
	// Cómo lo hace: Solicita confirmación u observación obligatoria, invoca el servicio de decisión y refresca los datos y contadores de la bandeja.
	async accionDictamen(aplica: boolean): Promise<void> {
		if (!this.puedeDictaminar || !this.selectedItem || this.accionEnCurso) {
			return;
		}

		const item = this.selectedItem;
		let observacion: string | undefined;

		// Qué hace: Solicita el motivo obligatorio cuando el candidato es rechazado o confirmación para movimiento de personal.
		// Cómo lo hace: Muestra el modal de observación con título "Rechazado" o confirmación para movimiento de personal.
		if (!aplica) {
			observacion = await this.pedirObservacion(
				'Rechazado',
				'Indique el motivo. La observación es obligatoria para rechazar al candidato.'
			);
			if (observacion == null) {
				return;
			}
			if (!observacion.trim()) {
				this.notifyFx('La observación es obligatoria para rechazar al candidato.', NotifyType.Warning, {
					raw: true,
				});
				return;
			}
		} else {
			const ok = await confirm(
				`¿Confirma seleccionar a ${item.NOMBRE_CANDIDATO || item.CODIGO} para ejecutar movimiento de personal?`,
				'Ejecutar movimiento personal'
			);
			if (!ok) {
				return;
			}
		}

		this.accionEnCurso = true;
		try {
			const response = await lastValueFrom(
				this.service.decideCandidato({
					CORR_REQUISICION_PERSONAL: item.CORR_REQUISICION_PERSONAL || 0,
					CORR_SOLICITUD_EMPLEO: item.CORR_SOLICITUD_EMPLEO || 0,
					CORR_EXPEDIENTE_CANDIDATO: item.CORR_EXPEDIENTE_CANDIDATO || 0,
					ESTADO_DECISION: aplica ? 'APLICA' : 'NO_APLICA',
					OBSERVACION_DECISION: observacion,
				})
			);

			if (!response.Result) {
				this.notifyFx(
					response.ErrorMessage || 'No se pudo registrar el dictamen.',
					NotifyType.Error,
					{ raw: true }
				);
				return;
			}

			this.notifyFx(
				aplica
					? 'Candidato seleccionado para movimiento de personal.'
					: 'Candidato registrado como rechazado.',
				NotifyType.Success,
				{ raw: true }
			);
			this.cerrarPanel();
			this.prefetchTotales();
			this.configurarDataSource();
		} catch (error: any) {
			const msg =
				error?.error?.ErrorMessage || error?.message || 'Error al registrar el dictamen.';
			this.notifyFx(msg, NotifyType.Error, {
				raw: true,
			});
		} finally {
			this.accionEnCurso = false;
		}
	}

	// Qué hace: Despliega el popup para solicitar observación al usuario.
	// Cómo lo hace: Retorna una Promise resuelta al confirmar o cancelar el modal.
	private pedirObservacion(titulo: string, hint?: string): Promise<string | null> {
		this.popupObservacionTitulo = titulo;
		this.popupObservacionHint =
			hint || 'Puede indicar un comentario. Si lo deja vacío se usará el texto automático.';
		this.popupObservacionTexto = '';
		this.popupObservacionVisible = true;

		return new Promise((resolve) => {
			this.observacionResolver = resolve;
		});
	}

	// Qué hace: Confirma y devuelve el texto de la observación escrita.
	// Cómo lo hace: Resuelve la promesa pendiente y cierra el popup.
	confirmarPopupObservacion(): void {
		const texto = this.popupObservacionTexto ?? '';
		const resolve = this.observacionResolver;
		this.observacionResolver = null;
		this.popupObservacionVisible = false;
		this.popupObservacionTexto = '';
		resolve?.(texto);
	}

	// Qué hace: Cancela la captura de observación.
	// Cómo lo hace: Resuelve la promesa con null y cierra el popup.
	cancelarPopupObservacion(): void {
		if (!this.observacionResolver) {
			this.popupObservacionVisible = false;
			return;
		}
		const resolve = this.observacionResolver;
		this.observacionResolver = null;
		this.popupObservacionVisible = false;
		this.popupObservacionTexto = '';
		resolve(null);
	}

	// Qué hace: Abre el modal para capturar o validar la fecha efectiva antes de confirmar.
	// Cómo lo hace: Precarga la fecha si ya venía registrada en BD y despliega el popup.
	abrirPopupConfirmarMov(): void {
		const item = this.selectedItem;
		if (!item || this.accionEnCurso) {
			return;
		}

		const corrMov = Number(item.CORR_MOVIMIENTO_PERSONAL) || 0;
		if (corrMov <= 0) {
			this.notifyFx(
				'No se encontró un movimiento de personal vinculado a este candidato.',
				NotifyType.Warning,
				{ raw: true }
			);
			return;
		}

		if (item.CONFIRMADO === true || Number(item.CONFIRMADO) === 1) {
			this.notifyFx(
				'El movimiento de personal ya está confirmado.',
				NotifyType.Warning,
				{ raw: true }
			);
			return;
		}

		// Precargar fecha si ya existe en base de datos
		this.popupFechaEfectiva = item.FECHA_EFECTIVA ?? null;
		this.popupFechaIngresoPropuesta = item.FECHA_INGRESO_PROPUESTA ?? item.FECHA_EFECTIVA ?? null;
		this.popupConfirmarMovVisible = true;
	}

	// Qué hace: Cancela y cierra el modal de confirmación de movimiento.
	// Cómo lo hace: Oculta el popup y limpia el valor temporal de fecha.
	cancelarPopupConfirmarMov(): void {
		this.popupConfirmarMovVisible = false;
		this.popupFechaEfectiva = null;
		this.popupFechaIngresoPropuesta = null;
	}

	// Qué hace: Ejecuta la confirmación del movimiento de personal con la fecha efectiva indicada en el modal.
	// Cómo lo hace: Valida fecha obligatoria, envía la petición al API y actualiza el estado en memoria a 'Listo para crear empleado'.
	async confirmarPopupConfirmarMov(): Promise<void> {
		const item = this.selectedItem;
		if (!item || this.accionEnCurso) {
			return;
		}

		// Alerta obligatoria si es eventual y no tiene fecha de ingreso propuesta
		if (this.esEventualConfirmacion && !this.popupFechaIngresoPropuesta) {
			this.notifyFx(
				'Debe indicar la fecha de ingreso propuesta para la contratación eventual.',
				NotifyType.Warning,
				{ raw: true }
			);
			return;
		}

		// Alerta obligatoria si no tiene fecha efectiva
		if (!this.popupFechaEfectiva) {
			this.notifyFx(
				'Debe indicar la fecha efectiva antes de confirmar el movimiento.',
				NotifyType.Warning,
				{ raw: true }
			);
			return;
		}

		const corrMov = Number(item.CORR_MOVIMIENTO_PERSONAL) || 0;
		this.accionEnCurso = true;
		try {
			const response = await lastValueFrom(
				this.service.confirmarMovimientoPersonal({
					CORR_MOVIMIENTO_PERSONAL: corrMov,
					FECHA_EFECTIVA: this.popupFechaEfectiva,
					FECHA_INGRESO_PROPUESTA: this.esEventualConfirmacion
						? this.popupFechaIngresoPropuesta
						: undefined,
				})
			);

			if (!response.Result) {
				this.notifyFx(
					response.ErrorMessage || 'No se pudo confirmar el movimiento.',
					NotifyType.Error,
					{ raw: true }
				);
				return;
			}

			this.notifyFx(
				'El movimiento se confirmó correctamente.',
				NotifyType.Success,
				{ raw: true }
			);

			// Qué hace: Actualiza la fila en el array models y el panel lateral en memoria tras confirmar.
			// Cómo lo hace: Busca el índice en this.models por ID o CORR_MOVIMIENTO_PERSONAL, reemplaza sus propiedades y reasigna el arreglo para refrescar la grilla sin GetAll.
			const idx = this.models.findIndex(
				(m) => m.ID === item.ID || (m.CORR_MOVIMIENTO_PERSONAL && m.CORR_MOVIMIENTO_PERSONAL === corrMov)
			);
			if (idx !== -1) {
				this.models[idx] = {
					...this.models[idx],
					FECHA_EFECTIVA: this.popupFechaEfectiva,
					FECHA_INGRESO_PROPUESTA: this.esEventualConfirmacion
						? this.popupFechaIngresoPropuesta
						: this.models[idx].FECHA_INGRESO_PROPUESTA,
					CONFIRMADO: true,
					ESTADO: 'Listo para crear empleado',
					ESTADO_TONE: 'listo-usuario',
					ESTADO_CICLO_CANDIDATO: 'LISTO_CREAR_USUARIO',
					CORR_ESTADO_EXPEDIENTE: 4,
					LISTO_CONTRATACION: false,
				};
				this.models = [...this.models];
			}

			item.FECHA_EFECTIVA = this.popupFechaEfectiva;
			if (this.esEventualConfirmacion) {
				item.FECHA_INGRESO_PROPUESTA = this.popupFechaIngresoPropuesta;
			}
			item.CONFIRMADO = true;
			item.ESTADO = 'Listo para crear empleado';
			item.ESTADO_TONE = 'listo-usuario';
			item.ESTADO_CICLO_CANDIDATO = 'LISTO_CREAR_USUARIO';
			item.CORR_ESTADO_EXPEDIENTE = 4;
			item.LISTO_CONTRATACION = false;

			this.popupConfirmarMovVisible = false;
			this.popupFechaEfectiva = null;
			this.popupFechaIngresoPropuesta = null;

			// Si el filtro de estado estaba en 'APLICA', cambiarlo a 'TODOS' para que el registro se mantenga visible
			if (this.filtroEstado === 'APLICA') {
				this.filtroEstado = 'TODOS';
			}

			this.prefetchTotales();
			// Refrescar grilla sin cerrar panel ni perder selección
			this.gridBandeja?.instance?.repaint();
			this.gridBandeja?.instance?.refresh();
		} catch (error: any) {
			const msg =
				error?.error?.ErrorMessage || error?.message || 'Error al confirmar el movimiento.';
			this.notifyFx(msg, NotifyType.Error, { raw: true });
		} finally {
			this.accionEnCurso = false;
		}
	}

	// Qué hace: Ejecuta la contratación institucional del candidato para crear su usuario y empleado institucional.
	// Cómo lo hace: Pide confirmación al usuario, invoca el endpoint ContratarEmpleado en SC_BANDEJA_TH y actualiza en memoria a estado Contratado.
	async crearUsuario(): Promise<void> {
		const item = this.selectedItem;
		if (!item || this.accionEnCurso) return;

		const corrMov = Number(item.CORR_MOVIMIENTO_PERSONAL) || 0;
		if (corrMov <= 0) {
			this.notifyFx(
				'Seleccione un registro con movimiento personal válido.',
				NotifyType.Warning,
				{ raw: true }
			);
			return;
		}

		const nombre = item.NOMBRE_CANDIDATO || item.DESCRIPCION || 'el candidato';
		const ok = await confirm(
			`¿Está seguro de crear el empleado institucional para <strong>${nombre}</strong>?`,
			'Crear empleado'
		);
		if (!ok) return;

		this.accionEnCurso = true;
		try {
			const response = await lastValueFrom(
				this.service.contratarEmpleado({ CORR_MOVIMIENTO_PERSONAL: corrMov })
			);

			if (!response.Result) {
				this.notifyFx(
					response.ErrorMessage || 'Error al crear el usuario/empleado.',
					NotifyType.Error,
					{ raw: true }
				);
				return;
			}

			this.notifyFx('Usuario y empleado creados exitosamente.', NotifyType.Success, { raw: true });

			// Parchear en memoria (estandar-sin-getall-despues-guardar)
			const data = response.Data;
			const corrEmpleado = Number(data?.CORR_EMPLEADO) || 1;
			const corrBase = item.CORR_EXPEDIENTE_CANDIDATO || item.CORR_SOLICITUD_EMPLEO || 0;

			// Qué hace: Actualiza la fila en el array models y el panel lateral tras crear empleado.
			// Cómo lo hace: Busca el índice en this.models, actualiza código y estados y reasigna el arreglo para reflejar 'Contratado' sin GetAll.
			const idx = this.models.findIndex(
				(m) => m.ID === item.ID || (m.CORR_MOVIMIENTO_PERSONAL && m.CORR_MOVIMIENTO_PERSONAL === corrMov)
			);
			if (idx !== -1) {
				this.models[idx] = {
					...this.models[idx],
					CORR_EMPLEADO: corrEmpleado,
					CODIGO: `CON-${corrBase}`,
					ESTADO: 'Contratado',
					ESTADO_TONE: 'cerrada',
					ESTADO_CICLO_CANDIDATO: 'CONTRATADO',
					CORR_ESTADO_EXPEDIENTE: 5,
					REQUIERE_ATENCION: false,
				};
				this.models = [...this.models];
			}

			item.CORR_EMPLEADO = corrEmpleado;
			// Qué hace: actualiza el código visible al prefijo de contratación sin CAN al oficializarse como contratado.
			// Cómo lo hace: concatena 'CON-' con el correlativo base del expediente/solicitud.
			item.CODIGO = `CON-${corrBase}`;
			item.ESTADO = 'Contratado';
			item.ESTADO_TONE = 'cerrada';
			item.ESTADO_CICLO_CANDIDATO = 'CONTRATADO';
			item.CORR_ESTADO_EXPEDIENTE = 5;
			item.REQUIERE_ATENCION = false;

			if (this.filtroEstado === 'LISTO_CREAR_USUARIO') {
				this.filtroEstado = 'TODOS';
			}

			this.prefetchTotales();
			this.gridBandeja?.instance?.repaint();
			this.gridBandeja?.instance?.refresh();
		} catch (error: any) {
			const msg =
				error?.error?.ErrorMessage || error?.message || 'Error al crear el usuario.';
			this.notifyFx(msg, NotifyType.Error, { raw: true });
		} finally {
			this.accionEnCurso = false;
		}
	}

	// Qué hace: Devuelve el texto legible del tipo de registro.
	// Cómo lo hace: Evalúa el tipo de elemento soportando null o undefined de forma segura.
	tipoLabel(tipo?: ScBandejaTipo | null, item?: ScBandejaItem | null): string {
		if (tipo === 'CANDIDATO' && item?.ESTADO_CICLO_CANDIDATO === 'POSTULANTE') {
			return 'Postulante';
		}
		switch (tipo) {
			case 'REQUISICION':
				return 'Requisición';
			case 'CANDIDATO':
				return 'Candidato';
			case 'CONTRATACION':
				return 'Contratación';
			default:
				return tipo || '';
		}
	}

	// Qué hace: Devuelve el identificador del icono según el tipo de registro.
	// Cómo lo hace: Evalúa el tipo de elemento soportando null o undefined de forma segura.
	tipoIcon(tipo?: ScBandejaTipo | null, item?: ScBandejaItem | null): string {
		if (tipo === 'CANDIDATO' && item?.ESTADO_CICLO_CANDIDATO === 'POSTULANTE') {
			return 'user';
		}
		switch (tipo) {
			case 'REQUISICION':
				return 'doc';
			case 'CANDIDATO':
				return 'user';
			case 'CONTRATACION':
				return 'card';
			default:
				return 'info';
		}
	}

	// Qué hace: Devuelve las clases CSS del chip de estado según el tipo de solicitud.
	// Cómo lo hace: Evalúa si es requisición o candidato/contratación y retorna la clase correspondiente, soportando null de forma segura.
	estadoChipClass(item?: ScBandejaItem | null): string {
		if (!item) return 'bandeja-estado-chip';
		if (item.TIPO === 'REQUISICION') {
			return `estado-req-chip ${this.service.getEstadoRequisicionBadgeClass(item.CORR_ESTADO_REQUISICION)}`;
		}
		return `bandeja-estado-chip bandeja-estado--${item.ESTADO_TONE || 'borrador'}`;
	}

	formatSalario(valor?: number): string {
		if (valor == null || isNaN(Number(valor))) {
			return '—';
		}
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			minimumFractionDigits: 2,
		}).format(Number(valor));
	}

	formatFecha(valor?: string | Date): string {
		if (!valor) {
			return '—';
		}
		const d = valor instanceof Date ? valor : new Date(valor);
		if (isNaN(d.getTime())) {
			return String(valor);
		}
		const dd = String(d.getDate()).padStart(2, '0');
		const mm = String(d.getMonth() + 1).padStart(2, '0');
		const yyyy = d.getFullYear();
		const hh = String(d.getHours()).padStart(2, '0');
		const mi = String(d.getMinutes()).padStart(2, '0');
		if (hh === '00' && mi === '00') {
			return `${dd}/${mm}/${yyyy}`;
		}
		return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
	}

	// Qué hace: Carga los registros del tab activo en memoria y activa el filtrado y búsqueda nativos de DevExtreme.
	// Cómo lo hace: Consulta el servicio con el tab actual, mapea las filas a ScBandejaItem y actualiza this.models.
	private configurarDataSource(): void {
		this.cerrarPanel();
		this.gridBandeja?.instance?.beginCustomLoading('Cargando registros...');

		let peticion: Observable<IResult>;
		switch (this.activeTab) {
			case 'TODAS':
				peticion = this.service.getTodas({ PAGE: 1, PAGE_SIZE: 500, SORT_DESC: true });
				break;
			case 'REQUISICIONES':
				peticion = this.service.getRequisiciones({ PAGE: 1, PAGE_SIZE: 500, SORT_DESC: true });
				break;
			case 'CANDIDATOS':
				peticion = this.service.getCandidatos({ PAGE: 1, PAGE_SIZE: 500, SORT_DESC: true });
				break;
			case 'CONTRATACIONES':
				peticion = this.service.getContrataciones({ PAGE: 1, PAGE_SIZE: 500, SORT_DESC: true });
				break;
		}

		peticion.subscribe({
			next: (res) => {
				this.gridBandeja?.instance?.endCustomLoading();
				if (!res?.Result) {
					this.models = [];
					this.recalcularKpis();
					return;
				}
				const data = res.Data || [];
				if (this.activeTab === 'TODAS') {
					this.models = data.map((r: any) => this.service.mapTodasToBandejaItem(r));
				} else if (this.activeTab === 'REQUISICIONES') {
					this.models = data.map((r: any) => this.service.mapRequisicionToBandejaItem(r));
					this.totalRequisicionesApi = res.RowsAffected || this.models.length;
				} else if (this.activeTab === 'CANDIDATOS') {
					this.models = data.map((r: any) => this.service.mapCandidatoToBandejaItem(r));
					this.totalCandidatosApi = res.RowsAffected || this.models.length;
				} else {
					this.models = data.map((r: any) => this.service.mapContratacionToBandejaItem(r));
					this.totalContratacionesApi = res.RowsAffected || this.models.length;
				}
				this.recalcularKpis();
			},
			error: (err) => {
				this.gridBandeja?.instance?.endCustomLoading();
				this.models = [];
				this.notifyFx(err?.message || 'Error al cargar los registros.', NotifyType.Error, {
					raw: true,
				});
			},
		});
	}

	private cargarBitacoraRequisicion(corr: number): void {
		this.bitacoraLoading = true;
		this.service.getBitacoraRequisicion(corr).subscribe({
			next: (response) => {
				this.bitacoraLoading = false;
				if (!this.selectedItem || this.selectedItem.CORR_REQUISICION_PERSONAL !== corr) {
					return;
				}
				if (!response.Result) {
					this.notifyFx(
						response.ErrorMessage || 'No se pudo cargar la bitácora.',
						NotifyType.Warning,
						{ raw: true }
					);
					return;
				}
				this.selectedItem = {
					...this.selectedItem,
					HISTORIAL: this.service.mapBitacoraToHistorial(response.Data || []),
				};
			},
			error: () => {
				this.bitacoraLoading = false;
				this.notifyFx('Error al cargar bitácora de la requisición.', NotifyType.Error, {
					raw: true,
				});
			},
		});
	}

	private recalcularKpis(): void {
		this.kpis = [
			{
				KEY: 'REQ',
				LABEL: 'Requisiciones',
				VALUE: this.totalRequisicionesApi,
				SUBLABEL: 'Desde base de datos',
				TONE: 'info',
				ICON: 'doc',
			},
			{
				KEY: 'CAN',
				LABEL: 'Candidatos',
				VALUE: this.totalCandidatosApi,
				SUBLABEL: 'Ciclo de selección',
				TONE: 'default',
				ICON: 'user',
			},
			{
				KEY: 'CON',
				LABEL: 'Contrataciones',
				VALUE: this.totalContratacionesApi,
				SUBLABEL: 'Dictamen APLICA',
				TONE: 'success',
				ICON: 'card',
			},
			{
				KEY: 'PEN',
				LABEL: 'Pendientes de mi acción',
				VALUE: 0,
				SUBLABEL: 'Se afinará al conectar acciones',
				TONE: 'warning',
				ICON: 'warning',
			},
			{
				KEY: 'ACT',
				LABEL: 'Procesos activos',
				VALUE:
					this.totalRequisicionesApi +
					this.totalCandidatosApi +
					this.totalContratacionesApi,
				SUBLABEL: 'Todos los stages',
				TONE: 'info',
				ICON: 'preferences',
			},
		];
	}
}
