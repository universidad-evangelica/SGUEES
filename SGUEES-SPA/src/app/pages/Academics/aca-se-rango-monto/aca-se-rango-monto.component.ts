// Qué hace: vista de mantenimiento de rangos de monto SE (ingresos/egresos).
// Cómo lo hace: CRUD de ACA_SE_RANGO_MONTO; solo secciones TIPO_EVALUACION=RANGO_MONTO.
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import {
	AcaSeRangoMonto,
	AcaSeSeccionRangoLookup,
	AcaSeVersionLookup,
} from './models/aca-se-rango-monto';
import { AcaSeRangoMontoService } from './aca-se-rango-monto.service';

const ESTADO_FIELD = 'ACTIVO';

@Component({
	standalone: false,
	selector: 'app-aca-se-rango-monto',
	templateUrl: './aca-se-rango-monto.component.html',
	styleUrls: ['./aca-se-rango-monto.component.scss'],
})
export class AcaSeRangoMontoComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'el rango de monto';
	protected override requiereEmpresaSesion = false;
	protected override mttoPageSize = 10;
	protected override mttoPageSizes = [10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_RANGO_MONTO';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'DESCRIPCION';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Catálogo de rangos de monto (ingresos / egresos)';
	mCORR_VERSION: AcaSeVersionLookup[] = [];
	mCORR_SECCION_SE: AcaSeSeccionRangoLookup[] = [];
	private mCORR_SECCION_SE_TODAS: AcaSeSeccionRangoLookup[] = [];

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: AcaSeRangoMontoService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.getLookUps();
		this.consultar();
	}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	fillParam(xCORR_RANGO_MONTO?: number): any {
		return { CORR_RANGO_MONTO: xCORR_RANGO_MONTO ?? 0 };
	}

	override fillData(xModel?: AcaSeRangoMonto): AcaSeRangoMonto {
		if (xModel !== undefined) {
			return {
				CORR_RANGO_MONTO: xModel.CORR_RANGO_MONTO,
				CORR_VERSION: xModel.CORR_VERSION,
				CODIGO_VERSION: xModel.CODIGO_VERSION,
				NOMBRE_VERSION: xModel.NOMBRE_VERSION,
				CORR_SECCION_SE: xModel.CORR_SECCION_SE,
				CODIGO_SECCION: xModel.CODIGO_SECCION,
				NOMBRE_SECCION: xModel.NOMBRE_SECCION,
				TIPO_EVALUACION: xModel.TIPO_EVALUACION,
				DESCRIPCION: xModel.DESCRIPCION,
				PUNTAJE: xModel.PUNTAJE,
				RANGO_INICIAL: xModel.RANGO_INICIAL,
				RANGO_FINAL: xModel.RANGO_FINAL,
				ORDEN: xModel.ORDEN,
				ACTIVO: xModel.ACTIVO,
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				USUARIO_CREA: xModel.USUARIO_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
			};
		}

		return {
			CORR_RANGO_MONTO: 0,
			CORR_VERSION: 0,
			CORR_SECCION_SE: 0,
			DESCRIPCION: '',
			PUNTAJE: 0,
			RANGO_INICIAL: 0,
			RANGO_FINAL: 0,
			ORDEN: 0,
			ACTIVO: true,
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: new Date(),
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: new Date(),
		};
	}

	consultar(resetPage = false): void {
		this.consultarMtto({
			load: () => this.service.getAll(this.fillParam()),
			onData: () => {
				this.ordenarModels();
				this.refrescarGridTrasCarga(resetPage);
			},
		});
	}

	// Qué hace: carga versión y secciones RANGO_MONTO para los selects.
	// Cómo lo hace: getLookUp en paralelo; filtra secciones por CORR_VERSION al editar.
	getLookUps(): void {
		this.service
			.getCORR_VERSION()
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response?.Result && Array.isArray(response.Data)) {
						this.mCORR_VERSION = response.Data.map((item: AcaSeVersionLookup) => ({
							CORR_VERSION: Number(item.CORR_VERSION),
							CODIGO: (item.CODIGO ?? '').trim(),
							NOMBRE: (item.NOMBRE ?? '').trim(),
							ACTIVO: item.ACTIVO,
						}));
					} else {
						this.mCORR_VERSION = [];
					}
					this.refrescarItemsForm();
				},
				error: () => {
					this.mCORR_VERSION = [];
					this.refrescarItemsForm();
				},
			});

		this.service
			.getCORR_SECCION_SE()
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response?.Result && Array.isArray(response.Data)) {
						this.mCORR_SECCION_SE_TODAS = response.Data.map((item: AcaSeSeccionRangoLookup) => ({
							CORR_SECCION_SE: Number(item.CORR_SECCION_SE),
							CORR_VERSION: Number(item.CORR_VERSION),
							CODIGO: (item.CODIGO ?? '').trim(),
							NOMBRE_SECCION: (item.NOMBRE_SECCION ?? '').trim(),
							TIPO_EVALUACION: (item.TIPO_EVALUACION ?? '').trim(),
							PORCENTAJE_MAXIMO: Number(item.PORCENTAJE_MAXIMO ?? 0),
							ACTIVO: item.ACTIVO,
						}));
					} else {
						this.mCORR_SECCION_SE_TODAS = [];
					}
					this.filtrarSeccionesPorVersion(Number(this.model?.CORR_VERSION ?? 0), false);
				},
				error: () => {
					this.mCORR_SECCION_SE_TODAS = [];
					this.filtrarSeccionesPorVersion(0, false);
				},
			});
	}

	// Qué hace: deja en el select solo secciones RANGO_MONTO de la versión elegida.
	// Cómo lo hace: filtra mCORR_SECCION_SE_TODAS; opcionalmente limpia CORR_SECCION_SE.
	private filtrarSeccionesPorVersion(corrVersion: number, limpiarSeccion: boolean): void {
		this.mCORR_SECCION_SE =
			corrVersion > 0
				? this.mCORR_SECCION_SE_TODAS.filter((s) => Number(s.CORR_VERSION) === corrVersion)
				: [...this.mCORR_SECCION_SE_TODAS];

		if (limpiarSeccion && this.model) {
			const sigue = this.mCORR_SECCION_SE.some((s) => s.CORR_SECCION_SE === this.model.CORR_SECCION_SE);
			if (!sigue) {
				this.model.CORR_SECCION_SE = 0;
				this.dataForm?.instance?.updateData('CORR_SECCION_SE', 0);
			}
		}

		this.refrescarItemsForm();
	}

	private refrescarItemsForm(): void {
		this.items = this.service.getItems({
			versiones: this.mCORR_VERSION,
			secciones: this.mCORR_SECCION_SE,
			onVersionChanged: (corrVersion: number) => this.filtrarSeccionesPorVersion(corrVersion, true),
		});
	}

	private ordenarModels(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort((a, b) => {
			const v = Number(a.CORR_VERSION) - Number(b.CORR_VERSION);
			if (v !== 0) {
				return v;
			}
			const s = Number(a.CORR_SECCION_SE) - Number(b.CORR_SECCION_SE);
			if (s !== 0) {
				return s;
			}
			const o = Number(a.ORDEN) - Number(b.ORDEN);
			return o !== 0 ? o : Number(a.CORR_RANGO_MONTO) - Number(b.CORR_RANGO_MONTO);
		});
	}

	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as AcaSeRangoMonto);
		const key = this.mttoGridKeyExpr as keyof AcaSeRangoMonto;

		if (isAdd) {
			this.models = [...this.models, record];
		} else {
			const index = this.models.findIndex((item) => item?.[key] === record[key]);
			if (index >= 0) {
				this.models = this.models.map((item, i) => (i === index ? this.fillData({ ...item, ...record }) : item));
			}
		}

		this.ordenarModels();
		this.refrescarGridTrasCarga(isAdd);
	}

	protected override quitarRegistroDeGrid(keyValue: unknown): void {
		if (!this.mttoGridKeyExpr || !Array.isArray(this.models)) {
			super.quitarRegistroDeGrid(keyValue);
			return;
		}

		const key = this.mttoGridKeyExpr as keyof AcaSeRangoMonto;
		this.models = this.models.filter((item) => item?.[key] !== keyValue);
		this.refrescarGridTrasCarga(true);
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
			this.filtrarSeccionesPorVersion(Number(this.model.CORR_VERSION), false);
		}
		super.rowDblClick(e);
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
		this.filtrarSeccionesPorVersion(Number(this.model.CORR_VERSION), false);
		this.editarClick(e);
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
			this.habilitar();
		});
	}

	override nuevo(): void {
		super.nuevo();
		this.filtrarSeccionesPorVersion(0, false);
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
		});
	}

	guardar(): void {
		const formData = this.dataForm?.instance?.option('formData');
		if (formData) {
			this.model = { ...this.model, ...formData };
		}

		const ctxValidacion = { secciones: this.mCORR_SECCION_SE_TODAS ?? [] };
		const formValidation = this.dataForm?.instance?.validate();
		if (formValidation && !formValidation.isValid) {
			this.service.esValido(this.model, this.notifyFx.bind(this), ctxValidacion);
			return;
		}

		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this), ctxValidacion),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
		});
	}

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
		super.cancelar((item: any) => item.CORR_RANGO_MONTO === this.modelUpdate.CORR_RANGO_MONTO);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.convertirErrorMttoEnWarning(this.service.delete(this.fillParam(e.data.CORR_RANGO_MONTO))),
		});
	}

	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_RANGO_MONTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_VERSION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_SECCION_SE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('DESCRIPCION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('PUNTAJE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('RANGO_INICIAL')?.option('readOnly', true);
		this.dataForm.instance.getEditor('RANGO_FINAL')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ORDEN')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ACTIVO')?.option('readOnly', true);
	}

	override habilitar(): void {
		const estadoSoloLectura = this.banderaMtto === UpdateType.Update;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_RANGO_MONTO')?.option('readOnly', true);
			this.dataForm.instance.getEditor('CORR_VERSION')?.option('readOnly', false);
			this.dataForm.instance.getEditor('CORR_SECCION_SE')?.option('readOnly', false);
			this.dataForm.instance.getEditor('DESCRIPCION')?.option('readOnly', false);
			this.dataForm.instance.getEditor('PUNTAJE')?.option('readOnly', false);
			this.dataForm.instance.getEditor('RANGO_INICIAL')?.option('readOnly', false);
			this.dataForm.instance.getEditor('RANGO_FINAL')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ORDEN')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ACTIVO')?.option('readOnly', estadoSoloLectura);
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_VERSION')?.focus();
		});
	}
}
