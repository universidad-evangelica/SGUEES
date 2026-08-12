// Qué hace: vista de asignación de puestos a unidades del organigrama.
// Cómo: grilla de unidades + modal con checkbox (marcados = asignados; Guardar inserta/elimina).
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { from, of } from 'rxjs';
import { catchError, concatMap, map, take, toArray } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { environment } from 'src/environments/environment';
import {
	GenPuestoAsignarItem,
	GenPuestoLookupItem,
	GenUnidadesPuesto,
	GenUnidadesPuestoUnidad,
} from './models/gen-unidades-puesto';
import { GenUnidadesPuestoService } from './gen-unidades-puesto.service';

@Component({
	selector: 'app-gen-unidades-puesto',
	templateUrl: './gen-unidades-puesto.component.html',
	styleUrls: ['./gen-unidades-puesto.component.scss'],
})
// Qué hace: componente de puestos por unidad.
// Cómo: browse = unidades; Asignar puestos abre modal (check = asignado); Guardar sincroniza altas/bajas.
export class GenUnidadesPuestoComponent extends CBaseComponent implements OnInit {
	@ViewChild('dataGrid', { static: false }) dataGrid!: DataGridMttoComponent;
	@ViewChild('gridAsignarPuestos', { static: false }) gridAsignarPuestos?: DxDataGridComponent;

	protected override etiquetaRegistro = 'la asignacion de puestos';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_UNIDAD';
	protected override mttoRemoteOperations = false;

	asignaciones: GenUnidadesPuesto[] = [];
	unidadSeleccionada: GenUnidadesPuestoUnidad | null = null;
	mCORR_PUESTO: GenPuestoLookupItem[] = [];
	asignandoTodosPuestos = false;

	popupAsignarVisible = false;
	puestosModal: GenPuestoAsignarItem[] = [];
	asignandoPuestosModal = false;

