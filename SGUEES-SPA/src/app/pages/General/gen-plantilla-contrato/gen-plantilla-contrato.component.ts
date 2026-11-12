// Qué hace: vista principal de mantenimiento para Plantillas de Contratos.
// Cómo lo hace: extiende CBaseComponent, gestiona el CRUD con parche en memoria y habilita el panel de parámetros con dx-html-editor tras guardar la plantilla.
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DxHtmlEditorComponent } from 'devextreme-angular/ui/html-editor';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import {
	GenPlantillaContrato,
	GenPlantillaContratoBitacora,
	GenPlantillaContratoVersion,
	GrupoParametrosContrato,
} from './models/gen-plantilla-contrato';
import { GenPlantillaContratoService } from './gen-plantilla-contrato.service';

@Component({
	standalone: false,
	selector: 'app-gen-plantilla-contrato',
	templateUrl: './gen-plantilla-contrato.component.html',
	styleUrls: ['./gen-plantilla-contrato.component.scss'],
})
// Qué hace: componente de mantenimiento CRUD y redacción para GEN_PLANTILLA_CONTRATO.
// Cómo lo hace: tras guardar un alta mantiene el formulario abierto en modo edición para redactar el contrato con parámetros insertables.
export class GenPlantillaContratoComponent extends CBaseComponent implements OnInit, AfterViewInit, OnDestroy {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;
	@ViewChild('htmlEditor', { static: false }) htmlEditor?: DxHtmlEditorComponent;

	protected override etiquetaRegistro = 'la plantilla de contrato';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_PLANTILLA_CONTRATO';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	mCORR_TIPO_CONTRATACION: any[] = [];
	gruposParametros: GrupoParametrosContrato[] = [];
	gruposParametrosFiltrados: GrupoParametrosContrato[] = [];
	modelsBitacora: GenPlantillaContratoBitacora[] = [];
	columnsBitacora: any[] = [];
	versiones: GenPlantillaContratoVersion[] = [];
	versionSeleccionada: GenPlantillaContratoVersion | null = null;
	creandoNuevaVersion = false;
	observacionNuevaVersion = '';
	modalMotivoVersionVisible = false;
	activeTabIndex = 0;
	filtroParametro = '';
	readOnly = false;
	tipoContratacionInvalido = false;
	opcionesBotonFirmas: any = null;
	opcionesBotonLimpiarTodo: any = null;
	opcionesBotonEncabezado: any = null;
	opcionesBotonPosicionImagen: any = null;

	private solicitudVersionEnCurso = 0;
	private cleanupDragToScroll?: () => void;
	private ultimoBloqueoToolbar: boolean | null = null;
	private payloadPendienteNuevaVersion: { payload: GenPlantillaContrato; cuerpoActual: string } | null = null;
	private quillInstance: any = null;
	private boundQuillInstance: any = null;
	private boundQuillRoot: HTMLElement | null = null;
	private ultimaSeleccion: { index: number; length: number } | null = null;
	private ultimaImagenSeleccionada: HTMLImageElement | null = null;
	private imagenArrastrada: HTMLImageElement | null = null;
	private readonly maintenanceSubtitulo = 'Mantenimiento de Plantillas de Contratos';
	private readonly logoContratoPath = 'assets/img/logo-xx.png';

