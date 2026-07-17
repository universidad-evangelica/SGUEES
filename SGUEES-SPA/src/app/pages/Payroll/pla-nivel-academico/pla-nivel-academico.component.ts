import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { PlaNivelAcademico } from './models/pla-nivel-academico';
import { PlaNivelAcademicoService } from './pla-nivel-academico.service';

const ESTADO_FIELD = 'ESTADO_NIVEL_ACADEMICO';

@Component({
	selector: 'app-pla-nivel-academico',
	templateUrl: './pla-nivel-academico.component.html',
	styleUrls: ['./pla-nivel-academico.component.scss'],
})
export class PlaNivelAcademicoComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'el nivel academico';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_NIVEL_ACADEMICO';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'NOMBRE_NIVEL_ACADEMICO';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de Nivel Academico';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: PlaNivelAcademicoService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	// Expone el grid de mantenimiento a la base para refrescos y foco.
	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	// Inicializa la vista y carga el listado de niveles académicos.
	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.consultar();
	}

	// Restaura el subtítulo de mantenimiento al volver a modo browse.
	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	// Construye el filtro que se envía al consultar o eliminar un nivel académico.
	fillParam(xCORR_NIVEL_ACADEMICO?: number): any {
		return { CORR_NIVEL_ACADEMICO: xCORR_NIVEL_ACADEMICO ?? 0 };
	}

	// Crea una copia del registro seleccionado o devuelve el modelo inicial del formulario.
	override fillData(xModel?: PlaNivelAcademico): PlaNivelAcademico {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_NIVEL_ACADEMICO: xModel.CORR_NIVEL_ACADEMICO,
				NOMBRE_NIVEL_ACADEMICO: xModel.NOMBRE_NIVEL_ACADEMICO,
				ESTADO_NIVEL_ACADEMICO: xModel.ESTADO_NIVEL_ACADEMICO,
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
			CORR_NIVEL_ACADEMICO: 0,
			NOMBRE_NIVEL_ACADEMICO: '',
			ESTADO_NIVEL_ACADEMICO: true,
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: new Date(),
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: new Date(),
		};
	}

	// Carga los niveles académicos y sincroniza el orden y la paginación de la grilla.
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

		this.models = [...this.models].sort((a, b) => Number(a.CORR_NIVEL_ACADEMICO) - Number(b.CORR_NIVEL_ACADEMICO));
	}

	// Incorpora en la grilla la respuesta del guardado sin volver a consultar la API.
	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as PlaNivelAcademico);
		const key = this.mttoGridKeyExpr as keyof PlaNivelAcademico;

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

		const key = this.mttoGridKeyExpr as keyof PlaNivelAcademico;
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

	// Convierte errores de llave duplicada en una advertencia entendible para el usuario.
	private convertirDuplicadoEnWarning<T>(request: Observable<T>): Observable<T> {
		return request.pipe(
			catchError((error: any) => {
				const message = this.obtenerMensajeApiLocal(error).toLowerCase();
				const errorCode = Number(error?.ErrorCode ?? error?.error?.ErrorCode);
				if (errorCode === 2601 || errorCode === 2627 || this.esErrorDuplicadoLocal(message)) {
					return of({
						Result: false,
						ErrorCode: 2627,
						ErrorMessage:
							'El identificador del nivel académico está registrado. Recargue los datos e intente nuevamente.',
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

	// Descarta la edición actual y restaura el estado de consulta del mantenimiento.
	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_NIVEL_ACADEMICO === this.modelUpdate.CORR_NIVEL_ACADEMICO);
	}

	// Solicita la eliminación y controla el caso de registros relacionados.
	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirEliminacionRelacionadaEnWarning(
					this.service.delete(this.fillParam(e.data.CORR_NIVEL_ACADEMICO))
				),
		});
	}

	// Cambia el estado del nivel seleccionado mediante el flujo común de mantenimiento.
	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	// Deja el formulario en solo lectura al consultar un registro.
	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_NIVEL_ACADEMICO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_NIVEL_ACADEMICO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTADO_NIVEL_ACADEMICO')?.option('readOnly', true);
	}

	// Habilita el nombre; el estado solo se edita en alta, no en actualización.
	override habilitar(): void {
		const estadoSoloLectura = this.banderaMtto === UpdateType.Update;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_NIVEL_ACADEMICO')?.option('readOnly', true);
			this.dataForm.instance.getEditor('NOMBRE_NIVEL_ACADEMICO')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ESTADO_NIVEL_ACADEMICO')?.option('readOnly', estadoSoloLectura);
		});
	}

	// Coloca el cursor en el nombre al abrir el formulario.
	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_NIVEL_ACADEMICO')?.focus();
		});
	}
}