	private readonly maintenanceSubtitulo = 'Puestos por Unidad';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenUnidadesPuestoService,
		private cdr: ChangeDetectorRef
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
	}

	// Qué hace: título del popup de asignación.
	// Cómo: muestra el nombre de la unidad seleccionada.
	get popupAsignarTitulo(): string {
		const nombre = (this.unidadSeleccionada?.NOMBRE_UNIDAD ?? '').trim();
		return nombre ? `Asignar puestos - ${nombre}` : 'Asignar puestos';
	}

	// Qué hace: texto del botón Asignar puestos en el ribbon (abre modal; no exige U).
	get textoBtnAsignarPuestos(): string {
		return this.isBrowse() ? 'Asignar puestos' : '';
	}

	// Qué hace: texto del botón Asignar todos en el ribbon (escribe; exige U).
	get textoBtnAsignarTodos(): string {
		return this.isBrowse() && this.permiteEdit ? 'Asignar todos los puestos' : '';
	}

	// Qué hace: entrega el grid de unidades al flujo base de CBaseComponent.
	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	// Qué hace: inicializa la vista al abrirla.
	// Cómo: fija subtítulo, modo Browse, carga lookup de puestos y consulta unidades/asignaciones.
	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.AsignaStatus(UpdateType.Browse);
		this.getCORR_PUESTO();
		this.consultar();
	}

	// Qué hace: mantiene el subtítulo al cambiar de estado.
	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	// Qué hace: construye el modelo de unidad para la grilla.
	override fillData(xModel?: GenUnidadesPuestoUnidad): GenUnidadesPuestoUnidad {
		if (xModel !== undefined) {
			return {
				CORR_UNIDAD: Number(xModel.CORR_UNIDAD),
				CODIGO_UNIDAD: (xModel.CODIGO_UNIDAD ?? '').trim(),
				NOMBRE_UNIDAD: (xModel.NOMBRE_UNIDAD ?? '').trim(),
				CANT_PUESTOS: Number(xModel.CANT_PUESTOS ?? 0),
				ACTIVO: xModel.ACTIVO !== false,
			};
		}
		return { CORR_UNIDAD: 0, CODIGO_UNIDAD: '', NOMBRE_UNIDAD: '', CANT_PUESTOS: 0, ACTIVO: true };
	}

	// Qué hace: refresca unidades y asignaciones del browse.
	consultar(): void {
		this.getCORR_UNIDAD();
		this.consultarAsignaciones();
	}

	// Qué hace: carga las unidades del organigrama hacia models (grilla global mtto).
	getCORR_UNIDAD(): void {
		this.appInfoService
			.getLookUp(
				'GEN_UNIDADES_PUESTO',
				'SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES',
				'GetCORR_UNIDAD',
				undefined,
				environment.UrlGENERALAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (!response?.Result || !Array.isArray(response.Data)) {
						this.models = [];
						return;
					}

					this.models = response.Data
						.filter((item: any) => item?.ACTIVO !== false)
						.map((item: any) => ({
							CORR_UNIDAD: Number(item.CORR_UNIDAD),
							CODIGO_UNIDAD: (item.CODIGO_UNIDAD ?? '').trim(),
							NOMBRE_UNIDAD: (item.NOMBRE_UNIDAD ?? '').trim(),
							CANT_PUESTOS: 0,
							ACTIVO: item.ACTIVO !== false,
						}));
					this.aplicarContadoresUnidades();
					this.refrescarGridMtto(false);
				},
				error: (error) => {
					this.models = [];
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: carga el catálogo de puestos activos.
	getCORR_PUESTO(): void {
		this.appInfoService
			.getLookUp(
				'GEN_UNIDADES_PUESTO',
				'PLA_PUESTO',
				'GetCORR_PUESTO',
				undefined,
				environment.UrlTALENTOHUMANONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (!response?.Result || !Array.isArray(response.Data)) {
						this.mCORR_PUESTO = [];
						return;
					}

					this.mCORR_PUESTO = response.Data
						.filter((item: any) => item?.ESTADO_PUESTO !== false)
						.map((item: any) => ({
							CORR_PUESTO: Number(item.CORR_PUESTO),
							CODIGO_PUESTO: (item.CODIGO_PUESTO ?? '').trim(),
							NOMBRE_PUESTO: (item.NOMBRE_PUESTO ?? '').trim(),
							ESTADO_PUESTO: item.ESTADO_PUESTO !== false,
						}));
				},
				error: (error) => {
					this.mCORR_PUESTO = [];
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: obtiene todas las asignaciones unidad-puesto de la empresa.
	consultarAsignaciones(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}

		this.loadingVisible = true;
		this.service
			.getAll()
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						this.asignaciones = [];
						this.aplicarContadoresUnidades();
						return;
					}

					this.asignaciones = (response.Data ?? []).map((item: GenUnidadesPuesto) => ({
						...item,
						CORR_UNIDAD: Number(item.CORR_UNIDAD),
						CORR_PUESTO: Number(item.CORR_PUESTO),
					}));
					this.aplicarContadoresUnidades();
					this.refrescarGridMtto(false);
				},
				error: (error) => {
					this.loadingVisible = false;
					this.asignaciones = [];
					this.aplicarContadoresUnidades();
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: abre el modal de puestos de la unidad seleccionada en la grilla.
	onAsignarPuestosHeader(): void {
		const unidad = this.obtenerUnidadSeleccionadaBrowse();
		if (!unidad) {
			this.notifyFx('Debe seleccionar una unidad.', NotifyType.Warning);
			return;
		}
		this.abrirAsignarPuestos(unidad);
	}

	// Qué hace: asigna todos los puestos a la unidad seleccionada en la grilla.
	onAsignarTodosHeader(): void {
		const unidad = this.obtenerUnidadSeleccionadaBrowse();
		if (!unidad) {
			this.notifyFx('Debe seleccionar una unidad.', NotifyType.Warning);
			return;
		}
		this.confirmarAsignarTodosPuestos(unidad);
	}

	// Qué hace: abre el popup con todos los puestos del catálogo.
	// Cómo: marca SELECCION=true en los ya asignados a la unidad y muestra el dx-popup.
	abrirAsignarPuestos(unidad: GenUnidadesPuestoUnidad): void {
		if (!unidad?.CORR_UNIDAD) {
			return;
		}
		if (this.asignandoPuestosModal || this.asignandoTodosPuestos) {
			return;
		}

		this.unidadSeleccionada = this.fillData(unidad);
		this.puestosModal = this.armarPuestosParaModal(Number(unidad.CORR_UNIDAD));
		this.popupAsignarVisible = true;
		this.cdr.detectChanges();
	}

	// Qué hace: marca todos los puestos del modal.
	selectTodos(): void {
		this.puestosModal = (this.puestosModal ?? []).map((item) => ({
			...item,
			SELECCION: true,
		}));
		this.cdr.detectChanges();
	}

	// Qué hace: desmarca todos los puestos del modal.
	selectNinguno(): void {
		this.puestosModal = (this.puestosModal ?? []).map((item) => ({
			...item,
			SELECCION: false,
		}));
		this.cdr.detectChanges();
	}

	// Qué hace: cierra el popup de asignación.
	cerrarPopupAsignar(): void {
		if (this.asignandoPuestosModal) {
			this.popupAsignarVisible = true;
			return;
		}
		this.popupAsignarVisible = false;
		this.puestosModal = [];
		this.unidadSeleccionada = null;
	}

	// Qué hace: guarda altas y bajas según el checkbox del modal.
	// Cómo: todos marcados → API masiva asignar; ninguno marcado → API masiva quitar; parcial → foreach.
	guardarAsignacionModal(): void {
		if (!this.permiteEdit || this.asignandoPuestosModal) {
			return;
		}

		const unidad = this.unidadSeleccionada;
		if (!unidad?.CORR_UNIDAD) {
			this.notifyFx('Debe indicar la unidad.', NotifyType.Warning);
			return;
		}

		const corrUnidad = Number(unidad.CORR_UNIDAD);
		const lista = this.puestosModal ?? [];
		if (!lista.length) {
			this.notifyFx('No hay puestos para asignar.', NotifyType.Warning);
			return;
		}

		const asignadosActuales = new Set(
			(this.asignaciones ?? [])
				.filter((item) => Number(item.CORR_UNIDAD) === corrUnidad)
				.map((item) => Number(item.CORR_PUESTO))
				.filter((corr) => corr > 0)
		);

		const aInsertar = lista.filter(
			(item) => !!item.SELECCION && !asignadosActuales.has(Number(item.CORR_PUESTO))
		);
		const aEliminar = lista.filter(
			(item) => !item.SELECCION && asignadosActuales.has(Number(item.CORR_PUESTO))
		);
		const todosMarcados = lista.every((item) => !!item.SELECCION);
		const ningunoMarcado = lista.every((item) => !item.SELECCION);

		if (!aInsertar.length && !aEliminar.length) {
			this.notifyFx('Cambios guardados con exito!', NotifyType.Success, { raw: true });
			this.popupAsignarVisible = false;
			this.puestosModal = [];
			this.unidadSeleccionada = null;
			return;
		}

		// Qué hace: si el usuario marcó todos, usa la API masiva (sin foreach de insert).
		if (todosMarcados) {
			this.guardarAsignacionModalMasiva(unidad, aInsertar.length);
			return;
		}

		// Qué hace: si no marcó ninguno, usa la API masiva de quitar (sin foreach de delete).
		if (ningunoMarcado) {
			this.guardarQuitarTodosModalMasiva(unidad, aEliminar.length);
			return;
		}

		this.guardarAsignacionModalUnoAUno(unidad, corrUnidad, aInsertar, aEliminar);
	}

	// Qué hace: asigna todos los puestos faltantes con la API masiva desde el modal.
	// Cómo: llama asignarTodosPuestos, parchea memoria y cierra el popup.
	private guardarAsignacionModalMasiva(unidad: GenUnidadesPuestoUnidad, pendientes: number): void {
		this.asignandoPuestosModal = true;
		this.loadingVisible = true;
		this.service
			.asignarTodosPuestos({ CORR_UNIDAD: Number(unidad.CORR_UNIDAD) })
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.asignandoPuestosModal = false;
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}

					const cant = Number(response.RowsAffected ?? pendientes ?? 0);
					if (cant <= 0) {
						this.notifyFx('Todos los puestos ya estan asignados a esta unidad.', NotifyType.Warning);
					} else {
						this.notifyFx(
							cant === 1
								? '1 puesto asignado.'
								: `Se asignaron ${cant} puestos a la unidad.`,
							NotifyType.Success,
							{ raw: true }
						);
						this.aplicarAsignacionMasivaEnMemoria(unidad, cant);
					}

					this.popupAsignarVisible = false;
					this.puestosModal = [];
					this.unidadSeleccionada = null;
					this.cdr.detectChanges();
				},
				error: (error) => {
					this.asignandoPuestosModal = false;
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: quita todos los puestos de la unidad con la API masiva desde el modal.
	// Cómo: llama quitarTodosPuestos, limpia asignaciones en memoria y cierra el popup.
	private guardarQuitarTodosModalMasiva(unidad: GenUnidadesPuestoUnidad, pendientes: number): void {
		this.asignandoPuestosModal = true;
		this.loadingVisible = true;
		this.service
			.quitarTodosPuestos({ CORR_UNIDAD: Number(unidad.CORR_UNIDAD) })
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.asignandoPuestosModal = false;
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}

					const cant = Number(response.RowsAffected ?? pendientes ?? 0);
					if (cant <= 0) {
						this.notifyFx('La unidad no tenia puestos asignados.', NotifyType.Warning);
					} else {
						this.notifyFx(
							cant === 1
								? '1 puesto quitado.'
								: `Se quitaron ${cant} puestos de la unidad.`,
							NotifyType.Success,
							{ raw: true }
						);
						this.aplicarQuitarTodosEnMemoria(unidad);
					}

					this.popupAsignarVisible = false;
					this.puestosModal = [];
					this.unidadSeleccionada = null;
					this.cdr.detectChanges();
				},
				error: (error) => {
					this.asignandoPuestosModal = false;
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: sincroniza altas/bajas del modal uno a uno.
	// Cómo: inserta los nuevos marcados y elimina los desmarcados; parchea memoria.
	private guardarAsignacionModalUnoAUno(
		unidad: GenUnidadesPuestoUnidad,
		corrUnidad: number,
		aInsertar: GenPuestoAsignarItem[],
		aEliminar: GenPuestoAsignarItem[]
	): void {
		type OperacionModal = {
			tipo: 'insert' | 'delete';
			puesto: GenPuestoAsignarItem;
		};
		const operaciones: OperacionModal[] = [
			...aInsertar.map((puesto) => ({ tipo: 'insert' as const, puesto })),
			...aEliminar.map((puesto) => ({ tipo: 'delete' as const, puesto })),
		];

		this.asignandoPuestosModal = true;
		this.loadingVisible = true;

		from(operaciones)
			.pipe(
				concatMap((op) => {
					const payload: GenUnidadesPuesto = {
						CORR_EMPRESA: 0,
						CORR_UNIDAD: corrUnidad,
						CODIGO_UNIDAD: unidad.CODIGO_UNIDAD ?? '',
						NOMBRE_UNIDAD: unidad.NOMBRE_UNIDAD ?? '',
						CORR_PUESTO: Number(op.puesto.CORR_PUESTO),
						CODIGO_PUESTO: op.puesto.CODIGO_PUESTO ?? '',
						NOMBRE_PUESTO: op.puesto.NOMBRE_PUESTO ?? '',
					};
					const request$ =
						op.tipo === 'insert' ? this.service.insert(payload) : this.service.delete(payload);
					return request$.pipe(
						take(1),
						catchError((error) =>
							of({
								Result: false,
								ErrorMessage: this.getErrorMessageFromAny(error),
								_tipo: op.tipo,
								_puesto: op.puesto,
							} as any)
						),
						map((response: any) => ({
							...response,
							_tipo: op.tipo,
							_puesto: op.puesto,
						}))
					);
				}),
				toArray()
			)
			.subscribe({
				next: (responses: any[]) => {
					this.asignandoPuestosModal = false;
					this.loadingVisible = false;

					const ok = responses.filter((r) => r?.Result);
					const fail = responses.filter((r) => !r?.Result);
					let insertOk = 0;
					let deleteOk = 0;

					for (const response of ok) {
						if (response._tipo === 'insert') {
							const mapped = this.mapPuestoAsignado(response.Data ?? response._puesto ?? {}, unidad);
							if (mapped.CORR_PUESTO) {
								this.aplicarPuestoAsignadoEnMemoria(mapped);
								insertOk += 1;
							}
						} else if (response._tipo === 'delete') {
							const corrPuesto = Number(response._puesto?.CORR_PUESTO ?? 0);
							if (corrPuesto > 0) {
								this.aplicarPuestoEliminadoEnMemoria(corrUnidad, corrPuesto);
								deleteOk += 1;
							}
						}
					}

					if (insertOk > 0 || deleteOk > 0) {
						const partes: string[] = [];
						if (insertOk > 0) {
							partes.push(
								insertOk === 1
									? '1 puesto asignado'
									: `${insertOk} puestos asignados`
							);
						}
						if (deleteOk > 0) {
							partes.push(
								deleteOk === 1
									? '1 puesto quitado'
									: `${deleteOk} puestos quitados`
							);
						}
						this.notifyFx(partes.join('. ') + '.', NotifyType.Success, { raw: true });
					}

					if (fail.length > 0) {
						const msg =
							fail[0]?.ErrorMessage ||
							'Algunos puestos no se pudieron actualizar.';
						this.notifyFx(msg, NotifyType.Warning);
					}

					if ((insertOk > 0 || deleteOk > 0) && fail.length === 0) {
						this.popupAsignarVisible = false;
						this.puestosModal = [];
						this.unidadSeleccionada = null;
					} else if (insertOk > 0 || deleteOk > 0) {
						this.puestosModal = this.armarPuestosParaModal(corrUnidad);
					}

					this.cdr.detectChanges();
				},
				error: (error) => {
					this.asignandoPuestosModal = false;
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: pide confirmación para asignar todos los puestos del catálogo a una unidad.
	confirmarAsignarTodosPuestos(unidad?: GenUnidadesPuestoUnidad | null): void {
		if (!this.permiteEdit || this.asignandoTodosPuestos || this.asignandoPuestosModal) {
			return;
		}
		const destino = unidad ?? this.unidadSeleccionada;
		if (!destino?.CORR_UNIDAD) {
			this.notifyFx('Debe indicar la unidad.', NotifyType.Warning);
			return;
		}

		const nombre = (destino.NOMBRE_UNIDAD ?? '').trim() || 'la unidad seleccionada';
		this.confirmaAccion(
			'Asignar todos los puestos',
			`¿Desea asignar todos los puestos del catalogo a ${nombre}?`,
			() => this.ejecutarAsignarTodosPuestos(destino)
		);
	}

	// Qué hace: recalcula CANT_PUESTOS de todas las unidades en browse.
	private aplicarContadoresUnidades(): void {
		this.models = ((this.models as GenUnidadesPuestoUnidad[]) ?? []).map((unidad) => ({
			...unidad,
			CANT_PUESTOS: this.asignaciones.filter(
				(item) => Number(item.CORR_UNIDAD) === Number(unidad.CORR_UNIDAD)
			).length,
		}));
	}

	// Qué hace: arma la lista del modal con todos los puestos del catálogo.
	// Cómo: SELECCION=true si el CORR_PUESTO ya está en asignaciones de esa unidad.
	private armarPuestosParaModal(corrUnidad: number): GenPuestoAsignarItem[] {
		const asignados = new Set(
			(this.asignaciones ?? [])
				.filter((item) => Number(item.CORR_UNIDAD) === corrUnidad)
				.map((item) => Number(item.CORR_PUESTO))
				.filter((corr) => corr > 0)
		);

		return (this.mCORR_PUESTO ?? [])
			.map((item) => ({
				...item,
				SELECCION: asignados.has(Number(item.CORR_PUESTO)),
			}))
			.sort((a, b) => Number(a.CORR_PUESTO) - Number(b.CORR_PUESTO));
	}

	// Qué hace: obtiene la unidad marcada en la grilla browse.
	private obtenerUnidadSeleccionadaBrowse(): GenUnidadesPuestoUnidad | null {
		const unidad = this.model as GenUnidadesPuestoUnidad;
		if (!unidad?.CORR_UNIDAD) {
			return null;
		}
		return unidad;
	}

	// Qué hace: asigna a la unidad todos los puestos activos que aún no tenga.
	private ejecutarAsignarTodosPuestos(unidad: GenUnidadesPuestoUnidad): void {
		this.asignandoTodosPuestos = true;
		this.loadingVisible = true;
		this.service
			.asignarTodosPuestos({ CORR_UNIDAD: Number(unidad.CORR_UNIDAD) })
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.asignandoTodosPuestos = false;
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}

					const cant = Number(response.RowsAffected ?? 0);
					if (cant <= 0) {
						this.notifyFx('Todos los puestos ya estan asignados a esta unidad.', NotifyType.Warning);
					} else {
						this.notifyFx(`Se asignaron ${cant} puestos a la unidad.`, NotifyType.Success, {
							raw: true,
						});
					}
					this.aplicarAsignacionMasivaEnMemoria(unidad, cant);
				},
				error: (error) => {
					this.asignandoTodosPuestos = false;
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: arma la fila de puesto asignado para memoria local.
	private mapPuestoAsignado(source: any, unidad: GenUnidadesPuestoUnidad): GenUnidadesPuesto {
		const corrPuesto = Number(source?.CORR_PUESTO ?? 0);
		const catalog = this.mCORR_PUESTO.find((item) => Number(item.CORR_PUESTO) === corrPuesto);
		return {
			CORR_EMPRESA: Number(source?.CORR_EMPRESA ?? 0),
			CORR_UNIDAD: Number(source?.CORR_UNIDAD ?? unidad.CORR_UNIDAD ?? 0),
			CODIGO_UNIDAD: (source?.CODIGO_UNIDAD ?? unidad.CODIGO_UNIDAD ?? '').toString().trim(),
			NOMBRE_UNIDAD: (source?.NOMBRE_UNIDAD ?? unidad.NOMBRE_UNIDAD ?? '').toString().trim(),
			CORR_PUESTO: corrPuesto,
			CODIGO_PUESTO: (source?.CODIGO_PUESTO ?? catalog?.CODIGO_PUESTO ?? '').toString().trim(),
			NOMBRE_PUESTO: (source?.NOMBRE_PUESTO ?? catalog?.NOMBRE_PUESTO ?? '').toString().trim(),
		};
	}

	// Qué hace: agrega la asignación en memoria y actualiza el contador (sin GetAll).
	private aplicarPuestoAsignadoEnMemoria(record: GenUnidadesPuesto): void {
		const corrUnidad = Number(record.CORR_UNIDAD);
		const corrPuesto = Number(record.CORR_PUESTO);
		if (!corrUnidad || !corrPuesto) {
			return;
		}

		const existe = (this.asignaciones ?? []).some(
			(item) =>
				Number(item.CORR_UNIDAD) === corrUnidad && Number(item.CORR_PUESTO) === corrPuesto
		);
		if (!existe) {
			this.asignaciones = [...(this.asignaciones ?? []), record];
		}

		this.models = ((this.models as GenUnidadesPuestoUnidad[]) ?? []).map((item) =>
			Number(item.CORR_UNIDAD) === corrUnidad
				? {
						...item,
						CANT_PUESTOS: (this.asignaciones ?? []).filter(
							(a) => Number(a.CORR_UNIDAD) === corrUnidad
						).length,
				  }
				: item
		);
	}

	// Qué hace: quita la asignación en memoria y actualiza el contador (sin GetAll).
	private aplicarPuestoEliminadoEnMemoria(corrUnidad: number, corrPuesto: number): void {
		if (!corrUnidad || !corrPuesto) {
			return;
		}

		this.asignaciones = (this.asignaciones ?? []).filter(
			(item) =>
				!(Number(item.CORR_UNIDAD) === corrUnidad && Number(item.CORR_PUESTO) === corrPuesto)
		);

		this.models = ((this.models as GenUnidadesPuestoUnidad[]) ?? []).map((item) =>
			Number(item.CORR_UNIDAD) === corrUnidad
				? {
						...item,
						CANT_PUESTOS: (this.asignaciones ?? []).filter(
							(a) => Number(a.CORR_UNIDAD) === corrUnidad
						).length,
				  }
				: item
		);
	}

	// Qué hace: refleja en memoria el resultado de asignar todos los puestos.
	private aplicarAsignacionMasivaEnMemoria(unidad: GenUnidadesPuestoUnidad, asignados: number): void {
		if (asignados <= 0) {
			return;
		}

		const ya = new Set(
			(this.asignaciones ?? [])
				.filter((item) => Number(item.CORR_UNIDAD) === Number(unidad.CORR_UNIDAD))
				.map((item) => Number(item.CORR_PUESTO))
				.filter((corr) => corr > 0)
		);
		const nuevos = (this.mCORR_PUESTO ?? [])
			.filter((item) => item.ESTADO_PUESTO !== false && !ya.has(Number(item.CORR_PUESTO)))
			.map((item) => this.mapPuestoAsignado({
				CORR_UNIDAD: unidad.CORR_UNIDAD,
				CODIGO_UNIDAD: unidad.CODIGO_UNIDAD,
				NOMBRE_UNIDAD: unidad.NOMBRE_UNIDAD,
				CORR_PUESTO: item.CORR_PUESTO,
				CODIGO_PUESTO: item.CODIGO_PUESTO,
				NOMBRE_PUESTO: item.NOMBRE_PUESTO,
			}, unidad));

		this.asignaciones = [...(this.asignaciones ?? []), ...nuevos];
		this.models = ((this.models as GenUnidadesPuestoUnidad[]) ?? []).map((item) =>
			Number(item.CORR_UNIDAD) === Number(unidad.CORR_UNIDAD)
				? { ...item, CANT_PUESTOS: Number(item.CANT_PUESTOS ?? 0) + asignados }
				: item
		);

		if (this.popupAsignarVisible && Number(this.unidadSeleccionada?.CORR_UNIDAD) === Number(unidad.CORR_UNIDAD)) {
			this.puestosModal = this.armarPuestosParaModal(Number(unidad.CORR_UNIDAD));
		}
		this.cdr.detectChanges();
	}

	// Qué hace: limpia en memoria todos los puestos de la unidad tras quitar masivo.
	private aplicarQuitarTodosEnMemoria(unidad: GenUnidadesPuestoUnidad): void {
		const corrUnidad = Number(unidad.CORR_UNIDAD);
		if (!corrUnidad) {
			return;
		}

		this.asignaciones = (this.asignaciones ?? []).filter(
			(item) => Number(item.CORR_UNIDAD) !== corrUnidad
		);
		this.models = ((this.models as GenUnidadesPuestoUnidad[]) ?? []).map((item) =>
			Number(item.CORR_UNIDAD) === corrUnidad ? { ...item, CANT_PUESTOS: 0 } : item
		);

		if (this.popupAsignarVisible && Number(this.unidadSeleccionada?.CORR_UNIDAD) === corrUnidad) {
			this.puestosModal = this.armarPuestosParaModal(corrUnidad);
		}
		this.cdr.detectChanges();
	}

	// Qué hace: obtiene un mensaje usable desde errores HTTP/API.
	private getErrorMessageFromAny(error: any): string {
		if (typeof error === 'string' && error.trim()) {
			return error.trim();
		}
		return (
			error?.error?.ErrorMessage ||
			error?.ErrorMessage ||
			error?.message ||
			'No se pudo asignar el puesto.'
		);
	}
}
