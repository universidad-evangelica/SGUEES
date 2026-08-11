// Qué hace: vista de asignación de puestos a unidades del organigrama.
// Cómo: grilla de unidades + detalle con tab Puestos (sin modal); coordina lookups, CRUD de la intermedia y GenUnidadesPuestoService.
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DxDataGridComponent } from 'devextreme-angular/ui/data-grid';
import { take } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { environment } from 'src/environments/environment';
import {
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
// Cómo: extiende CBaseComponent; browse = unidades; form = detalle de la unidad con grilla de puestos asignados.
export class GenUnidadesPuestoComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;
	@ViewChild('gridPuestos', { static: false }) gridPuestos!: DxDataGridComponent;

	protected override etiquetaRegistro = 'la asignacion de puestos';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_UNIDAD';
	protected override mttoRemoteOperations = false;

	asignaciones: GenUnidadesPuesto[] = [];
	puestosDetalle: GenUnidadesPuesto[] = [];
	puestosEditando = false;
	puestosInsertando = false;
	unidadSeleccionada: GenUnidadesPuestoUnidad | null = null;
	puestoFocusedKey: number | null = null;
	puestoSeleccionado: GenUnidadesPuesto | null = null;

	mCORR_PUESTO: GenPuestoLookupItem[] = [];
	mCORR_PUESTO_DISPONIBLES: GenPuestoLookupItem[] = [];
	asignandoTodosPuestos = false;

	readonly puestosLookupColumns = [
		{ dataField: 'CORR_PUESTO', caption: 'Corr.', width: 80 },
		{ dataField: 'NOMBRE_PUESTO', caption: 'Puesto', width: 260 },
	];

	private readonly maintenanceSubtitulo = 'Puestos por Unidad';
	private clientKeySeq = 0;

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenUnidadesPuestoService,
		private cdr: ChangeDetectorRef
	) {
		super(appInfoService, router);
		this.puestoDeleteButtonVisible = this.puestoDeleteButtonVisible.bind(this);
		this.selectedLookUpCORR_PUESTO = this.selectedLookUpCORR_PUESTO.bind(this);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
	}

	// Qué hace: texto del botón Asignar puestos en el ribbon (solo browse con permiso C).
	// Cómo: si no es browse o no hay permiso, devuelve vacío para ocultar btn1.
	get textoBtnAsignarPuestos(): string {
		return this.isBrowse() && this.permiteAdd ? 'Asignar puestos' : '';
	}

	// Qué hace: texto del botón Asignar todos en el ribbon (solo browse con permiso C).
	// Cómo: si no es browse o no hay permiso, devuelve vacío para ocultar btn2.
	get textoBtnAsignarTodos(): string {
		return this.isBrowse() && this.permiteAdd ? 'Asignar todos los puestos' : '';
	}

	// Qué hace: entrega el grid de unidades al flujo base de CBaseComponent.
	// Cómo: devuelve la referencia dataGrid enlazada con @ViewChild, o null si aún no está disponible.
	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	// Qué hace: evita parchear la grilla de unidades desde el flujo base cuando se está en detalle.
	// Cómo: si no es browse no hace nada; en browse delega a CBaseComponent.
	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.isBrowse()) {
			return;
		}
		super.aplicarRegistroEnGrid(data, isAdd);
	}

	// Qué hace: inicializa la vista al abrirla.
	// Cómo: fija subtítulo, modo Browse, carga lookup de puestos y consulta unidades/asignaciones.
	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.AsignaStatus(UpdateType.Browse);
		this.getCORR_PUESTO();
		this.consultar();
	}

	// Qué hace: reacciona a los cambios de estado del formulario (browse / detalle).
	// Cómo: llama a AsignaStatus del base y, al volver a Browse, restaura el subtítulo de mantenimiento.
	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	// Qué hace: construye el modelo de unidad para la grilla/detalle.
	// Cómo: si recibe xModel copia correlativo, códigos, nombre y contador; si no, devuelve una unidad vacía.
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

	// Qué hace: refresca datos según el modo actual.
	// Cómo: en detalle carga puestos de la unidad; en browse carga unidades y asignaciones.
	consultar(): void {
		if (!this.isBrowse()) {
			this.cargarPuestosDetalle();
			return;
		}
		this.getCORR_UNIDAD();
		this.consultarAsignaciones();
	}

	// Qué hace: carga las unidades del organigrama hacia models (grilla global mtto).
	// Cómo: lookup GetCORR_UNIDAD vía UrlGENERALAPI y luego aplica contadores con las asignaciones.
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

	// Qué hace: carga el catálogo de puestos para el lookup del detalle.
	// Cómo: lookup GetCORR_PUESTO vía UrlTALENTOHUMANONAPI; filtra inactivos y actualiza los disponibles.
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
						this.mCORR_PUESTO_DISPONIBLES = [];
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
					this.actualizarPuestosLookupDisponibles();
				},
				error: (error) => {
					this.mCORR_PUESTO = [];
					this.mCORR_PUESTO_DISPONIBLES = [];
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: obtiene todas las asignaciones unidad-puesto de la empresa.
	// Cómo: llama a getAll del servicio sin filtro de unidad y recalcula CANT_PUESTOS en la grilla.
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

	// Qué hace: abre el detalle de puestos de la unidad seleccionada en la grilla.
	// Cómo: toma la unidad del browse; si no hay fila, avisa y no abre.
	onAsignarPuestosHeader(): void {
		const unidad = this.obtenerUnidadSeleccionadaBrowse();
		if (!unidad) {
			this.notifyFx('Debe seleccionar una unidad.', NotifyType.Warning);
			return;
		}
		this.abrirAsignarPuestos(unidad);
	}

	// Qué hace: asigna todos los puestos a la unidad seleccionada en la grilla.
	// Cómo: toma la unidad del browse; si no hay fila, avisa; si hay, confirma y asigna.
	onAsignarTodosHeader(): void {
		const unidad = this.obtenerUnidadSeleccionadaBrowse();
		if (!unidad) {
			this.notifyFx('Debe seleccionar una unidad.', NotifyType.Warning);
			return;
		}
		this.confirmarAsignarTodosPuestos(unidad);
	}

	// Qué hace: abre el detalle de la unidad (modo form) con el tab Puestos.
	// Cómo: exige permiso de agregar (C); fija unidadSeleccionada/model, limpia selección, pasa a Update y carga puestos.
	abrirAsignarPuestos(unidad: GenUnidadesPuestoUnidad): void {
		if (!this.permiteAdd || !unidad?.CORR_UNIDAD) {
			return;
		}
		this.unidadSeleccionada = this.fillData(unidad);
		this.model = this.fillData(unidad);
		this.modelUpdate = this.fillData(unidad);
		this.limpiarSeleccionPuesto();
		this.puestosEditando = false;
		this.puestosInsertando = false;
		this.AsignaStatus(UpdateType.Update);
		this.subTituloVentana = `Puestos - ${this.unidadSeleccionada.NOMBRE_UNIDAD || 'Unidad'}`;
		this.cargarPuestosDetalle();
	}

	// Qué hace: pide confirmación para asignar todos los puestos del catálogo a una unidad.
	// Cómo: exige permiso C y unidad válida; si hay línea en edición avisa; confirmaAccion y ejecuta la carga masiva.
	confirmarAsignarTodosPuestos(unidad?: GenUnidadesPuestoUnidad | null): void {
		if (!this.permiteAdd || this.asignandoTodosPuestos) {
			return;
		}
		const destino = unidad ?? this.unidadSeleccionada;
		if (!destino?.CORR_UNIDAD) {
			this.notifyFx('Debe indicar la unidad.', NotifyType.Warning);
			return;
		}
		if (this.puestosEditando) {
			this.notifyFx('Cancele o guarde la linea en edicion antes de asignar todos los puestos.', NotifyType.Warning);
			return;
		}

		const nombre = (destino.NOMBRE_UNIDAD ?? '').trim() || 'la unidad seleccionada';
		this.confirmaAccion(
			'Asignar todos los puestos',
			`¿Desea asignar todos los puestos del catalogo a ${nombre}?`,
			() => this.ejecutarAsignarTodosPuestos(destino)
		);
	}

	// Qué hace: acción Guardar de la barra superior del detalle.
	// Cómo: si hay línea en edición la guarda; si no, vuelve a la grilla de unidades.
	guardar(): void {
		if (this.puestosEditando) {
			this.guardarPuestoEditado();
			return;
		}
		this.cerrarDetallePuestos();
	}

	// Qué hace: acción Cancelar de la barra superior: vuelve al listado de unidades.
	// Cómo: si hay línea en edición avisa; si no, confirma y cierra el detalle.
	override cancelar(): void {
		if (this.puestosEditando) {
			this.notifyFx('Cancele o guarde la linea en edicion antes de salir.', NotifyType.Warning);
			return;
		}
		this.confirmaCancelar(() => this.cerrarDetallePuestos());
	}

	// Qué hace: inicia una nueva fila de puesto en la grilla del detalle.
	// Cómo: exige permiso de agregar (C); actualiza lookup, marca insertando/editando y llama addRow.
	agregarPuesto(): void {
		if (!this.permiteAdd || this.puestosEditando || !this.unidadSeleccionada) {
			return;
		}
		this.actualizarPuestosLookupDisponibles();
		this.puestosInsertando = true;
		this.puestosEditando = true;
		setTimeout(() => {
			this.gridPuestos?.instance?.addRow();
		});
	}

	// Qué hace: controla la visibilidad del botón Eliminar en Options.
	// Cómo: exige permiso de eliminar (D); oculta el delete de la fila en edición (editRowKey).
	puestoDeleteButtonVisible(e: any): boolean {
		if (!this.permiteDele) {
			return false;
		}
		const editKey = e?.component?.option?.('editing.editRowKey');
		if (editKey == null) {
			return !!e?.row?.data && !e?.row?.isNewRow;
		}
		return e?.row?.key !== editKey;
	}

	// Qué hace: sincroniza el puesto seleccionado al cambiar el foco de fila.
	// Cómo: pasa la fila o la key a aplicarSeleccionPuesto.
	onPuestoFocusedRowChanged(e: any): void {
		this.aplicarSeleccionPuesto(e?.row?.data ?? e?.rowKey);
	}

	// Qué hace: sincroniza el puesto seleccionado al hacer clic en una fila.
	// Cómo: ignora filas nuevas y pasa los datos a aplicarSeleccionPuesto.
	onPuestoRowClick(e: any): void {
		if (e?.row?.isNewRow) {
			return;
		}
		this.aplicarSeleccionPuesto(e?.data ?? e?.row?.data);
	}

	// Qué hace: confirma la línea en edición de la grilla de puestos.
	// Cómo: llama saveEditData del dx-data-grid; el insert real ocurre en puestoRowInserting.
	guardarPuestoEditado(): void {
		const grid = this.gridPuestos?.instance;
		if (!grid || !this.puestosEditando) {
			this.notifyFx('No hay una linea en edicion', NotifyType.Warning);
			return;
		}
		grid.saveEditData();
	}

	// Qué hace: descarta la línea en edición de puestos.
	// Cómo: cancelEditData del grid y limpia flags (sin recargar GetAll).
	cancelarPuestoEditado(): void {
		const grid = this.gridPuestos?.instance;
		if (grid) {
			grid.cancelEditData();
		}
		this.puestosEditando = false;
		this.puestosInsertando = false;
	}

	// Qué hace: inicializa los valores de una fila nueva de puesto.
	// Cómo: marca insertando/editando y rellena empresa/unidad/puesto vacío.
	puestoInitNewRow(e: any): void {
		this.puestosInsertando = true;
		this.puestosEditando = true;
		e.data.CORR_EMPRESA = 0;
		e.data.CORR_UNIDAD = this.unidadSeleccionada?.CORR_UNIDAD ?? 0;
		e.data.CORR_PUESTO = null;
		e.data.CODIGO_PUESTO = '';
		e.data.NOMBRE_PUESTO = '';
		e.data._clientKey = this.nextClientKey();
	}

	// Qué hace: marca que hay edición en curso al iniciar edición de fila.
	onPuestoEditingStart(_e: any): void {
		this.puestosEditando = true;
	}

	// Qué hace: limpia flags al guardar edición del grid.
	onPuestoSaved(_e: any): void {
		this.puestosEditando = false;
		this.puestosInsertando = false;
	}

	// Qué hace: limpia flags al cancelar edición del grid.
	onPuestoEditCanceled(_e: any): void {
		this.puestosEditando = false;
		this.puestosInsertando = false;
	}

	// Qué hace: inserta la asignación unidad-puesto vía API (cancela el insert local del grid).
	// Cómo: e.cancel = true, valida, llama insert y parchea la grilla con response.Data (sin GetAll).
	puestoRowInserting(e: any): void {
		e.cancel = true;
		const data = { ...(e.data as GenUnidadesPuesto) };
		data.CORR_UNIDAD = this.unidadSeleccionada?.CORR_UNIDAD ?? 0;

		if (!this.service.esValidoPuesto(data, this.notifyFx.bind(this))) {
			return;
		}

		this.loadingVisible = true;
		this.service
			.insert(data)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}
					this.notifyFx('Puesto asignado con exito!', NotifyType.Success, { raw: true });
					this.gridPuestos?.instance?.cancelEditData();
					this.puestosEditando = false;
					this.puestosInsertando = false;
					this.aplicarPuestoEnDetalle(this.mapPuestoAsignado(response.Data ?? data, data), true);
				},
				error: (error) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: elimina la asignación unidad-puesto vía API (cancela el remove local del grid).
	// Cómo: e.cancel = true; exige permiso D; llama delete y quita la fila en memoria (sin GetAll).
	puestoRowRemoving(e: any): void {
		e.cancel = true;
		if (!this.permiteDele || this.puestosEditando) {
			return;
		}
		const data = e.data as GenUnidadesPuesto;
		this.loadingVisible = true;
		this.service
			.delete(data)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}
					this.notifyFx('Puesto removido con exito!', NotifyType.Success, { raw: true });
					if (Number(this.puestoFocusedKey) === Number(data.CORR_PUESTO)) {
						this.limpiarSeleccionPuesto();
					}
					this.quitarPuestoDeDetalle(Number(data.CORR_PUESTO));
				},
				error: (error) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: valida que la fila tenga puesto seleccionado antes de guardar.
	puestoRowValidating(e: any): void {
		const corr = Number(e.newData?.CORR_PUESTO ?? e.oldData?.CORR_PUESTO ?? 0);
		if (!corr || corr <= 0) {
			e.isValid = false;
			e.errorText = 'Debe seleccionar un puesto.';
		}
	}

	// Qué hace: refleja el valor elegido en el lookup de puesto en la celda.
	onPuestoLookupChanged(value: number | null, cellInfo: any): void {
		const corr = value != null && value > 0 ? Number(value) : null;
		cellInfo.setValue(corr);
		this.cdr.detectChanges();
	}

	// Qué hace: extrae la key de la fila seleccionada en el lookup.
	selectedLookUpCORR_PUESTO(vRow: any): number {
		return vRow[0].CORR_PUESTO;
	}

	// Qué hace: al elegir puesto en la celda, completa código y nombre desde el catálogo.
	setPuestoCellValue = (
		newData: GenUnidadesPuesto,
		value: number | null,
		_currentRowData: GenUnidadesPuesto
	): void => {
		const corr = value != null && Number(value) > 0 ? Number(value) : null;
		const catalog = this.mCORR_PUESTO.find((item) => Number(item.CORR_PUESTO) === Number(corr));
		newData.CORR_PUESTO = corr;
		newData.CODIGO_PUESTO = catalog?.CODIGO_PUESTO ?? '';
		newData.NOMBRE_PUESTO = catalog?.NOMBRE_PUESTO ?? '';
	};

	// Qué hace: texto a mostrar en la columna Puesto del grid.
	puestoCatalogDisplay = (row: GenUnidadesPuesto): string => {
		if (!row?.CORR_PUESTO) {
			return '';
		}
		const nombre = (row.NOMBRE_PUESTO ?? '').trim();
		if (nombre) {
			return nombre;
		}
		const catalog = this.mCORR_PUESTO.find((item) => Number(item.CORR_PUESTO) === Number(row.CORR_PUESTO));
		return (catalog?.NOMBRE_PUESTO ?? String(row.CORR_PUESTO)).trim();
	};

	// Qué hace: cierra el detalle y vuelve a la grilla de unidades.
	// Cómo: limpia estado local y AsignaStatus Browse; el contador ya quedó parcheado en memoria.
	private cerrarDetallePuestos(): void {
		this.puestosEditando = false;
		this.puestosInsertando = false;
		this.limpiarSeleccionPuesto();
		this.puestosDetalle = [];
		this.unidadSeleccionada = null;
		this.AsignaStatus(UpdateType.Browse);
		this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
	}

	// Qué hace: fija puestoFocusedKey y puestoSeleccionado.
	private aplicarSeleccionPuesto(source: GenUnidadesPuesto | number | null | undefined): void {
		if (source == null) {
			this.limpiarSeleccionPuesto();
			return;
		}

		let row: GenUnidadesPuesto | null = null;
		if (typeof source === 'object') {
			const corr = Number(source.CORR_PUESTO);
			if (!corr || corr <= 0) {
				this.limpiarSeleccionPuesto();
				return;
			}
			row =
				(this.puestosDetalle ?? []).find((item) => Number(item.CORR_PUESTO) === corr) ??
				({
					...source,
					CORR_PUESTO: corr,
				} as GenUnidadesPuesto);
		} else {
			const corr = Number(source);
			if (!corr || corr <= 0) {
				this.limpiarSeleccionPuesto();
				return;
			}
			row = (this.puestosDetalle ?? []).find((item) => Number(item.CORR_PUESTO) === corr) ?? null;
		}

		if (!row?.CORR_PUESTO) {
			this.limpiarSeleccionPuesto();
			return;
		}

		this.puestoFocusedKey = Number(row.CORR_PUESTO);
		this.puestoSeleccionado = { ...row };
		this.cdr.detectChanges();
	}

	// Qué hace: limpia la selección de puesto del detalle.
	private limpiarSeleccionPuesto(): void {
		this.puestoFocusedKey = null;
		this.puestoSeleccionado = null;
		this.cdr.detectChanges();
	}

	// Qué hace: actualiza el badge CANT_PUESTOS de la unidad abierta y de la grilla.
	private actualizarContadorPuestos(unidad: GenUnidadesPuestoUnidad | null): void {
		if (!unidad) {
			return;
		}
		const cant = (this.puestosDetalle ?? []).length;
		unidad.CANT_PUESTOS = cant;
		const unidadGrid = (this.models as GenUnidadesPuestoUnidad[]).find(
			(item) => Number(item.CORR_UNIDAD) === Number(unidad.CORR_UNIDAD)
		);
		if (unidadGrid) {
			unidadGrid.CANT_PUESTOS = cant;
			this.models = [...this.models];
		}
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

	// Qué hace: carga los puestos asignados a la unidad seleccionada.
	private cargarPuestosDetalle(onLoaded?: () => void): void {
		const corrUnidad = this.unidadSeleccionada?.CORR_UNIDAD;
		if (!corrUnidad) {
			this.puestosDetalle = [];
			return;
		}

		this.loadingVisible = true;
		this.service
			.getAll(corrUnidad)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						this.puestosDetalle = [];
						this.limpiarSeleccionPuesto();
						this.actualizarContadorPuestos(this.unidadSeleccionada);
						return;
					}

					const vistos = new Set<number>();
					this.puestosDetalle = (response.Data ?? [])
						.map((item: GenUnidadesPuesto) => ({
							...item,
							CORR_UNIDAD: Number(item.CORR_UNIDAD),
							CORR_PUESTO: Number(item.CORR_PUESTO),
							_clientKey: `p-${item.CORR_UNIDAD}-${item.CORR_PUESTO}`,
						}))
						.filter((item: GenUnidadesPuesto) => {
							const corr = Number(item.CORR_PUESTO);
							if (!corr || vistos.has(corr)) {
								return false;
							}
							vistos.add(corr);
							return true;
						})
						.sort(
							(a: GenUnidadesPuesto, b: GenUnidadesPuesto) =>
								Number(a.CORR_PUESTO) - Number(b.CORR_PUESTO)
						);

					if (
						this.puestoFocusedKey != null &&
						!this.puestosDetalle.some(
							(item) => Number(item.CORR_PUESTO) === Number(this.puestoFocusedKey)
						)
					) {
						this.limpiarSeleccionPuesto();
					} else if (this.puestoFocusedKey != null) {
						this.aplicarSeleccionPuesto(this.puestoFocusedKey);
					}

					this.actualizarPuestosLookupDisponibles();
					this.actualizarContadorPuestos(this.unidadSeleccionada);
					this.cdr.detectChanges();
					onLoaded?.();
				},
				error: (error) => {
					this.loadingVisible = false;
					this.puestosDetalle = [];
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: deja en el lookup solo puestos aún no asignados a la unidad.
	private actualizarPuestosLookupDisponibles(incluirCorr: number | null = null): void {
		const asignados = new Set(
			(this.puestosDetalle ?? [])
				.map((item) => Number(item.CORR_PUESTO))
				.filter((corr) => corr > 0)
		);

		this.mCORR_PUESTO_DISPONIBLES = (this.mCORR_PUESTO || []).filter((item) => {
			const corr = Number(item.CORR_PUESTO);
			if (incluirCorr != null && corr === Number(incluirCorr)) {
				return true;
			}
			return !asignados.has(corr);
		});
	}

	// Qué hace: obtiene la unidad marcada en la grilla browse.
	// Cómo: usa model.CORR_UNIDAD cargado por focusedRowChanged; si falta, retorna null.
	private obtenerUnidadSeleccionadaBrowse(): GenUnidadesPuestoUnidad | null {
		const unidad = this.model as GenUnidadesPuestoUnidad;
		if (!unidad?.CORR_UNIDAD) {
			return null;
		}
		return unidad;
	}

	// Qué hace: genera una key temporal para filas nuevas del grid.
	private nextClientKey(): string {
		this.clientKeySeq += 1;
		return `tmp-${Date.now()}-${this.clientKeySeq}`;
	}

	// Qué hace: asigna a la unidad todos los puestos activos que aún no tenga.
	// Cómo: una sola petición AsignarTodosPuestos (INSERT...SELECT); luego parchea memoria sin GetAll.
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

	// Qué hace: arma la fila de puesto asignado para la grilla del detalle.
	// Cómo: usa response.Data, el fallback de la línea y el catálogo mCORR_PUESTO para completar nombres.
	private mapPuestoAsignado(source: any, fallback?: GenUnidadesPuesto): GenUnidadesPuesto {
		const corrPuesto = Number(source?.CORR_PUESTO ?? fallback?.CORR_PUESTO ?? 0);
		const catalog = this.mCORR_PUESTO.find((item) => Number(item.CORR_PUESTO) === corrPuesto);
		const unidad = this.unidadSeleccionada;
		return {
			CORR_EMPRESA: Number(source?.CORR_EMPRESA ?? fallback?.CORR_EMPRESA ?? 0),
			CORR_UNIDAD: Number(source?.CORR_UNIDAD ?? fallback?.CORR_UNIDAD ?? unidad?.CORR_UNIDAD ?? 0),
			CODIGO_UNIDAD: (source?.CODIGO_UNIDAD ?? fallback?.CODIGO_UNIDAD ?? unidad?.CODIGO_UNIDAD ?? '').toString().trim(),
			NOMBRE_UNIDAD: (source?.NOMBRE_UNIDAD ?? fallback?.NOMBRE_UNIDAD ?? unidad?.NOMBRE_UNIDAD ?? '').toString().trim(),
			CORR_PUESTO: corrPuesto,
			CODIGO_PUESTO: (source?.CODIGO_PUESTO ?? fallback?.CODIGO_PUESTO ?? catalog?.CODIGO_PUESTO ?? '').toString().trim(),
			NOMBRE_PUESTO: (source?.NOMBRE_PUESTO ?? fallback?.NOMBRE_PUESTO ?? catalog?.NOMBRE_PUESTO ?? '').toString().trim(),
			_clientKey: `p-${source?.CORR_UNIDAD ?? unidad?.CORR_UNIDAD}-${corrPuesto}`,
		};
	}

	// Qué hace: agrega o actualiza un puesto en el detalle y el contador, sin GetAll.
	// Cómo: si isAdd y no existe, lo inserta; sincroniza asignaciones, lookup y CANT_PUESTOS.
	private aplicarPuestoEnDetalle(record: GenUnidadesPuesto, isAdd: boolean): void {
		const corr = Number(record.CORR_PUESTO);
		if (!corr) {
			return;
		}

		const existe = (this.puestosDetalle ?? []).some((item) => Number(item.CORR_PUESTO) === corr);
		if (isAdd && !existe) {
			this.puestosDetalle = [...(this.puestosDetalle ?? []), record].sort(
				(a, b) => Number(a.CORR_PUESTO) - Number(b.CORR_PUESTO)
			);
			this.asignaciones = [...(this.asignaciones ?? []), record];
		} else {
			this.puestosDetalle = (this.puestosDetalle ?? []).map((item) =>
				Number(item.CORR_PUESTO) === corr ? { ...item, ...record } : item
			);
		}

		this.actualizarPuestosLookupDisponibles();
		this.actualizarContadorPuestos(this.unidadSeleccionada);
		this.cdr.detectChanges();
	}

	// Qué hace: quita un puesto del detalle en memoria.
	// Cómo: filtra puestosDetalle y asignaciones por CORR_PUESTO; actualiza lookup y contador.
	private quitarPuestoDeDetalle(corrPuesto: number): void {
		this.puestosDetalle = (this.puestosDetalle ?? []).filter(
			(item) => Number(item.CORR_PUESTO) !== corrPuesto
		);
		this.asignaciones = (this.asignaciones ?? []).filter(
			(item) =>
				!(
					Number(item.CORR_UNIDAD) === Number(this.unidadSeleccionada?.CORR_UNIDAD) &&
					Number(item.CORR_PUESTO) === corrPuesto
				)
		);
		this.actualizarPuestosLookupDisponibles();
		this.actualizarContadorPuestos(this.unidadSeleccionada);
		this.cdr.detectChanges();
	}

	// Qué hace: refleja en memoria el resultado de asignar todos los puestos.
	// Cómo: en detalle agrega los del catálogo que falten; en browse suma RowsAffected al contador.
	private aplicarAsignacionMasivaEnMemoria(unidad: GenUnidadesPuestoUnidad, asignados: number): void {
		if (asignados <= 0) {
			return;
		}

		if (
			!this.isBrowse() &&
			Number(this.unidadSeleccionada?.CORR_UNIDAD) === Number(unidad.CORR_UNIDAD)
		) {
			const ya = new Set(
				(this.puestosDetalle ?? []).map((item) => Number(item.CORR_PUESTO)).filter((corr) => corr > 0)
			);
			const nuevos = (this.mCORR_PUESTO ?? [])
				.filter((item) => item.ESTADO_PUESTO !== false && !ya.has(Number(item.CORR_PUESTO)))
				.map((item) =>
					this.mapPuestoAsignado({
						CORR_UNIDAD: unidad.CORR_UNIDAD,
						CODIGO_UNIDAD: unidad.CODIGO_UNIDAD,
						NOMBRE_UNIDAD: unidad.NOMBRE_UNIDAD,
						CORR_PUESTO: item.CORR_PUESTO,
						CODIGO_PUESTO: item.CODIGO_PUESTO,
						NOMBRE_PUESTO: item.NOMBRE_PUESTO,
					})
				);
			this.puestosDetalle = [...(this.puestosDetalle ?? []), ...nuevos].sort(
				(a, b) => Number(a.CORR_PUESTO) - Number(b.CORR_PUESTO)
			);
			this.asignaciones = [...(this.asignaciones ?? []), ...nuevos];
			this.actualizarPuestosLookupDisponibles();
			this.actualizarContadorPuestos(this.unidadSeleccionada);
			this.cdr.detectChanges();
			return;
		}

		this.models = ((this.models as GenUnidadesPuestoUnidad[]) ?? []).map((item) =>
			Number(item.CORR_UNIDAD) === Number(unidad.CORR_UNIDAD)
				? { ...item, CANT_PUESTOS: Number(item.CANT_PUESTOS ?? 0) + asignados }
				: item
		);
	}
}
