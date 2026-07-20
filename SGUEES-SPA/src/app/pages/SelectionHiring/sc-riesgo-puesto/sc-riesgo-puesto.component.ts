// Vista de mantenimiento de Riesgo del Puesto (CRUD del catálogo SC).
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ScRiesgoPuesto } from './models/sc-riesgo-puesto';
import { ScRiesgoPuestoService } from './sc-riesgo-puesto.service';

const ESTADO_FIELD = 'ESTADO_RIESGO_PUESTO';

@Component({
	selector: 'app-sc-riesgo-puesto',
	templateUrl: './sc-riesgo-puesto.component.html',
	styleUrls: ['./sc-riesgo-puesto.component.scss'],
})
// Orquesta grilla, formulario y llamadas al servicio de riesgo del puesto.
export class ScRiesgoPuestoComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'el riesgo de puesto';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_RIESGO_PUESTO';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'NOMBRE_RIESGO_PUESTO';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de Riesgo de Puesto';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScRiesgoPuestoService
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
	fillParam(xCORR_RIESGO_PUESTO?: number): any {
		return { CORR_RIESGO_PUESTO: xCORR_RIESGO_PUESTO ?? 0 };
	}

	// Copia el registro seleccionado o crea el modelo inicial del formulario.
	override fillData(xModel?: ScRiesgoPuesto): ScRiesgoPuesto {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_RIESGO_PUESTO: xModel.CORR_RIESGO_PUESTO,
				NOMBRE_RIESGO_PUESTO: xModel.NOMBRE_RIESGO_PUESTO,
				ESTADO_RIESGO_PUESTO: xModel.ESTADO_RIESGO_PUESTO,
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
			CORR_RIESGO_PUESTO: 0,
			NOMBRE_RIESGO_PUESTO: '',
			ESTADO_RIESGO_PUESTO: true,
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: new Date(),
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: new Date(),
		};
	}

	// Carga los riesgos y sincroniza el orden y la paginación de la grilla.
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

		this.models = [...this.models].sort((a, b) => Number(a.CORR_RIESGO_PUESTO) - Number(b.CORR_RIESGO_PUESTO));
	}

	// Agrega o reemplaza en la grilla la respuesta del guardado.
	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as ScRiesgoPuesto);
		const key = this.mttoGridKeyExpr as keyof ScRiesgoPuesto;

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

		const key = this.mttoGridKeyExpr as keyof ScRiesgoPuesto;
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

	// Valida el formulario antes de insertar o actualizar.
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

	// Convierte restricciones FK al eliminar en advertencia controlada.
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

	// Descarta la edición y restaura el registro original en la grilla.
	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_RIESGO_PUESTO === this.modelUpdate.CORR_RIESGO_PUESTO);
	}

	// Solicita la eliminación y controla dependencias asociadas.
	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirErrorMttoEnWarning(this.service.delete(this.fillParam(e.data.CORR_RIESGO_PUESTO))),
		});
	}

	// Cambia el estado del riesgo seleccionado.
	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	// Deja el formulario en solo lectura (modo consulta).
	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_RIESGO_PUESTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_RIESGO_PUESTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTADO_RIESGO_PUESTO')?.option('readOnly', true);
	}

	// Habilita campos editables; el estado queda bloqueado al editar.
	override habilitar(): void {
		const estadoSoloLectura = this.banderaMtto === UpdateType.Update;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_RIESGO_PUESTO')?.option('readOnly', true);
			this.dataForm.instance.getEditor('NOMBRE_RIESGO_PUESTO')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ESTADO_RIESGO_PUESTO')?.option('readOnly', estadoSoloLectura);
		});
	}

	// Coloca el foco en el primer campo editable del formulario.
	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_RIESGO_PUESTO')?.focus();
		});
	}
}
