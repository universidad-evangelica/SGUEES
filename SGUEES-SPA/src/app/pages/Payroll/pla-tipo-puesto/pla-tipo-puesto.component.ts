import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { PlaTipoPuesto } from './models/pla-tipo-puesto';
import { PlaTipoPuestoService } from './pla-tipo-puesto.service';

// Campo de estado usado por la grilla y el activar/inactivar.
const ESTADO_FIELD = 'ESTADO_TIPO_PUESTO';

@Component({
	selector: 'app-pla-tipo-puesto',
	templateUrl: './pla-tipo-puesto.component.html',
	styleUrls: ['./pla-tipo-puesto.component.scss'],
})
// Vista de mantenimiento del catálogo Payroll de tipo de puesto.
export class PlaTipoPuestoComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'el tipo de puesto';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_TIPO_PUESTO';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'NOMBRE_TIPO_PUESTO';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de Tipo de Puesto';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: PlaTipoPuestoService
	) {
		super(appInfoService, router);
		// Configura grilla y formulario desde el servicio.
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	// Expone la grilla al flujo común de mantenimiento.
	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	// Inicializa subtítulo y carga el catálogo al entrar.
	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.consultar();
	}

	// Restaura el subtítulo al volver al modo browse.
	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	// Construye el filtro que se envía al consultar o eliminar un tipo de puesto.
	fillParam(xCORR_TIPO_PUESTO?: number): any {
		return { CORR_TIPO_PUESTO: xCORR_TIPO_PUESTO ?? 0 };
	}

	// Crea una copia del registro seleccionado o devuelve el modelo inicial del formulario.
	override fillData(xModel?: PlaTipoPuesto): PlaTipoPuesto {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_TIPO_PUESTO: xModel.CORR_TIPO_PUESTO,
				NOMBRE_TIPO_PUESTO: xModel.NOMBRE_TIPO_PUESTO,
				CODIGO_TIPO_PUESTO: xModel.CODIGO_TIPO_PUESTO,
				ESTADO_TIPO_PUESTO: xModel.ESTADO_TIPO_PUESTO,
				USUARIO_CREA: xModel.USUARIO_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
			};
		}

		return {
			CORR_EMPRESA: 1,
			CORR_TIPO_PUESTO: 0,
			NOMBRE_TIPO_PUESTO: '',
			CODIGO_TIPO_PUESTO: '',
			ESTADO_TIPO_PUESTO: true,
			USUARIO_CREA: '',
			FECHA_CREA: new Date(),
			ESTACION_CREA: '',
			USUARIO_ACTU: '',
			FECHA_ACTU: new Date(),
			ESTACION_ACTU: '',
		};
	}

	// Carga los tipos de puesto y sincroniza el orden y la paginación de la grilla.
	consultar(resetPage = false): void {
		this.consultarMtto({
			load: () => this.service.getAll(this.fillParam()),
			onData: () => {
				this.ordenarModelsPorCorr();
				this.refrescarGridTrasCarga(resetPage);
			},
		});
	}

	// Mantiene los registros ordenados por correlativo después de cada cambio local.
	private ordenarModelsPorCorr(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort((a, b) => Number(a.CORR_TIPO_PUESTO) - Number(b.CORR_TIPO_PUESTO));
	}

	// Incorpora en la grilla la respuesta del guardado sin volver a consultar la API.
	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as PlaTipoPuesto);
		const key = this.mttoGridKeyExpr as keyof PlaTipoPuesto;

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

	// Retira el registro eliminado del arreglo visible y reinicia la página.
	protected override quitarRegistroDeGrid(keyValue: unknown): void {
		if (!this.mttoGridKeyExpr || !Array.isArray(this.models)) {
			super.quitarRegistroDeGrid(keyValue);
			return;
		}

		const key = this.mttoGridKeyExpr as keyof PlaTipoPuesto;
		this.models = this.models.filter((item) => item?.[key] !== keyValue);
		this.refrescarGridTrasCarga(true);
	}

	// Espera a que Angular actualice los datos antes de refrescar la grilla.
	private refrescarGridTrasCarga(resetPage = false): void {
		setTimeout(() => {
			this.dataGrid?.refreshData(resetPage);
		}, 0);
	}

	// Abre en modo consulta el registro seleccionado y bloquea sus campos.
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

	// Prepara el registro seleccionado para edición y habilita sus campos permitidos.
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

	// Inicializa un registro nuevo únicamente cuando existe una empresa en sesión.
	override nuevo(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		super.nuevo();
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
		});
	}

	// Valida el formulario y ejecuta la inserción o actualización según el estado actual.
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
			insert: () => this.convertirDuplicadoEnWarning(this.service.insert(this.model)),
			update: () => this.convertirDuplicadoEnWarning(this.service.update(this.model)),
		});
	}

	// Convierte errores de unicidad en una advertencia específica para nombre o código.
	private convertirDuplicadoEnWarning<T>(request: Observable<T>): Observable<T> {
		return request.pipe(
			catchError((error: any) => {
				const message = this.obtenerMensajeApiLocal(error);
				const normalized = message.toLowerCase();
				const errorCode = Number(error?.ErrorCode ?? error?.error?.ErrorCode);
				if (errorCode === 2601 || errorCode === 2627 || this.esErrorDuplicadoLocal(normalized)) {
					const campo = normalized.includes('nombre') ? 'nombre' : 'código';
					return of({
						Result: false,
						ErrorCode: 2627,
						ErrorMessage: `El ${campo} de tipo de puesto ingresado está registrado. Escriba otro ${campo} para continuar.`,
					} as T);
				}

				return throwError(() => error);
			})
		);
	}

	// Convierte errores por relaciones existentes en una advertencia de eliminación.
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

	// Reconoce mensajes de distintas capas que corresponden a registros duplicados.
	private esErrorDuplicadoLocal(message: string): boolean {
		return ['ya existe', 'duplicad', 'primary key', 'unique key', 'mismo tiempo', 'llave primaria', 'clave primaria'].some(
			(fragment) => message.includes(fragment)
		);
	}

	// Reconoce mensajes que indican dependencias asociadas al registro.
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

	// Extrae de las variantes de respuesta de la API el mensaje útil del error.
	private obtenerMensajeApiLocal(error: any): string {
		if (typeof error === 'string') {
			return error;
		}

		if (typeof error?.error === 'string') {
			return error.error;
		}

		return `${error?.ErrorMessage ?? error?.error?.ErrorMessage ?? error?.message ?? error ?? ''}`;
	}

	// Cancela y recupera el registro original por correlativo.
	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_TIPO_PUESTO === this.modelUpdate.CORR_TIPO_PUESTO);
	}

	// Solicita la eliminación y controla el caso de registros relacionados.
	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirEliminacionRelacionadaEnWarning(this.service.delete(this.fillParam(e.data.CORR_TIPO_PUESTO))),
		});
	}

	// Cambia el estado del tipo seleccionado mediante el flujo común de mantenimiento.
	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	// Bloquea todos los editores en modo consulta.
	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_TIPO_PUESTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_TIPO_PUESTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO_TIPO_PUESTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTADO_TIPO_PUESTO')?.option('readOnly', true);
	}

	// Habilita campos editables; el estado queda fijo al actualizar.
	override habilitar(): void {
		const estadoSoloLectura = this.banderaMtto === UpdateType.Update;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_TIPO_PUESTO')?.option('readOnly', true);
			this.dataForm.instance.getEditor('NOMBRE_TIPO_PUESTO')?.option('readOnly', false);
			this.dataForm.instance.getEditor('CODIGO_TIPO_PUESTO')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ESTADO_TIPO_PUESTO')?.option('readOnly', estadoSoloLectura);
		});
	}

	// Coloca el foco en el nombre al abrir el formulario.
	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_TIPO_PUESTO')?.focus();
		});
	}
}
