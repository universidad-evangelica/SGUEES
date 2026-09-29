// Qué hace: vista de mantenimiento de Puesto (CRUD del catálogo Payroll PLA_PUESTO).
// Cómo: grilla + formulario con lookup de tipo de puesto; coordina PlaPuestoService.
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { BarraMttoCombox } from 'src/app/layouts/barra-data-mtto/barra-data-mtto.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { environment } from 'src/environments/environment';
import { PlaPuesto } from './models/pla-puesto';
import { PlaPuestoSalario } from './pla-puesto-salario/models/pla-puesto-salario';
import { PlaPuestoService } from './pla-puesto.service';

const ESTADO_FIELD = 'ACTIVO_PUESTO';

@Component({
	selector: 'app-pla-puesto',
	templateUrl: './pla-puesto.component.html',
	styleUrls: ['./pla-puesto.component.scss'],
})
export class PlaPuestoComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'el puesto';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'GRID_KEY';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'NOMBRE_PUESTO';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	mCORR_TIPO_PUESTO: any[] = [];
	readOnly = false;

	// Qué hace: salarios del puesto abierto y unidades que ya lo tienen.
	salarios: PlaPuestoSalario[] = [];
	submodalSalarioVisible = false;
	submodalSalarioEditIndex: number | null = null;
	submodalSalarioDraft: Partial<PlaPuestoSalario> = {};
	unidadSalarioContexto = 0;
	nombreUnidadSalario = '';
	filtroCorrUnidad = 0;
	barraFiltroUnidad: BarraMttoCombox | null = null;
	private filasPuestoUnidad: PlaPuesto[] = [];
	private readonly unidadLookupColumns = [
		{ dataField: 'CODIGO_UNIDAD', caption: 'Codigo', width: 120 },
		{ dataField: 'NOMBRE_UNIDAD', caption: 'Unidad', width: 280 },
	];

	private readonly maintenanceSubtitulo = 'Mantenimiento de Puesto';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: PlaPuestoService
	) {
		super(appInfoService, router);
		this.selectedLookUpCORR_TIPO_PUESTO = this.selectedLookUpCORR_TIPO_PUESTO.bind(this);
		this.selectedLookUpCORR_UNIDAD = this.selectedLookUpCORR_UNIDAD.bind(this);
		this.syncBarraFiltroUnidad();
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.llenaComboBox();
		this.consultar();
	}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
			this.readOnly = false;
		}
	}

	llenaComboBox(): void {
		this.getCORR_TIPO_PUESTO();
	}

	getCORR_TIPO_PUESTO(): void {
		this.appInfoService
			.getLookUp('PLA_PUESTO', 'PLA_TIPO_PUESTO', 'GetCORR_TIPO_PUESTO', undefined, environment.UrlTALENTOHUMANONAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_TIPO_PUESTO = response?.Result && Array.isArray(response.Data) ? response.Data : [];
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	selectedLookUpCORR_TIPO_PUESTO(vRow: any): number {
		return vRow[0].CORR_TIPO_PUESTO;
	}

	onTipoPuestoChanged(value: number | null): void {
		this.model.CORR_TIPO_PUESTO = value != null && Number(value) > 0 ? Number(value) : null;
	}

	selectedLookUpCORR_UNIDAD(vRow: any): number {
		return vRow[0].CORR_UNIDAD;
	}

	fillParam(xCORR_PUESTO?: number): any {
		return { CORR_PUESTO: xCORR_PUESTO ?? 0 };
	}

	override fillData(xModel?: PlaPuesto): PlaPuesto {
		if (xModel !== undefined) {
			const corrUnidad = Number(xModel.CORR_UNIDAD ?? 0);
			const corrPuesto = Number(xModel.CORR_PUESTO ?? 0);
			return {
				CORR_EMPRESA: Number(xModel.CORR_EMPRESA ?? 0),
				CORR_PUESTO: corrPuesto,
				CORR_UNIDAD: corrUnidad > 0 ? corrUnidad : 0,
				CODIGO_UNIDAD: (xModel.CODIGO_UNIDAD ?? '').trim(),
				NOMBRE_UNIDAD: (xModel.NOMBRE_UNIDAD ?? '').trim(),
				GRID_KEY: xModel.GRID_KEY || (corrUnidad > 0 && corrPuesto > 0 ? `${corrUnidad}|${corrPuesto}` : ''),
				NOMBRE_PUESTO: (xModel.NOMBRE_PUESTO ?? '').trim(),
				CODIGO_PUESTO: xModel.CODIGO_PUESTO ?? '',
				CORR_TIPO_PUESTO:
					xModel.CORR_TIPO_PUESTO != null && Number(xModel.CORR_TIPO_PUESTO) > 0
						? Number(xModel.CORR_TIPO_PUESTO)
						: null,
				NOMBRE_TIPO_PUESTO: xModel.NOMBRE_TIPO_PUESTO ?? '',
				ACTIVO_PUESTO: xModel.ACTIVO_PUESTO !== false,
				APROBACION_PUESTO: xModel.APROBACION_PUESTO === true,
				MISION_PUESTO: xModel.MISION_PUESTO ?? '',
				OTROS_ASPECTOS: xModel.OTROS_ASPECTOS ?? '',
				USUARIO_CREA: xModel.USUARIO_CREA ?? '',
				ESTACION_CREA: xModel.ESTACION_CREA ?? '',
				FECHA_CREA: xModel.FECHA_CREA ?? new Date(),
				USUARIO_ACTU: xModel.USUARIO_ACTU ?? '',
				ESTACION_ACTU: xModel.ESTACION_ACTU ?? '',
				FECHA_ACTU: xModel.FECHA_ACTU ?? new Date(),
			};
		}

		return {
			CORR_EMPRESA: 1,
			CORR_PUESTO: 0,
			NOMBRE_PUESTO: '',
			CODIGO_PUESTO: '',
			CORR_TIPO_PUESTO: null,
			NOMBRE_TIPO_PUESTO: '',
			ACTIVO_PUESTO: true,
			APROBACION_PUESTO: false,
			MISION_PUESTO: '',
			OTROS_ASPECTOS: '',
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: new Date(),
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: new Date(),
		};
	}

	consultar(resetPage = false): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		this.loadingVisible = true;
		forkJoin({
			puestos: this.service.getAll(this.fillParam()),
			asignaciones: this.appInfoService.getLookUp(
				'PLA_PUESTO',
				'GEN_UNIDADES_PUESTO',
				'GetAll',
				undefined,
				environment.UrlGENERALAPI
			),
			unidades: this.appInfoService.getLookUp(
				'PLA_PUESTO',
				'SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES',
				'GetCORR_UNIDAD',
				undefined,
				environment.UrlGENERALAPI
			),
		})
			.pipe(take(1))
			.subscribe({
				next: ({ puestos, asignaciones, unidades }: any) => {
					this.loadingVisible = false;
					if (!puestos?.Result) {
						this.notifyApiResponse(puestos);
						return;
					}
					if (!asignaciones?.Result) {
						this.notifyApiResponse(asignaciones);
						return;
					}
					this.filasPuestoUnidad = this.armarFilasOrganigrama(
						puestos.Data ?? [],
						asignaciones.Data ?? [],
						unidades?.Result ? unidades.Data ?? [] : []
					);
					this.syncBarraFiltroUnidad();
					this.aplicarFiltroUnidad(resetPage);
				},
				error: (error) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: arma una fila por unidad y puesto, en el orden del organigrama.
	// Cómo: ordena por CODIGO_UNIDAD (el código sigue el nivel) y luego por el nombre del puesto.
	private armarFilasOrganigrama(puestos: any[], asignaciones: any[], unidades: any[]): PlaPuesto[] {
		const puestoPorCorr = new Map<number, any>();
		(puestos ?? []).forEach((item) => puestoPorCorr.set(Number(item?.CORR_PUESTO), item));
		const unidadPorCorr = new Map<number, any>();
		(unidades ?? []).forEach((item) => unidadPorCorr.set(Number(item?.CORR_UNIDAD), item));

		return (asignaciones ?? [])
			.map((item) => {
				const corrUnidad = Number(item?.CORR_UNIDAD ?? 0);
				const corrPuesto = Number(item?.CORR_PUESTO ?? 0);
				const puesto = puestoPorCorr.get(corrPuesto) ?? {};
				const unidad = unidadPorCorr.get(corrUnidad) ?? {};
				return this.fillData({
					...puesto,
					...item,
					CORR_UNIDAD: corrUnidad,
					CORR_PUESTO: corrPuesto,
					CODIGO_UNIDAD: unidad.CODIGO_UNIDAD || item.CODIGO_UNIDAD || '',
					NOMBRE_UNIDAD: unidad.NOMBRE_UNIDAD || item.NOMBRE_UNIDAD || '',
					CODIGO_PUESTO: puesto.CODIGO_PUESTO || item.CODIGO_PUESTO || '',
					NOMBRE_PUESTO: puesto.NOMBRE_PUESTO || item.NOMBRE_PUESTO || '',
					NOMBRE_TIPO_PUESTO: puesto.NOMBRE_TIPO_PUESTO || item.NOMBRE_TIPO_PUESTO || '',
					ACTIVO_PUESTO: puesto.ACTIVO_PUESTO ?? item.ACTIVO_PUESTO,
					GRID_KEY: `${corrUnidad}|${corrPuesto}`,
				});
			})
			.filter((row) => Number(row.CORR_UNIDAD) > 0 && Number(row.CORR_PUESTO) > 0)
			.sort((a, b) => {
				const codigo = `${a.CODIGO_UNIDAD ?? ''}`.localeCompare(`${b.CODIGO_UNIDAD ?? ''}`);
				if (codigo !== 0) {
					return codigo;
				}
				return `${a.NOMBRE_PUESTO ?? ''}`.localeCompare(`${b.NOMBRE_PUESTO ?? ''}`, 'es');
			});
	}

	// Qué hace: filtra el listado con la unidad elegida en la barra.
	// Cómo: 0 muestra todas; si hay unidad, deja solo sus puestos.
	onFiltroUnidadChanged(value: any): void {
		const corr = Number(value);
		this.filtroCorrUnidad = corr > 0 ? corr : 0;
		this.syncBarraFiltroUnidad();
		if (this.isBrowse()) {
			this.aplicarFiltroUnidad(true);
		}
	}

	private aplicarFiltroUnidad(resetPage = false): void {
		const corr = Number(this.filtroCorrUnidad ?? 0);
		const filas = corr > 0
			? this.filasPuestoUnidad.filter((row) => Number(row.CORR_UNIDAD) === corr)
			: this.filasPuestoUnidad;
		this.models = filas.map((row) => ({ ...row }));
		this.refrescarGridTrasCarga(resetPage);
	}

	// Qué hace: arma el combo de unidad de la barra.
	// Cómo: opción Todos más las unidades que tienen puesto, en orden de código.
	private syncBarraFiltroUnidad(): void {
		const vistas = new Set<number>();
		const unidades = this.filasPuestoUnidad
			.filter((row) => {
				const corr = Number(row.CORR_UNIDAD ?? 0);
				if (corr <= 0 || vistas.has(corr)) {
					return false;
				}
				vistas.add(corr);
				return true;
			})
			.map((row) => ({
				CORR_UNIDAD: Number(row.CORR_UNIDAD),
				CODIGO_UNIDAD: row.CODIGO_UNIDAD ?? '',
				NOMBRE_UNIDAD: row.NOMBRE_UNIDAD ?? '',
			}))
			.sort((a, b) => `${a.CODIGO_UNIDAD}`.localeCompare(`${b.CODIGO_UNIDAD}`));

		this.barraFiltroUnidad = {
			label: 'Unidad',
			model: unidades,
			value: this.filtroCorrUnidad ?? 0,
			valueExpr: 'CORR_UNIDAD',
			displayExpr: 'NOMBRE_UNIDAD',
			lookupColumns: this.unidadLookupColumns,
			selectedRowKeys: this.selectedLookUpCORR_UNIDAD,
			showClearButton: true,
			dropDownWidth: 460,
			width: 320,
			todosOption: { CORR_UNIDAD: 0, CODIGO_UNIDAD: '', NOMBRE_UNIDAD: 'Todas' },
			clearResetsTo: 0,
		};
	}

	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as PlaPuesto);
		if (isAdd || Number(record.CORR_PUESTO) <= 0) {
			this.aplicarFiltroUnidad(isAdd);
			return;
		}

		this.filasPuestoUnidad = this.filasPuestoUnidad.map((row) => {
			if (Number(row.CORR_PUESTO) !== Number(record.CORR_PUESTO)) {
				return row;
			}
			return this.fillData({
				...row,
				...record,
				CORR_UNIDAD: row.CORR_UNIDAD,
				CODIGO_UNIDAD: row.CODIGO_UNIDAD,
				NOMBRE_UNIDAD: row.NOMBRE_UNIDAD,
				GRID_KEY: row.GRID_KEY,
			});
		});
		this.aplicarFiltroUnidad(false);
	}

	protected override quitarRegistroDeGrid(keyValue: unknown): void {
		const fila = this.filasPuestoUnidad.find((row) => row.GRID_KEY === keyValue);
		const corrPuesto = Number(fila?.CORR_PUESTO ?? 0);
		if (corrPuesto <= 0) {
			super.quitarRegistroDeGrid(keyValue);
			return;
		}
		this.filasPuestoUnidad = this.filasPuestoUnidad.filter((row) => Number(row.CORR_PUESTO) !== corrPuesto);
		this.syncBarraFiltroUnidad();
		this.aplicarFiltroUnidad(true);
	}

	protected override sincronizarSeleccionTrasCambioEstado(data: unknown): void {
		const puesto = data as PlaPuesto;
		if (this.model && Number(this.model.CORR_PUESTO) === Number(puesto?.CORR_PUESTO)) {
			this.model = this.fillData({
				...this.model,
				...puesto,
				CORR_UNIDAD: this.model.CORR_UNIDAD,
				CODIGO_UNIDAD: this.model.CODIGO_UNIDAD,
				NOMBRE_UNIDAD: this.model.NOMBRE_UNIDAD,
				GRID_KEY: this.model.GRID_KEY,
			});
		}
		const visible = (this.models as PlaPuesto[]).find((row) => row.GRID_KEY === this.model?.GRID_KEY);
		this.getMttoDataGrid()?.actualizarFocusedRowData(visible ?? this.model);
	}

	private refrescarGridTrasCarga(resetPage = false): void {
		setTimeout(() => {
			this.dataGrid?.refreshData(resetPage);
		}, 0);
	}

	override rowDblClick(e: any): void {
		const rowData = e?.data ?? e?.row?.data;
		this.fijarUnidadSalario(rowData);
		if (rowData) {
			this.model = this.fillData(rowData);
			this.modelUpdate = this.fillData(rowData);
		}
		super.rowDblClick(e);
		this.cargarSalariosDelPuesto();
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
			this.bloquear();
		});
	}

	onEditClick(e: any): void {
		if (!e?.row?.data) {
			return;
		}
		this.fijarUnidadSalario(e.row.data);
		this.model = this.fillData(e.row.data);
		this.editarClick(e);
		this.cargarSalariosDelPuesto();
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
			this.habilitar();
		});
	}

	override nuevo(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		super.nuevo();
		this.fijarUnidadSalario(null);
		this.salarios = [];
		this.cerrarSubmodalSalario();
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
		});
	}

	guardar(): void {
		const formData = this.dataForm?.instance?.option('formData');
		if (formData) {
			this.model = { ...this.model, ...formData };
		}

		const formValidation = this.dataForm?.instance?.validate();
		if (formValidation && !formValidation.isValid) {
			this.service.esValido(this.model, this.notifyFx.bind(this));
			return;
		}

		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
		});
	}

	// Qué hace: convierte un error de llave foránea al eliminar en una advertencia controlada.
	// Cómo: intercepta el error de la petición y, si el mensaje indica una relación, devuelve un IResult con advertencia.
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

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_PUESTO === this.modelUpdate.CORR_PUESTO);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirErrorMttoEnWarning(this.service.delete(this.fillParam(e.data.CORR_PUESTO))),
		});
	}

	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	override bloquear(): void {
		this.readOnly = true;
		const fields = [
			'CORR_PUESTO',
			'CODIGO_PUESTO',
			'NOMBRE_PUESTO',
			'MISION_PUESTO',
			'OTROS_ASPECTOS',
			'APROBACION_PUESTO',
			'ACTIVO_PUESTO',
		];
		fields.forEach((field) => this.dataForm.instance.getEditor(field)?.option('readOnly', true));
	}

	override habilitar(): void {
		const estadoSoloLectura = this.banderaMtto === UpdateType.Update;
		this.readOnly = false;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_PUESTO')?.option('readOnly', true);
			[
				'CODIGO_PUESTO',
				'NOMBRE_PUESTO',
				'MISION_PUESTO',
				'OTROS_ASPECTOS',
				'APROBACION_PUESTO',
			].forEach((field) => this.dataForm.instance.getEditor(field)?.option('readOnly', false));
			this.dataForm.instance.getEditor('ACTIVO_PUESTO')?.option('readOnly', estadoSoloLectura);
		});
	}

	get tienePuestoGuardado(): boolean {
		return Number(this.model?.CORR_PUESTO ?? 0) > 0;
	}

	get tituloSubmodalSalario(): string {
		return this.submodalSalarioEditIndex != null ? 'Editar salario' : 'Agregar salario';
	}

	// Qué hace: indica si otra fila de la misma unidad ya tiene el salario activo.
	// Cómo: ignora la fila que se está activando o editando.
	private hayOtroSalarioActivoEnUnidad(corrUnidad: number | null, exceptoIndex: number | null): boolean {
		const unidad = Number(corrUnidad ?? 0);
		if (unidad <= 0) {
			return false;
		}
		return (this.salarios ?? []).some(
			(s, i) =>
				(exceptoIndex == null || i !== exceptoIndex) &&
				Number(s.CORR_UNIDAD ?? 0) === unidad &&
				!!s.ACTIVO_PUESTO_SALARIO
		);
	}

	// Qué hace: activa o desactiva el salario y lo guarda de inmediato.
	// Cómo: no enciende si esa unidad ya tiene otro activo; en éxito parchea la fila con Data.
	toggleActivoSalario(index: number, event?: Event): void {
		event?.stopPropagation();
		const row = this.salarios[index];
		if (!row || this.readOnly) {
			return;
		}
		const activar = !row.ACTIVO_PUESTO_SALARIO;
		if (activar && this.hayOtroSalarioActivoEnUnidad(row.CORR_UNIDAD, index)) {
			this.notifyFx(
				'Ya hay un salario activo en esa unidad. Desactívelo antes de activar este.',
				NotifyType.Warning
			);
			return;
		}
		this.loadingVisible = true;
		this.service
			.updateSalario({
				...row,
				CORR_PUESTO: Number(this.model?.CORR_PUESTO ?? row.CORR_PUESTO),
				ACTIVO_PUESTO_SALARIO: activar,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}
					const guardado = this.normalizarSalarios([response.Data])[0];
					this.salarios = this.salarios.map((s) =>
						s.CORR_PUESTO_SALARIO === guardado.CORR_PUESTO_SALARIO ? guardado : s
					);
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: recuerda la unidad de la fila que se está editando.
	// Cómo: el salario se guarda en esa unidad, sin volver a pedirla.
	private fijarUnidadSalario(row: any): void {
		const corr = Number(row?.CORR_UNIDAD ?? 0);
		this.unidadSalarioContexto = corr > 0 ? corr : 0;
		this.nombreUnidadSalario = corr > 0 ? `${row?.NOMBRE_UNIDAD ?? ''}`.trim() : '';
	}

	// Qué hace: carga el salario de este puesto en la unidad de la fila.
	// Cómo: GetAll de PLA_PUESTO_SALARIO y deja solo CORR_UNIDAD del contexto.
	private cargarSalariosDelPuesto(): void {
		const corrPuesto = Number(this.model?.CORR_PUESTO ?? 0);
		const corrUnidad = Number(this.unidadSalarioContexto ?? 0);
		if (corrPuesto <= 0 || corrUnidad <= 0) {
			this.salarios = [];
			return;
		}

		this.service
			.getSalarios(corrPuesto)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					const rows = response?.Result ? this.normalizarSalarios(response.Data ?? []) : [];
					this.salarios = rows.filter((row) => Number(row.CORR_UNIDAD) === corrUnidad);
				},
				error: () => {
					this.salarios = [];
				},
			});
	}

	abrirSubmodalSalarioNuevo(): void {
		if (!this.tienePuestoGuardado || this.unidadSalarioContexto <= 0 || this.readOnly) {
			this.notifyFx('Abra el puesto desde una unidad para registrar el salario.', NotifyType.Warning);
			return;
		}
		this.submodalSalarioEditIndex = null;
		this.submodalSalarioDraft = {
			CORR_UNIDAD: this.unidadSalarioContexto,
			SALARIO_INICIAL: null,
			SALARIO_FINAL: null,
			FECHA_INGRESO: this.fechaHoyElSalvador() as any,
			ACTIVO_PUESTO_SALARIO: true,
		};
		this.submodalSalarioVisible = true;
	}

	abrirSubmodalSalarioEditar(index: number): void {
		const actual = this.salarios[index];
		if (!actual || this.readOnly) {
			return;
		}
		this.submodalSalarioEditIndex = index;
		const iso = this.normalizarFecha(actual.FECHA_INGRESO);
		this.submodalSalarioDraft = {
			...actual,
			FECHA_INGRESO: (iso ? this.fechaDesdeIso(iso) : this.fechaHoyElSalvador()) as any,
			CORR_UNIDAD: this.unidadSalarioContexto || actual.CORR_UNIDAD,
		};
		this.submodalSalarioVisible = true;
	}

	cerrarSubmodalSalario(): void {
		this.submodalSalarioVisible = false;
		this.submodalSalarioEditIndex = null;
		this.submodalSalarioDraft = {};
	}

	guardarSubmodalSalario(): void {
		const corrUnidad = Number(this.submodalSalarioDraft?.CORR_UNIDAD ?? 0);
		if (corrUnidad <= 0) {
			this.notifyFx('Seleccione la unidad.', NotifyType.Warning);
			return;
		}
		const inicial = this.numeroSalario(this.submodalSalarioDraft?.SALARIO_INICIAL);
		const final = this.numeroSalario(this.submodalSalarioDraft?.SALARIO_FINAL);
		const fechaIngreso = this.normalizarFecha(this.submodalSalarioDraft?.FECHA_INGRESO);
		if (inicial == null) {
			this.notifyFx('Ingrese el salario inicial.', NotifyType.Warning);
			return;
		}
		if (final == null) {
			this.notifyFx('Ingrese el salario final.', NotifyType.Warning);
			return;
		}
		if (!fechaIngreso) {
			this.notifyFx('Seleccione la fecha de ingreso.', NotifyType.Warning);
			return;
		}
		if ([inicial, final].some((n) => n != null && n < 0)) {
			this.notifyFx('Los salarios no pueden ser negativos.', NotifyType.Warning);
			return;
		}
		if (inicial != null && final != null && inicial > final) {
			this.notifyFx('El salario inicial no puede ser mayor que el salario final.', NotifyType.Warning);
			return;
		}
		const quedariaActivo = this.submodalSalarioDraft?.ACTIVO_PUESTO_SALARIO !== false;
		if (quedariaActivo && this.hayOtroSalarioActivoEnUnidad(corrUnidad, this.submodalSalarioEditIndex)) {
			this.notifyFx(
				'Esa unidad ya tiene un salario activo para este puesto.',
				NotifyType.Warning
			);
			return;
		}

		const row = {
			CORR_PUESTO_SALARIO:
				this.submodalSalarioEditIndex != null
					? this.salarios[this.submodalSalarioEditIndex].CORR_PUESTO_SALARIO
					: 0,
			CORR_PUESTO: Number(this.model.CORR_PUESTO),
			CORR_UNIDAD: corrUnidad,
			SALARIO_INICIAL: inicial,
			SALARIO_FINAL: final,
			FECHA_INGRESO: fechaIngreso,
			ACTIVO_PUESTO_SALARIO: this.submodalSalarioDraft?.ACTIVO_PUESTO_SALARIO !== false,
		};

		this.loadingVisible = true;
		const request =
			row.CORR_PUESTO_SALARIO > 0 ? this.service.updateSalario(row) : this.service.insertSalario(row);
		request.pipe(take(1)).subscribe({
			next: (response: any) => {
				this.loadingVisible = false;
				if (!response?.Result) {
					this.notifyApiResponse(response);
					return;
				}
				const guardado = this.normalizarSalarios([response.Data])[0];
				if (row.CORR_PUESTO_SALARIO > 0) {
					this.salarios = this.salarios.map((s) =>
						s.CORR_PUESTO_SALARIO === guardado.CORR_PUESTO_SALARIO ? guardado : s
					);
				} else {
					this.salarios = [...this.salarios, guardado];
				}
				this.cerrarSubmodalSalario();
			},
			error: (error: any) => {
				this.loadingVisible = false;
				this.notifyApiError(error);
			},
		});
	}

	eliminarSalario(index: number): void {
		const row = this.salarios[index];
		if (!row || this.readOnly) {
			return;
		}
		this.loadingVisible = true;
		this.service
			.deleteSalario(row.CORR_PUESTO_SALARIO)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}
					this.salarios = this.salarios.filter(
						(s) => s.CORR_PUESTO_SALARIO !== row.CORR_PUESTO_SALARIO
					);
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	resumenSalario(item: PlaPuestoSalario): string {
		const partes = [
			item?.SALARIO_INICIAL != null ? `Inicial ${this.textoMonto(item.SALARIO_INICIAL)}` : '',
			item?.SALARIO_FINAL != null ? `Final ${this.textoMonto(item.SALARIO_FINAL)}` : '',
			this.textoFecha(item?.FECHA_INGRESO),
		].filter((t) => t && t !== '—');
		return partes.join(' · ') || '—';
	}

	textoMonto(valor: any): string {
		if (valor == null || valor === '') {
			return '—';
		}
		const n = Number(valor);
		if (Number.isNaN(n)) {
			return '—';
		}
		return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
	}

	textoFecha(valor: any): string {
		const iso = this.normalizarFecha(valor);
		if (!iso) {
			return '—';
		}
		const [anio, mes, dia] = iso.split('-');
		return `${dia}/${mes}/${anio}`;
	}

	private normalizarSalarios(rows: any[]): PlaPuestoSalario[] {
		return (rows ?? [])
			.filter((r) => r)
			.map((r) => ({
				CORR_EMPRESA: Number(r.CORR_EMPRESA ?? 0),
				CORR_PUESTO_SALARIO: Number(r.CORR_PUESTO_SALARIO ?? 0),
				CORR_PUESTO: Number(r.CORR_PUESTO ?? 0),
				CORR_UNIDAD: Number(r.CORR_UNIDAD) > 0 ? Number(r.CORR_UNIDAD) : null,
				NOMBRE_UNIDAD: r.NOMBRE_UNIDAD ?? '',
				SALARIO_INICIAL: this.numeroSalario(r.SALARIO_INICIAL),
				SALARIO_FINAL: this.numeroSalario(r.SALARIO_FINAL),
				FECHA_INGRESO: this.normalizarFecha(r.FECHA_INGRESO),
				ACTIVO_PUESTO_SALARIO: r.ACTIVO_PUESTO_SALARIO !== false && r.ACTIVO_PUESTO_SALARIO !== 0,
			}));
	}

	private numeroSalario(valor: any): number | null {
		if (valor == null || valor === '' || Number.isNaN(Number(valor))) {
			return null;
		}
		return Number(valor);
	}

	private fechaHoyElSalvador(): Date {
		const iso = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/El_Salvador' }).format(new Date());
		const [anio, mes, dia] = iso.split('-').map((n) => Number(n));
		return new Date(anio, mes - 1, dia, 12, 0, 0);
	}

	private fechaDesdeIso(iso: string): Date {
		const [anio, mes, dia] = iso.split('-').map((n) => Number(n));
		return new Date(anio, mes - 1, dia, 12, 0, 0);
	}

	private normalizarFecha(valor: any): string | null {
		if (valor == null || valor === '') {
			return null;
		}
		if (valor instanceof Date && !Number.isNaN(valor.getTime())) {
			const y = valor.getFullYear();
			const m = `${valor.getMonth() + 1}`.padStart(2, '0');
			const d = `${valor.getDate()}`.padStart(2, '0');
			return `${y}-${m}-${d}`;
		}
		const iso = `${valor}`.trim().match(/^(\d{4}-\d{2}-\d{2})/);
		return iso ? iso[1] : null;
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_PUESTO')?.focus();
		});
	}
}
