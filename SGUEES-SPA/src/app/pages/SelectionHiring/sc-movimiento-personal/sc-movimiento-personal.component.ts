import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/shared/services/auth.service';
import {
	SELECTION_HIRING_RPT,
	SELECTION_HIRING_RPT_MESSAGE_SOURCE,
	buildSelectionHiringRptUrl,
	resolveSelectionHiringFuente,
} from '../shared/selection-hiring-rpt';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { BarraMttoCombox } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';

import {
	OPERACION_FLUJO_MOVIMIENTO,
	ScMovimientoPersonal,
} from './models/sc-movimiento-personal';
import { ScMovimientoPersonalService } from './sc-movimiento-personal.service';

@Component({
  standalone: false,
	selector: 'app-sc-movimiento-personal',
	templateUrl: './sc-movimiento-personal.component.html',
	styleUrls: ['./sc-movimiento-personal.component.scss'],
})
export class ScMovimientoPersonalComponent extends CBaseComponent implements OnInit, AfterViewInit, OnDestroy {
	protected override etiquetaRegistro = 'el movimiento de personal';
	protected override requiereEmpresaSesion = true;
	protected override mttoGridKeyExpr = 'CORR_MOVIMIENTO_PERSONAL';
	protected override mttoPageSize = 15;
	protected override mttoPageSizes = [15, 25, 50, 100];

	// Qué hace: Función de limpieza de listeners de arrastre horizontal (drag-to-scroll).
	private cleanupDragToScroll?: () => void;

	//#region Declarando Variables
	readOnly = false;
	enviandoMovimiento = false;
	confirmandoMovimiento = false;
	btnEnviarMovimiento = '';
	btnProcesarMovimiento = '';
	btnConfirmarMovimiento = '';
	procesarFechaEfectivaModo = false;
	private procesarFechaEfectivaCorr: number | null = null;
	popupConfirmarMovVisible = false;
	popupFechaIngresoPropuesta: any = null;
	/** Fecha efectiva editable solo cuando Confirmar está habilitado. */
	puedeEditarFechaEfectiva = false;
	requisicionAsociada: any = null;
	avisoIngresoVisible = false;
	popupFlujoVisible = false;
	popupFlujoTitulo = 'Observación';
	popupFlujoTexto = '';
	private flujoOperacion: number | null = null;
	accionesFlujo = {
		PUEDE_ENVIAR: false,
		PUEDE_APROBAR: false,
		PUEDE_DEVOLVER: false,
		PUEDE_RECHAZAR: false,
		PUEDE_CONFIRMAR: false,
		PUEDE_PROCESAR: false,
	};
	btnAprobarMovimiento = '';
	btnDevolverMovimiento = '';
	btnRechazarMovimiento = '';

	// QuÃ© hace: Muestra Imprimir solo para movimientos aprobados y confirmados.
	// CÃ³mo lo hace: Exige correlativo, ESTADO_MOVIMIENTO = AP y CONFIRMADO = 2; el estado procesado (CONFIRMADO = 1) no habilita el botÃ³n.
	get btnImprimirMovimiento(): string {
		const corr = Number(this.model?.CORR_MOVIMIENTO_PERSONAL) || 0;
		const estadoMovimiento = `${this.model?.ESTADO_MOVIMIENTO || ''}`.trim().toUpperCase();
		const aprobado = estadoMovimiento === 'AP';
		const confirmado = this.service.esConfirmado(this.model?.CONFIRMADO);
		return corr > 0 && aprobado && confirmado ? 'Imprimir' : '';
	}

	imprimirPopupVisible = false;
	imprimirUrl: SafeResourceUrl | null = null;
	imprimirLoading = false;
	private imprimirLoadFallbackTimer: ReturnType<typeof setTimeout> | null = null;

	private avisoIngresoTimer: ReturnType<typeof setTimeout> | null = null;
	private ultimaFechaIngresoMs: number | null = null;

	/** Lookups compartidos (unidad / modalidad / empleado); puestos van por lado. */
	mCORR_UNIDAD: any[] = [];
	filtroCorrUnidad = 0;
	barraFiltroUnidad: BarraMttoCombox | null = null;
	private modelsListadoCompleto: ScMovimientoPersonal[] = [];
	/** Padres distintos (gerencia) para la posición propuesta. */
	mGerenciaPropuesta: any[] = [];
	/** Departamentos hijos de la gerencia elegida. */
	mUnidadPropuesta: any[] = [];
	/** CORR del padre elegido; no se persiste (el texto queda en GERENCIA_PROPUESTA). */
	corrGerenciaPropuesta = 0;
	mCORR_TIPO_MODALIDAD: any[] = [];
	mCORR_PUESTO_ACTUAL: any[] = [];
	mCORR_PUESTO_PROPUESTO: any[] = [];
	mCORR_EMPLEADO: any[] = [];

	unidadLookupColumns = [
		{ dataField: 'CODIGO_UNIDAD', caption: 'Código', width: 100 },
		{ dataField: 'NOMBRE_UNIDAD', caption: 'Unidad', width: 280 },
	];
	unidadFiltroLookupColumns = [
		{ dataField: 'NOMBRE_UNIDAD', caption: 'Unidad', width: 280 },
	];
	puestoLookupColumns = [
		{ dataField: 'CORR_PUESTO', caption: 'Corr.', width: 80 },
		{ dataField: 'NOMBRE_PUESTO', caption: 'Puesto', width: 280 },
	];
	modalidadLookupColumns = [
		{ dataField: 'CORR_TIPO_MODALIDAD', caption: 'Corr.', width: 80 },
		{ dataField: 'MODALIDAD_NOMBRE', caption: 'Modalidad', width: 220 },
	];
	empleadoLookupColumns = [
		{ dataField: 'CODIGO_EMPLEADO', caption: 'Código', width: 90 },
		{ dataField: 'NOMBRE_COMPLETO', caption: 'Nombre', width: 280 },
		{ dataField: 'NUMERO_ID', caption: 'Documento', width: 120 },
		{ dataField: 'NOMBRE_UNIDAD_ACTUAL', caption: 'Unidad', width: 220 },
		{ dataField: 'NOMBRE_PUESTO_ACTUAL', caption: 'Puesto', width: 200 },
	];

