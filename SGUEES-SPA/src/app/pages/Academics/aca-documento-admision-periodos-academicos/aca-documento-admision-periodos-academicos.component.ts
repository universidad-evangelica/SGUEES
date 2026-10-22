// Qué hace: configura en qué períodos académicos se muestra cada documento de admisión.
// Cómo: el browse lista los documentos y el popup marca o quita períodos sin volver a consultar todo.
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { from, of } from 'rxjs';
import { catchError, concatMap, map, take, toArray } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { AcaDocumentoAdmisionPeriodosAcademicosService } from './aca-documento-admision-periodos-academicos.service';
import { AcaPeriodosAcademicosService } from './aca-periodos-academicos/aca-periodos-academicos.service';
import { AcaDocumentoPeriodo, AcaDocumentoPeriodoAsignacion } from './models/aca-documento-admision-periodos-academicos';
import { AcaPeriodoDocumento, AcaPeriodoDocumentoSeleccion } from './aca-periodos-academicos/models/aca-periodo-academico';

@Component({
	selector: 'app-aca-documento-admision-periodos-academicos',
	templateUrl: './aca-documento-admision-periodos-academicos.component.html',
	styleUrls: ['./aca-documento-admision-periodos-academicos.component.scss'],
})
export class AcaDocumentoAdmisionPeriodosAcademicosComponent extends CBaseComponent implements OnInit {
	@ViewChild('dataGrid', { static: false }) dataGrid!: DataGridMttoComponent;
	@ViewChild('popupPeriodos') popupPeriodos?: any;

	protected override etiquetaRegistro = 'el período del documento';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 10;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_DOCUMENTO_ADMISION';
	protected override mttoRemoteOperations = false;

	asignaciones: AcaDocumentoPeriodoAsignacion[] = [];
	periodos: AcaPeriodoDocumento[] = [];
	periodosModal: AcaPeriodoDocumentoSeleccion[] = [];
	documentoSeleccionado: AcaDocumentoPeriodo | null = null;
	popupVisible = false;
	guardando = false;
	periodoModalPageSize = 10;

