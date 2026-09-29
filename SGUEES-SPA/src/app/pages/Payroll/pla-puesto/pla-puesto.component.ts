// Qué hace: vista de mantenimiento de Puesto (CRUD del catálogo Payroll PLA_PUESTO).
// Cómo: grilla + formulario con lookup de tipo de puesto; coordina PlaPuestoService.
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { environment } from 'src/environments/environment';
import { PlaPuesto } from './models/pla-puesto';
import { PlaPuestoSalario } from './pla-puesto-salario/models/pla-puesto-salario';
import { PlaPuestoService } from './pla-puesto.service';

const ESTADO_FIELD = 'ACTIVO_PUESTO';

interface UnidadDelPuesto {
	CORR_UNIDAD: number;
	CORR_PUESTO: number;
	CODIGO_UNIDAD: string;
	NOMBRE_UNIDAD: string;
	NOMBRE_COMBO: string;
}

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
	protected override mttoGridKeyExpr = 'CORR_PUESTO';
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
	private submodalSalarioFilaKey = '';
	submodalSalarioDraft: Partial<PlaPuestoSalario> = {};
	salarioSeleccionado: PlaPuestoSalario | null = null;
	unidadesAsignadas: UnidadDelPuesto[] = [];
	catalogoUnidades: UnidadDelPuesto[] = [];
	unidadesDisponibles: UnidadDelPuesto[] = [];
	submodalUnidadVisible = false;
	unidadPorAsignar: number | null = null;
	readonly unidadLookupColumns = [
		{ dataField: 'CODIGO_UNIDAD', caption: 'Codigo', width: 140 },
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
		this.selectedLookUpUnidad = this.selectedLookUpUnidad.bind(this);
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
		this.cargarCatalogoUnidades();
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

	// Qué hace: toma la unidad elegida en el combo.
	// Cómo: devuelve el CORR_UNIDAD de la fila seleccionada.
	selectedLookUpUnidad(vRow: any): number {
		return Number(vRow?.[0]?.CORR_UNIDAD ?? 0);
	}

	onTipoPuestoChanged(value: number | null): void {
		this.model.CORR_TIPO_PUESTO = value != null && Number(value) > 0 ? Number(value) : null;
	}

	fillParam(xCORR_PUESTO?: number): any {
		return { CORR_PUESTO: xCORR_PUESTO ?? 0 };
	}

	override fillData(xModel?: PlaPuesto): PlaPuesto {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: Number(xModel.CORR_EMPRESA ?? 0),
				CORR_PUESTO: Number(xModel.CORR_PUESTO ?? 0),
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
		this.service
			.getAll(this.fillParam())
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}
					this.models = (response.Data ?? []).map((item: PlaPuesto) => this.fillData(item));
					this.refrescarGridTrasCarga(resetPage);
				},
				error: (error) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	private refrescarGridTrasCarga(resetPage = false): void {
		setTimeout(() => {
			this.dataGrid?.refreshData(resetPage);
		}, 0);
	}

	override rowDblClick(e: any): void {
		const rowData = e?.data ?? e?.row?.data;
		if (rowData) {
			this.model = this.fillData(rowData);
			this.modelUpdate = this.fillData(rowData);
		}
		super.rowDblClick(e);
		this.cargarUnidadesDelPuesto();
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
		this.model = this.fillData(e.row.data);
		this.editarClick(e);
		this.cargarUnidadesDelPuesto();
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
		this.unidadesAsignadas = [];
		this.salarios = [];
		this.salarioSeleccionado = null;
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
			// Qué hace: tras crear el puesto se queda en el formulario para mostrar las pestañas.
			// Cómo: el alta pasa a edición; solo una modificación posterior regresa a la tabla.
			onSuccess: (data, isAdd) => {
				if (!isAdd) {
					return;
				}
				const puesto = this.fillData(data as PlaPuesto);
				this.model = puesto;
				this.modelUpdate = this.fillData(puesto);
				this.AsignaStatus(UpdateType.Update);
				this.unidadesAsignadas = [];
				this.salarios = [];
				this.salarioSeleccionado = null;
				this.cargarUnidadesDelPuesto();
				this.cargarSalariosDelPuesto();
				setTimeout(() => {
					this.dataForm?.instance?.option('formData', this.model);
					this.habilitar();
				});
			},
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

	// Qué hace: muestra la fecha de ingreso en la grilla como dd/MM/yyyy.
	// Cómo: toma el día calendario guardado, sin correrlo por zona horaria.
	textoFechaFinalizacion = (row: PlaPuestoSalario): string => {
		const iso = this.normalizarFecha(row?.FECHA_FINALIZACION);
		if (!iso) {
			return '';
		}
		const [anio, mes, dia] = iso.split('-');
		return `${dia}/${mes}/${anio}`;
	};

	textoFechaSalario = (row: PlaPuestoSalario): string => {
		const iso = this.normalizarFecha(row?.FECHA_INGRESO);
		if (!iso) {
			return '';
		}
		const [anio, mes, dia] = iso.split('-');
		return `${dia}/${mes}/${anio}`;
	};

	// Qué hace: ubica en la lista el salario de la fila de la grilla.
	// Cómo: compara el correlativo; si aún no existe, usa la misma referencia.
	indiceSalario(row: PlaPuestoSalario): number {
		const key = row?.FILA_KEY ?? '';
		if (key) {
			const porKey = this.salarios.findIndex((s) => s.FILA_KEY === key);
			if (porKey >= 0) {
				return porKey;
			}
		}
		return this.salarios.indexOf(row);
	}

	// Qué hace: guarda la fila de salario o de unidad que está marcada.
	// Cómo: acepta la unidad aunque esa fila aún no tenga salario.
	onSalarioFocused(e: any): void {
		const row = (e?.row?.data ?? null) as PlaPuestoSalario | null;
		this.salarioSeleccionado = row && Number(row.CORR_UNIDAD) > 0 ? row : null;
	}

	// Qué hace: activa o desactiva el salario seleccionado.
	// Cómo: usa el mismo guardado inmediato del interruptor de la fila.
	activarDesactivarSalarioSeleccionado(): void {
		if (!this.salarioSeleccionado || Number(this.salarioSeleccionado.CORR_PUESTO_SALARIO) <= 0) {
			return;
		}
		this.toggleActivoSalario(this.indiceSalario(this.salarioSeleccionado));
	}

	// Qué hace: atenúa la fila de un salario inactivo.
	// Cómo: marca la fila de datos cuando ACTIVO_PUESTO_SALARIO está apagado.
	onSalarioRowPrepared(e: any): void {
		if (e?.rowType !== 'data') {
			return;
		}
		const tieneSalario = Number(e.data?.CORR_PUESTO_SALARIO ?? 0) > 0;
		e.rowElement?.classList?.toggle(
			'ps-salario-row--inactive',
			tieneSalario && !e.data?.ACTIVO_PUESTO_SALARIO
		);
	}

	// Qué hace: activa o desactiva el salario y lo guarda de inmediato.
	// Cómo: no enciende si esa unidad ya tiene otro activo; en éxito parchea la fila con Data.
	toggleActivoSalario(index: number, event?: Event): void {
		event?.stopPropagation();
		const row = this.salarios[index];
		if (!row || this.readOnly || Number(row.CORR_PUESTO_SALARIO) <= 0) {
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
				FECHA_FINALIZACION: activar ? null : this.normalizarFecha(this.fechaHoyElSalvador()),
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
					if (Number(this.salarioSeleccionado?.CORR_PUESTO_SALARIO) === guardado.CORR_PUESTO_SALARIO) {
						this.salarioSeleccionado = guardado;
					}
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: carga el catálogo de unidades del organigrama.
	// Cómo: lookup GetCORR_UNIDAD de pla-puesto, ordenado por código.
	private cargarCatalogoUnidades(): void {
		this.appInfoService
			.getLookUp(
				'PLA_PUESTO',
				'SC_ORGANIGRAMA_ESTRUCTURAL_UNIDADES',
				'GetCORR_UNIDAD',
				undefined,
				environment.UrlGENERALAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					const rows = response?.Result && Array.isArray(response.Data) ? response.Data : [];
					this.catalogoUnidades = rows
						.map((row: any) => this.mapUnidad(row, 0))
						.sort((a: UnidadDelPuesto, b: UnidadDelPuesto) =>
							a.CODIGO_UNIDAD.localeCompare(b.CODIGO_UNIDAD)
						);
				},
				error: () => {
					this.catalogoUnidades = [];
				},
			});
	}

	// Qué hace: carga las unidades ya asociadas a este puesto.
	// Cómo: GetCORR_UNIDAD_PLA_PUESTO filtrado por CORR_PUESTO.
	private cargarUnidadesDelPuesto(): void {
		const corrPuesto = Number(this.model?.CORR_PUESTO ?? 0);
		if (corrPuesto <= 0) {
			this.unidadesAsignadas = [];
			return;
		}
		this.appInfoService
			.getLookUp(
				'PLA_PUESTO',
				'GEN_UNIDADES_PUESTO',
				'GetCORR_UNIDAD',
				[{ Parameter: 'CORR_PUESTO', Value: corrPuesto }],
				environment.UrlGENERALAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					const rows = response?.Result && Array.isArray(response.Data) ? response.Data : [];
					this.unidadesAsignadas = rows
						.map((row: any) => this.mapUnidad(row, corrPuesto))
						.sort((a: UnidadDelPuesto, b: UnidadDelPuesto) =>
							a.CODIGO_UNIDAD.localeCompare(b.CODIGO_UNIDAD)
						);
				},
				error: () => {
					this.unidadesAsignadas = [];
				},
			});
	}

	// Qué hace: abre el alta de una unidad para este puesto.
	// Cómo: ofrece solo las unidades del organigrama que aún no están asociadas.
	abrirSubmodalUnidad(): void {
		if (!this.tienePuestoGuardado || this.readOnly) {
			this.notifyFx('Guarde el puesto para asociar unidades.', NotifyType.Warning);
			return;
		}
		const usadas = new Set(this.unidadesAsignadas.map((u) => u.CORR_UNIDAD));
		this.unidadesDisponibles = this.catalogoUnidades.filter((u) => !usadas.has(u.CORR_UNIDAD));
		this.unidadPorAsignar = null;
		this.submodalUnidadVisible = true;
	}

	cerrarSubmodalUnidad(): void {
		this.submodalUnidadVisible = false;
		this.unidadPorAsignar = null;
	}

	// Qué hace: asocia la unidad elegida al puesto.
	// Cómo: inserta y parchea la lista y una fila vacía de salario, sin volver a consultar.
	guardarUnidad(): void {
		const corrUnidad = Number(this.unidadPorAsignar ?? 0);
		const corrPuesto = Number(this.model?.CORR_PUESTO ?? 0);
		if (corrUnidad <= 0 || corrPuesto <= 0) {
			this.notifyFx('Seleccione la unidad.', NotifyType.Warning);
			return;
		}
		this.loadingVisible = true;
		this.service
			.asignarUnidad(corrUnidad, corrPuesto)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}
					const catalogo = this.catalogoUnidades.find((u) => u.CORR_UNIDAD === corrUnidad);
					const fila = this.mapUnidad({ ...(catalogo ?? {}), ...(response.Data ?? {}), CORR_UNIDAD: corrUnidad, CORR_PUESTO: corrPuesto }, corrPuesto);
					this.unidadesAsignadas = [...this.unidadesAsignadas, fila].sort((a, b) =>
						a.CODIGO_UNIDAD.localeCompare(b.CODIGO_UNIDAD)
					);
					if (!this.salarios.some((s) => Number(s.CORR_UNIDAD) === corrUnidad)) {
						this.salarios = [...this.salarios, this.filaSalarioVacia(fila)];
					}
					this.cerrarSubmodalUnidad();
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: quita la unidad del puesto.
	// Cómo: elimina la asociación y la saca de las dos pestañas en memoria.
	quitarUnidad(row: UnidadDelPuesto): void {
		const corrPuesto = Number(this.model?.CORR_PUESTO ?? 0);
		if (!row || this.readOnly || corrPuesto <= 0) {
			return;
		}
		this.loadingVisible = true;
		this.service
			.quitarUnidad(row.CORR_UNIDAD, corrPuesto)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (!response?.Result) {
						this.notifyApiResponse(response);
						return;
					}
					this.unidadesAsignadas = this.unidadesAsignadas.filter((u) => u.CORR_UNIDAD !== row.CORR_UNIDAD);
					this.salarios = this.salarios.filter((s) => Number(s.CORR_UNIDAD) !== row.CORR_UNIDAD);
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: carga salarios del puesto, incluyendo unidades sin salario.
	// Cómo: GetAll ya hace el left join; aquí solo normaliza las filas.
	private cargarSalariosDelPuesto(): void {
		const corrPuesto = Number(this.model?.CORR_PUESTO ?? 0);
		if (corrPuesto <= 0) {
			this.salarios = [];
			this.salarioSeleccionado = null;
			return;
		}

		this.service
			.getSalarios(corrPuesto)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.salarios = response?.Result ? this.normalizarSalarios(response.Data ?? []) : [];
					this.salarioSeleccionado = null;
				},
				error: () => {
					this.salarios = [];
				},
			});
	}

	abrirSubmodalSalarioNuevo(): void {
		if (!this.tienePuestoGuardado || this.readOnly) {
			this.notifyFx('Guarde el puesto para registrar salarios.', NotifyType.Warning);
			return;
		}
		const corrUnidad = Number(this.salarioSeleccionado?.CORR_UNIDAD ?? 0)
			|| (this.unidadesAsignadas.length === 1 ? this.unidadesAsignadas[0].CORR_UNIDAD : 0);
		if (corrUnidad <= 0) {
			this.notifyFx('Seleccione en la tabla la unidad del salario.', NotifyType.Warning);
			return;
		}
		this.submodalSalarioEditIndex = null;
		this.submodalSalarioFilaKey = this.salarioSeleccionado?.FILA_KEY ?? '';
		this.submodalSalarioDraft = {
			CORR_UNIDAD: corrUnidad,
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
		this.submodalSalarioFilaKey = actual.FILA_KEY ?? '';
		const iso = this.normalizarFecha(actual.FECHA_INGRESO);
		const sinRegistro = Number(actual.CORR_PUESTO_SALARIO) <= 0;
		this.submodalSalarioDraft = {
			...actual,
			FECHA_INGRESO: (iso ? this.fechaDesdeIso(iso) : this.fechaHoyElSalvador()) as any,
			CORR_UNIDAD: actual.CORR_UNIDAD,
			ACTIVO_PUESTO_SALARIO: sinRegistro ? true : !!actual.ACTIVO_PUESTO_SALARIO,
			FECHA_FINALIZACION: sinRegistro ? null : actual.FECHA_FINALIZACION,
		};
		this.submodalSalarioVisible = true;
	}

	cerrarSubmodalSalario(): void {
		this.submodalSalarioVisible = false;
		this.submodalSalarioEditIndex = null;
		this.submodalSalarioFilaKey = '';
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
		const corrSalario =
			this.submodalSalarioEditIndex != null
				? Number(this.salarios[this.submodalSalarioEditIndex].CORR_PUESTO_SALARIO)
				: 0;
		// Qué hace: el primer salario de la fila nace activo y sin fecha de finalización.
		const esAlta = corrSalario <= 0;
		const quedariaActivo = esAlta || this.submodalSalarioDraft?.ACTIVO_PUESTO_SALARIO !== false;
		if (quedariaActivo && this.hayOtroSalarioActivoEnUnidad(corrUnidad, this.submodalSalarioEditIndex)) {
			this.notifyFx(
				'Esa unidad ya tiene un salario activo para este puesto.',
				NotifyType.Warning
			);
			return;
		}

		const row = {
			CORR_PUESTO_SALARIO: esAlta ? 0 : corrSalario,
			CORR_PUESTO: Number(this.model.CORR_PUESTO),
			CORR_UNIDAD: corrUnidad,
			SALARIO_INICIAL: inicial,
			SALARIO_FINAL: final,
			FECHA_INGRESO: fechaIngreso,
			FECHA_FINALIZACION: quedariaActivo
				? null
				: this.normalizarFecha(this.submodalSalarioDraft?.FECHA_FINALIZACION) ||
					this.normalizarFecha(this.fechaHoyElSalvador()),
			ACTIVO_PUESTO_SALARIO: quedariaActivo,
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
					const vacia = this.submodalSalarioFilaKey
						? this.salarios.findIndex((s) => s.FILA_KEY === this.submodalSalarioFilaKey && Number(s.CORR_PUESTO_SALARIO) <= 0)
						: this.salarios.findIndex(
								(s) =>
									Number(s.CORR_UNIDAD) === Number(guardado.CORR_UNIDAD) &&
									Number(s.CORR_PUESTO_SALARIO) <= 0
							);
					if (vacia >= 0) {
						const next = [...this.salarios];
						next[vacia] = guardado;
						this.salarios = next;
					} else {
						this.salarios = [...this.salarios, guardado];
					}
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
		if (!row || this.readOnly || Number(row.CORR_PUESTO_SALARIO) <= 0) {
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
					const restantes = this.salarios.filter((s) => s.FILA_KEY !== row.FILA_KEY);
					const sigueLaUnidad = restantes.some(
						(s) => Number(s.CORR_UNIDAD) === Number(row.CORR_UNIDAD) && Number(s.CORR_PUESTO_SALARIO) > 0
					);
					this.salarios = sigueLaUnidad ? restantes : [...restantes, this.filaSalarioVacia(row)];
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyApiError(error);
				},
			});
	}

	private normalizarSalarios(rows: any[]): PlaPuestoSalario[] {
		return (rows ?? [])
			.filter((r) => r)
			.map((r) => {
				const corrSalario = Number(r.CORR_PUESTO_SALARIO ?? 0);
				const corrUnidad = Number(r.CORR_UNIDAD) > 0 ? Number(r.CORR_UNIDAD) : null;
				return {
					CORR_EMPRESA: Number(r.CORR_EMPRESA ?? 0),
					CORR_PUESTO_SALARIO: corrSalario,
					CORR_PUESTO: Number(r.CORR_PUESTO ?? 0),
					CORR_UNIDAD: corrUnidad,
					CODIGO_UNIDAD: r.CODIGO_UNIDAD ?? '',
					NOMBRE_UNIDAD: r.NOMBRE_UNIDAD ?? '',
					FILA_KEY: `${corrUnidad ?? 0}|${corrSalario}`,
					SALARIO_INICIAL: this.numeroSalario(r.SALARIO_INICIAL),
					SALARIO_FINAL: this.numeroSalario(r.SALARIO_FINAL),
					FECHA_INGRESO: this.normalizarFecha(r.FECHA_INGRESO),
					FECHA_FINALIZACION: this.normalizarFecha(r.FECHA_FINALIZACION),
					ACTIVO_PUESTO_SALARIO:
						corrSalario > 0 && r.ACTIVO_PUESTO_SALARIO !== false && r.ACTIVO_PUESTO_SALARIO !== 0,
				};
			});
	}

	private mapUnidad(row: any, corrPuesto: number): UnidadDelPuesto {
		const codigo = `${row?.CODIGO_UNIDAD ?? ''}`.trim();
		const nombre = `${row?.NOMBRE_UNIDAD ?? ''}`.trim();
		return {
			CORR_UNIDAD: Number(row?.CORR_UNIDAD ?? 0),
			CORR_PUESTO: Number(row?.CORR_PUESTO ?? corrPuesto ?? 0),
			CODIGO_UNIDAD: codigo,
			NOMBRE_UNIDAD: nombre,
			NOMBRE_COMBO: codigo ? `${codigo} - ${nombre}` : nombre,
		};
	}

	private filaSalarioVacia(unidad: { CORR_UNIDAD?: number | null; CODIGO_UNIDAD?: string; NOMBRE_UNIDAD?: string }): PlaPuestoSalario {
		const corrUnidad = Number(unidad?.CORR_UNIDAD ?? 0);
		return {
			CORR_EMPRESA: Number(this.model?.CORR_EMPRESA ?? 0),
			CORR_PUESTO_SALARIO: 0,
			CORR_PUESTO: Number(this.model?.CORR_PUESTO ?? 0),
			CORR_UNIDAD: corrUnidad,
			CODIGO_UNIDAD: unidad?.CODIGO_UNIDAD ?? '',
			NOMBRE_UNIDAD: unidad?.NOMBRE_UNIDAD ?? '',
			FILA_KEY: `${corrUnidad}|0`,
			SALARIO_INICIAL: null,
			SALARIO_FINAL: null,
			FECHA_INGRESO: null,
			FECHA_FINALIZACION: null,
			ACTIVO_PUESTO_SALARIO: false,
		};
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