	private readonly editorSelectionChangeHandler: (range: any) => void;
	private readonly editorClickHandler: (e: MouseEvent) => void;
	private readonly editorPasteHandler: (e: ClipboardEvent) => void;
	private readonly editorDragStartHandler: (e: DragEvent) => void;
	private readonly editorDragOverHandler: (e: DragEvent) => void;
	private readonly editorDropHandler: (e: DragEvent) => void;
	private readonly editorDragEndHandler: () => void;

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenPlantillaContratoService,
		private elRef: ElementRef
	) {
		super(appInfoService, router);
		this.editorSelectionChangeHandler = (range: any) => {
			if (range && typeof range.index === 'number') {
				this.ultimaSeleccion = range;
			}
		};
		this.editorClickHandler = (e: MouseEvent) => this.onEditorClick(e);
		this.editorPasteHandler = (e: ClipboardEvent) => this.onEditorPaste(e);
		this.editorDragStartHandler = (e: DragEvent) => this.onEditorDragStart(e);
		this.editorDragOverHandler = (e: DragEvent) => this.onEditorDragOver(e);
		this.editorDropHandler = (e: DragEvent) => this.onEditorDrop(e);
		this.editorDragEndHandler = () => {
			this.imagenArrastrada = null;
		};
		this.selectedLookUpCORR_TIPO_CONTRATACION = this.selectedLookUpCORR_TIPO_CONTRATACION.bind(this);
		this.getPermiteDele = this.getPermiteDele.bind(this);
		this.columns = this.service.getColumns();
		this.columnsBitacora = this.service.getBitacoraColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
		this.actualizarOpcionesBotonFirmas();
	}

	// Qué hace: controla por fila si se muestra el botón de eliminar en la grilla principal.
	// Cómo lo hace: solo permite eliminar si el usuario tiene permiso y la plantilla está en Borrador (sin versión activa).
	override getPermiteDele(e: any): boolean {
		const rowData = e?.row?.data ?? e?.data;
		const tieneVersionActiva = Number(rowData?.CORR_VERSION_ACTIVA ?? 0) > 0;
		return this.permiteDele && !tieneVersionActiva;
	}

	// Qué hace: entrega la instancia de grilla al flujo base de CBaseComponent.
	// Cómo lo hace: retorna dataGrid enlazado por @ViewChild o null.
	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	// Qué hace: inicializa la vista al abrirla.
	// Cómo lo hace: asigna subtítulo, carga catálogos de tipo de contrato y parámetros disponibles, y consulta la grilla.
	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.llenaComboBox();
		this.cargarParametrosDisponibles();
		this.consultar();
	}

	// Qué hace: habilita el desplazamiento horizontal por arrastre una vez renderizada la vista.
	// Cómo lo hace: invoca initDragToScroll para registrar los listeners sobre las grillas del componente.
	ngAfterViewInit(): void {
		this.initDragToScroll();
	}

	// Qué hace: libera listeners DOM del editor y del arrastre horizontal al destruir el componente.
	// Cómo lo hace: invoca desvincularEventosEditor y cleanupDragToScroll si fue registrado.
	ngOnDestroy(): void {
		this.desvincularEventosEditor();
		this.cleanupDragToScroll?.();
	}

	// Qué hace: permite hacer scroll horizontal haciendo clic y arrastrando sobre cualquier fila de las grillas.
	// Cómo lo hace: captura mousedown, mousemove y mouseup sobre .dx-datagrid-rowsview, actualiza scrollLeft e ignora botones o barras de scroll.
	private initDragToScroll(): void {
		const host = this.elRef.nativeElement as HTMLElement;
		let isDown = false;
		let startX = 0;
		let scrollLeft = 0;
		let hasDragged = false;
		let scrollContainer: HTMLElement | null = null;

		const onMouseDown = (e: MouseEvent) => {
			if (e.button !== 0) {
				return;
			}
			const target = e.target as HTMLElement | null;
			if (!target) {
				return;
			}

			if (target.closest('.dx-scrollable-scrollbar, .dx-scrollable-scroll, .dx-scrollbar-horizontal, .dx-scrollbar-vertical')) {
				return;
			}

			if (target.closest('button, .dx-button, a, input, select, textarea, .dx-checkbox, .dx-link, [role="button"]')) {
				return;
			}

			const grid = target.closest('.dx-datagrid');
			const rowsView = target.closest('.dx-datagrid-rowsview');
			const isTableContent = !!target.closest('.dx-data-row, .dx-datagrid-content');
			if (!grid || !rowsView || !isTableContent) {
				return;
			}

			scrollContainer = grid.querySelector('.dx-datagrid-rowsview .dx-scrollable-container') as HTMLElement | null;
			if (!scrollContainer) {
				return;
			}

			isDown = true;
			hasDragged = false;
			startX = e.pageX;
			scrollLeft = scrollContainer.scrollLeft;
		};

		const onMouseMove = (e: MouseEvent) => {
			if (!isDown || !scrollContainer) {
				return;
			}
			const walk = e.pageX - startX;
			if (Math.abs(walk) > 4) {
				hasDragged = true;
				scrollContainer.scrollLeft = scrollLeft - walk;
				document.body.style.cursor = 'grabbing';
				document.body.style.userSelect = 'none';
			}
		};

		const onMouseUp = () => {
			if (!isDown) {
				return;
			}
			isDown = false;
			scrollContainer = null;
			document.body.style.cursor = '';
			document.body.style.removeProperty('user-select');
			if (hasDragged) {
				const suppressClick = (ev: MouseEvent) => {
					ev.stopPropagation();
					ev.preventDefault();
					window.removeEventListener('click', suppressClick, true);
				};
				window.addEventListener('click', suppressClick, true);
				setTimeout(() => window.removeEventListener('click', suppressClick, true), 0);
			}
		};

		host.addEventListener('mousedown', onMouseDown);
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);

		this.cleanupDragToScroll = () => {
			host.removeEventListener('mousedown', onMouseDown);
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
			document.body.style.cursor = '';
			document.body.style.removeProperty('user-select');
		};
	}

	// Qué hace: reacciona al cambio de estado entre Browse y Formulario.
	// Cómo lo hace: ejecuta AsignaStatus base y al volver a Browse restaura el subtítulo y limpia el estado transitorio del editor.
	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
			this.reiniciarEstadoEditor();
		}
	}

	// Qué hace: reinicia filtros, versiones, pestaña activa y referencias internas de Quill del editor.
	// Cómo lo hace: limpia filtroParametro, versiones, bitácora, listeners de imagen y selección activa de Quill.
	private reiniciarEstadoEditor(): void {
		this.solicitudVersionEnCurso++;
		this.filtroParametro = '';
		this.filtrarParametros();
		this.activeTabIndex = 0;
		this.modelsBitacora = [];
		this.versiones = [];
		this.versionSeleccionada = null;
		this.creandoNuevaVersion = false;
		this.observacionNuevaVersion = '';
		this.modalMotivoVersionVisible = false;
		this.payloadPendienteNuevaVersion = null;
		this.ultimoBloqueoToolbar = null;
		this.desvincularEventosEditor();
		this.quillInstance = null;
		this.ultimaSeleccion = null;
		this.ultimaImagenSeleccionada = null;
		this.imagenArrastrada = null;
	}

	// Qué hace: indica si la versión seleccionada en el selector puede editarse directamente.
	// Cómo lo hace: habilita edición únicamente cuando es una versión v2+ activa fuera de modo consulta o creación.
	get puedeEditarVersionSeleccionada(): boolean {
		return (
			!this.readOnly &&
			!this.creandoNuevaVersion &&
			!!this.versionSeleccionada &&
			this.versionSeleccionada.ES_VERSION_ACTIVA &&
			Number(this.versionSeleccionada.NUMERO_VERSION) > 1
		);
	}

	// Qué hace: indica si el área del editor debe mantenerse bloqueada contra edición directa.
	// Cómo lo hace: bloquea en consulta, Versión 1 e históricas; habilita en Borrador, creación de nueva versión o versión v2+ activa.
	get editorReadOnly(): boolean {
		if (this.readOnly) {
			return true;
		}
		if (this.creandoNuevaVersion || this.puedeEditarVersionSeleccionada) {
			return false;
		}
		return this.versiones.length > 0 || Number(this.model?.CORR_VERSION_ACTIVA ?? 0) > 0;
	}

	// Qué hace: verifica si la plantilla ya cuenta con la versión base v1.
	// Cómo lo hace: busca un elemento con NUMERO_VERSION igual a 1 en la lista de versiones.
	get tieneVersionV1(): boolean {
		return this.versiones.some((v) => Number(v.NUMERO_VERSION) === 1);
	}

	// Qué hace: determina si puede iniciarse una nueva versión a partir de v1.
	// Cómo lo hace: exige modo edición activo, no estar ya en redacción de nueva versión y contar con v1.
	get puedeCrearNuevaVersion(): boolean {
		return !this.readOnly && !this.creandoNuevaVersion && this.tieneVersionV1;
	}

	// Qué hace: determina si la versión histórica mostrada puede establecerse como vigente.
	// Cómo lo hace: habilita activación únicamente para versiones v2+ inactivas en modo edición (v1 permanece histórica).
	get puedeActivarVersion(): boolean {
		return (
			!this.readOnly &&
			!this.creandoNuevaVersion &&
			!!this.versionSeleccionada &&
			!this.versionSeleccionada.ES_VERSION_ACTIVA &&
			Number(this.versionSeleccionada.NUMERO_VERSION) > 1
		);
	}

	// Qué hace: devuelve la etiqueta de estado mostrada junto al selector de versión.
	// Cómo lo hace: prioriza creación de nueva versión, luego delega en obtenerEtiquetaEstadoVersion y finalmente Borrador.
	get estadoVersionTexto(): string {
		if (this.creandoNuevaVersion) {
			return 'Nueva versión (desde Versión 1)';
		}
		if (this.versionSeleccionada) {
			return this.obtenerEtiquetaEstadoVersion(this.versionSeleccionada);
		}
		return Number(this.model?.CORR_VERSION_ACTIVA ?? 0) > 0 ? 'Activa' : 'Borrador';
	}

	// Qué hace: devuelve la clase CSS del badge de estado en la barra de versiones.
	// Cómo lo hace: asigna el modificador visual correspondiente a nueva versión, activa, histórica o borrador.
	get estadoVersionCss(): string {
		if (this.creandoNuevaVersion) {
			return 'estado-badge--nueva-version';
		}
		if (this.versionSeleccionada) {
			return this.versionSeleccionada.ES_VERSION_ACTIVA ? 'estado-badge--activo' : 'estado-badge--historica';
		}
		return Number(this.model?.CORR_VERSION_ACTIVA ?? 0) > 0 ? 'estado-badge--activo' : 'estado-badge--borrador';
	}

	// Qué hace: calcula el número correlativo correspondiente a la nueva versión por crear.
	// Cómo lo hace: suma 1 al máximo NUMERO_VERSION registrado en la plantilla (mínimo 2).
	get numeroNuevaVersion(): number {
		const maxNumero = this.versiones.reduce((max, item) => Math.max(max, Number(item.NUMERO_VERSION) || 0), 1);
		return maxNumero + 1;
	}

	// Qué hace: compone el título mostrado en el modal de motivo al guardar nueva versión.
	// Cómo lo hace: interpola numeroNuevaVersion en la etiqueta del popup.
	get tituloModalNuevaVersion(): string {
		return `Guardar Versión ${this.numeroNuevaVersion}`;
	}

	// Qué hace: describe la versión padre o el número de versión en redacción.
	// Cómo lo hace: muestra Versión N desde Versión 1 durante la creación o NOMBRE_VERSION_PADRE para versiones guardadas.
	get origenVersionTexto(): string {
		if (this.creandoNuevaVersion) {
			return `Creando Versión ${this.numeroNuevaVersion} a partir de la Versión 1`;
		}
		if (this.versionSeleccionada?.NOMBRE_VERSION_PADRE) {
			return `Basada en ${this.versionSeleccionada.NOMBRE_VERSION_PADRE}`;
		}
		return '';
	}

	// Qué hace: determina si se muestra el banner informativo de solo lectura o consulta de versión.
	// Cómo lo hace: lo activa cuando existe una versión guardada seleccionada fuera del modo de creación.
	get mostrarNotaSoloLecturaVersion(): boolean {
		return !this.creandoNuevaVersion && this.versiones.length > 0 && !!this.versionSeleccionada;
	}

	// Qué hace: construye el texto informativo mostrado bajo la barra de versiones.
	// Cómo lo hace: indica si la versión v2+ activa está habilitada para edición o si Versión 1 o históricas permanecen en solo lectura.
	get notaSoloLecturaVersionTexto(): string {
		const obs = `${this.versionSeleccionada?.OBSERVACION ?? ''}`.trim();
		const detalleObs = obs ? ` Observación: ${obs}` : '';
		const nombreVersion = this.versionSeleccionada?.NOMBRE_VERSION ?? '';
		if (this.readOnly) {
			return `Visualizando ${nombreVersion} (${this.estadoVersionTexto}).${detalleObs}`;
		}
		if (this.puedeEditarVersionSeleccionada) {
			return `${nombreVersion} está habilitada para edición (versión activa). Puede modificar el formato y presionar Guardar, o crear una Nueva Versión desde la Versión 1.${detalleObs}`;
		}
		if (Number(this.versionSeleccionada?.NUMERO_VERSION) === 1) {
			return `${nombreVersion} es el Formato Padre y permanece en solo lectura (inhabilitada). Para modificar el formato cree una Nueva Versión desde la Versión 1.${detalleObs}`;
		}
		return `${nombreVersion} está inactiva (solo lectura). Use "Activar Versión" para volver a habilitarla o cree una Nueva Versión desde la Versión 1.${detalleObs}`;
	}

	// Qué hace: resuelve la etiqueta de estado visible para una versión guardada.
	// Cómo lo hace: retorna 'Activa' si está vigente, 'Formato Padre' para la Versión 1 inactiva e 'Inactiva' para versiones v2+ anteriores.
	obtenerEtiquetaEstadoVersion(version?: Partial<GenPlantillaContratoVersion> | null): string {
		if (!version) {
			return '';
		}
		if (version.ES_VERSION_ACTIVA) {
			return 'Activa';
		}
		return Number(version.NUMERO_VERSION) === 1 ? 'Formato Padre' : 'Inactiva';
	}

	// Qué hace: sincroniza model.CUERPO_PLANTILLA directamente desde la instancia de dx-html-editor.
	// Cómo lo hace: consulta option('value') del editor para capturar cambios recientes aunque aún no haya emitido valueChange.
	private sincronizarCuerpoDesdeEditor(): string {
		const editorValue = this.htmlEditor?.instance?.option?.('value');
		if (typeof editorValue === 'string') {
			this.model.CUERPO_PLANTILLA = editorValue;
			return editorValue;
		}

		return `${this.model?.CUERPO_PLANTILLA ?? ''}`;
	}

	// Qué hace: carga los catálogos auxiliares del formulario.
	// Cómo lo hace: invoca getCORR_TIPO_CONTRATACION para poblar el selector de tipo de contrato.
	llenaComboBox(): void {
		this.getCORR_TIPO_CONTRATACION();
	}

	// Qué hace: obtiene los tipos de contratación activos desde Selección y Contratación.
	// Cómo lo hace: consulta getLookUp hacia SC_TIPO_CONTRATACION/GetCORR_TIPO_CONTRATACION_GEN_PLANTILLA_CONTRATO.
	getCORR_TIPO_CONTRATACION(): void {
		this.appInfoService
			.getLookUp(
				'GEN_PLANTILLA_CONTRATO',
				'SC_TIPO_CONTRATACION',
				'GetCORR_TIPO_CONTRATACION',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response?.Result) {
						this.mCORR_TIPO_CONTRATACION = response.Data ?? [];
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: carga el catálogo agrupado de parámetros disponibles desde el API propio de plantillas de contrato.
	// Cómo lo hace: llama a getParametrosDisponibles del servicio y aplica el filtro inicial.
	cargarParametrosDisponibles(): void {
		this.service
			.getParametrosDisponibles()
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response?.Result && Array.isArray(response.Data)) {
						this.gruposParametros = response.Data;
						this.filtrarParametros();
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: filtra los grupos y chips de parámetros según el texto ingresado en el buscador lateral.
	// Cómo lo hace: compara filtroParametro contra clave, etiqueta y descripción sin distinguir mayúsculas/minúsculas.
	filtrarParametros(): void {
		const termino = `${this.filtroParametro ?? ''}`.trim().toLowerCase();
		if (!termino) {
			this.gruposParametrosFiltrados = this.gruposParametros.map((g) => ({
				categoria: g.categoria,
				items: [...(g.items ?? [])],
			}));
			return;
		}

		this.gruposParametrosFiltrados = this.gruposParametros
			.map((g) => ({
				categoria: g.categoria,
				items: (g.items ?? []).filter((item) => {
					const texto = `${item.key ?? ''} ${item.label ?? ''} ${item.descripcion ?? ''}`.toLowerCase();
					return texto.includes(termino);
				}),
			}))
			.filter((g) => g.items.length > 0);
	}

	// Qué hace: extrae el identificador seleccionado en el lookup de tipo de contrato.
	// Cómo lo hace: retorna CORR_TIPO_CONTRATACION de la primera fila seleccionada.
	selectedLookUpCORR_TIPO_CONTRATACION(vRow: any): any {
		return vRow?.[0]?.CORR_TIPO_CONTRATACION ?? null;
	}

	// Qué hace: formatea una clave de parámetro con llaves dobles para mostrarla en la plantilla HTML.
	// Cómo lo hace: concatena {{ y }} alrededor de la clave sin interferir con la interpolación de Angular.
	formatToken(key: string): string {
		return `{{${key}}}`;
	}

	// Qué hace: arma el filtro por correlativo de plantilla.
	// Cómo lo hace: devuelve un objeto con CORR_PLANTILLA_CONTRATO.
	fillParam(xCORR_PLANTILLA_CONTRATO?: number): any {
		return {
			CORR_PLANTILLA_CONTRATO: xCORR_PLANTILLA_CONTRATO ?? 0,
		};
	}

	// Qué hace: construye el modelo del formulario para alta, edición o consulta.
	// Cómo lo hace: clona xModel preservando versión activa y cuerpo vacío como cadena vacía, o retorna valores iniciales.
	override fillData(xModel?: GenPlantillaContrato): GenPlantillaContrato {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_PLANTILLA_CONTRATO: xModel.CORR_PLANTILLA_CONTRATO,
				NOMBRE_PLANTILLA: xModel.NOMBRE_PLANTILLA,
				CORR_TIPO_CONTRATACION: xModel.CORR_TIPO_CONTRATACION,
				NOMBRE_TIPO_CONTRATACION: xModel.NOMBRE_TIPO_CONTRATACION,
				CORR_VERSION_ACTIVA: xModel.CORR_VERSION_ACTIVA ?? null,
				NUMERO_VERSION_ACTIVA: xModel.NUMERO_VERSION_ACTIVA ?? null,
				NOMBRE_VERSION_ACTIVA: xModel.NOMBRE_VERSION_ACTIVA
					? this.service?.formatearNombreVersion(xModel.NOMBRE_VERSION_ACTIVA, xModel.NUMERO_VERSION_ACTIVA) ||
					  xModel.NOMBRE_VERSION_ACTIVA
					: null,
				CUERPO_PLANTILLA: xModel.CUERPO_PLANTILLA ?? '',
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
			CORR_PLANTILLA_CONTRATO: 0,
			NOMBRE_PLANTILLA: '',
			CORR_TIPO_CONTRATACION: null,
			CORR_VERSION_ACTIVA: null,
			NUMERO_VERSION_ACTIVA: null,
			NOMBRE_VERSION_ACTIVA: null,
			CUERPO_PLANTILLA: '',
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: new Date(),
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: new Date(),
		};
	}

	// Qué hace: consulta el catálogo completo y actualiza la grilla.
	// Cómo lo hace: usa consultarMtto, ordena por correlativo y refresca el grid.
	consultar(resetPage = false): void {
		this.consultarMtto({
			load: () => this.service.getAll(this.fillParam()),
			onData: () => {
				this.ordenarModelsPorCorr();
				this.refrescarGridTrasCarga(resetPage);
			},
		});
	}

	// Qué hace: mantiene el listado ordenado de la más reciente a la más antigua por correlativo.
	// Cómo lo hace: genera una copia ordenada descendentemente de this.models por CORR_PLANTILLA_CONTRATO.
	private ordenarModelsPorCorr(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort(
			(a, b) => Number(b.CORR_PLANTILLA_CONTRATO) - Number(a.CORR_PLANTILLA_CONTRATO)
		);
	}

	// Qué hace: aplica el registro guardado en memoria sin ejecutar un GetAll adicional.
	// Cómo lo hace: agrega o reemplaza la fila por su llave en this.models y refresca la grilla.
	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as GenPlantillaContrato);
		const key = this.mttoGridKeyExpr as keyof GenPlantillaContrato;

		if (isAdd) {
			this.models = [...this.models, record];
		} else {
			const index = this.models.findIndex((item) => item?.[key] === record[key]);
			if (index >= 0) {
				this.models = this.models.map((item, i) =>
					i === index ? this.fillData({ ...item, ...record }) : item
				);
			}
		}

		this.ordenarModelsPorCorr();
		this.refrescarGridTrasCarga(isAdd);
	}

	// Qué hace: retira de memoria el registro eliminado sin recargar el catálogo.
	// Cómo lo hace: filtra this.models por CORR_PLANTILLA_CONTRATO y refresca la grilla.
	protected override quitarRegistroDeGrid(keyValue: unknown): void {
		if (!this.mttoGridKeyExpr || !Array.isArray(this.models)) {
			super.quitarRegistroDeGrid(keyValue);
			return;
		}

		const key = this.mttoGridKeyExpr as keyof GenPlantillaContrato;
		this.models = this.models.filter((item) => item?.[key] !== keyValue);
		this.refrescarGridTrasCarga(true);
	}

	// Qué hace: refresca visualmente la grilla tras cambios locales.
	// Cómo lo hace: difiere refreshData al siguiente ciclo de detección de cambios.
	private refrescarGridTrasCarga(resetPage = false): void {
		setTimeout(() => {
			this.dataGrid?.refreshData(resetPage);
		}, 0);
	}

	// Qué hace: abre la plantilla seleccionada en modo solo lectura.
	// Cómo lo hace: reinicia estado transitorio del editor, carga model/modelUpdate, consulta versiones/bitácora, activa readOnly y bloquea los controles y editor.
	override rowDblClick(e: any): void {
		const rowData = e?.data ?? e?.row?.data;
		this.tipoContratacionInvalido = false;
		this.reiniciarEstadoEditor();
		if (rowData) {
			this.model = this.fillData(rowData);
			this.modelUpdate = this.fillData(rowData);
		}
		this.readOnly = true;
		this.actualizarOpcionesBotonFirmas();
		super.rowDblClick(e);
		const corrPlantilla = Number(rowData?.CORR_PLANTILLA_CONTRATO ?? this.model?.CORR_PLANTILLA_CONTRATO ?? 0);
		if (corrPlantilla > 0) {
			this.cargarVersionesYBitacora(corrPlantilla);
		}
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
			this.bloquear();
		});
	}

	// Qué hace: abre la fila seleccionada en modo edición.
	// Cómo lo hace: reinicia estado transitorio del editor, activa modo edición con editarClick, consulta versiones/bitácora y sincroniza formData antes de habilitar y enfocar.
	onEditClick(e: any): void {
		const rowData = e?.row?.data ?? e?.data;
		if (!rowData) {
			return;
		}

		this.readOnly = false;
		this.tipoContratacionInvalido = false;
		this.reiniciarEstadoEditor();
		this.actualizarOpcionesBotonFirmas();
		this.editarClick(e);
		const corrPlantilla = Number(rowData?.CORR_PLANTILLA_CONTRATO ?? 0);
		if (corrPlantilla > 0) {
			this.cargarVersionesYBitacora(corrPlantilla);
		}
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
			this.habilitar();
			this.setFocus();
		});
	}

	// Qué hace: carga en paralelo el historial de versiones y bitácora de la plantilla abierta.
	// Cómo lo hace: usa forkJoin protegido por token de solicitud y selecciona por defecto la versión activa.
	private cargarVersionesYBitacora(corrPlantilla: number): void {
		const token = ++this.solicitudVersionEnCurso;
		forkJoin({
			versiones: this.service.getVersiones(corrPlantilla),
			bitacora: this.service.getBitacora(corrPlantilla),
		})
			.pipe(take(1))
			.subscribe({
				next: ({ versiones, bitacora }) => {
					if (token !== this.solicitudVersionEnCurso || Number(this.model?.CORR_PLANTILLA_CONTRATO ?? 0) !== corrPlantilla) {
						return;
					}

					if (versiones?.Result && Array.isArray(versiones.Data)) {
						this.versiones = versiones.Data.map((v: GenPlantillaContratoVersion) => this.normalizarVersionItem(v));
						const seleccionada =
							this.versiones.find((v) => v.ES_VERSION_ACTIVA) ??
							this.versiones[this.versiones.length - 1] ??
							null;
						this.versionSeleccionada = seleccionada;
						if (seleccionada) {
							this.aplicarCuerpoEnEditor(seleccionada.CUERPO_PLANTILLA ?? '');
						}
					} else {
						this.versiones = [];
						this.versionSeleccionada = null;
					}

					if (bitacora?.Result && Array.isArray(bitacora.Data)) {
						this.modelsBitacora = bitacora.Data;
					} else {
						this.modelsBitacora = [];
					}

					this.actualizarOpcionesBotonFirmas();
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: recarga únicamente la bitácora de eventos de la plantilla actual.
	// Cómo lo hace: consulta getBitacora y actualiza modelsBitacora si la plantilla sigue abierta.
	private cargarBitacora(corrPlantilla: number): void {
		this.service
			.getBitacora(corrPlantilla)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (Number(this.model?.CORR_PLANTILLA_CONTRATO ?? 0) !== corrPlantilla) {
						return;
					}
					if (response?.Result && Array.isArray(response.Data)) {
						this.modelsBitacora = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: cambia la versión visualizada en el editor al seleccionar otra entrada en el selector.
	// Cómo lo hace: busca la versión elegida y carga su CUERPO_PLANTILLA en solo lectura cuando no se está redactando una nueva versión.
	onVersionChanged(e: any): void {
		if (this.creandoNuevaVersion || !e?.value) {
			return;
		}
		const corrVersion = Number(e.value);
		if (Number.isNaN(corrVersion) || corrVersion === Number(this.versionSeleccionada?.CORR_PLANTILLA_CONTRATO_VERSION ?? 0)) {
			return;
		}
		const encontrada = this.versiones.find((v) => Number(v.CORR_PLANTILLA_CONTRATO_VERSION) === corrVersion);
		if (!encontrada) {
			return;
		}
		this.versionSeleccionada = encontrada;
		this.aplicarCuerpoEnEditor(encontrada.CUERPO_PLANTILLA ?? '');
		this.actualizarOpcionesBotonFirmas();
	}

	// Qué hace: confirma con el usuario e inicia la redacción de una nueva versión clonada desde la Versión 1.
	// Cómo lo hace: muestra el mensaje de confirmación requerido, copia CUERPO_PLANTILLA de Versión 1 y habilita el editor para guardar como nueva versión.
	solicitarNuevaVersion(): void {
		if (this.readOnly || this.creandoNuevaVersion) {
			return;
		}

		const versionV1 = this.versiones.find((v) => Number(v.NUMERO_VERSION) === 1);
		if (!versionV1) {
			this.notifyFx('Debe existir primero la Versión 1 antes de crear una nueva versión.', NotifyType.Warning, { raw: true });
			return;
		}

		this.confirmaAccion(
			'Nueva Versión',
			'La nueva versión se creará a partir de la Versión 1, ¿está de acuerdo?',
			() => {
				this.creandoNuevaVersion = true;
				this.observacionNuevaVersion = '';
				this.aplicarCuerpoEnEditor(versionV1.CUERPO_PLANTILLA ?? '');
				this.actualizarOpcionesBotonFirmas();
				setTimeout(() => this.htmlEditor?.instance?.focus?.(), 0);
			}
		);
	}

	// Qué hace: cancela la redacción temporal de una nueva versión sin modificar la base de datos.
	// Cómo lo hace: desactiva creandoNuevaVersion, limpia la observación y restaura el cuerpo de la versión activa.
	cancelarNuevaVersion(): void {
		this.creandoNuevaVersion = false;
		this.observacionNuevaVersion = '';
		this.modalMotivoVersionVisible = false;
		this.payloadPendienteNuevaVersion = null;
		const restaurar =
			this.versiones.find((v) => v.ES_VERSION_ACTIVA) ??
			this.versionSeleccionada ??
			null;
		this.versionSeleccionada = restaurar;
		if (restaurar) {
			this.aplicarCuerpoEnEditor(restaurar.CUERPO_PLANTILLA ?? '');
		}
		this.actualizarOpcionesBotonFirmas();
	}

	// Qué hace: activa una versión histórica v2+ previa confirmación del usuario.
	// Cómo lo hace: invoca activarVersion, parchea versiones y fila del grid en memoria y recarga bitácora sin GetAll.
	activarVersionSeleccionada(): void {
		const target = this.versionSeleccionada;
		if (this.readOnly || this.creandoNuevaVersion || !target || target.ES_VERSION_ACTIVA || Number(target.NUMERO_VERSION) <= 1) {
			return;
		}

		this.confirmaAccion(
			'Activar Versión',
			`¿Desea establecer ${target.NOMBRE_VERSION} como la versión activa de la plantilla?`,
			() => {
				this.loadingVisible = true;
				this.service
					.activarVersion({
						CORR_PLANTILLA_CONTRATO: Number(this.model.CORR_PLANTILLA_CONTRATO),
						CORR_PLANTILLA_CONTRATO_VERSION: Number(target.CORR_PLANTILLA_CONTRATO_VERSION),
					})
					.pipe(take(1))
					.subscribe({
						next: (response: any) => {
							if (response?.Result && response.Data) {
								const activada = this.normalizarVersionItem(response.Data as GenPlantillaContratoVersion);
								this.versiones = this.versiones.map((v) =>
									Number(v.CORR_PLANTILLA_CONTRATO_VERSION) === Number(activada.CORR_PLANTILLA_CONTRATO_VERSION)
										? activada
										: { ...v, ES_VERSION_ACTIVA: false }
								);
								this.versionSeleccionada = activada;
								this.aplicarVersionActivaEnModelo(activada);
								this.aplicarCuerpoEnEditor(activada.CUERPO_PLANTILLA ?? '');
								this.actualizarOpcionesBotonFirmas();
								this.cargarBitacora(activada.CORR_PLANTILLA_CONTRATO);
								this.notifyFx(`${activada.NOMBRE_VERSION} activada con éxito.`, NotifyType.Success, { raw: true });
							} else {
								this.notifyApiResponse(response);
							}
							this.loadingVisible = false;
						},
						error: (error: any) => {
							this.notifyApiError(error);
							this.loadingVisible = false;
						},
					});
			}
		);
	}

	// Qué hace: normaliza los nombres de versión y versión padre al formato completo 'Versión N'.
	// Cómo lo hace: delega el formateo en service.formatearNombreVersion para evitar mostrar prefijos cortos 'vN'.
	private normalizarVersionItem(version: GenPlantillaContratoVersion): GenPlantillaContratoVersion {
		return {
			...version,
			NOMBRE_VERSION: this.service.formatearNombreVersion(version.NOMBRE_VERSION, version.NUMERO_VERSION),
			NOMBRE_VERSION_PADRE: version.NOMBRE_VERSION_PADRE
				? this.service.formatearNombreVersion(version.NOMBRE_VERSION_PADRE)
				: version.NOMBRE_VERSION_PADRE ?? null,
		};
	}

	// Qué hace: sincroniza el HTML mostrado tanto en model como en la instancia de dx-html-editor.
	// Cómo lo hace: actualiza CUERPO_PLANTILLA y llama a option('value') si difiere del valor actual.
	private aplicarCuerpoEnEditor(html: string): void {
		const contenido = html ?? '';
		this.model.CUERPO_PLANTILLA = contenido;
		if (this.htmlEditor?.instance && this.htmlEditor.instance.option('value') !== contenido) {
			this.htmlEditor.instance.option('value', contenido);
		}
	}

	// Qué hace: refleja en memoria los metadatos de la versión activa sin reconsultar GetAll.
	// Cómo lo hace: actualiza model, modelUpdate y parchea la fila correspondiente en models mediante aplicarRegistroEnGrid.
	private aplicarVersionActivaEnModelo(version: GenPlantillaContratoVersion): void {
		const actualizado = this.fillData({
			...this.model,
			CORR_VERSION_ACTIVA: version.CORR_PLANTILLA_CONTRATO_VERSION,
			NUMERO_VERSION_ACTIVA: version.NUMERO_VERSION,
			NOMBRE_VERSION_ACTIVA: version.NOMBRE_VERSION,
			CUERPO_PLANTILLA: version.CUERPO_PLANTILLA ?? '',
		});
		this.model = actualizado;
		this.modelUpdate = this.fillData(actualizado);
		this.aplicarRegistroEnGrid(actualizado, false);
	}

	// Qué hace: inicia el alta de una nueva plantilla de contrato.
	// Cómo lo hace: valida empresa en sesión, limpia banderas y estado del editor, llama a nuevo() y enlaza formData.
	override nuevo(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		this.readOnly = false;
		this.tipoContratacionInvalido = false;
		this.reiniciarEstadoEditor();
		this.actualizarOpcionesBotonFirmas();
		super.nuevo();
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
		});
	}

	// Qué hace: actualiza el tipo de contrato seleccionado desde el lookup y lo propaga al dx-form.
	// Cómo lo hace: asigna el valor en model, actualiza formData con updateData y limpia tipoContratacionInvalido cuando es mayor a cero.
	onTipoContratacionChanged(value: number | null): void {
		this.model.CORR_TIPO_CONTRATACION = value;
		this.dataForm?.instance?.updateData?.('CORR_TIPO_CONTRATACION', value);
		if (value != null && value > 0) {
			this.tipoContratacionInvalido = false;
		}
	}

	// Qué hace: sincroniza el contenido HTML editado en el lienzo de dx-html-editor.
	// Cómo lo hace: asigna el valor recibido al campo CUERPO_PLANTILLA del modelo en curso.
	onCuerpoChanged(value: string): void {
		this.model.CUERPO_PLANTILLA = value ?? '';
	}

	// Qué hace: intenta vincular la instancia subyacente de Quill cuando el editor se inicializa.
	// Cómo lo hace: delega a vincularQuill sobre el componente recibido en onInitialized.
	onEditorInitialized(e: any): void {
		this.vincularQuill(e?.component);
	}

	// Qué hace: vincula la instancia de Quill una vez renderizado completamente el dx-html-editor.
	// Cómo lo hace: captura la instancia creada en _renderHtmlEditor mediante onContentReady.
	onEditorContentReady(e: any): void {
		this.vincularQuill(e?.component);
	}

	// Qué hace: resuelve y monitorea siempre la instancia viva de Quill del dx-html-editor.
	// Cómo lo hace: prioriza getQuillInstance() sobre la referencia cacheada, desvincula listeners previos si Quill se recreó y enlaza eventos sobre la instancia vigente.
	private vincularQuill(component?: any): any {
		const editorComp = component ?? this.htmlEditor?.instance;
		const quill =
			editorComp?.getQuillInstance?.() ||
			editorComp?._quillInstance ||
			(editorComp as any)?.getQuill?.() ||
			this.quillInstance ||
			null;

		if (!quill) {
			return null;
		}

		const root = quill.root as HTMLElement | undefined;
		if (this.boundQuillInstance !== quill || (root && this.boundQuillRoot !== root)) {
			this.desvincularEventosEditor();
			this.quillInstance = quill;
			this.boundQuillInstance = quill;

			if (typeof quill.on === 'function') {
				quill.on('selection-change', this.editorSelectionChangeHandler);
			}

			if (root) {
				this.boundQuillRoot = root;
				root.addEventListener('click', this.editorClickHandler);
				root.addEventListener('paste', this.editorPasteHandler, true);
				root.addEventListener('dragstart', this.editorDragStartHandler, true);
				root.addEventListener('dragover', this.editorDragOverHandler, true);
				root.addEventListener('drop', this.editorDropHandler, true);
				root.addEventListener('dragend', this.editorDragEndHandler, true);
			}
		} else {
			this.quillInstance = quill;
		}

		return this.quillInstance;
	}

	// Qué hace: remueve los listeners DOM y eventos de Quill de la instancia enlazada actualmente.
	// Cómo lo hace: retira selection-change y los listeners sobre boundQuillRoot limpiando ambas referencias.
	private desvincularEventosEditor(): void {
		if (this.boundQuillInstance && typeof this.boundQuillInstance.off === 'function') {
			this.boundQuillInstance.off('selection-change', this.editorSelectionChangeHandler);
		}
		this.boundQuillInstance = null;

		if (!this.boundQuillRoot) {
			return;
		}
		this.boundQuillRoot.removeEventListener('click', this.editorClickHandler);
		this.boundQuillRoot.removeEventListener('paste', this.editorPasteHandler, true);
		this.boundQuillRoot.removeEventListener('dragstart', this.editorDragStartHandler, true);
		this.boundQuillRoot.removeEventListener('dragover', this.editorDragOverHandler, true);
		this.boundQuillRoot.removeEventListener('drop', this.editorDropHandler, true);
		this.boundQuillRoot.removeEventListener('dragend', this.editorDragEndHandler, true);
		this.boundQuillRoot = null;
	}

	// Qué hace: limpia fondos y colores heredados del portapapeles (Word/Docs/web) al pegar HTML en el editor.
	// Cómo lo hace: intercepta paste en captura, remueve background/color de un DOM temporal manteniendo estructura y delega el pegado limpio a Quill.
	private onEditorPaste(e: ClipboardEvent): void {
		const quill = this.vincularQuill();
		if (this.editorReadOnly || !quill || e.defaultPrevented || !e.clipboardData) {
			return;
		}

		const html = e.clipboardData.getData('text/html');
		if (!html) {
			return;
		}

		const doc = new DOMParser().parseFromString(html, 'text/html');
		const files = Array.from(e.clipboardData.files || []);
		const esSoloImagen =
			files.length > 0 && doc.body.childElementCount === 1 && doc.body.firstElementChild?.tagName === 'IMG';
		if (esSoloImagen) {
			return;
		}

		e.preventDefault();
		e.stopPropagation();

		const htmlLimpio = this.limpiarColoresHtmlPegado(doc);
		const text = e.clipboardData.getData('text/plain') ?? '';
		const rangoActual = quill.getSelection?.(true) ?? this.ultimaSeleccion;
		const longitudDoc = Math.max(0, (quill.getLength?.() ?? 1) - 1);
		const range =
			rangoActual && typeof rangoActual.index === 'number'
				? { index: Math.min(Math.max(0, rangoActual.index), longitudDoc), length: rangoActual.length ?? 0 }
				: { index: longitudDoc, length: 0 };

		if (typeof quill.clipboard?.onPaste === 'function') {
			quill.clipboard.onPaste(range, { html: htmlLimpio, text, keepLastNewLine: true });
		} else if (typeof quill.clipboard?.dangerouslyPasteHTML === 'function') {
			if (range.length > 0) {
				quill.deleteText(range.index, range.length, 'user');
			}
			quill.clipboard.dangerouslyPasteHTML(range.index, htmlLimpio, 'user');
		}

		const nuevaSel = quill.getSelection?.(false);
		if (nuevaSel && typeof nuevaSel.index === 'number') {
			this.ultimaSeleccion = nuevaSel;
		}
		setTimeout(() => this.sincronizarCuerpoDesdeEditor(), 0);
	}

	// Qué hace: elimina estilos de fondo y color externos sin perder negritas, alineación, listas ni tablas.
	// Cómo lo hace: remueve nodos meta/style/xml de Word y limpia background, color, mso-highlight y atributos legacy de cada nodo.
	private limpiarColoresHtmlPegado(doc: Document): string {
		doc.body.querySelectorAll('style, script, meta, xml, link').forEach((el) => el.remove());
		doc.body.querySelectorAll('*').forEach((el) => {
			const htmlEl = el as HTMLElement;
			htmlEl.style.removeProperty('background');
			htmlEl.style.removeProperty('background-color');
			htmlEl.style.removeProperty('color');
			htmlEl.style.removeProperty('mso-highlight');
			htmlEl.style.removeProperty('mso-shading');
			htmlEl.removeAttribute('bgcolor');
			if (htmlEl.tagName === 'FONT') {
				htmlEl.removeAttribute('color');
			}
			if (htmlEl.getAttribute('style')?.trim() === '') {
				htmlEl.removeAttribute('style');
			}
		});
		return doc.body.innerHTML;
	}

	// Qué hace: registra la última imagen seleccionada dentro del editor para poder alinear o flotarla desde el toolbar.
	// Cómo lo hace: guarda el elemento HTMLImageElement si el clic fue sobre una imagen, o limpia la referencia al clicar texto.
	private onEditorClick(e: MouseEvent): void {
		const target = e.target as HTMLElement | null;
		if (!target) {
			return;
		}
		if (target instanceof HTMLImageElement) {
			this.ultimaImagenSeleccionada = target;
			return;
		}
		if (!target.closest('.dx-resizable-handle')) {
			this.ultimaImagenSeleccionada = null;
		}
	}

	// Qué hace: inicia el arrastre interno de una imagen existente dentro del editor.
	// Cómo lo hace: valida edición activa, guarda la imagen arrastrada en memoria y configura dataTransfer para movimiento.
	private onEditorDragStart(e: DragEvent): void {
		if (this.editorReadOnly || !this.boundQuillRoot) {
			return;
		}
		const target = e.target;
		if (!(target instanceof HTMLImageElement) || !this.boundQuillRoot.contains(target)) {
			return;
		}
		this.imagenArrastrada = target;
		this.ultimaImagenSeleccionada = target;
		if (e.dataTransfer) {
			e.dataTransfer.effectAllowed = 'move';
			e.dataTransfer.setData('text/plain', '');
		}
	}

	// Qué hace: habilita el cursor de soltado mientras se arrastra una imagen interna por el editor.
	// Cómo lo hace: previene el comportamiento por defecto cuando hay imagenArrastrada activa y marca dropEffect como move.
	private onEditorDragOver(e: DragEvent): void {
		if (this.editorReadOnly || !this.imagenArrastrada) {
			return;
		}
		e.preventDefault();
		if (e.dataTransfer) {
			e.dataTransfer.dropEffect = 'move';
		}
	}

	// Qué hace: mueve la imagen arrastrada a la línea o celda exacta donde el usuario la soltó.
	// Cómo lo hace: intercepta el drop en captura antes que DropImageModule, resuelve índice destino, re-inserta el blot extendedImage con sus dimensiones y float, y sincroniza el modelo.
	private onEditorDrop(e: DragEvent): void {
		const quill = this.vincularQuill();
		const img = this.imagenArrastrada;
		if (this.editorReadOnly || !quill || !img || !this.boundQuillRoot?.contains(img)) {
			this.imagenArrastrada = null;
			return;
		}

		e.preventDefault();
		e.stopPropagation();
		e.stopImmediatePropagation();
		this.imagenArrastrada = null;

		const imgBlot = this.obtenerBlotNodo(quill, img);
		if (!imgBlot || typeof quill.getIndex !== 'function') {
			return;
		}

		const imgIndex = quill.getIndex(imgBlot);
		const dropIndex = this.resolverIndiceDrop(quill, e);
		if (dropIndex < 0 || dropIndex === imgIndex || dropIndex === imgIndex + 1) {
			return;
		}

		const src = img.getAttribute('src') ?? '';
		if (!src) {
			return;
		}
		const width = img.getAttribute('width') || img.style.width?.replace(/px$/i, '') || undefined;
		const height = img.getAttribute('height') || img.style.height?.replace(/px$/i, '') || undefined;
		const alt = img.getAttribute('alt') || undefined;
		const floatValue = img.style.float || '';

		const embedData: Record<string, string> = { src };
		if (width) {
			embedData['width'] = width;
		}
		if (height) {
			embedData['height'] = height;
		}
		if (alt) {
			embedData['alt'] = alt;
		}

		quill.deleteText(imgIndex, 1, 'user');
		const targetIndex = dropIndex > imgIndex ? dropIndex - 1 : dropIndex;
		quill.insertEmbed(targetIndex, 'extendedImage', embedData, 'user');

		if (floatValue) {
			quill.formatText(targetIndex, 1, 'float', floatValue, 'user');
		}
		const [nuevoBlot] = quill.getLeaf?.(targetIndex) ?? [];
		const nuevaImg = nuevoBlot?.domNode as HTMLImageElement | undefined;
		if (nuevaImg instanceof HTMLImageElement) {
			this.ultimaImagenSeleccionada = nuevaImg;
		}

		quill.setSelection(targetIndex + 1, 0, 'user');
		this.ultimaSeleccion = { index: targetIndex + 1, length: 0 };
		setTimeout(() => this.sincronizarCuerpoDesdeEditor(), 0);
	}

	// Qué hace: localiza el blot de Quill asociado a un nodo DOM.
	// Cómo lo hace: consulta scroll.find en la instancia activa de Quill.
	private obtenerBlotNodo(quill: any, node: Node | null): any {
		if (!quill?.scroll || !node) {
			return null;
		}
		try {
			return quill.scroll.find(node, true);
		} catch {
			return null;
		}
	}

	// Qué hace: calcula el índice lineal de Quill bajo las coordenadas del puntero durante un drop.
	// Cómo lo hace: intenta resolver el caret Range en el punto del cursor (incluyendo celdas de tabla) y cae al final del bloque si no hay rango de texto.
	private resolverIndiceDrop(quill: any, e: DragEvent): number {
		const doc = document as any;
		let nativeRange: Range | null = null;

		if (typeof doc.caretRangeFromPoint === 'function') {
			nativeRange = doc.caretRangeFromPoint(e.clientX, e.clientY);
		} else if (typeof doc.caretPositionFromPoint === 'function') {
			const pos = doc.caretPositionFromPoint(e.clientX, e.clientY);
			if (pos?.offsetNode) {
				nativeRange = document.createRange();
				nativeRange.setStart(pos.offsetNode, pos.offset);
				nativeRange.collapse(true);
			}
		}

		if (nativeRange?.startContainer && this.boundQuillRoot?.contains(nativeRange.startContainer)) {
			if (
				quill.selection &&
				typeof quill.selection.normalizeNative === 'function' &&
				typeof quill.selection.normalizedToRange === 'function'
			) {
				try {
					const normalized = quill.selection.normalizeNative(nativeRange);
					const qRange = normalized ? quill.selection.normalizedToRange(normalized) : null;
					if (qRange && typeof qRange.index === 'number') {
						return qRange.index;
					}
				} catch {
					// Respaldo con scroll.find cuando normalizeNative no resuelve celdas vacías.
				}
			}

			const blot = this.obtenerBlotNodo(quill, nativeRange.startContainer);
			if (blot && typeof blot.offset === 'function') {
				const base = blot.offset(quill.scroll);
				return nativeRange.startContainer.nodeType === Node.TEXT_NODE
					? base + nativeRange.startOffset
					: base;
			}
		}

		const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
		const td = el?.closest('td, th') as HTMLElement | null;
		if (td && this.boundQuillRoot?.contains(td)) {
			const linea = (td.querySelector('p, .ql-table-cell-line') as HTMLElement | null) ?? td;
			const blot = this.obtenerBlotNodo(quill, linea);
			if (blot && typeof blot.offset === 'function') {
				return blot.offset(quill.scroll);
			}
		}

		return Math.max(0, (quill.getLength?.() ?? 1) - 1);
	}

	// Qué hace: inserta el parámetro seleccionado en la posición activa del cursor dentro del editor.
	// Cómo lo hace: obtiene la instancia viva de Quill conectada al DOM (y la habilita si estaba bloqueada), inserta {{KEY}} en negrita y sincroniza selección y modelo.
	insertarParametroEnCursor(key: string): void {
		if (this.editorReadOnly || !key) {
			return;
		}

		const token = `{{${key}}}`;
		const quill = this.vincularQuill();
		const quillConectado = !!(quill?.root && document.body.contains(quill.root));

		if (quill && quillConectado) {
			if (typeof quill.enable === 'function' && quill.isEnabled?.() === false) {
				quill.enable(true);
			}
			const seleccionActual = quill.getSelection?.(false);
			const rango = seleccionActual ?? this.ultimaSeleccion;
			const longitudDoc = Math.max(0, (quill.getLength?.() ?? 1) - 1);
			const index =
				rango && typeof rango.index === 'number'
					? Math.min(Math.max(0, rango.index), longitudDoc)
					: longitudDoc;
			const length = rango && typeof rango.length === 'number' ? rango.length : 0;

			quill.focus();
			if (length > 0) {
				quill.deleteText(index, length, 'user');
			}
			quill.insertText(index, token, { bold: true }, 'user');
			const nuevoIndex = index + token.length;
			quill.setSelection(nuevoIndex, 0, 'user');
			this.ultimaSeleccion = { index: nuevoIndex, length: 0 };
			setTimeout(() => this.sincronizarCuerpoDesdeEditor(), 0);
			return;
		}

		const editor = this.htmlEditor?.instance;
		if (!editor) {
			return;
		}

		const rango = editor.getSelection?.(false) ?? this.ultimaSeleccion;
		const longitudDoc = Math.max(0, (editor.getLength?.() ?? 1) - 1);
		const index =
			rango && typeof rango.index === 'number'
				? Math.min(Math.max(0, rango.index), longitudDoc)
				: longitudDoc;
		editor.focus();
		editor.insertText(index, token, { bold: true });
		const nuevoIndex = index + token.length;
		editor.setSelection(nuevoIndex, 0);
		this.ultimaSeleccion = { index: nuevoIndex, length: 0 };
		const valorActual = editor.option?.('value');
		if (typeof valorActual === 'string') {
			this.model.CUERPO_PLANTILLA = valorActual;
		}
	}

	// Qué hace: inserta un encabezado institucional con logo-xx de 120px centrado o a la derecha manteniendo el título centrado en toda la página.
	// Cómo lo hace: para logo a la derecha usa tabla simétrica 1x3 sin bordes con anchos en px (>40px para tableResizing de DevExtreme) y para centrado usa párrafos centrados.
	insertarEncabezado(estilo: 'centrado' | 'derecha' = 'derecha'): void {
		const quill = this.vincularQuill();
		if (this.editorReadOnly || !quill) {
			return;
		}

		const seleccionActual = quill.getSelection?.(false);
		const rango = seleccionActual ?? this.ultimaSeleccion;
		const longitudDoc = Math.max(0, (quill.getLength?.() ?? 1) - 1);
		const index =
			rango && typeof rango.index === 'number'
				? Math.min(Math.max(0, rango.index), longitudDoc)
				: 0;

		const bloqueHtml =
			estilo === 'derecha'
				? '<table style="width: 100%; border-collapse: collapse; border-style: none; border-width: 0px;"><tbody><tr>' +
				  '<td style="width: 190px; border-style: none; border-width: 0px;"><p><br></p></td>' +
				  '<td style="width: 420px; border-style: none; border-width: 0px; vertical-align: middle; text-align: center;"><strong>UNIVERSIDAD EVANGÉLICA DE EL SALVADOR</strong><br></td>' +
				  `<td style="width: 190px; border-style: none; border-width: 0px; vertical-align: middle; text-align: right;"><img src="${this.logoContratoPath}" alt="Logo UEES" width="120"></td>` +
				  '</tr></tbody></table><p><br></p>'
				: '<p style="text-align: center;"><strong>UNIVERSIDAD EVANGÉLICA DE EL SALVADOR</strong></p>' +
				  `<p style="text-align: center;"><img src="${this.logoContratoPath}" alt="Logo UEES" width="120"></p>`;

		quill.focus();
		if (quill.clipboard?.dangerouslyPasteHTML) {
			quill.clipboard.dangerouslyPasteHTML(index, bloqueHtml, 'user');
			setTimeout(() => this.sincronizarCuerpoDesdeEditor(), 0);
		}
	}

	// Qué hace: aplica alineación o flotado (izquierda, centro, derecha o en línea) sobre la imagen seleccionada.
	// Cómo lo hace: resuelve la imagen activa (o la única imagen del editor), ajusta su formato float y alineación de línea en Quill y sincroniza el modelo.
	aplicarPosicionImagen(posicion: 'left' | 'center' | 'right' | 'inline'): void {
		const quill = this.vincularQuill();
		if (this.editorReadOnly || !quill || !this.boundQuillRoot) {
			return;
		}

		let img =
			this.ultimaImagenSeleccionada && this.boundQuillRoot.contains(this.ultimaImagenSeleccionada)
				? this.ultimaImagenSeleccionada
				: null;

		if (!img) {
			const imgs = this.boundQuillRoot.querySelectorAll('img');
			if (imgs.length === 1) {
				img = imgs[0] as HTMLImageElement;
				this.ultimaImagenSeleccionada = img;
			}
		}

		if (!img) {
			this.notifyFx('Haz clic primero sobre la imagen que deseas mover o alinear.', NotifyType.Warning, { raw: true });
			return;
		}

		const blot = this.obtenerBlotNodo(quill, img);
		const idx = blot && typeof quill.getIndex === 'function' ? quill.getIndex(blot) : -1;
		if (idx < 0) {
			return;
		}

		if (posicion === 'left' || posicion === 'right') {
			quill.formatText(idx, 1, 'float', posicion, 'user');
		} else {
			quill.formatText(idx, 1, 'float', false, 'user');
			img.style.removeProperty('float');
			quill.formatLine(idx, 1, 'align', posicion === 'center' ? 'center' : false, 'user');
		}

		setTimeout(() => this.sincronizarCuerpoDesdeEditor(), 0);
	}

	// Qué hace: inserta una tabla centrada sin bordes de firmas (Universidad / Empleado) en la posición activa del editor.
	// Cómo lo hace: usa párrafos <p style="text-align: center;"> dentro de celdas 50%/50% sin bordes (compatibles con CellLine de Quill) o texto de respaldo.
	insertarBloqueFirmas(): void {
		const quill = this.vincularQuill();
		if (this.editorReadOnly || !quill) {
			return;
		}

		const seleccionActual = quill.getSelection?.(false);
		const rango = seleccionActual ?? this.ultimaSeleccion;
		const longitudDoc = Math.max(0, (quill.getLength?.() ?? 1) - 1);
		const index =
			rango && typeof rango.index === 'number'
				? Math.min(Math.max(0, rango.index), longitudDoc)
				: longitudDoc;

		const bloqueHtml =
			'<p><br></p>' +
			'<table style="width: 100%; border-collapse: collapse; border-style: none; border-width: 0px;"><tbody><tr>' +
			'<td style="width: 50%; border-style: none; border-width: 0px; vertical-align: top;">' +
			'<p style="text-align: center;">f) _____________________________</p>' +
			'<p style="text-align: center;"><strong>Por la Universidad</strong></p>' +
			'<p style="text-align: center;"><br></p>' +
			'<p style="text-align: center;"><strong>{{RECTOR_NOMBRE}}</strong></p>' +
			'</td>' +
			'<td style="width: 50%; border-style: none; border-width: 0px; vertical-align: top;">' +
			'<p style="text-align: center;">f) _____________________________</p>' +
			'<p style="text-align: center;"><strong>Empleado(a)</strong></p>' +
			'<p style="text-align: center;"><br></p>' +
			'<p style="text-align: center;"><strong>{{EMPLEADO_NOMBRE_COMPLETO}}</strong></p>' +
			'</td>' +
			'</tr></tbody></table><p><br></p>';

		quill.focus();
		try {
			if (quill.clipboard?.dangerouslyPasteHTML) {
				quill.clipboard.dangerouslyPasteHTML(index, bloqueHtml, 'user');
				setTimeout(() => this.sincronizarCuerpoDesdeEditor(), 0);
				return;
			}
		} catch {
			// Respaldo de texto simple si el portapapeles de Quill no acepta la tabla.
		}

		const fallbackTexto =
			'\nf) _____________________________\nPor la Universidad\n\n{{RECTOR_NOMBRE}}\n\n' +
			'f) _____________________________\nEmpleado(a)\n\n{{EMPLEADO_NOMBRE_COMPLETO}}\n';
		quill.insertText(index, fallbackTexto, {}, 'user');
		setTimeout(() => this.sincronizarCuerpoDesdeEditor(), 0);
	}

	// Qué hace: limpia por completo el contenido del editor (texto, formatos y tablas) tras confirmar.
	// Cómo lo hace: verifica si existe contenido o tabla, solicita confirmación con confirmaAccion y reinicia editor y cursor.
	limpiarTodoContenido(): void {
		if (this.editorReadOnly) {
			return;
		}

		const quill = this.vincularQuill();
		const html = `${this.model?.CUERPO_PLANTILLA ?? ''}`;
		const tieneContenidoHtml = html.replace(/<p><br><\/p>/gi, '').trim() !== '';
		const tieneTextoOTabla = (quill?.getLength?.() ?? 0) > 1 || html.toLowerCase().includes('<table');
		if (!tieneContenidoHtml && !tieneTextoOTabla) {
			return;
		}

		this.confirmaAccion(
			'Limpiar contenido',
			'¿Está seguro de limpiar todo el contenido de la plantilla?',
			() => {
				if (quill) {
					quill.focus();
					quill.deleteText(0, quill.getLength(), 'user');
					quill.setSelection(0, 0, 'user');
				} else {
					this.htmlEditor?.instance?.option('value', '');
				}
				this.model.CUERPO_PLANTILLA = '';
				this.ultimaSeleccion = { index: 0, length: 0 };
				this.ultimaImagenSeleccionada = null;
				this.imagenArrastrada = null;
			}
		);
	}

	// Qué hace: configura las opciones de los botones personalizados del toolbar de dx-html-editor.
	// Cómo lo hace: reconstruye Posición Img, Encabezado, Bloque de Firmas y Limpiar todo únicamente cuando cambia editorReadOnly para evitar reinicializar Quill.
	private actualizarOpcionesBotonFirmas(): void {
		const bloqueado = this.editorReadOnly;
		if (this.opcionesBotonFirmas && this.ultimoBloqueoToolbar === bloqueado) {
			return;
		}
		this.ultimoBloqueoToolbar = bloqueado;
		this.opcionesBotonPosicionImagen = {
			text: 'Posición Img',
			icon: 'move',
			stylingMode: 'outlined',
			height: 24,
			disabled: bloqueado,
			dropDownOptions: { width: 205 },
			elementAttr: { class: 'contrato-toolbar-dropdown-btn' },
			items: [
				{ id: 'left', text: 'Flotar a la izquierda', icon: 'alignleft' },
				{ id: 'center', text: 'Centrar en línea', icon: 'aligncenter' },
				{ id: 'right', text: 'Flotar a la derecha', icon: 'alignright' },
				{ id: 'inline', text: 'Normal (en línea)', icon: 'revert' },
			],
			displayExpr: 'text',
			keyExpr: 'id',
			onItemClick: (e: any) => {
				const id = e?.itemData?.id as 'left' | 'center' | 'right' | 'inline' | undefined;
				if (id) {
					this.aplicarPosicionImagen(id);
				}
			},
		};

		this.opcionesBotonEncabezado = {
			text: '+ Encabezado',
			icon: 'image',
			stylingMode: 'outlined',
			splitButton: true,
			height: 24,
			disabled: bloqueado,
			dropDownOptions: { width: 260 },
			elementAttr: { class: 'contrato-toolbar-dropdown-btn' },
			onButtonClick: () => this.insertarEncabezado('derecha'),
			items: [
				{ id: 'derecha', text: 'Título centrado + Logo derecha', icon: 'alignright' },
				{ id: 'centrado', text: 'Todo centrado', icon: 'aligncenter' },
			],
			displayExpr: 'text',
			keyExpr: 'id',
			onItemClick: (e: any) => {
				const id = e?.itemData?.id as 'centrado' | 'derecha' | undefined;
				if (id) {
					this.insertarEncabezado(id);
				}
			},
		};

		this.opcionesBotonFirmas = {
			text: '+ Bloque de Firmas',
			icon: 'edit',
			stylingMode: 'outlined',
			height: 24,
			disabled: bloqueado,
			elementAttr: { class: 'contrato-toolbar-firmas-btn' },
			onClick: () => this.insertarBloqueFirmas(),
		};

		this.opcionesBotonLimpiarTodo = {
			text: 'Limpiar todo',
			icon: 'trash',
			stylingMode: 'outlined',
			height: 24,
			disabled: bloqueado,
			elementAttr: { class: 'contrato-toolbar-limpiar-btn' },
			onClick: () => this.limpiarTodoContenido(),
		};
	}

	// Qué hace: evalúa si el selector de tipo de contrato tiene un valor válido.
	// Cómo lo hace: marca tipoContratacionInvalido como true cuando el valor es nulo o menor o igual a cero.
	private actualizarEstadoValidacionLookup(): void {
		const value = Number(this.model?.CORR_TIPO_CONTRATACION);
		this.tipoContratacionInvalido = Number.isNaN(value) || value <= 0;
	}

	// Qué hace: determina si el HTML del editor carece de contenido útil.
	// Cómo lo hace: conserva contenido si incluye tablas o imágenes y, de lo contrario, verifica texto visible sin etiquetas ni espacios.
	private esCuerpoVacio(html?: string | null): boolean {
		const raw = `${html ?? ''}`.trim();
		if (!raw) {
			return true;
		}
		if (/<(?:table|img)\b/i.test(raw)) {
			return false;
		}
		const textoPlano = raw
			.replace(/<[^>]+>/g, ' ')
			.replace(/&nbsp;/gi, ' ')
			.trim();
		return textoPlano === '';
	}

	// Qué hace: valida el formulario, solicita confirmación al activar versión 1 y delega el guardado.
	// Cómo lo hace: sincroniza formData y editor; si pasa de Borrador a versión 1 con cuerpo real muestra alerta de confirmación previa.
	guardar(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}

		const cuerpoActual = this.sincronizarCuerpoDesdeEditor();
		const formData = this.dataForm?.instance?.option('formData');
		const tipoContratacionActual = this.model?.CORR_TIPO_CONTRATACION ?? formData?.CORR_TIPO_CONTRATACION ?? null;
		if (formData) {
			this.model = {
				...this.model,
				...formData,
				CORR_TIPO_CONTRATACION: tipoContratacionActual,
				CUERPO_PLANTILLA: cuerpoActual,
			};
		}

		this.actualizarEstadoValidacionLookup();
		const formValidation = this.dataForm?.instance?.validate();
		if ((formValidation && !formValidation.isValid) || !this.service.esValido(this.model, this.notifyFx.bind(this))) {
			if (formValidation && !formValidation.isValid) {
				this.service.esValido(this.model, this.notifyFx.bind(this));
			}
			return;
		}

		const isAdd = this.banderaMtto === UpdateType.Add;
		const cuerpoVacio = this.esCuerpoVacio(cuerpoActual);
		const tieneVersionActiva = Number(this.model?.CORR_VERSION_ACTIVA ?? 0) > 0;

		if (!isAdd && this.creandoNuevaVersion) {
			if (cuerpoVacio) {
				this.notifyFx('El contenido de la nueva versión no puede quedar vacío.', NotifyType.Warning, { raw: true });
				return;
			}
			this.payloadPendienteNuevaVersion = {
				payload: {
					...this.model,
					CUERPO_PLANTILLA: cuerpoActual,
				},
				cuerpoActual,
			};
			this.modalMotivoVersionVisible = true;
			return;
		}

		if (!isAdd && this.puedeEditarVersionSeleccionada && this.versionSeleccionada) {
			if (cuerpoVacio) {
				this.notifyFx('El contenido de la versión activa no puede quedar vacío.', NotifyType.Warning, { raw: true });
				return;
			}
			const versionEditable = this.versionSeleccionada;
			const cuerpoOriginal = versionEditable.CUERPO_PLANTILLA ?? '';
			const payloadEncabezado: GenPlantillaContrato = {
				...this.model,
				CUERPO_PLANTILLA: null,
			};
			if (cuerpoActual !== cuerpoOriginal) {
				this.ejecutarActualizacionVersionActiva(payloadEncabezado, cuerpoActual, versionEditable);
				return;
			}
			this.ejecutarGuardado(payloadEncabezado, false, false);
			return;
		}

		if (!isAdd && tieneVersionActiva && cuerpoVacio) {
			this.notifyFx('La plantilla ya tiene una versión activa; el contenido no puede quedar vacío.', NotifyType.Warning, { raw: true });
			return;
		}

		const payload: GenPlantillaContrato = {
			...this.model,
			CUERPO_PLANTILLA: isAdd || tieneVersionActiva || cuerpoVacio ? null : cuerpoActual,
		};

		if (!isAdd && !tieneVersionActiva && payload.CUERPO_PLANTILLA !== null) {
			this.confirmaAccion(
				'Confirmar Versión 1',
				'¿Seguro que quieres guardar esta Versión 1? No podrás eliminarla y quedará inhabilitada para edición directa; futuros cambios generarán nuevas versiones a partir de la Versión 1.',
				() => this.ejecutarGuardado(payload, false, true)
			);
			return;
		}

		this.ejecutarGuardado(payload, isAdd, false);
	}

	// Qué hace: cierra el modal de motivo/observación sin perder lo redactado en el editor.
	// Cómo lo hace: oculta modalMotivoVersionVisible y limpia la referencia de guardado pendiente.
	cerrarModalMotivoVersion(): void {
		this.modalMotivoVersionVisible = false;
		this.payloadPendienteNuevaVersion = null;
	}

	// Qué hace: confirma el modal de motivo y ejecuta el guardado definitivo de la nueva versión.
	// Cómo lo hace: extrae payloadPendienteNuevaVersion, cierra el modal y delega en ejecutarGuardadoNuevaVersion.
	confirmarGuardarNuevaVersionModal(): void {
		const pendiente = this.payloadPendienteNuevaVersion;
		this.payloadPendienteNuevaVersion = null;
		this.modalMotivoVersionVisible = false;
		if (!pendiente) {
			return;
		}
		this.ejecutarGuardadoNuevaVersion(pendiente.payload, pendiente.cuerpoActual);
	}

	// Qué hace: actualiza primero el encabezado si varió antes de ejecutar una mutación de versión.
	// Cómo lo hace: compara nombre y tipo de contrato contra modelUpdate; si cambiaron guarda encabezado sin sobrescribir cuerpo y encadena operacionVersion$.
	private ejecutarConEncabezadoSiCambio(payload: GenPlantillaContrato, operacionVersion$: Observable<any>): Observable<any> {
		const encabezadoCambio =
			(payload.NOMBRE_PLANTILLA ?? '').trim() !== (this.modelUpdate?.NOMBRE_PLANTILLA ?? '').trim() ||
			Number(payload.CORR_TIPO_CONTRATACION ?? 0) !== Number(this.modelUpdate?.CORR_TIPO_CONTRATACION ?? 0);

		if (!encabezadoCambio) {
			return operacionVersion$;
		}

		return this.service.update({ ...payload, CUERPO_PLANTILLA: null }).pipe(
			switchMap((updRes: any) => {
				if (!updRes?.Result) {
					return of(updRes);
				}
				const guardadoEnc = this.fillData(updRes.Data);
				this.model = guardadoEnc;
				this.modelUpdate = this.fillData(guardadoEnc);
				this.aplicarRegistroEnGrid(guardadoEnc, false);
				return operacionVersion$;
			})
		);
	}

	// Qué hace: persiste cambios directos del cuerpo HTML (y encabezado si varió) sobre la versión v2+ activa sin reconsultar GetAll.
	// Cómo lo hace: invoca ejecutarConEncabezadoSiCambio con actualizarVersion, parchea versiones/modelo y recarga bitácora.
	private ejecutarActualizacionVersionActiva(
		payload: GenPlantillaContrato,
		cuerpoActual: string,
		versionEditable: GenPlantillaContratoVersion
	): void {
		this.loadingVisible = true;
		const reqVersion = {
			CORR_PLANTILLA_CONTRATO: Number(payload.CORR_PLANTILLA_CONTRATO),
			CORR_PLANTILLA_CONTRATO_VERSION: Number(versionEditable.CORR_PLANTILLA_CONTRATO_VERSION),
			CUERPO_PLANTILLA: cuerpoActual,
		};

		this.ejecutarConEncabezadoSiCambio(payload, this.service.actualizarVersion(reqVersion))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response?.Result && response.Data) {
						const actualizada = this.normalizarVersionItem(response.Data as GenPlantillaContratoVersion);
						this.versiones = this.versiones.map((v) =>
							Number(v.CORR_PLANTILLA_CONTRATO_VERSION) === Number(actualizada.CORR_PLANTILLA_CONTRATO_VERSION)
								? actualizada
								: v
						);
						this.versionSeleccionada = actualizada;
						this.aplicarVersionActivaEnModelo(actualizada);
						this.aplicarCuerpoEnEditor(actualizada.CUERPO_PLANTILLA ?? '');
						this.actualizarOpcionesBotonFirmas();
						this.cargarBitacora(actualizada.CORR_PLANTILLA_CONTRATO);
						this.readOnly = false;
						this.AsignaStatus(UpdateType.Update);
						this.notifyFx(`${actualizada.NOMBRE_VERSION} actualizada con éxito.`, NotifyType.Success, { raw: true });
					} else {
						this.notifyApiResponse(response);
					}
					this.loadingVisible = false;
				},
				error: (error: any) => {
					this.notifyApiError(error);
					this.loadingVisible = false;
				},
			});
	}

	// Qué hace: persiste la nueva versión redactada desde v1 (y el encabezado si cambió) sin reconsultar GetAll.
	// Cómo lo hace: actualiza encabezado si varió, llama a crearVersion, pasa versiones previas a Histórica y habilita la nueva versión activa.
	private ejecutarGuardadoNuevaVersion(payload: GenPlantillaContrato, cuerpoActual: string): void {
		this.loadingVisible = true;
		const reqVersion = {
			CORR_PLANTILLA_CONTRATO: Number(payload.CORR_PLANTILLA_CONTRATO),
			CUERPO_PLANTILLA: cuerpoActual,
			OBSERVACION: `${this.observacionNuevaVersion ?? ''}`.trim() || null,
		};

		this.ejecutarConEncabezadoSiCambio(payload, this.service.crearVersion(reqVersion))
			.pipe(take(1))
			.subscribe({
			next: (response: any) => {
				if (response?.Result && response.Data) {
					const nuevaVersion = this.normalizarVersionItem(response.Data as GenPlantillaContratoVersion);
					this.versiones = [
						...this.versiones.map((v) => ({ ...v, ES_VERSION_ACTIVA: false })),
						nuevaVersion,
					];
					this.versionSeleccionada = nuevaVersion;
					this.creandoNuevaVersion = false;
					this.observacionNuevaVersion = '';
					this.aplicarVersionActivaEnModelo(nuevaVersion);
					this.aplicarCuerpoEnEditor(nuevaVersion.CUERPO_PLANTILLA ?? '');
					this.actualizarOpcionesBotonFirmas();
					this.cargarBitacora(nuevaVersion.CORR_PLANTILLA_CONTRATO);
					this.notifyFx(
						`${nuevaVersion.NOMBRE_VERSION} guardada y activada a partir de la Versión 1.`,
						NotifyType.Success,
						{ raw: true }
					);
				} else {
					this.notifyApiResponse(response);
				}
				this.loadingVisible = false;
			},
			error: (error: any) => {
				this.notifyApiError(error);
				this.loadingVisible = false;
			},
		});
	}

	// Qué hace: ejecuta la petición insert o update contra el API y actualiza el estado local sin GetAll.
	// Cómo lo hace: parchea model, modelUpdate y la fila en la grilla, refresca versiones/bitácora cuando aplica y notifica el resultado.
	private ejecutarGuardado(payload: GenPlantillaContrato, isAdd: boolean, esActivacionInicial: boolean): void {
		this.loadingVisible = true;
		const request$ = isAdd ? this.service.insert(payload) : this.service.update(payload);
		request$.pipe(take(1)).subscribe({
			next: (response: any) => {
				if (response?.Result) {
					const guardado = this.fillData(response.Data);
					if (!guardado.NOMBRE_TIPO_CONTRATACION) {
						const tipoSeleccionado = this.mCORR_TIPO_CONTRATACION.find(
							(x) => Number(x?.CORR_TIPO_CONTRATACION) === Number(guardado.CORR_TIPO_CONTRATACION)
						);
						guardado.NOMBRE_TIPO_CONTRATACION = tipoSeleccionado?.NOMBRE_TIPO_CONTRATACION ?? '';
					}

					this.model = guardado;
					this.modelUpdate = this.fillData(guardado);
					this.aplicarRegistroEnGrid(guardado, isAdd);

					if (isAdd) {
						this.activeTabIndex = 0;
						this.cargarBitacora(guardado.CORR_PLANTILLA_CONTRATO);
					} else if (esActivacionInicial || this.versiones.length === 0) {
						this.cargarVersionesYBitacora(guardado.CORR_PLANTILLA_CONTRATO);
					} else {
						const versionActiva = this.versiones.find((v) => v.ES_VERSION_ACTIVA) ?? this.versionSeleccionada;
						this.versionSeleccionada = versionActiva;
						this.aplicarCuerpoEnEditor(guardado.CUERPO_PLANTILLA ?? '');
						this.cargarBitacora(guardado.CORR_PLANTILLA_CONTRATO);
					}

					this.readOnly = false;
					this.actualizarOpcionesBotonFirmas();
					this.AsignaStatus(UpdateType.Update);
					setTimeout(() => {
						this.dataForm?.instance?.option('formData', this.model);
						this.habilitar();
					});

					const mensaje = isAdd
						? 'Plantilla creada en estado Borrador. Ya puede redactar el contenido para guardar la versión 1.'
						: esActivacionInicial
							? 'Versión 1 guardada y activada con éxito.'
							: 'Plantilla guardada con éxito.';

					this.notifyFx(mensaje, NotifyType.Success, { raw: true });
				} else {
					this.notifyApiResponse(response);
				}
				this.loadingVisible = false;
			},
			error: (error: any) => {
				this.notifyApiError(error);
				this.loadingVisible = false;
			},
		});
	}

	// Qué hace: convierte errores de llave foránea al eliminar en una advertencia legible.
	// Cómo lo hace: intercepta excepciones de relación y devuelve IResult con Result en false.
	private convertirErrorMttoEnWarning<T>(request: Observable<T>): Observable<T> {
		return request.pipe(
			catchError((error: any) => {
				const mensaje = `${
					error?.ErrorMessage ?? error?.error?.ErrorMessage ?? error?.error?.message ?? error?.error ?? error?.message ?? error ?? ''
				}`;
				const normalizado = mensaje.toLowerCase();
				const tieneRelacion = [
					'foreign key',
					'reference constraint',
					'clave externa',
					'clave foránea',
					'llave foránea',
					'hijos',
					'registros relacionados',
					'registros asociados',
					'asociados',
				].some((texto) => normalizado.includes(texto));

				if (tieneRelacion) {
					return of({
						Result: false,
						ErrorCode: 2627,
						ErrorMessage: 'No se puede eliminar porque tiene registros relacionados.',
					} as T);
				}

				return throwError(() => error);
			})
		);
	}

	// Qué hace: cancela la edición en curso y vuelve al modo Browse.
	// Cómo lo hace: limpia estado del lookup y editor, libera listeners DOM y llama a cancelar base por llave.
	override cancelar(): void {
		this.tipoContratacionInvalido = false;
		this.filtroParametro = '';
		this.filtrarParametros();
		this.desvincularEventosEditor();
		this.quillInstance = null;
		this.ultimaSeleccion = null;
		this.ultimaImagenSeleccionada = null;
		this.imagenArrastrada = null;
		super.cancelar((item: any) => item.CORR_PLANTILLA_CONTRATO === this.modelUpdate?.CORR_PLANTILLA_CONTRATO);
	}

	// Qué hace: elimina la plantilla seleccionada desde la grilla.
	// Cómo lo hace: llama a rowRemovingMtto con el delete del servicio envuelto en manejo de FK.
	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirErrorMttoEnWarning(
					this.service.delete(this.fillParam(e.data.CORR_PLANTILLA_CONTRATO))
				),
		});
	}

	// Qué hace: bloquea los editores del formulario en modo solo lectura.
	// Cómo lo hace: activa readOnly, actualiza botón de firmas y fija readOnly=true en correlativo y nombre.
	override bloquear(): void {
		this.readOnly = true;
		this.actualizarOpcionesBotonFirmas();
		this.dataForm?.instance?.getEditor('CORR_PLANTILLA_CONTRATO')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('NOMBRE_PLANTILLA')?.option('readOnly', true);
	}

	// Qué hace: habilita los campos editables manteniendo el correlativo bloqueado.
	// Cómo lo hace: desactiva readOnly del lookup y editor, actualiza botón de firmas y habilita NOMBRE_PLANTILLA.
	override habilitar(): void {
		this.readOnly = false;
		this.actualizarOpcionesBotonFirmas();
		setTimeout(() => {
			this.dataForm?.instance?.getEditor('CORR_PLANTILLA_CONTRATO')?.option('readOnly', true);
			this.dataForm?.instance?.getEditor('NOMBRE_PLANTILLA')?.option('readOnly', false);
		});
	}

	// Qué hace: enfoca el campo nombre al entrar al formulario.
	// Cómo lo hace: llama a focus() sobre el editor NOMBRE_PLANTILLA con setTimeout.
	override setFocus(): void {
		setTimeout(() => {
			this.dataForm?.instance?.getEditor('NOMBRE_PLANTILLA')?.focus();
		});
	}
}