	private readonly maintenanceSubtitulo = 'Documentos por período';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: AcaDocumentoAdmisionPeriodosAcademicosService,
		private periodosService: AcaPeriodosAcademicosService,
		private cdr: ChangeDetectorRef
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
	}

	// Qué hace: arma el título del popup.
	// Cómo: agrega el código y el nombre del documento enfocado.
	get popupTitulo(): string {
		const codigo = (this.documentoSeleccionado?.CODIGO ?? '').trim();
		const nombre = (this.documentoSeleccionado?.NOMBRE_DOCUMENTO ?? '').trim();
		const texto = [codigo, nombre].filter((parte) => !!parte).join(' - ');
		return texto ? `Mostrar períodos - ${texto}` : 'Mostrar períodos';
	}

	// Qué hace: muestra el botón del ribbon en browse.
	// Cómo: el texto vacío oculta el botón fuera de la grilla.
	get textoBtnMostrarPeriodos(): string {
		return this.isBrowse() ? 'Mostrar períodos' : '';
	}

	// Qué hace: integra el grid con CBaseComponent.
	// Cómo: devuelve la referencia de DataGridMtto.
	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	// Qué hace: abre la vista en browse.
	// Cómo: carga documentos, marcas y el catálogo de períodos.
	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.AsignaStatus(UpdateType.Browse);
		this.consultar();
	}

	// Qué hace: conserva el subtítulo en browse.
	// Cómo: delega el estado base y repone el texto de mantenimiento.
	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	// Qué hace: normaliza un documento del browse.
	// Cómo: limpia textos y convierte el contador a número.
	override fillData(xModel?: AcaDocumentoPeriodo): AcaDocumentoPeriodo {
		if (xModel) {
			return {
				CORR_DOCUMENTO_ADMISION: Number(xModel.CORR_DOCUMENTO_ADMISION ?? 0),
				CODIGO: (xModel.CODIGO ?? '').trim(),
				NOMBRE_DOCUMENTO: (xModel.NOMBRE_DOCUMENTO ?? '').trim(),
				ORDEN: Number(xModel.ORDEN ?? 0),
				OBLIGATORIO: xModel.OBLIGATORIO === true,
				ACTIVO: xModel.ACTIVO !== false,
				CANT_PERIODOS: Number(xModel.CANT_PERIODOS ?? 0),
			};
		}
		return { CORR_DOCUMENTO_ADMISION: 0, CODIGO: '', NOMBRE_DOCUMENTO: '', ORDEN: 0, CANT_PERIODOS: 0 };
	}

	// Qué hace: recarga la vista.
	// Cómo: vuelve a pedir documentos, marcas y períodos.
	consultar(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		this.cargarDocumentos();
		this.cargarAsignaciones();
		this.cargarPeriodos();
	}

	// Qué hace: abre el popup del documento enfocado.
	// Cómo: arma los períodos con check en los que ya tienen fila.
	onMostrarPeriodos(): void {
		const documento = this.obtenerDocumentoSeleccionado();
		if (!documento) {
			this.notifyFx('Debe seleccionar un documento.', NotifyType.Warning);
			return;
		}
		this.documentoSeleccionado = this.fillData(documento);
		this.periodoModalPageSize = 10;
		this.periodosModal = this.armarPeriodosModal(documento.CORR_DOCUMENTO_ADMISION);
		this.popupVisible = true;
		this.cdr.detectChanges();
	}

	// Qué hace: con 5 o 10 filas la tabla se encoge; con más, mantiene altura y scroll.
	// Cómo: deja espacio para el título, los botones y el paginador dentro de la pantalla.
	get alturaPeriodosModal(): string {
		return this.periodoModalPageSize <= 10 ? 'auto' : 'calc(100vh - 300px)';
	}

	// Qué hace: actualiza la altura cuando cambia el tamaño de página del popup.
	// Cómo: reaplica la altura en la grilla para que el paginador no quede fuera.
	onPeriodosModalOptionChanged(e: any): void {
		if (e?.fullName !== 'paging.pageSize' || !(Number(e.value) > 0)) {
			return;
		}
		this.periodoModalPageSize = Number(e.value);
		const altura = this.alturaPeriodosModal;
		setTimeout(() => {
			e.component?.option('height', altura);
			e.component?.updateDimensions?.();
			this.popupPeriodos?.instance?.repaint();
		});
	}

	// Qué hace: marca todos los períodos del popup.
	// Cómo: deja SELECCION en true sin guardar todavía.
	selectTodos(): void {
		this.periodosModal = this.periodosModal.map((item) => ({ ...item, SELECCION: true }));
		this.cdr.detectChanges();
	}

	// Qué hace: desmarca todos los períodos del popup.
	// Cómo: deja SELECCION en false; al guardar se eliminan las filas.
	selectNinguno(): void {
		this.periodosModal = this.periodosModal.map((item) => ({ ...item, SELECCION: false }));
		this.cdr.detectChanges();
	}

	// Qué hace: cierra el popup.
	// Cómo: lo mantiene abierto mientras se está guardando.
	cerrarPopup(): void {
		if (this.guardando) {
			this.popupVisible = true;
			return;
		}
		this.documentoSeleccionado = null;
		this.periodosModal = [];
	}

	// Qué hace: guarda los checks del documento.
	// Cómo: inserta los nuevos y elimina los que se quitaron, y parchea la grilla.
	guardarPeriodos(): void {
		if (!this.permiteEdit || this.guardando) {
			return;
		}
		const documento = this.documentoSeleccionado;
		if (!documento?.CORR_DOCUMENTO_ADMISION || !this.periodosModal.length) {
			this.notifyFx('No hay períodos para mostrar.', NotifyType.Warning);
			return;
		}
		const corrDocumento = Number(documento.CORR_DOCUMENTO_ADMISION);
		const actuales = new Set(
			this.asignaciones
				.filter((item) => Number(item.CORR_DOCUMENTO_ADMISION) === corrDocumento)
				.map((item) => Number(item.CORR_PERIODO_ACADEMICO))
		);
		const aInsertar = this.periodosModal.filter(
			(item) => item.SELECCION && !actuales.has(Number(item.CORR_PERIODO_ACADEMICO))
		);
		const aEliminar = this.periodosModal.filter(
			(item) => !item.SELECCION && actuales.has(Number(item.CORR_PERIODO_ACADEMICO))
		);
		if (!aInsertar.length && !aEliminar.length) {
			this.notifyFx('Cambios guardados con éxito.', NotifyType.Success, { raw: true });
			this.popupVisible = false;
			this.cerrarPopup();
			return;
		}
		this.ejecutarCambios(corrDocumento, aInsertar, aEliminar);
	}

	// Qué hace: carga los documentos del browse.
	// Cómo: lee GetAll y refresca la grilla.
	private cargarDocumentos(): void {
		this.loadingVisible = true;
		this.service.getAll().pipe(take(1)).subscribe({
			next: (response: any) => {
				this.loadingVisible = false;
				this.models = response?.Result && Array.isArray(response.Data)
					? response.Data.map((item: AcaDocumentoPeriodo) => this.fillData(item))
					: [];
				this.aplicarContadores();
			},
			error: (error) => {
				this.loadingVisible = false;
				this.models = [];
				this.notifyApiError(error);
			},
		});
	}

	// Qué hace: carga las marcas existentes.
	// Cómo: guarda la relación en memoria para pintar el check y el contador.
	private cargarAsignaciones(): void {
		this.service.getAsignaciones().pipe(take(1)).subscribe({
			next: (response: any) => {
				this.asignaciones = response?.Result && Array.isArray(response.Data)
					? response.Data.map((item: any) => this.mapAsignacion(item))
					: [];
				this.aplicarContadores();
			},
			error: (error) => {
				this.asignaciones = [];
				this.notifyApiError(error);
			},
		});
	}

	// Qué hace: carga los períodos de la empresa.
	// Cómo: GetLookUp de la subcarpeta ACA_PERIODOS_ACADEMICOS y los deja en memoria.
	private cargarPeriodos(): void {
		this.periodosService.getPeriodos().pipe(take(1)).subscribe({
			next: (response: any) => {
				this.periodos = response?.Result && Array.isArray(response.Data)
					? response.Data.map((item: any) => this.mapPeriodo(item))
					: [];
			},
			error: (error) => {
				this.periodos = [];
				this.notifyApiError(error);
			},
		});
	}

	// Qué hace: toma el documento enfocado en la grilla.
	// Cómo: lee el modelo que deja focusedRowChanged.
	private obtenerDocumentoSeleccionado(): AcaDocumentoPeriodo | null {
		const corr = Number(this.model?.CORR_DOCUMENTO_ADMISION ?? 0);
		if (corr <= 0) {
			return null;
		}
		const encontrado = (this.models as AcaDocumentoPeriodo[]).find(
			(item) => Number(item.CORR_DOCUMENTO_ADMISION) === corr
		);
		return encontrado ?? this.fillData(this.model);
	}

	// Qué hace: arma las filas del popup.
	// Cómo: muestra los períodos activos y los ya marcados, con el check encendido.
	private armarPeriodosModal(corrDocumento: number): AcaPeriodoDocumentoSeleccion[] {
		const marcados = new Set(
			this.asignaciones
				.filter((item) => Number(item.CORR_DOCUMENTO_ADMISION) === Number(corrDocumento))
				.map((item) => Number(item.CORR_PERIODO_ACADEMICO))
		);
		return this.periodos
			.filter((item) => item.ACTIVO !== false || marcados.has(Number(item.CORR_PERIODO_ACADEMICO)))
			.map((item) => ({
				...item,
				SELECCION: marcados.has(Number(item.CORR_PERIODO_ACADEMICO)),
			}));
	}

	// Qué hace: persiste altas y bajas del popup.
	// Cómo: llama insert o delete uno a uno y parchea memoria con la respuesta.
	private ejecutarCambios(
		corrDocumento: number,
		aInsertar: AcaPeriodoDocumentoSeleccion[],
		aEliminar: AcaPeriodoDocumentoSeleccion[]
	): void {
		const operaciones = [
			...aInsertar.map((periodo) => ({ tipo: 'insert' as const, periodo })),
			...aEliminar.map((periodo) => ({ tipo: 'delete' as const, periodo })),
		];
		this.guardando = true;
		this.loadingVisible = true;
		from(operaciones)
			.pipe(
				concatMap((op) => {
					const payload: AcaDocumentoPeriodoAsignacion = {
						CORR_EMPRESA: 0,
						CORR_DOCUMENTO_ADMISION: corrDocumento,
						CORR_PERIODO_ACADEMICO: Number(op.periodo.CORR_PERIODO_ACADEMICO),
						CICLO: op.periodo.CICLO,
						NOMBRE_SEDE: op.periodo.NOMBRE_SEDE,
						ALCANCE: op.periodo.ALCANCE,
						LUGAR: op.periodo.LUGAR,
					};
					const request$ = op.tipo === 'insert'
						? this.service.insert(payload)
						: this.service.delete(payload);
					return request$.pipe(
						take(1),
						catchError((error) => of({
							Result: false,
							ErrorMessage: error?.error?.ErrorMessage || error?.message || 'No se pudo actualizar el período.',
							_tipo: op.tipo,
							_periodo: op.periodo,
						})),
						map((response: any) => ({
							...response,
							_tipo: op.tipo,
							_periodo: op.periodo,
						}))
					);
				}),
				toArray()
			)
			.subscribe({
				next: (responses: any[]) => {
					this.guardando = false;
					this.loadingVisible = false;
					const ok = responses.filter((item) => item?.Result);
					const fail = responses.filter((item) => !item?.Result);
					let insertOk = 0;
					let deleteOk = 0;
					for (const response of ok) {
						if (response._tipo === 'insert') {
							const mapped = this.mapAsignacion(response.Data ?? {
								CORR_DOCUMENTO_ADMISION: corrDocumento,
								CORR_PERIODO_ACADEMICO: response._periodo?.CORR_PERIODO_ACADEMICO,
								CICLO: response._periodo?.CICLO,
								NOMBRE_SEDE: response._periodo?.NOMBRE_SEDE,
								ALCANCE: response._periodo?.ALCANCE,
								LUGAR: response._periodo?.LUGAR,
							});
							if (mapped.CORR_PERIODO_ACADEMICO > 0) {
								this.aplicarInsertEnMemoria(mapped);
								insertOk += 1;
							}
						} else if (response._tipo === 'delete') {
							const corrPeriodo = Number(response._periodo?.CORR_PERIODO_ACADEMICO ?? 0);
							if (corrPeriodo > 0) {
								this.aplicarDeleteEnMemoria(corrDocumento, corrPeriodo);
								deleteOk += 1;
							}
						}
					}
					if (insertOk > 0 || deleteOk > 0) {
						const partes: string[] = [];
						if (insertOk > 0) {
							partes.push(insertOk === 1 ? '1 período asignado' : `${insertOk} períodos asignados`);
						}
						if (deleteOk > 0) {
							partes.push(deleteOk === 1 ? '1 período quitado' : `${deleteOk} períodos quitados`);
						}
						this.notifyFx(partes.join('. ') + '.', NotifyType.Success, { raw: true });
					}
					if (fail.length > 0) {
						this.notifyFx(
							fail[0]?.ErrorMessage || 'Algunos períodos no se pudieron actualizar.',
							NotifyType.Warning
						);
						this.periodosModal = this.armarPeriodosModal(corrDocumento);
					} else {
						this.popupVisible = false;
						this.cerrarPopup();
					}
					this.cdr.detectChanges();
				},
				error: (error) => {
					this.guardando = false;
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: normaliza un período del catálogo.
	// Cómo: arma el ciclo, el lugar y el texto de activo para la grilla del popup.
	private mapPeriodo(item: any): AcaPeriodoDocumento {
		const anio = Number(item?.ANIO ?? 0);
		const numero = item?.NUMERO_PERIODO === null || item?.NUMERO_PERIODO === undefined
			? null
			: Number(item.NUMERO_PERIODO);
		const lugar = (item?.NOMBRE_CARRERA || item?.NOMBRE_FACULTAD || item?.NOMBRE_AREA || '').toString().trim();
		return {
			CORR_EMPRESA: Number(item?.CORR_EMPRESA ?? 0),
			CORR_PERIODO_ACADEMICO: Number(item?.CORR_PERIODO_ACADEMICO ?? 0),
			ANIO: anio,
			NUMERO_PERIODO: numero ?? undefined,
			CICLO: numero === null ? String(anio || '') : `${anio}-${String(numero).padStart(2, '0')}`,
			NOMBRE_SEDE: (item?.NOMBRE_SEDE ?? '').toString().trim(),
			ALCANCE: (item?.ALCANCE ?? '').toString().trim(),
			LUGAR: lugar,
			FECHA_INICIO: item?.FECHA_INICIO,
			FECHA_FIN: item?.FECHA_FIN,
			ACTIVO: item?.ACTIVO !== false,
			ACTIVO_TEXTO: item?.ACTIVO !== false ? 'Sí' : 'No',
		};
	}

	// Qué hace: normaliza una fila de la relación.
	// Cómo: convierte correlativos y completa el ciclo con el catálogo si la vista no lo trae.
	private mapAsignacion(item: any): AcaDocumentoPeriodoAsignacion {
		const corrPeriodo = Number(item?.CORR_PERIODO_ACADEMICO ?? 0);
		const periodo = this.periodos.find((row) => Number(row.CORR_PERIODO_ACADEMICO) === corrPeriodo);
		return {
			CORR_EMPRESA: Number(item?.CORR_EMPRESA ?? 0),
			CORR_DOCUMENTO_ADMISION: Number(item?.CORR_DOCUMENTO_ADMISION ?? 0),
			CORR_PERIODO_ACADEMICO: corrPeriodo,
			CODIGO: (item?.CODIGO ?? '').toString().trim(),
			NOMBRE_DOCUMENTO: (item?.NOMBRE_DOCUMENTO ?? '').toString().trim(),
			CICLO: (item?.CICLO ?? periodo?.CICLO ?? '').toString().trim(),
			NOMBRE_SEDE: (item?.NOMBRE_SEDE ?? periodo?.NOMBRE_SEDE ?? '').toString().trim(),
			ALCANCE: (item?.ALCANCE ?? periodo?.ALCANCE ?? '').toString().trim(),
			LUGAR: (item?.LUGAR ?? periodo?.LUGAR ?? '').toString().trim(),
		};
	}

	// Qué hace: agrega una asignación en memoria.
	// Cómo: reemplaza la fila de la misma llave y recalcula el contador.
	private aplicarInsertEnMemoria(item: AcaDocumentoPeriodoAsignacion): void {
		this.asignaciones = [
			...this.asignaciones.filter(
				(row) =>
					!(
						Number(row.CORR_DOCUMENTO_ADMISION) === Number(item.CORR_DOCUMENTO_ADMISION) &&
						Number(row.CORR_PERIODO_ACADEMICO) === Number(item.CORR_PERIODO_ACADEMICO)
					)
			),
			item,
		];
		this.aplicarContadores();
	}

	// Qué hace: quita una asignación en memoria.
	// Cómo: saca la fila por documento y período y recalcula el contador.
	private aplicarDeleteEnMemoria(corrDocumento: number, corrPeriodo: number): void {
		this.asignaciones = this.asignaciones.filter(
			(row) =>
				!(
					Number(row.CORR_DOCUMENTO_ADMISION) === Number(corrDocumento) &&
					Number(row.CORR_PERIODO_ACADEMICO) === Number(corrPeriodo)
				)
		);
		this.aplicarContadores();
	}

	// Qué hace: actualiza la cantidad de períodos de cada documento.
	// Cómo: cuenta las marcas en memoria y refresca la grilla.
	private aplicarContadores(): void {
		if (!Array.isArray(this.models)) {
			return;
		}
		this.models = (this.models as AcaDocumentoPeriodo[]).map((item) => ({
			...item,
			CANT_PERIODOS: this.asignaciones.filter(
				(row) => Number(row.CORR_DOCUMENTO_ADMISION) === Number(item.CORR_DOCUMENTO_ADMISION)
			).length,
		}));
		const corr = Number(this.model?.CORR_DOCUMENTO_ADMISION ?? 0);
		if (corr > 0) {
			const actual = (this.models as AcaDocumentoPeriodo[]).find(
				(item) => Number(item.CORR_DOCUMENTO_ADMISION) === corr
			);
			if (actual) {
				this.model = actual;
			}
		}
		this.refrescarGridMtto(false);
	}
}
