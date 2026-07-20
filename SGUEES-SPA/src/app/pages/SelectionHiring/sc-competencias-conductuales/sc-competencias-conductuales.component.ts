// Vista de mantenimiento de Competencias Conductuales (CRUD del catálogo SC).
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ScCompetenciasConductuales } from './models/sc-competencias-conductuales';
import { ScCompetenciasConductualesService } from './sc-competencias-conductuales.service';

const ESTADO_FIELD = 'ESTADO_COMPETENCIAS_CONDUCTUALES';

@Component({
	selector: 'app-sc-competencias-conductuales',
	templateUrl: './sc-competencias-conductuales.component.html',
	styleUrls: ['./sc-competencias-conductuales.component.scss'],
})
// Orquesta grilla, formulario y llamadas al servicio de competencia conductual.
export class ScCompetenciasConductualesComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'la competencia conductual';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_COMPETENCIAS_CONDUCTUALES';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'NOMBRE_COMPETENCIAS_CONDUCTUALES';

	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	mCORR_TIPO_PUESTO: any;
	readOnly = false;
	tipoPuestoInvalido = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de Competencias Conductuales';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScCompetenciasConductualesService
	) {
		super(appInfoService, router);
		this.selectedLookUpCORR_TIPO_PUESTO = this.selectedLookUpCORR_TIPO_PUESTO.bind(this);
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
		this.llenaComboBox();
		this.consultar();
	}

	// Restaura el subtítulo de mantenimiento al volver a modo consulta.
	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	// Dispara la carga de lookups necesarios para el formulario.
	llenaComboBox(): void {
		this.getCORR_TIPO_PUESTO();
	}

	// Obtiene el catálogo de tipos de puesto para el lookup del formulario.
	getCORR_TIPO_PUESTO(): void {
		this.appInfoService
			.getLookUp(
				'SC_COMPETENCIAS_CONDUCTUALES',
				'PLA_TIPO_PUESTO',
				'GetCORR_TIPO_PUESTO',
				undefined,
				environment.UrlTALENTOHUMANONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_TIPO_PUESTO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	// Devuelve la clave del tipo de puesto seleccionado en el lookup.
	selectedLookUpCORR_TIPO_PUESTO(vRow: any): any {
		return vRow[0].CORR_TIPO_PUESTO;
	}

	// Construye el filtro por correlativo usado en consultas y eliminaciones.
	fillParam(xCORR_COMPETENCIAS_CONDUCTUALES?: number): any {
		return {
			CORR_COMPETENCIAS_CONDUCTUALES: xCORR_COMPETENCIAS_CONDUCTUALES ?? 0,
		};
	}

	// Copia el registro seleccionado o crea el modelo inicial del formulario.
	override fillData(xModel?: ScCompetenciasConductuales): ScCompetenciasConductuales {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_COMPETENCIAS_CONDUCTUALES: xModel.CORR_COMPETENCIAS_CONDUCTUALES,
				CORR_TIPO_PUESTO: xModel.CORR_TIPO_PUESTO,
				NOMBRE_COMPETENCIAS_CONDUCTUALES: xModel.NOMBRE_COMPETENCIAS_CONDUCTUALES,
				DESCRIPCION: xModel.DESCRIPCION,
				ESTADO_COMPETENCIAS_CONDUCTUALES: xModel.ESTADO_COMPETENCIAS_CONDUCTUALES,
				NOMBRE_TIPO_PUESTO: xModel.NOMBRE_TIPO_PUESTO,
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
			CORR_COMPETENCIAS_CONDUCTUALES: 0,
			CORR_TIPO_PUESTO: null,
			NOMBRE_COMPETENCIAS_CONDUCTUALES: '',
			DESCRIPCION: '',
			ESTADO_COMPETENCIAS_CONDUCTUALES: true,
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: new Date(),
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: new Date(),
		};
	}

	// Carga las competencias y sincroniza el orden y la paginación de la grilla.
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

		this.models = [...this.models].sort(
			(a, b) => Number(a.CORR_COMPETENCIAS_CONDUCTUALES) - Number(b.CORR_COMPETENCIAS_CONDUCTUALES)
		);
	}

	// Agrega o reemplaza en la grilla la respuesta del guardado.
	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as ScCompetenciasConductuales);
		const key = this.mttoGridKeyExpr as keyof ScCompetenciasConductuales;

		if (isAdd) {
			this.models = [...this.models, record];
		} else {
			const index = this.models.findIndex((item) => item?.[key] === record[key]);
			if (index >= 0) {
				this.models = this.models.map((item, i) =>
					i === index ? this.fillData({ ...item, ...record }) : item
				);
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

		const key = this.mttoGridKeyExpr as keyof ScCompetenciasConductuales;
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
		this.readOnly = true;
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

		this.readOnly = false;
		this.tipoPuestoInvalido = false;
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
		this.readOnly = false;
		this.tipoPuestoInvalido = false;
		super.nuevo();
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
		});
	}

	// Actualiza el tipo de puesto y limpia la marca de inválido.
	onTipoPuestoChanged(value: number | null): void {
		this.model.CORR_TIPO_PUESTO = value;
		if (value != null && value > 0) {
			this.tipoPuestoInvalido = false;
		}
	}

	// Marca el lookup como inválido cuando no se seleccionó un tipo de puesto.
	private actualizarEstadoValidacionLookup(): void {
		const value = Number(this.model?.CORR_TIPO_PUESTO);
		this.tipoPuestoInvalido = Number.isNaN(value) || value <= 0;
	}

	// Valida formulario y lookup antes de insertar o actualizar.
	guardar(): void {
		const formData = this.dataForm?.instance?.option('formData');
		if (formData) {
			this.model = { ...this.model, ...formData };
		}

		this.actualizarEstadoValidacionLookup();
		const formValidation = this.dataForm?.instance?.validate();
		if (formValidation && !formValidation.isValid) {
			this.actualizarEstadoValidacionLookup();
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
		this.tipoPuestoInvalido = false;
		super.cancelar((item: any) => item.CORR_COMPETENCIAS_CONDUCTUALES === this.modelUpdate.CORR_COMPETENCIAS_CONDUCTUALES);
	}

	// Solicita la eliminación y controla dependencias asociadas.
	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirErrorMttoEnWarning(
					this.service.delete(this.fillParam(e.data.CORR_COMPETENCIAS_CONDUCTUALES))
				),
		});
	}

	// Cambia el estado de la competencia seleccionada.
	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	// Deja el formulario en solo lectura (modo consulta).
	override bloquear(): void {
		this.readOnly = true;
		this.dataForm.instance.getEditor('CORR_COMPETENCIAS_CONDUCTUALES')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_COMPETENCIAS_CONDUCTUALES')?.option('readOnly', true);
		this.dataForm.instance.getEditor('DESCRIPCION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTADO_COMPETENCIAS_CONDUCTUALES')?.option('readOnly', true);
	}

	// Habilita campos editables; el estado queda bloqueado al editar.
	override habilitar(): void {
		this.readOnly = false;
		const estadoSoloLectura = this.banderaMtto === UpdateType.Update;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_COMPETENCIAS_CONDUCTUALES')?.option('readOnly', true);
			this.dataForm.instance.getEditor('NOMBRE_COMPETENCIAS_CONDUCTUALES')?.option('readOnly', false);
			this.dataForm.instance.getEditor('DESCRIPCION')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ESTADO_COMPETENCIAS_CONDUCTUALES')?.option('readOnly', estadoSoloLectura);
		});
	}

	// Coloca el foco en el primer campo editable del formulario.
	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_COMPETENCIAS_CONDUCTUALES')?.focus();
		});
	}
}