	modelsBitacora: any[] = [];
	columnsBitacora: any[] = [];
	//#endregion

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private navRouter: Router,
		private service: ScMovimientoPersonalService,
		private authService: AuthService,
		private sanitizer: DomSanitizer,
		private elRef: ElementRef,
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems('DIRECTO', null, 'ASCENSO');
		this.columnsBitacora = this.service.getBitacoraColumns();
	}

	//#region Inicializando Opciones
	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	// Qué hace: Inicializa listeners del DOM una vez renderizada la vista.
	// Cómo lo hace: Invoca el método initDragToScroll para habilitar arrastre horizontal en la grilla.
	ngAfterViewInit(): void {
		this.initDragToScroll();
	}

	// Qué hace: Limpia los event listeners al destruir el componente.
	// Cómo lo hace: Ejecuta la función cleanupDragToScroll para evitar fugas de memoria.
	ngOnDestroy(): void {
		if (this.cleanupDragToScroll) {
			this.cleanupDragToScroll();
		}
	}

	// Qué hace: Permite hacer scroll horizontal en la grilla mediante clic y arrastre desde cualquier fila.
	// Cómo lo hace: Captura mousedown, mousemove y mouseup en .dx-datagrid-rowsview y actualiza scrollLeft según el desplazamiento del ratón.
	private initDragToScroll(): void {
		const host = this.elRef.nativeElement;
		let isDown = false;
		let startX = 0;
		let scrollLeft = 0;
		let hasDragged = false;
		let scrollContainer: HTMLElement | null = null;

		// Qué hace: Inicia el arrastre horizontal sobre registros sin interferir con la barra de scroll inferior.
		// Cómo lo hace: Ignora clics en la barra de scroll y controles interactivos, asegurando que el clic provenga de filas de la grilla.
		const onMouseDown = (e: MouseEvent) => {
			if (e.button !== 0) return; // Solo botón izquierdo
			const target = e.target as HTMLElement;

			// Ignorar clics sobre la barra de desplazamiento inferior y sus deslizadores
			if (target.closest('.dx-scrollable-scrollbar, .dx-scrollable-scroll, .dx-scrollbar-horizontal, .dx-scrollbar-vertical')) {
				return;
			}

			// No activar arrastre sobre botones, inputs, links o iconos de acción
			if (target.closest('button, .dx-button, a, input, select, textarea, .dx-checkbox, .dx-link, [role="button"]')) {
				return;
			}

			// Verificar que el clic provenga de las filas/contenido de la tabla
			const rowsView = target.closest('.dx-datagrid-rowsview');
			const isTableContent = !!target.closest('.dx-data-row, .dx-datagrid-content');
			if (!rowsView || !isTableContent) return;

			scrollContainer = host.querySelector('.sguees-data-grid-mtto .dx-datagrid-rowsview .dx-scrollable-container');
			if (!scrollContainer) return;

			isDown = true;
			hasDragged = false;
			startX = e.pageX;
			scrollLeft = scrollContainer.scrollLeft;
		};

		const onMouseMove = (e: MouseEvent) => {
			if (!isDown || !scrollContainer) return;
			const walk = e.pageX - startX;
			if (Math.abs(walk) > 4) {
				hasDragged = true;
				scrollContainer.scrollLeft = scrollLeft - walk;
				document.body.style.cursor = 'grabbing';
				document.body.style.userSelect = 'none';
			}
		};

		const onMouseUp = () => {
			if (!isDown) return;
			isDown = false;
			document.body.style.cursor = '';
			document.body.style.removeProperty('user-select');
			if (hasDragged) {
				const suppressClick = (ev: MouseEvent) => {
					ev.stopPropagation();
					ev.preventDefault();
					window.removeEventListener('click', suppressClick, true);
				};
				window.addEventListener('click', suppressClick, true);
			}
		};

		host.addEventListener('mousedown', onMouseDown);
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);

		this.cleanupDragToScroll = () => {
			host.removeEventListener('mousedown', onMouseDown);
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
		};
	}

	inicializaOpciones(): void {}

	override AsignaStatus(xEstado: UpdateType): void {
		if (xEstado === UpdateType.Browse) {
			this.procesarFechaEfectivaModo = false;
			this.procesarFechaEfectivaCorr = null;
		}
		super.AsignaStatus(xEstado);
		this.refrescarBotones();
		if (xEstado === UpdateType.Browse) {
			this.modelsBitacora = [];
			this.syncBarraFiltros();
			this.aplicarFiltrosListado(false);
		} else {
			this.refrescarItemsFormulario();
		}
	}
	//#endregion

	//#region Manejo de Combos
	llenaComboBox(): void {
		this.getCORR_UNIDAD();
		this.getCORR_TIPO_MODALIDAD();
		this.getCORR_EMPLEADO();
	}

	/** Unidades efectivas del usuario (SP PRAL_DATA_SC_UNIDADES_USUARIO vía API propia). */
	getCORR_UNIDAD(): void {
		this.appInfoService
			.getLookUp(
				'SC_MOVIMIENTO_PERSONAL',
				'SC_MOVIMIENTO_PERSONAL',
				'GetCORR_UNIDAD',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_UNIDAD = (response?.Result ? response.Data ?? [] : []).map((item: any) => ({
						...item,
						DISPLAY_UNIDAD: item.DISPLAY_UNIDAD || this.formatUnidadDisplay(item),
					}));
					this.armarGerenciasPropuesta();
					this.syncBarraFiltros();
					if (!this.isBrowse()) {
						this.aplicarPadreDesdeUnidadPropuesta();
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	getCORR_TIPO_MODALIDAD(): void {
		this.appInfoService
			.getLookUp(
				'SC_MOVIMIENTO_PERSONAL',
				'SC_MOVIMIENTO_PERSONAL',
				'GetCORR_TIPO_MODALIDAD',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_TIPO_MODALIDAD = response?.Result ? response.Data ?? [] : [];
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	/** Empleados activos + posición vigente (lookup nuevo de esta pantalla). */
	getCORR_EMPLEADO(): void {
		this.appInfoService
			.getLookUp(
				'SC_MOVIMIENTO_PERSONAL',
				'SC_MOVIMIENTO_PERSONAL',
				'GetCORR_EMPLEADO',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_EMPLEADO = response?.Result ? response.Data ?? [] : [];
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	getCORR_PUESTO_ACTUAL(
		corrUnidad?: number,
		corrPuestoPreferido?: number,
		nombrePuestoPreferido?: string
	): void {
		const unidad = corrUnidad ?? this.model?.CORR_UNIDAD_ACTUAL;
		if (!unidad || unidad <= 0) {
			this.mCORR_PUESTO_ACTUAL = [];
			return;
		}

		const puestoKeep = Number(corrPuestoPreferido ?? this.model?.CORR_PUESTO_ACTUAL) || 0;
		const nombreKeep =
			nombrePuestoPreferido ?? this.model?.NOMBRE_PUESTO_ACTUAL ?? '';

		this.appInfoService
			.getLookUp(
				'SC_MOVIMIENTO_PERSONAL',
				'SC_MOVIMIENTO_PERSONAL',
				'GetCORR_PUESTO',
				[{ Parameter: 'CORR_UNIDAD', Value: unidad }],
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					const data = response?.Result ? response.Data ?? [] : [];
					this.mCORR_PUESTO_ACTUAL = data;
					if (
						puestoKeep > 0
						&& !data.some((p: any) => Number(p.CORR_PUESTO) === puestoKeep)
					) {
						this.mCORR_PUESTO_ACTUAL = [
							...data,
							{
								CORR_UNIDAD: unidad,
								CORR_PUESTO: puestoKeep,
								NOMBRE_PUESTO: nombreKeep,
							},
						];
					}
					if (puestoKeep > 0) {
						this.model.CORR_PUESTO_ACTUAL = puestoKeep;
						if (nombreKeep) {
							this.model.NOMBRE_PUESTO_ACTUAL = nombreKeep;
						}
					}
				},
				error: (error: any) => {
					this.asegurarPuestoActualEnLookup(unidad, puestoKeep, nombreKeep);
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	getCORR_PUESTO_PROPUESTO(corrUnidad?: number): void {
		const unidad = corrUnidad ?? this.model?.CORR_UNIDAD_PROPUESTA;
		if (!unidad || unidad <= 0) {
			this.mCORR_PUESTO_PROPUESTO = [];
			return;
		}

		this.appInfoService
			.getLookUp(
				'SC_MOVIMIENTO_PERSONAL',
				'SC_MOVIMIENTO_PERSONAL',
				'GetCORR_PUESTO',
				[{ Parameter: 'CORR_UNIDAD', Value: unidad }],
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_PUESTO_PROPUESTO = response?.Result ? response.Data ?? [] : [];
				},
				error: (error: any) => {
					this.mCORR_PUESTO_PROPUESTO = [];
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	//#endregion

	//#region Metodos Mtto
	fillParam(xCORR_MOVIMIENTO_PERSONAL?: number): any {
		return { CORR_MOVIMIENTO_PERSONAL: xCORR_MOVIMIENTO_PERSONAL ?? 0 };
	}

	override fillData(xModel?: ScMovimientoPersonal): ScMovimientoPersonal {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_MOVIMIENTO_PERSONAL: xModel.CORR_MOVIMIENTO_PERSONAL,
				FECHA_ELABORACION: xModel.FECHA_ELABORACION,
				ORIGEN_MOVIMIENTO: xModel.ORIGEN_MOVIMIENTO,
				CORR_TIPO_CONTRATACION: xModel.CORR_TIPO_CONTRATACION ?? null,
				TIPO_MOVIMIENTO: xModel.TIPO_MOVIMIENTO,
				ESTADO_MOVIMIENTO: xModel.ESTADO_MOVIMIENTO,
				NOMBRE_ESTADO_MOVIMIENTO: xModel.NOMBRE_ESTADO_MOVIMIENTO,
				NOMBRE_TIPO_MOVIMIENTO: xModel.NOMBRE_TIPO_MOVIMIENTO,
				NOMBRE_ORIGEN_MOVIMIENTO: xModel.NOMBRE_ORIGEN_MOVIMIENTO,
				CORR_EMPLEADO: xModel.CORR_EMPLEADO ?? null,
				NOMBRE_COMPLETO: xModel.NOMBRE_COMPLETO,
				NUMERO_ID: xModel.NUMERO_ID,
				FECHA_INGRESO_PROPUESTA: xModel.FECHA_INGRESO_PROPUESTA,
				FECHA_FINALIZACION: xModel.FECHA_FINALIZACION,
				GERENCIA_ACTUAL: xModel.GERENCIA_ACTUAL,
				CORR_UNIDAD_ACTUAL: xModel.CORR_UNIDAD_ACTUAL,
				NOMBRE_UNIDAD_ACTUAL: xModel.NOMBRE_UNIDAD_ACTUAL,
				CORR_PUESTO_ACTUAL: xModel.CORR_PUESTO_ACTUAL,
				NOMBRE_PUESTO_ACTUAL: xModel.NOMBRE_PUESTO_ACTUAL,
				SALARIO_ACTUAL: xModel.SALARIO_ACTUAL,
				CORR_TIPO_MODALIDAD_ACTUAL: xModel.CORR_TIPO_MODALIDAD_ACTUAL,
				NOMBRE_MODALIDAD_ACTUAL: xModel.NOMBRE_MODALIDAD_ACTUAL,
				HORARIO_ACTUAL: xModel.HORARIO_ACTUAL,
				GERENCIA_PROPUESTA: xModel.GERENCIA_PROPUESTA,
				CORR_UNIDAD_PROPUESTA: xModel.CORR_UNIDAD_PROPUESTA,
				NOMBRE_UNIDAD_PROPUESTA: xModel.NOMBRE_UNIDAD_PROPUESTA,
				CORR_PUESTO_PROPUESTO: xModel.CORR_PUESTO_PROPUESTO,
				NOMBRE_PUESTO_PROPUESTO: xModel.NOMBRE_PUESTO_PROPUESTO,
				SALARIO_PROPUESTO: xModel.SALARIO_PROPUESTO,
				CORR_TIPO_MODALIDAD_PROPUESTA: xModel.CORR_TIPO_MODALIDAD_PROPUESTA,
				NOMBRE_MODALIDAD_PROPUESTA: xModel.NOMBRE_MODALIDAD_PROPUESTA,
				HORARIO_PROPUESTO: xModel.HORARIO_PROPUESTO,
				JUSTIFICACION: xModel.JUSTIFICACION,
				FECHA_EFECTIVA: xModel.FECHA_EFECTIVA,
				CONFIRMADO: Number(xModel.CONFIRMADO) || 0,
				NOMBRE_CONFIRMACION: xModel.NOMBRE_CONFIRMACION,
				USUARIO_CONFIRMA: xModel.USUARIO_CONFIRMA ?? null,
				FECHA_CONFIRMA: xModel.FECHA_CONFIRMA ?? null,
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
			CORR_MOVIMIENTO_PERSONAL: 0,
			FECHA_ELABORACION: new Date(),
			ORIGEN_MOVIMIENTO: 'DIRECTO',
			CORR_TIPO_CONTRATACION: null,
			TIPO_MOVIMIENTO: 'ASCENSO',
			ESTADO_MOVIMIENTO: 'DI',
			CORR_EMPLEADO: null,
			NOMBRE_COMPLETO: '',
			NUMERO_ID: '',
			FECHA_INGRESO_PROPUESTA: null,
			FECHA_FINALIZACION: null,
			GERENCIA_ACTUAL: '',
			CORR_UNIDAD_ACTUAL: 0,
			NOMBRE_UNIDAD_ACTUAL: '',
			CORR_PUESTO_ACTUAL: 0,
			NOMBRE_PUESTO_ACTUAL: '',
			SALARIO_ACTUAL: 0,
			CORR_TIPO_MODALIDAD_ACTUAL: 0,
			NOMBRE_MODALIDAD_ACTUAL: '',
			HORARIO_ACTUAL: '',
			GERENCIA_PROPUESTA: '',
			CORR_UNIDAD_PROPUESTA: 0,
			NOMBRE_UNIDAD_PROPUESTA: '',
			CORR_PUESTO_PROPUESTO: 0,
			NOMBRE_PUESTO_PROPUESTO: '',
			SALARIO_PROPUESTO: 0,
			CORR_TIPO_MODALIDAD_PROPUESTA: 0,
			NOMBRE_MODALIDAD_PROPUESTA: '',
			HORARIO_PROPUESTO: '',
			JUSTIFICACION: '',
			FECHA_EFECTIVA: null,
			CONFIRMADO: 0,
			NOMBRE_CONFIRMACION: 'En evaluación',
			USUARIO_CONFIRMA: null,
			FECHA_CONFIRMA: null,
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: new Date(),
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: new Date(),
		};
	}

	consultar(): void {
		this.consultarMtto({
			load: () => this.service.getAll(this.fillParam()),
			onData: (_resetPage = false) => {
				this.modelsListadoCompleto = Array.isArray(this.models) ? [...this.models] : [];
				this.aplicarFiltrosListado(false);
				this.abrirDesdeQueryCorr();
			},
		});
	}

	private aplicarFiltrosListado(_resetPage = false): void {
		let rows = Array.isArray(this.modelsListadoCompleto) ? [...this.modelsListadoCompleto] : [];
		const corrUnidad = Number(this.filtroCorrUnidad);
		if (corrUnidad > 0) {
			rows = rows.filter((row: any) =>
				Number(row.CORR_UNIDAD_PROPUESTA) === corrUnidad
				|| Number(row.CORR_UNIDAD_ACTUAL) === corrUnidad
			);
		}
		this.models = rows;
	}

	onFiltroUnidadChanged(value: any): void {
		const corr = Number(value);
		this.filtroCorrUnidad = corr > 0 ? corr : 0;
		this.syncBarraFiltros();
		if (this.isBrowse()) {
			this.aplicarFiltrosListado(true);
		}
	}

	selectedLookUpUnidadFiltro(vRow: any): number {
		return Number(vRow?.[0]?.CORR_UNIDAD ?? 0);
	}

	private syncBarraFiltros(): void {
		this.barraFiltroUnidad = {
			label: 'Unidad',
			model: this.mCORR_UNIDAD ?? [],
			value: this.filtroCorrUnidad ?? 0,
			valueExpr: 'CORR_UNIDAD',
			displayExpr: 'DISPLAY_UNIDAD',
			lookupColumns: this.unidadFiltroLookupColumns,
			selectedRowKeys: this.selectedLookUpUnidadFiltro,
			showClearButton: true,
			dropDownWidth: 420,
			width: 350,
			todosOption: {
				CORR_UNIDAD: 0,
				CODIGO_UNIDAD: '',
				NOMBRE_UNIDAD: 'Todos',
				DISPLAY_UNIDAD: 'Todos',
			},
			clearResetsTo: 0,
		};
	}

	override nuevo(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		super.nuevo();
		this.corrGerenciaPropuesta = 0;
		this.mUnidadPropuesta = [];
		this.mCORR_PUESTO_ACTUAL = [];
		this.mCORR_PUESTO_PROPUESTO = [];
		this.requisicionAsociada = null;
		this.avisoIngresoVisible = false;
		this.limpiarAccionesFlujo();
		this.modelsBitacora = [];
		this.refrescarBotones();
		this.refrescarItemsFormulario();
	}

	/**
	 * Editar solo Borrador/Devuelto; si no, abre en consulta.
	 */
	override editarClick(e: any): void {
		const rowData = e?.row?.data ?? e?.data;
		if (rowData && !this.service.esEstadoEditable(rowData.ESTADO_MOVIMIENTO)) {
			this.abrirEnConsulta(rowData);
			return;
		}
		super.editarClick(e);
		this.readOnly = false;
		this.despuesDeCargarFormulario();
	}

	/** Doble clic siempre abre en consulta (sin Guardar). */
	override rowDblClick(e: any): void {
		const rowData = e?.data ?? e?.row?.data;
		this.abrirEnConsulta(rowData);
	}

	/** Abre el registro en modo consulta (Not_Defined): sin Guardar, campos bloqueados. */
	private abrirEnConsulta(rowData?: any): void {
		if (rowData) {
			this.modelUpdate = { ...rowData };
			this.model = this.fillData(rowData);
		}
		this.AsignaStatus(UpdateType.Not_Defined);
		this.readOnly = true;
		this.despuesDeCargarFormulario();
		setTimeout(() => {
			this.bloquear();
		}, 0);
	}

	private despuesDeCargarFormulario(): void {
		this.aplicarPadreDesdeUnidadPropuesta();
		if (this.model?.CORR_UNIDAD_ACTUAL > 0) {
			this.getCORR_PUESTO_ACTUAL(this.model.CORR_UNIDAD_ACTUAL);
		}
		if (this.model?.CORR_UNIDAD_PROPUESTA > 0) {
			this.getCORR_PUESTO_PROPUESTO(this.model.CORR_UNIDAD_PROPUESTA);
		}
		this.cargarBitacora();
		this.cargarRequisicionAsociada();
		this.cargarAccionesFlujo();
		this.refrescarBotones();
		this.refrescarItemsFormulario();
	}

	/** DIRECTO → solo Empleado; REQUISICION → solo Nombre completo. */
	private refrescarItemsFormulario(): void {
		this.items = this.service.getItems(
			this.model?.ORIGEN_MOVIMIENTO || 'DIRECTO',
			this.model?.CORR_TIPO_CONTRATACION,
			this.model?.TIPO_MOVIMIENTO || 'ASCENSO'
		);
		setTimeout(() => {
			if (this.dataForm?.instance) {
				this.dataForm.instance.option('items', this.items);
			}
			this.aplicarBloqueoFormulario();
			this.engancharFechaIngreso();
		}, 0);
	}

	onMovimientoFieldChanged(e: any): void {
		if (e?.dataField === 'TIPO_MOVIMIENTO') {
			this.refrescarItemsFormulario();
		}
	}

	override getPermiteEditar(e: any): boolean {
		const data = e?.row?.data ?? e?.data;
		return this.permiteEdit && this.service.esEstadoEditable(data?.ESTADO_MOVIMIENTO);
	}

	override getPermiteDele(e: any): boolean {
		const data = e?.row?.data ?? e?.data;
		return this.permiteDele && `${data?.ESTADO_MOVIMIENTO || ''}`.toUpperCase() === 'DI';
	}

	guardar(): void {
		if (
			this.banderaMtto !== UpdateType.Add
			&& !this.service.esEstadoEditable(this.model?.ESTADO_MOVIMIENTO)
		) {
			this.notifyFx('Solo se puede modificar un movimiento en Borrador o Devuelto.', NotifyType.Warning);
			return;
		}

		/* Los combos escriben en el modelo. El formulario, al guardar, vuelve a
		   poner sus valores encima. Hay que pasarle antes lo que eligieron. */
		this.volcarCombosAlFormulario();

		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
		});
	}

	override cancelar(): void {
		super.cancelar(
			(item: any) => item.CORR_MOVIMIENTO_PERSONAL === this.modelUpdate.CORR_MOVIMIENTO_PERSONAL
		);
		this.refrescarBotones();
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_MOVIMIENTO_PERSONAL)),
		});
	}

	override bloquear(): void {
		this.readOnly = true;
		setTimeout(() => this.aplicarBloqueoFormulario(), 0);
	}

	override habilitar(): void {
		this.readOnly = false;
		setTimeout(() => {
			this.dataForm?.instance?.getEditor('CORR_MOVIMIENTO_PERSONAL')?.option('readOnly', true);
			this.dataForm?.instance?.getEditor('ORIGEN_MOVIMIENTO')?.option('readOnly', true);
		}, 0);
	}

	override setFocus(): void {
		setTimeout(() => {
			const field = `${this.model?.ORIGEN_MOVIMIENTO || ''}`.toUpperCase() === 'DIRECTO'
				? 'CORR_EMPLEADO'
				: 'NOMBRE_COMPLETO';
			const input = this.elRef.nativeElement.querySelector(
				`.dx-field-item[data-field="${field}"] input`
			) as HTMLInputElement | null;
			input?.focus({ preventScroll: true });
		});
	}

	/** Textos de botones de proceso (barra). */
	refrescarBotones(): void {
		const abierto = (this.model?.CORR_MOVIMIENTO_PERSONAL ?? 0) > 0;
		const estadoConfirmacion = Number(this.model?.CONFIRMADO) || 0;
		this.btnEnviarMovimiento = abierto && this.accionesFlujo.PUEDE_ENVIAR ? 'Enviar a aprobación' : '';
		this.btnAprobarMovimiento = abierto && this.accionesFlujo.PUEDE_APROBAR ? 'Aprobar' : '';
		this.btnDevolverMovimiento = abierto && this.accionesFlujo.PUEDE_DEVOLVER ? 'Devolver' : '';
		this.btnRechazarMovimiento = abierto && this.accionesFlujo.PUEDE_RECHAZAR ? 'Rechazar' : '';
		this.btnProcesarMovimiento = '';

		const puedeConfirmar =
			(this.model?.CORR_MOVIMIENTO_PERSONAL ?? 0) > 0
			&& estadoConfirmacion === 1
			&& this.accionesFlujo.PUEDE_PROCESAR
			&& (`${this.model?.ORIGEN_MOVIMIENTO || ''}`.trim().toUpperCase() !== 'REQUISICION'
				|| this.accionesFlujo.PUEDE_CONFIRMAR)
			&& this.service.esConfirmable(this.model);

		this.btnConfirmarMovimiento = puedeConfirmar ? 'Confirmar' : '';
		this.puedeEditarFechaEfectiva = estadoConfirmacion === 0 && this.procesarFechaEfectivaModo;
	}

	/** En browse, al seleccionar fila se habilita Confirmar e Imprimir en la barra. */
	override focusedRowChanged(e: any): void {
		super.focusedRowChanged(e);
		const corr = Number(this.model?.CORR_MOVIMIENTO_PERSONAL) || 0;
		if (this.procesarFechaEfectivaModo && this.procesarFechaEfectivaCorr !== corr) {
			this.procesarFechaEfectivaModo = false;
			this.procesarFechaEfectivaCorr = null;
		}
		this.refrescarBotones();
	}

	/**
	 * Abre SelectionHiring.aspx (mismo visor que requisición).
	 * fuente = ruta del componente; report = rptMovimientoPersonal.
	 */
	imprimirMovimiento(): void {
		const corr = Number(this.model?.CORR_MOVIMIENTO_PERSONAL) || 0;
		const corrEmpresa =
			Number(this.model?.CORR_EMPRESA) ||
			Number(this.authService?.decodedToken?.CORR_EMPRESA) ||
			0;
		if (corr <= 0 || corrEmpresa <= 0) {
			this.notifyFx('Guarde o seleccione un movimiento para imprimir.', NotifyType.Warning);
			return;
		}

		const fuente = resolveSelectionHiringFuente(this.router, this.urlOpcion);
		if (!fuente) {
			this.notifyFx('No se pudo resolver la fuente del reporte (ruta SPA).', NotifyType.Error);
			return;
		}

		this.clearImprimirLoadFallback();
		this.imprimirUrl = null;
		this.imprimirLoading = true;
		this.imprimirPopupVisible = true;

		this.service
			.getRptToken()
			.pipe(take(1))
			.subscribe({
				next: (res: any) => {
					const token = res?.Token || res?.Data?.Token || res?.token;
					if (!token) {
						this.imprimirLoading = false;
						this.imprimirPopupVisible = false;
						this.notifyFx('No se pudo obtener el token de reportería.', NotifyType.Error);
						return;
					}
					const url = buildSelectionHiringRptUrl({
						fuente,
						report: SELECTION_HIRING_RPT.MOVIMIENTO_PERSONAL,
						params: {
							CORR_EMPRESA: corrEmpresa,
							CORR_MOVIMIENTO_PERSONAL: corr,
						},
						token,
					});
					this.imprimirUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
					this.imprimirLoadFallbackTimer = setTimeout(() => {
						this.imprimirLoading = false;
						this.imprimirLoadFallbackTimer = null;
					}, 45000);
				},
				error: (err: any) => {
					this.imprimirLoading = false;
					this.imprimirPopupVisible = false;
					this.notifyFx(err?.ErrorMessage || err?.message || err || 'Error al preparar impresión', NotifyType.Error);
				},
			});
	}

	// Qué hace: escucha mensajes del visor de reportes para remover el indicador de carga.
	// Cómo lo hace: valida tipo y origen del evento window:message y desactiva el estado de carga.
	// eslint-disable-next-line @typescript-eslint/member-ordering
	@HostListener('window:message', ['$event'])
	onImprimirRptMessage(event: MessageEvent): void {
		const data = event?.data;
		if (!data || data.type !== 'sguees-rpt-ready' || data.source !== SELECTION_HIRING_RPT_MESSAGE_SOURCE) {
			return;
		}
		this.clearImprimirLoadFallback();
		this.imprimirLoading = false;
	}

	onImprimirIframeLoad(): void {
		if (!this.imprimirLoading) {
			return;
		}
		this.clearImprimirLoadFallback();
		this.imprimirLoadFallbackTimer = setTimeout(() => {
			this.imprimirLoading = false;
			this.imprimirLoadFallbackTimer = null;
		}, 8000);
	}

	cerrarImprimirPopup(): void {
		this.clearImprimirLoadFallback();
		this.imprimirPopupVisible = false;
		this.imprimirUrl = null;
		this.imprimirLoading = false;
	}

	private clearImprimirLoadFallback(): void {
		if (this.imprimirLoadFallbackTimer != null) {
			clearTimeout(this.imprimirLoadFallbackTimer);
			this.imprimirLoadFallbackTimer = null;
		}
	}

	cargarBitacora(): void {
		const corr = this.model?.CORR_MOVIMIENTO_PERSONAL ?? 0;
		if (corr <= 0) {
			this.modelsBitacora = [];
			return;
		}

		this.service
			.getBitacora(this.fillParam(corr))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.modelsBitacora = response?.Result ? response.Data ?? [] : [];
					if (!response?.Result && response?.ErrorMessage) {
						this.notifyFx(response.ErrorMessage, NotifyType.Error);
					}
				},
				error: (error: any) => {
					this.modelsBitacora = [];
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	async enviarMovimiento(): Promise<void> {
		this.abrirPopupFlujo(OPERACION_FLUJO_MOVIMIENTO.ENVIAR, 'Enviar a aprobación');
	}

	aprobarMovimiento(): void {
		this.abrirPopupFlujo(OPERACION_FLUJO_MOVIMIENTO.APROBAR, 'Aprobar movimiento');
	}

	devolverMovimiento(): void {
		this.abrirPopupFlujo(OPERACION_FLUJO_MOVIMIENTO.DEVOLVER, 'Devolver movimiento');
	}

	rechazarMovimiento(): void {
		this.abrirPopupFlujo(OPERACION_FLUJO_MOVIMIENTO.RECHAZAR, 'Rechazar movimiento');
	}

	cerrarPopupFlujo(): void {
		this.popupFlujoVisible = false;
		this.popupFlujoTexto = '';
		this.flujoOperacion = null;
	}

	confirmarPopupFlujo(): void {
		const texto = (this.popupFlujoTexto || '').trim();
		if (!texto) {
			this.notifyFx('La observación es obligatoria.', NotifyType.Warning);
			return;
		}
		const operacion = this.flujoOperacion;
		this.popupFlujoVisible = false;
		this.popupFlujoTexto = '';
		this.flujoOperacion = null;
		if (operacion) {
			this.ejecutarAutoriza(operacion, texto);
		}
	}

	private abrirPopupFlujo(operacion: number, titulo: string): void {
		if (this.enviandoMovimiento) {
			return;
		}
		const motivo = this.motivoNoPuedeOperarFlujo(operacion);
		if (motivo) {
			this.notifyFx(motivo, NotifyType.Warning);
			return;
		}
		this.flujoOperacion = operacion;
		this.popupFlujoTitulo = titulo;
		this.popupFlujoTexto = '';
		this.popupFlujoVisible = true;
	}

	private motivoNoPuedeOperarFlujo(operacion: number): string | null {
		if (this.isBrowse()) {
			return 'Abra el movimiento para continuar el flujo.';
		}
		if ((this.model?.CORR_MOVIMIENTO_PERSONAL ?? 0) <= 0) {
			return 'Guarde el movimiento antes de enviarlo al flujo.';
		}
		if (operacion === OPERACION_FLUJO_MOVIMIENTO.ENVIAR && !this.accionesFlujo.PUEDE_ENVIAR) {
			return 'Solo se puede enviar un ascenso o traslado en Borrador o Devuelto, con una unidad asignada a su usuario.';
		}
		if (operacion === OPERACION_FLUJO_MOVIMIENTO.APROBAR && !this.accionesFlujo.PUEDE_APROBAR) {
			return 'Este movimiento no está pendiente de su aprobación.';
		}
		if (operacion === OPERACION_FLUJO_MOVIMIENTO.DEVOLVER && !this.accionesFlujo.PUEDE_DEVOLVER) {
			return 'Este movimiento no está pendiente de su devolución.';
		}
		if (operacion === OPERACION_FLUJO_MOVIMIENTO.RECHAZAR && !this.accionesFlujo.PUEDE_RECHAZAR) {
			return 'Este movimiento no está pendiente de su rechazo.';
		}
		return null;
	}

	private ejecutarAutoriza(operacion: number, observacion: string): void {
		const corr = Number(this.model?.CORR_MOVIMIENTO_PERSONAL) || 0;
		this.enviandoMovimiento = true;
		this.loadingVisible = true;

		this.service
			.autoriza({
				CORR_MOVIMIENTO_PERSONAL: corr,
				OPERACION: operacion,
				OBSERVACION: observacion,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.enviandoMovimiento = false;
					this.loadingVisible = false;

					if (response?.Result && response.ErrorCode === 0) {
						const row = response.Data as ScMovimientoPersonal;
						if (row) {
							this.model = this.fillData(row);
							this.modelUpdate = this.fillData(row);
							const idx = this.models?.findIndex(
								(m: any) => m.CORR_MOVIMIENTO_PERSONAL === corr
							);
							if (idx >= 0) {
								this.models[idx] = { ...this.models[idx], ...row };
							}
						}
						this.cargarBitacora();
						this.notifyFx('La operación de flujo se registró correctamente.', NotifyType.Success);
						this.AsignaStatus(UpdateType.Browse);
					} else {
						this.notifyFx(
							response?.ErrorMessage || 'No se pudo ejecutar la operación de flujo.',
							NotifyType.Warning,
							{ raw: true }
						);
					}
				},
				error: (error: any) => {
					this.enviandoMovimiento = false;
					this.loadingVisible = false;
					this.notifyFx(this.extraerMensajeError(error), NotifyType.Warning, { raw: true });
				},
			});
	}

	private limpiarAccionesFlujo(): void {
		this.accionesFlujo = {
			PUEDE_ENVIAR: false,
			PUEDE_APROBAR: false,
			PUEDE_DEVOLVER: false,
			PUEDE_RECHAZAR: false,
			PUEDE_CONFIRMAR: false,
			PUEDE_PROCESAR: false,
		};
	}

	private cargarAccionesFlujo(): void {
		this.limpiarAccionesFlujo();
		const corr = Number(this.model?.CORR_MOVIMIENTO_PERSONAL) || 0;
		if (corr <= 0) {
			this.refrescarBotones();
			return;
		}
		this.service.getAccionesFlujo(corr).pipe(take(1)).subscribe({
			next: (response: any) => {
				const data = response?.Result ? response.Data : null;
				if (data) {
					this.accionesFlujo = {
						PUEDE_ENVIAR: !!data.PUEDE_ENVIAR,
						PUEDE_APROBAR: !!data.PUEDE_APROBAR,
						PUEDE_DEVOLVER: !!data.PUEDE_DEVOLVER,
						PUEDE_RECHAZAR: !!data.PUEDE_RECHAZAR,
						PUEDE_CONFIRMAR: !!data.PUEDE_CONFIRMAR,
						PUEDE_PROCESAR: !!data.PUEDE_PROCESAR,
					};
				}
				this.refrescarBotones();
			},
			error: () => this.refrescarBotones(),
		});
	}

	private abrirDesdeQueryCorr(): void {
		const corr = Number(this.router.snapshot.queryParamMap.get('corr') ?? 0);
		if (!(corr > 0)) {
			return;
		}
		const row = (this.models as ScMovimientoPersonal[])?.find(
			(item) => Number(item.CORR_MOVIMIENTO_PERSONAL) === corr
		);
		if (!row) {
			this.notifyFx(
				`No se encontró el movimiento ${corr} o no tiene acceso a él.`,
				NotifyType.Warning,
				{ raw: true }
			);
		} else {
			this.editarClick({ data: row });
		}
		void this.navRouter.navigate([], {
			relativeTo: this.router,
			queryParams: { corr: null },
			queryParamsHandling: 'merge',
			replaceUrl: true,
		});
	}

	/** Habilita la fecha efectiva en el formulario y luego procesa el movimiento. */
	abrirPopupProcesarMovimiento(): void {
		if (!this.model || (this.model.CORR_MOVIMIENTO_PERSONAL ?? 0) <= 0) return;
		if (Number(this.model.CONFIRMADO) !== 0) {
			this.notifyFx('El movimiento ya fue procesado o confirmado.', NotifyType.Warning);
			return;
		}

		if (!this.procesarFechaEfectivaModo) {
			if (!this.model.FECHA_EFECTIVA) {
				this.notifyFx(
					'Debe indicar la fecha efectiva antes de procesar el movimiento.',
					NotifyType.Warning,
					{ raw: true }
				);
			}
			this.procesarFechaEfectivaModo = true;
			this.procesarFechaEfectivaCorr = Number(this.model.CORR_MOVIMIENTO_PERSONAL);
			if (this.isBrowse()) {
				this.abrirEnConsulta(this.model);
			}
			this.puedeEditarFechaEfectiva = true;
			this.refrescarBotones();
			return;
		}

		if (!this.model.FECHA_EFECTIVA) {
			this.notifyFx(
				'Debe indicar la fecha efectiva antes de procesar el movimiento.',
				NotifyType.Warning,
				{ raw: true }
			);
			return;
		}
		if (this.procesarFechaEfectivaCorr !== Number(this.model.CORR_MOVIMIENTO_PERSONAL)) {
			this.procesarFechaEfectivaModo = false;
			this.procesarFechaEfectivaCorr = null;
			this.notifyFx('El movimiento seleccionado cambió. Vuelva a pulsar Procesar para habilitar la fecha efectiva.', NotifyType.Warning);
			return;
		}
		const corr = Number(this.model?.CORR_MOVIMIENTO_PERSONAL) || 0;
		if (corr <= 0) return;
		this.confirmandoMovimiento = true;
		this.loadingVisible = true;
		this.service.procesar({
			CORR_MOVIMIENTO_PERSONAL: corr,
			FECHA_EFECTIVA: this.model.FECHA_EFECTIVA,
		}).pipe(take(1)).subscribe({
			next: (response: any) => {
				this.confirmandoMovimiento = false;
				this.loadingVisible = false;
				if (response?.Result) {
					this.actualizarEstadoConfirmacionLocal(1);
					this.notifyFx('El movimiento fue procesado correctamente.', NotifyType.Success);
				} else {
					const message = response?.ErrorMessage || 'No se pudo procesar el movimiento.';
					if (this.sincronizarEstadoProcesamientoExistente(message)) {
						this.notifyFx('El estado del movimiento ya estaba actualizado.', NotifyType.Warning, { raw: true });
					} else {
						this.notifyFx(message, NotifyType.Warning);
					}
				}
			},
			error: (error: any) => {
				this.confirmandoMovimiento = false;
				this.loadingVisible = false;
				const message = this.extraerMensajeErrorConfirmacion(error);
				if (this.sincronizarEstadoProcesamientoExistente(message)) {
					this.notifyFx('El estado del movimiento ya estaba actualizado.', NotifyType.Warning, { raw: true });
				} else {
					this.notifyFx(message, NotifyType.Warning);
				}
			},
		});
	}

	private sincronizarEstadoProcesamientoExistente(message: string): boolean {
		const normalized = `${message || ''}`.toLowerCase();
		if (normalized.includes('ya está procesado') || normalized.includes('ya esta procesado')) {
			this.actualizarEstadoConfirmacionLocal(1);
			return true;
		}
		if (normalized.includes('ya está confirmado') || normalized.includes('ya esta confirmado')) {
			this.actualizarEstadoConfirmacionLocal(2);
			return true;
		}
		return false;
	}

	private actualizarEstadoConfirmacionLocal(estado: 1 | 2): void {
		if (!this.model) return;
		this.model.CONFIRMADO = estado;
		this.model.NOMBRE_CONFIRMACION = estado === 1 ? 'Procesado' : 'Confirmado';
		this.modelUpdate = this.fillData(this.model);
		const corr = Number(this.model.CORR_MOVIMIENTO_PERSONAL) || 0;
		const idx = this.models?.findIndex(
			(m: any) => Number(m.CORR_MOVIMIENTO_PERSONAL) === corr
		);
		if (idx >= 0) {
			this.models[idx] = { ...this.models[idx], ...this.model };
			this.models = [...this.models];
		}
		this.procesarFechaEfectivaModo = false;
		this.procesarFechaEfectivaCorr = null;
		this.cargarAccionesFlujo();
		this.refrescarBotones();
	}

	async confirmarMovimiento(): Promise<void> {
		if (this.confirmandoMovimiento) {
			return;
		}

		const motivo = this.motivoNoPuedeConfirmar();
		if (motivo) {
			this.notifyFx(motivo, NotifyType.Warning);
			return;
		}

		if (!this.model?.FECHA_EFECTIVA) {
			this.notifyFx(
				'Debe indicar la fecha efectiva antes de confirmar el movimiento.',
				NotifyType.Warning
			);
			return;
		}
		this.popupFechaIngresoPropuesta = this.model.FECHA_INGRESO_PROPUESTA ?? null;
		this.popupConfirmarMovVisible = true;
	}

	cancelarPopupConfirmarMovimiento(): void {
		this.popupConfirmarMovVisible = false;
		this.popupFechaIngresoPropuesta = null;
	}

	async confirmarPopupConfirmarMovimiento(): Promise<void> {
		if (!this.popupFechaIngresoPropuesta) {
			this.notifyFx('Debe indicar la fecha de ingreso propuesta.', NotifyType.Warning);
			return;
		}
		const corr = Number(this.model?.CORR_MOVIMIENTO_PERSONAL) || 0;
		this.confirmandoMovimiento = true;
		this.loadingVisible = true;
		this.service
			.confirmar({
				CORR_MOVIMIENTO_PERSONAL: corr,
				FECHA_EFECTIVA: this.model.FECHA_EFECTIVA,
				FECHA_INGRESO_PROPUESTA: this.popupFechaIngresoPropuesta,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.confirmandoMovimiento = false;
					this.loadingVisible = false;

					if (response?.Result && response.ErrorCode === 0) {
						const row = response.Data as ScMovimientoPersonal;
						if (row) {
							this.model = this.fillData(row);
							this.modelUpdate = this.fillData(row);
							const idx = this.models?.findIndex(
								(m: any) => m.CORR_MOVIMIENTO_PERSONAL === corr
							);
							if (idx >= 0) {
								this.models[idx] = { ...this.models[idx], ...row };
							}
						}
						this.model.FECHA_INGRESO_PROPUESTA = this.popupFechaIngresoPropuesta;
						this.model.NOMBRE_CONFIRMACION = 'Confirmado';
						this.model.CONFIRMADO = 2;
						this.popupConfirmarMovVisible = false;
						this.popupFechaIngresoPropuesta = null;
						this.refrescarBotones();
						this.notifyFx('El movimiento se confirmó correctamente.', NotifyType.Success);
					} else {
						this.notifyFx(
							response?.ErrorMessage || 'No se pudo confirmar el movimiento.',
							NotifyType.Warning,
							{ raw: true }
						);
					}
				},
				error: (error: any) => {
					this.confirmandoMovimiento = false;
					this.loadingVisible = false;
					this.notifyFx(this.extraerMensajeErrorConfirmacion(error), NotifyType.Warning, {
						raw: true,
					});
				},
			});
	}

	private motivoNoPuedeConfirmar(): string | null {
		if ((this.model?.CORR_MOVIMIENTO_PERSONAL ?? 0) <= 0) {
			return 'Seleccione o abra un movimiento para confirmarlo.';
		}
		if (Number(this.model?.CONFIRMADO) === 2) {
			return 'El movimiento ya está confirmado.';
		}
		if (Number(this.model?.CONFIRMADO) !== 1) {
			return 'Primero debe procesar el movimiento personal.';
		}

		const origen = `${this.model?.ORIGEN_MOVIMIENTO || ''}`.trim().toUpperCase();
		const estado = `${this.model?.ESTADO_MOVIMIENTO || ''}`.trim().toUpperCase();

		if (origen === 'DIRECTO' && estado !== 'AP') {
			return 'Los movimientos creados desde cero solo se pueden confirmar cuando están Aprobados.';
		}
		if (origen !== 'DIRECTO' && origen !== 'REQUISICION') {
			return 'Origen de movimiento no válido para confirmar.';
		}
		if (origen === 'REQUISICION' && !this.accionesFlujo.PUEDE_CONFIRMAR) {
			return 'Solo el creador de la requisición, su jefe inmediato o Gerencia General puede ejecutar este movimiento.';
		}
		return null;
	}

	private extraerMensajeError(error: any): string {
		if (typeof error === 'string') {
			return error.replace(/^\s*Error:\s*/i, '').trim();
		}
		const msg = error?.error?.ErrorMessage || error?.ErrorMessage || error?.message || '';
		return (
			String(msg).replace(/^\s*Error:\s*/i, '').trim()
			|| 'No se pudo enviar el movimiento a aprobación.'
		);
	}

	private extraerMensajeErrorConfirmacion(error: any): string {
		if (typeof error === 'string') {
			return error.replace(/^\s*Error:\s*/i, '').trim();
		}
		const msg = error?.error?.ErrorMessage || error?.ErrorMessage || error?.message || '';
		return (
			String(msg).replace(/^\s*Error:\s*/i, '').trim()
			|| 'No se pudo confirmar el movimiento.'
		);
	}

	getEstadoLabel(estado?: string): string {
		return this.service.getEstadoLabel(estado ?? this.model?.ESTADO_MOVIMIENTO);
	}

	getEstadoBadgeClass(estado?: string): string {
		return this.service.getEstadoBadgeClass(estado ?? this.model?.ESTADO_MOVIMIENTO);
	}

	get esOrigenRequisicion(): boolean {
		return `${this.model?.ORIGEN_MOVIMIENTO || ''}`.trim().toUpperCase() === 'REQUISICION';
	}

	esEventualRequisicion(): boolean {
		return this.esOrigenRequisicion && Number(this.requisicionAsociada?.CORR_TIPO_CONTRATACION) === 2;
	}

	cerrarAvisoIngreso(): void {
		this.avisoIngresoVisible = false;
		if (this.avisoIngresoTimer) {
			clearTimeout(this.avisoIngresoTimer);
			this.avisoIngresoTimer = null;
		}
	}

	private cargarRequisicionAsociada(): void {
		this.requisicionAsociada = null;
		this.cerrarAvisoIngreso();
		const corr = Number(this.model?.CORR_MOVIMIENTO_PERSONAL) || 0;
		if (!this.esOrigenRequisicion || corr <= 0) {
			return;
		}

		this.service.getRequisicionAsociada(corr).pipe(take(1)).subscribe({
			next: (response: any) => {
				const data = response?.Result ? response.Data ?? null : null;
				this.requisicionAsociada = Array.isArray(data) ? data[0] ?? null : data;
				if (this.requisicionAsociada) {
					this.model.CORR_TIPO_CONTRATACION = this.requisicionAsociada.CORR_TIPO_CONTRATACION;
				}
				this.ultimaFechaIngresoMs = this.fechaAMs(this.model?.FECHA_INGRESO_PROPUESTA);
				this.refrescarItemsFormulario();
				this.mostrarAvisoIngresoSiFalta();
			},
			error: () => {
				this.requisicionAsociada = null;
			},
		});
	}

	private mostrarAvisoIngresoSiFalta(): void {
		if (!this.esEventualRequisicion() || this.model?.FECHA_INGRESO_PROPUESTA || this.service.esConfirmado(this.model?.CONFIRMADO)) {
			return;
		}
		this.avisoIngresoVisible = true;
		this.avisoIngresoTimer = setTimeout(() => this.cerrarAvisoIngreso(), 8000);
	}

	private aplicarBloqueoFormulario(): void {
		const form = this.dataForm?.instance;
		if (!form || !this.readOnly) {
			return;
		}
		form.option('readOnly', true);
		if (this.esEventualRequisicion() && !this.service.esConfirmado(this.model?.CONFIRMADO)) {
			form.getEditor('FECHA_INGRESO_PROPUESTA')?.option('readOnly', false);
		}
	}

	private engancharFechaIngreso(): void {
		const editor = this.dataForm?.instance?.getEditor('FECHA_INGRESO_PROPUESTA');
		if (!editor) {
			return;
		}
		editor.off('valueChanged', this.onFechaIngresoEditor);
		editor.on('valueChanged', this.onFechaIngresoEditor);
	}

	private readonly onFechaIngresoEditor = (e: any): void => {
		this.onFechaIngresoChanged(e?.value);
	};

	private onFechaIngresoChanged(value: Date | string | null): void {
		if (!this.esEventualRequisicion() || this.service.esConfirmado(this.model?.CONFIRMADO)) {
			return;
		}
		const ms = this.fechaAMs(value);
		if (ms === this.ultimaFechaIngresoMs) {
			return;
		}
		this.ultimaFechaIngresoMs = ms;
		this.model.FECHA_INGRESO_PROPUESTA = value ? new Date(value) : null;
		const meses = Number(this.requisicionAsociada?.TIEMPO_CONTRATO) || 0;
		this.model.FECHA_FINALIZACION = value && meses > 0 ? this.sumarMeses(new Date(value), meses) : null;
		this.dataForm?.instance?.updateData('FECHA_FINALIZACION', this.model.FECHA_FINALIZACION);

		const corr = Number(this.model?.CORR_MOVIMIENTO_PERSONAL) || 0;
		if (corr <= 0) {
			return;
		}
		this.service.registrarFechaIngreso({
			CORR_MOVIMIENTO_PERSONAL: corr,
			FECHA_INGRESO_PROPUESTA: this.model.FECHA_INGRESO_PROPUESTA,
		}).pipe(take(1)).subscribe({
			next: (response: any) => {
				if (!response?.Result) {
					this.notifyFx(response?.ErrorMessage || 'No se pudo calcular la fecha de finalización.', NotifyType.Warning);
					return;
				}
				const row = response.Data;
				if (row) {
					this.model.FECHA_INGRESO_PROPUESTA = row.FECHA_INGRESO_PROPUESTA;
					this.model.FECHA_FINALIZACION = row.FECHA_FINALIZACION;
					this.ultimaFechaIngresoMs = this.fechaAMs(row.FECHA_INGRESO_PROPUESTA);
					this.dataForm?.instance?.updateData('FECHA_FINALIZACION', this.model.FECHA_FINALIZACION);
				}
			},
			error: (error: any) => this.notifyFx(this.extraerMensajeError(error), NotifyType.Warning, { raw: true }),
		});
	}

	private fechaAMs(value: Date | string | null | undefined): number | null {
		if (!value) {
			return null;
		}
		const fecha = new Date(value);
		if (Number.isNaN(fecha.getTime())) {
			return null;
		}
		fecha.setHours(0, 0, 0, 0);
		return fecha.getTime();
	}

	private sumarMeses(fecha: Date, meses: number): Date {
		const dia = fecha.getDate();
		const resultado = new Date(fecha.getFullYear(), fecha.getMonth() + meses, 1);
		const ultimo = new Date(resultado.getFullYear(), resultado.getMonth() + 1, 0).getDate();
		resultado.setDate(Math.min(dia, ultimo));
		return resultado;
	}
	//#endregion

	//#region Lookups selected
	selectedLookUpCORR_EMPLEADO = (vRow: any): any => {
		const row = vRow?.[0];
		if (!row) {
			return 0;
		}

		const corrUnidad = Number(row.CORR_UNIDAD_ACTUAL) || 0;
		const corrPuesto = Number(row.CORR_PUESTO_ACTUAL) || 0;
		const corrModalidad = Number(row.CORR_TIPO_MODALIDAD_ACTUAL) || 0;

		this.model.CORR_EMPLEADO = Number(row.CORR_EMPLEADO) || 0;
		this.model.NOMBRE_COMPLETO = row.NOMBRE_COMPLETO ?? '';
		this.model.NUMERO_ID = row.NUMERO_ID ?? '';
		this.model.GERENCIA_ACTUAL = row.GERENCIA_ACTUAL ?? '';
		this.model.CORR_UNIDAD_ACTUAL = corrUnidad;
		this.model.NOMBRE_UNIDAD_ACTUAL = row.NOMBRE_UNIDAD_ACTUAL ?? '';
		this.model.CORR_PUESTO_ACTUAL = corrPuesto;
		this.model.NOMBRE_PUESTO_ACTUAL = row.NOMBRE_PUESTO_ACTUAL ?? '';
		this.model.SALARIO_ACTUAL = row.SALARIO_ACTUAL ?? 0;
		this.model.CORR_TIPO_MODALIDAD_ACTUAL = corrModalidad;
		this.model.NOMBRE_MODALIDAD_ACTUAL = row.NOMBRE_MODALIDAD_ACTUAL ?? '';
		this.model.HORARIO_ACTUAL = row.HORARIO_ACTUAL ?? '';

		/* Sembrar lookups para que el displayExpr pinte de inmediato (sin esperar el GET). */
		this.asegurarUnidadEnLookup(corrUnidad, row.NOMBRE_UNIDAD_ACTUAL);
		this.asegurarPuestoActualEnLookup(corrUnidad, corrPuesto, row.NOMBRE_PUESTO_ACTUAL);

		if (corrUnidad > 0) {
			this.getCORR_PUESTO_ACTUAL(corrUnidad, corrPuesto, row.NOMBRE_PUESTO_ACTUAL);
		} else {
			this.mCORR_PUESTO_ACTUAL = [];
		}

		setTimeout(() => this.refrescarFormularioEnSitio(), 0);

		return this.model.CORR_EMPLEADO;
	};

	selectedLookUpCORR_UNIDAD_ACTUAL = (vRow: any): any => {
		const row = vRow?.[0];
		const corr = Number(row?.CORR_UNIDAD) || 0;
		this.model.CORR_UNIDAD_ACTUAL = corr;
		this.model.NOMBRE_UNIDAD_ACTUAL = row?.DISPLAY_UNIDAD || this.formatUnidadDisplay(row);
		this.model.GERENCIA_ACTUAL = row?.GERENCIA_DISPLAY ?? '';
		this.model.CORR_PUESTO_ACTUAL = 0;
		this.model.NOMBRE_PUESTO_ACTUAL = '';
		this.mCORR_PUESTO_ACTUAL = [];
		setTimeout(() => this.getCORR_PUESTO_ACTUAL(corr), 0);
		return corr;
	};

	selectedLookUpCORR_GERENCIA_PROPUESTA = (vRow: any): any => {
		const row = vRow?.[0];
		const corr = Number(row?.CORR_UNIDAD) || 0;
		const cambio = corr !== this.corrGerenciaPropuesta;
		this.corrGerenciaPropuesta = corr;
		this.model.GERENCIA_PROPUESTA = row?.DISPLAY_UNIDAD || this.formatUnidadDisplay(row);
		this.dataForm?.instance?.updateData('GERENCIA_PROPUESTA', this.model.GERENCIA_PROPUESTA);
		this.filtrarUnidadesPropuesta(corr);
		if (cambio) {
			this.model.CORR_UNIDAD_PROPUESTA = 0;
			this.model.NOMBRE_UNIDAD_PROPUESTA = '';
			this.model.CORR_PUESTO_PROPUESTO = 0;
			this.model.NOMBRE_PUESTO_PROPUESTO = '';
			this.mCORR_PUESTO_PROPUESTO = [];
		}
		return corr;
	};

	selectedLookUpCORR_UNIDAD_PROPUESTA = (vRow: any): any => {
		const row = vRow?.[0];
		const corr = Number(row?.CORR_UNIDAD) || 0;
		this.model.CORR_UNIDAD_PROPUESTA = corr;
		this.model.NOMBRE_UNIDAD_PROPUESTA = row?.DISPLAY_UNIDAD || this.formatUnidadDisplay(row);
		if (row?.GERENCIA_DISPLAY) {
			this.model.GERENCIA_PROPUESTA = row.GERENCIA_DISPLAY;
		}
		this.model.CORR_PUESTO_PROPUESTO = 0;
		this.model.NOMBRE_PUESTO_PROPUESTO = '';
		this.mCORR_PUESTO_PROPUESTO = [];
		setTimeout(() => this.getCORR_PUESTO_PROPUESTO(corr), 0);
		return corr;
	};

	selectedLookUpCORR_PUESTO_ACTUAL = (vRow: any): any => {
		const row = vRow?.[0];
		this.model.NOMBRE_PUESTO_ACTUAL = row?.NOMBRE_PUESTO ?? '';
		return Number(row?.CORR_PUESTO) || 0;
	};

	selectedLookUpCORR_PUESTO_PROPUESTO = (vRow: any): any => {
		const row = vRow?.[0];
		this.model.NOMBRE_PUESTO_PROPUESTO = row?.NOMBRE_PUESTO ?? '';
		return Number(row?.CORR_PUESTO) || 0;
	};

	selectedLookUpCORR_TIPO_MODALIDAD_ACTUAL = (vRow: any): any => {
		const row = vRow?.[0];
		this.model.NOMBRE_MODALIDAD_ACTUAL = row?.MODALIDAD_NOMBRE ?? '';
		return Number(row?.CORR_TIPO_MODALIDAD) || 0;
	};

	selectedLookUpCORR_TIPO_MODALIDAD_PROPUESTA = (vRow: any): any => {
		const row = vRow?.[0];
		this.model.NOMBRE_MODALIDAD_PROPUESTA = row?.MODALIDAD_NOMBRE ?? '';
		return Number(row?.CORR_TIPO_MODALIDAD) || 0;
	};

	/**
	 * Pasa al formulario los valores que viven en los combos.
	 * Sin esto, Guardar conserva salario y horario, y borra gerencia, departamento y cargo.
	 */
	private volcarCombosAlFormulario(): void {
		if (this.corrGerenciaPropuesta > 0 && !`${this.model?.GERENCIA_PROPUESTA || ''}`.trim()) {
			const gerencia = (this.mGerenciaPropuesta || []).find(
				(g) => Number(g.CORR_UNIDAD) === Number(this.corrGerenciaPropuesta)
			);
			this.model.GERENCIA_PROPUESTA = gerencia?.DISPLAY_UNIDAD || this.formatUnidadDisplay(gerencia);
		}

		this.dataForm?.instance?.updateData({
			CORR_EMPLEADO: this.model.CORR_EMPLEADO,
			NOMBRE_COMPLETO: this.model.NOMBRE_COMPLETO,
			NUMERO_ID: this.model.NUMERO_ID,
			CORR_UNIDAD_ACTUAL: this.model.CORR_UNIDAD_ACTUAL,
			NOMBRE_UNIDAD_ACTUAL: this.model.NOMBRE_UNIDAD_ACTUAL,
			CORR_PUESTO_ACTUAL: this.model.CORR_PUESTO_ACTUAL,
			NOMBRE_PUESTO_ACTUAL: this.model.NOMBRE_PUESTO_ACTUAL,
			CORR_TIPO_MODALIDAD_ACTUAL: this.model.CORR_TIPO_MODALIDAD_ACTUAL,
			NOMBRE_MODALIDAD_ACTUAL: this.model.NOMBRE_MODALIDAD_ACTUAL,
			GERENCIA_PROPUESTA: this.model.GERENCIA_PROPUESTA,
			CORR_UNIDAD_PROPUESTA: this.model.CORR_UNIDAD_PROPUESTA,
			NOMBRE_UNIDAD_PROPUESTA: this.model.NOMBRE_UNIDAD_PROPUESTA,
			CORR_PUESTO_PROPUESTO: this.model.CORR_PUESTO_PROPUESTO,
			NOMBRE_PUESTO_PROPUESTO: this.model.NOMBRE_PUESTO_PROPUESTO,
			CORR_TIPO_MODALIDAD_PROPUESTA: this.model.CORR_TIPO_MODALIDAD_PROPUESTA,
			NOMBRE_MODALIDAD_PROPUESTA: this.model.NOMBRE_MODALIDAD_PROPUESTA,
		});
	}

	/** Actualiza las cajas del formulario sin reemplazar el objeto de datos. */
	private refrescarFormularioEnSitio(): void {
		this.dataForm?.instance?.updateData(this.model);
	}

	/** Padres distintos de las unidades del usuario (combo Gerencia propuesta). */
	private armarGerenciasPropuesta(): void {
		const porCorr = new Map<number, any>();
		for (const unidad of this.mCORR_UNIDAD || []) {
			const padre = Number(unidad?.CORR_UNIDAD_PADRE) || 0;
			if (padre <= 0 || porCorr.has(padre)) {
				continue;
			}
			const filaPadre = (this.mCORR_UNIDAD || []).find((u) => Number(u.CORR_UNIDAD) === padre);
			if (filaPadre) {
				porCorr.set(padre, {
					CORR_UNIDAD: padre,
					CODIGO_UNIDAD: filaPadre.CODIGO_UNIDAD,
					NOMBRE_UNIDAD: filaPadre.NOMBRE_UNIDAD,
					DISPLAY_UNIDAD: filaPadre.DISPLAY_UNIDAD || this.formatUnidadDisplay(filaPadre),
				});
				continue;
			}
			const display = `${unidad.GERENCIA_DISPLAY || ''}`.trim();
			const partes = display.includes(' - ') ? display.split(' - ') : [display];
			porCorr.set(padre, {
				CORR_UNIDAD: padre,
				CODIGO_UNIDAD: partes.length > 1 ? partes[0] : '',
				NOMBRE_UNIDAD: partes.length > 1 ? partes.slice(1).join(' - ') : display,
				DISPLAY_UNIDAD: display,
			});
		}
		this.mGerenciaPropuesta = [...porCorr.values()].sort((a, b) =>
			`${a.DISPLAY_UNIDAD}`.localeCompare(`${b.DISPLAY_UNIDAD}`)
		);
	}

	/** Departamentos cuyo padre es la gerencia elegida. */
	private filtrarUnidadesPropuesta(corrPadre: number, corrUnidadKeep?: number): void {
		const padre = Number(corrPadre) || 0;
		if (padre <= 0) {
			this.mUnidadPropuesta = [];
			return;
		}
		const hijos = (this.mCORR_UNIDAD || []).filter((u) => Number(u.CORR_UNIDAD_PADRE) === padre);
		const keep = Number(corrUnidadKeep) || 0;
		if (keep > 0 && !hijos.some((u) => Number(u.CORR_UNIDAD) === keep)) {
			const row = (this.mCORR_UNIDAD || []).find((u) => Number(u.CORR_UNIDAD) === keep);
			if (row) {
				hijos.push(row);
			}
		}
		this.mUnidadPropuesta = hijos;
	}

	/** Al abrir un movimiento, la gerencia sale del padre de la unidad guardada. */
	private aplicarPadreDesdeUnidadPropuesta(): void {
		this.armarGerenciasPropuesta();
		const unidad = Number(this.model?.CORR_UNIDAD_PROPUESTA) || 0;
		if (unidad <= 0) {
			this.corrGerenciaPropuesta = 0;
			this.mUnidadPropuesta = [];
			return;
		}
		const row = (this.mCORR_UNIDAD || []).find((u) => Number(u.CORR_UNIDAD) === unidad);
		const padre = Number(row?.CORR_UNIDAD_PADRE) || 0;
		this.corrGerenciaPropuesta = padre;
		if (row?.GERENCIA_DISPLAY) {
			this.model.GERENCIA_PROPUESTA = row.GERENCIA_DISPLAY;
		}
		this.filtrarUnidadesPropuesta(padre, unidad);
	}

	private formatUnidadDisplay(row: any): string {
		if (!row) {
			return '';
		}
		const codigo = `${row.CODIGO_UNIDAD || ''}`.trim();
		const nombre = `${row.NOMBRE_UNIDAD || ''}`.trim();
		if (codigo && nombre) {
			return `${codigo} - ${nombre}`;
		}
		return nombre || codigo;
	}

	/** Si la unidad del empleado no está en el combo del usuario, la inserta para poder mostrarla. */
	private asegurarUnidadEnLookup(corrUnidad: number, display?: string): void {
		if (corrUnidad <= 0) {
			return;
		}
		const exists = this.mCORR_UNIDAD?.some((u) => Number(u.CORR_UNIDAD) === corrUnidad);
		if (exists) {
			return;
		}
		const texto = `${display || ''}`.trim();
		const partes = texto.includes(' - ') ? texto.split(' - ') : [texto];
		this.mCORR_UNIDAD = [
			...(this.mCORR_UNIDAD || []),
			{
				CORR_UNIDAD: corrUnidad,
				CODIGO_UNIDAD: partes.length > 1 ? partes[0] : '',
				NOMBRE_UNIDAD: partes.length > 1 ? partes.slice(1).join(' - ') : texto,
				DISPLAY_UNIDAD: texto,
				GERENCIA_DISPLAY: this.model.GERENCIA_ACTUAL || '',
			},
		];
	}

	/** Siembra el cargo actual para que el lookup muestre el texto de inmediato. */
	private asegurarPuestoActualEnLookup(
		corrUnidad: number,
		corrPuesto: number,
		nombrePuesto?: string
	): void {
		if (corrPuesto <= 0) {
			this.mCORR_PUESTO_ACTUAL = [];
			return;
		}
		this.mCORR_PUESTO_ACTUAL = [
			{
				CORR_UNIDAD: corrUnidad,
				CORR_PUESTO: corrPuesto,
				NOMBRE_PUESTO: nombrePuesto || '',
			},
		];
	}
	//#endregion
}
