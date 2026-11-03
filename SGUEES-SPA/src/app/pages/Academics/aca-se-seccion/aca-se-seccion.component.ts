// Qué hace: vista de mantenimiento de secciones socioeconómico.
// Cómo lo hace: CRUD de ACA_SE_SECCION; versión vía getLookUp (patrón aca-se-version-pregunta).
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { AcaSeSeccion, AcaSeVersionLookup } from './models/aca-se-seccion';
import { AcaSeSeccionService } from './aca-se-seccion.service';

const ESTADO_FIELD = 'ACTIVO';

@Component({
	standalone: false,
	selector: 'app-aca-se-seccion',
	templateUrl: './aca-se-seccion.component.html',
	styleUrls: ['./aca-se-seccion.component.scss'],
})
export class AcaSeSeccionComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'la sección';
	protected override requiereEmpresaSesion = false;
	protected override mttoPageSize = 10;
	protected override mttoPageSizes = [10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_SECCION_SE';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'NOMBRE_SECCION';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de secciones socioeconómico';
	mCORR_VERSION: AcaSeVersionLookup[] = [];

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: AcaSeSeccionService
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
		this.cargarLookUps();
		this.consultar();
	}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	fillParam(xCORR_SECCION_SE?: number): any {
		return { CORR_SECCION_SE: xCORR_SECCION_SE ?? 0 };
	}

	override fillData(xModel?: AcaSeSeccion): AcaSeSeccion {
		if (xModel !== undefined) {
			return {
				CORR_SECCION_SE: xModel.CORR_SECCION_SE,
				CORR_VERSION: xModel.CORR_VERSION,
				CODIGO_VERSION: xModel.CODIGO_VERSION,
				NOMBRE_VERSION: xModel.NOMBRE_VERSION,
				NOMBRE_SECCION: xModel.NOMBRE_SECCION,
				DESCRIPCION: xModel.DESCRIPCION ?? null,
				ORDEN: Number(xModel.ORDEN ?? 0),
				PUNTAJE_MAXIMO:
					xModel.PUNTAJE_MAXIMO === null || xModel.PUNTAJE_MAXIMO === undefined
						? null
						: Number(xModel.PUNTAJE_MAXIMO),
				PORCENTAJE_SECCION:
					xModel.PORCENTAJE_SECCION === null || xModel.PORCENTAJE_SECCION === undefined
						? null
						: Number(xModel.PORCENTAJE_SECCION),
				ACTIVO: !!xModel.ACTIVO,
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
			CORR_SECCION_SE: 0,
			CORR_VERSION: 0,
			NOMBRE_SECCION: '',
			DESCRIPCION: null,
			ORDEN: 0,
			PUNTAJE_MAXIMO: null,
			PORCENTAJE_SECCION: null,
			ACTIVO: true,
			CORR_EMPRESA: 1,
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

	// Qué hace: carga el lookup de versiones activas/disponibles.
	// Cómo lo hace: GetCORR_VERSION vía getLookUp hacia ACA_SE_VERSION.
	private cargarLookUps(): void {
		this.service
			.getCORR_VERSION()
			.pipe(
				catchError(() => of({ Result: false, Data: [] } as any)),
				take(1)
			)
			.subscribe({
				next: (result: any) => {
					this.mCORR_VERSION = Array.isArray(result?.Data)
						? result.Data.map((item: AcaSeVersionLookup) => ({
								CORR_VERSION: Number(item.CORR_VERSION),
								CODIGO: (item.CODIGO ?? '').trim(),
								NOMBRE: (item.NOMBRE ?? '').trim(),
								ACTIVO: item.ACTIVO,
						  }))
						: [];
					this.refrescarItemsForm();
				},
			});
	}

	// Qué hace: reconstruye el formulario con el dataSource de versiones.
	private refrescarItemsForm(): void {
		this.items = this.service.getItems({ versiones: this.mCORR_VERSION });
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
			const o = Number(a.ORDEN) - Number(b.ORDEN);
			return o !== 0 ? o : Number(a.CORR_SECCION_SE) - Number(b.CORR_SECCION_SE);
		});
	}

	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as AcaSeSeccion);
		const key = this.mttoGridKeyExpr as keyof AcaSeSeccion;

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

		const key = this.mttoGridKeyExpr as keyof AcaSeSeccion;
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
		}
		this.refrescarItemsForm();
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
		this.refrescarItemsForm();
		this.editarClick(e);
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
			this.habilitar();
		});
	}

	override nuevo(): void {
		super.nuevo();
		this.refrescarItemsForm();
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
		super.cancelar((item: any) => item.CORR_SECCION_SE === this.modelUpdate.CORR_SECCION_SE);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirErrorMttoEnWarning(this.service.delete(this.fillParam(e.data.CORR_SECCION_SE))),
		});
	}

	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_SECCION_SE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_VERSION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_SECCION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('DESCRIPCION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ORDEN')?.option('readOnly', true);
		this.dataForm.instance.getEditor('PUNTAJE_MAXIMO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('PORCENTAJE_SECCION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ACTIVO')?.option('readOnly', true);
	}

	override habilitar(): void {
		const estadoSoloLectura = this.banderaMtto === UpdateType.Update;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_SECCION_SE')?.option('readOnly', true);
			this.dataForm.instance.getEditor('CORR_VERSION')?.option('readOnly', false);
			this.dataForm.instance.getEditor('NOMBRE_SECCION')?.option('readOnly', false);
			this.dataForm.instance.getEditor('DESCRIPCION')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ORDEN')?.option('readOnly', false);
			this.dataForm.instance.getEditor('PUNTAJE_MAXIMO')?.option('readOnly', false);
			this.dataForm.instance.getEditor('PORCENTAJE_SECCION')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ACTIVO')?.option('readOnly', estadoSoloLectura);
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_VERSION')?.focus();
		});
	}
}
