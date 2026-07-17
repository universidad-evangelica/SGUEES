// Vista de mantenimiento de Inducción (CRUD del catálogo SC).
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ScInduccion } from './models/sc-induccion';
import { ScInduccionService } from './sc-induccion.service';

const ESTADO_FIELD = 'ESTADO_INDUCCION';

@Component({
	selector: 'app-sc-induccion',
	templateUrl: './sc-induccion.component.html',
	styleUrls: ['./sc-induccion.component.scss'],
})
// Orquesta grilla, formulario y llamadas al servicio de inducción.
export class ScInduccionComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'la inducción';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_INDUCCION';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'NOMBRE_INDUCCION';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de Inducción';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScInduccionService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	// Expone el grid de mantenimiento al flujo base de CBaseComponent.
	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	// Inicializa subtítulo y carga el catálogo al abrir la vista.
	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.consultar();
	}

	// Restaura el subtítulo de mantenimiento al volver a modo consulta.
	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	// Construye el filtro por correlativo usado en consultas y eliminaciones.
	fillParam(xCORR_INDUCCION?: number): any {
		return { CORR_INDUCCION: xCORR_INDUCCION ?? 0 };
	}

	// Copia el registro seleccionado o crea el modelo inicial del formulario.
	override fillData(xModel?: ScInduccion): ScInduccion {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_INDUCCION: xModel.CORR_INDUCCION,
				NOMBRE_INDUCCION: xModel.NOMBRE_INDUCCION,
				SEMANAS_INDUCCION: xModel.SEMANAS_INDUCCION,
				ESTADO_INDUCCION: xModel.ESTADO_INDUCCION,
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
			CORR_INDUCCION: 0,
			NOMBRE_INDUCCION: '',
			SEMANAS_INDUCCION: 1,
			ESTADO_INDUCCION: true,
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: new Date(),
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: new Date(),
		};
	}

	// Carga las inducciones y sincroniza el orden y la paginación de la grilla.
	consultar(resetPage = false): void {
		this.consultarMtto({
			load: () => this.service.getAll(this.fillParam()),
			onData: () => {
				this.ordenarModelsPorCorr();
				this.refrescarGridTrasCarga(resetPage);
			},
		});
	}

	// Mantiene los registros ordenados por correlativo tras cambios locales.
	private ordenarModelsPorCorr(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort((a, b) => Number(a.CORR_INDUCCION) - Number(b.CORR_INDUCCION));
	}

	// Agrega o reemplaza en la grilla la respuesta del guardado.
	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as ScInduccion);
		const key = this.mttoGridKeyExpr as keyof ScInduccion;

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

	// Retira de la grilla el registro eliminado sin recargar el catálogo.
	protected override quitarRegistroDeGrid(keyValue: unknown): void {
		if (!this.mttoGridKeyExpr || !Array.isArray(this.models)) {
			super.quitarRegistroDeGrid(keyValue);
			return;
		}

		const key = this.mttoGridKeyExpr as keyof ScInduccion;
		this.models = this.models.filter((item) => item?.[key] !== keyValue);
		this.refrescarGridTrasCarga(true);
	}

	// Espera la actualización de Angular antes de refrescar la grilla.
	private refrescarGridTrasCarga(resetPage = false): void {
		setTimeout(() => {
			this.dataGrid?.refreshData(resetPage);
		}, 0);
	}

	// Abre el registro seleccionado en modo consulta.
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

	// Prepara el registro seleccionado y habilita sus campos editables.
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

	// Inicializa un registro nuevo solo si existe empresa en sesión.
	override nuevo(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		super.nuevo();
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
		});
	}

	// Valida nombre y duración antes de insertar o actualizar.
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
			insert: () =>
				this.convertirErrorMttoEnWarning(
					this.service.insert(this.model),
					'El nombre ingresado ya está registrado para otra inducción.'
				),
			update: () =>
				this.convertirErrorMttoEnWarning(
					this.service.update(this.model),
					'El nombre ingresado ya está registrado para otra inducción.'
				),
		});
	}

	// Convierte duplicados y relaciones existentes en advertencias controladas.
	private convertirErrorMttoEnWarning<T>(
		request: Observable<T>,
		mensajeDuplicado?: string,
		esEliminacion = false
	): Observable<T> {
		return request.pipe(
			catchError((error: any) => {
				const mensaje = `${
					error?.ErrorMessage ?? error?.error?.ErrorMessage ?? error?.error?.message ?? error?.error ?? error?.message ?? error ?? ''
				}`;
				const normalizado = mensaje.toLowerCase();
				const esDuplicado =
					!!mensajeDuplicado &&
					['ya existe', 'duplicad', 'primary key', 'unique key', 'mismo tiempo', 'llave primaria', 'clave primaria'].some(
						(texto) => normalizado.includes(texto)
					);
				const tieneRelacion =
					esEliminacion &&
					[
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

				if (esDuplicado || tieneRelacion) {
					return of({
						Result: false,
						ErrorCode: 2627,
						ErrorMessage: tieneRelacion
							? 'No se puede eliminar porque tiene registros relacionados.'
							: mensajeDuplicado,
					} as T);
				}

				return throwError(() => error);
			})
		);
	}

	// Descarta la edición y restaura el registro original en la grilla.
	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_INDUCCION === this.modelUpdate.CORR_INDUCCION);
	}

	// Solicita la eliminación y controla dependencias asociadas.
	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirErrorMttoEnWarning(
					this.service.delete(this.fillParam(e.data.CORR_INDUCCION)),
					undefined,
					true
				),
		});
	}

	// Cambia el estado de la inducción seleccionada.
	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	// Deja el formulario en solo lectura (modo consulta).
	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_INDUCCION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_INDUCCION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('SEMANAS_INDUCCION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTADO_INDUCCION')?.option('readOnly', true);
	}

	// Habilita campos editables; el estado queda bloqueado al editar.
	override habilitar(): void {
		const estadoSoloLectura = this.banderaMtto === UpdateType.Update;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_INDUCCION')?.option('readOnly', true);
			this.dataForm.instance.getEditor('NOMBRE_INDUCCION')?.option('readOnly', false);
			this.dataForm.instance.getEditor('SEMANAS_INDUCCION')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ESTADO_INDUCCION')?.option('readOnly', estadoSoloLectura);
		});
	}

	// Coloca el foco en el primer campo editable del formulario.
	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_INDUCCION')?.focus();
		});
	}
}
