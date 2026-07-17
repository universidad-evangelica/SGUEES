import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { GenDivision } from './models/gen-division';
import { GenDivisionService } from './gen-division.service';

@Component({
	selector: 'app-gen-division',
	templateUrl: './gen-division.component.html',
	styleUrls: ['./gen-division.component.scss'],
})
export class GenDivisionComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'la division';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_DIVISION';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de Divisiones';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenDivisionService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	// Inicializa la vista y carga la información necesaria para comenzar el mantenimiento.
	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.consultar();
	}

	// Sincroniza el estado del mantenimiento con la presentación y las acciones disponibles.
	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	// Construye los filtros enviados al API para consultar el registro seleccionado.
	fillParam(xCORR_DIVISION?: number): any {
		return { CORR_DIVISION: xCORR_DIVISION ?? 0 };
	}

	// Transforma los datos recibidos en el modelo editable y crea sus valores iniciales cuando corresponde.
	override fillData(xModel?: GenDivision): GenDivision {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_DIVISION: xModel.CORR_DIVISION,
				NOMBRE_DIVISION: xModel.NOMBRE_DIVISION,
				CODIGO_DIVISION: xModel.CODIGO_DIVISION,
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
			CORR_DIVISION: 0,
			NOMBRE_DIVISION: '',
			CODIGO_DIVISION: '',
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: new Date(),
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: new Date(),
		};
	}

	// Carga el listado desde el servicio, ordena los resultados y actualiza la cuadrícula.
	consultar(resetPage = false): void {
		this.consultarMtto({
			load: () => this.service.getAll(this.fillParam()),
			onData: () => {
				this.ordenarModelsPorCorr();
				this.refrescarGridTrasCarga(resetPage);
			},
		});
	}

	// Ordena una copia del listado por correlativo para mantener una presentación estable.
	private ordenarModelsPorCorr(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort((a, b) => Number(a.CORR_DIVISION) - Number(b.CORR_DIVISION));
	}

	// Integra el registro guardado al listado local y mantiene su orden sin recargar toda la consulta.
	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as GenDivision);
		const key = this.mttoGridKeyExpr as keyof GenDivision;

		if (isAdd) {
			this.models = [...this.models, record];
		} else {
			const index = this.models.findIndex((item) => item?.[key] === record[key]);
			if (index >= 0) {
				this.models = this.models.map((item, i) => (i === index ? this.fillData({ ...item, ...record }) : item));
			}
		}

		this.ordenarModelsPorCorr();
		this.refrescarGridTrasCarga(isAdd);
	}

	// Retira del listado local el registro eliminado y refresca la cuadrícula.
	protected override quitarRegistroDeGrid(keyValue: unknown): void {
		if (!this.mttoGridKeyExpr || !Array.isArray(this.models)) {
			super.quitarRegistroDeGrid(keyValue);
			return;
		}

		const key = this.mttoGridKeyExpr as keyof GenDivision;
		this.models = this.models.filter((item) => item?.[key] !== keyValue);
		this.refrescarGridTrasCarga(true);
	}

	// Actualiza la cuadrícula después de una carga y opcionalmente reinicia su paginación.
	private refrescarGridTrasCarga(resetPage = false): void {
		setTimeout(() => {
			this.dataGrid?.refreshData(resetPage);
		}, 0);
	}

	// Abre el registro seleccionado desde la cuadrícula y prepara sus datos para consulta.
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
		});
	}

	// Carga la fila seleccionada y habilita el formulario para su modificación.
	onEditClick(e: any): void {
		if (!e?.row?.data) {
			return;
		}

		this.model = this.fillData(e.row.data);
		this.editarClick(e);
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
			this.habilitar();
		});
	}

	// Prepara un modelo vacío y abre el formulario para registrar un nuevo elemento.
	override nuevo(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		super.nuevo();
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
		});
	}

	// Valida el formulario y ejecuta la creación o actualización según el estado del mantenimiento.
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
			insert: () => this.convertirCodigoDuplicadoEnWarning(this.service.insert(this.model)),
			update: () => this.convertirCodigoDuplicadoEnWarning(this.service.update(this.model)),
		});
	}

	// Convierte errores de código duplicado en una respuesta controlada para mostrar una advertencia clara.
	private convertirCodigoDuplicadoEnWarning<T>(request: Observable<T>): Observable<T> {
		return request.pipe(
			catchError((error: any) => {
				const message = this.obtenerMensajeApiLocal(error).toLowerCase();
				const errorCode = Number(error?.ErrorCode ?? error?.error?.ErrorCode);
				if (errorCode === 2601 || errorCode === 2627 || this.esErrorDuplicadoLocal(message)) {
					return of({
						Result: false,
						ErrorCode: 2627,
						ErrorMessage: 'El código de división ingresado está registrado. Escriba otro código para continuar.',
					} as T);
				}

				return throwError(() => error);
			})
		);
	}

	// Convierte restricciones de integridad al eliminar en una advertencia comprensible para el usuario.
	private convertirEliminacionRelacionadaEnWarning<T>(request: Observable<T>): Observable<T> {
		return request.pipe(
			catchError((error: any) => {
				const message = this.obtenerMensajeApiLocal(error).toLowerCase();
				const errorCode = Number(error?.ErrorCode ?? error?.error?.ErrorCode);
				if (errorCode === 547 || this.esErrorRelacionadosLocal(message)) {
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

	// Reconoce variantes del mensaje de base de datos que indican un registro duplicado.
	private esErrorDuplicadoLocal(message: string): boolean {
		return ['ya existe', 'duplicad', 'primary key', 'unique key', 'mismo tiempo', 'llave primaria', 'clave primaria'].some(
			(fragment) => message.includes(fragment)
		);
	}

	// Reconoce mensajes de integridad referencial para evitar mostrar errores técnicos.
	private esErrorRelacionadosLocal(message: string): boolean {
		return [
			'foreign key',
			'reference constraint',
			'restricción reference',
			'restriccion reference',
			'hijos',
			'relacionad',
			'asociad',
		].some((fragment) => message.includes(fragment));
	}

	// Extrae el mensaje útil de las distintas formas de error que puede devolver el API.
	private obtenerMensajeApiLocal(error: any): string {
		if (typeof error === 'string') {
			return error;
		}

		if (typeof error?.error === 'string') {
			return error.error;
		}

		return `${error?.ErrorMessage ?? error?.error?.ErrorMessage ?? error?.message ?? error ?? ''}`;
	}

	// Descarta la edición actual y restaura el estado de consulta del mantenimiento.
	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_DIVISION === this.modelUpdate.CORR_DIVISION);
	}

	// Canaliza la eliminación de la fila y convierte restricciones relacionadas en mensajes controlados.
	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirEliminacionRelacionadaEnWarning(this.service.delete(this.fillParam(e.data.CORR_DIVISION))),
		});
	}

	override bloquear(): void {
		this.dataForm?.instance?.getEditor('CORR_DIVISION')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('NOMBRE_DIVISION')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('CODIGO_DIVISION')?.option('readOnly', true);
	}

	override habilitar(): void {
		setTimeout(() => {
			this.dataForm?.instance?.getEditor('CORR_DIVISION')?.option('readOnly', true);
			this.dataForm?.instance?.getEditor('NOMBRE_DIVISION')?.option('readOnly', false);
			this.dataForm?.instance?.getEditor('CODIGO_DIVISION')?.option('readOnly', false);
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm?.instance?.getEditor('NOMBRE_DIVISION')?.focus();
		});
	}
}
