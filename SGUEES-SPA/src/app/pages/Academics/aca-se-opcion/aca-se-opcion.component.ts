// Qué hace: vista de mantenimiento de opciones socioeconómico.
// Cómo lo hace: CRUD de ACA_SE_OPCION; pregunta vía getLookUp (patrón sc-descriptor).
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { AcaSeOpcion, AcaSePreguntaLookup } from './models/aca-se-opcion';
import { AcaSeOpcionService } from './aca-se-opcion.service';

const ESTADO_FIELD = 'ACTIVO';

@Component({
	selector: 'app-aca-se-opcion',
	templateUrl: './aca-se-opcion.component.html',
	styleUrls: ['./aca-se-opcion.component.scss'],
})
export class AcaSeOpcionComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'la opción';
	protected override requiereEmpresaSesion = false;
	protected override mttoPageSize = 10;
	protected override mttoPageSizes = [10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_OPCION';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'TEXTO';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de opciones socioeconómico';
	mCORR_PREGUNTA: AcaSePreguntaLookup[] = [];

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: AcaSeOpcionService
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
		this.getCORR_PREGUNTA();
		this.consultar();
	}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	fillParam(xCORR_OPCION?: number): any {
		return { CORR_OPCION: xCORR_OPCION ?? 0 };
	}

	override fillData(xModel?: AcaSeOpcion): AcaSeOpcion {
		if (xModel !== undefined) {
			return {
				CORR_OPCION: xModel.CORR_OPCION,
				CORR_PREGUNTA: xModel.CORR_PREGUNTA,
				CODIGO_PREGUNTA: xModel.CODIGO_PREGUNTA,
				ENUNCIADO_PREGUNTA: xModel.ENUNCIADO_PREGUNTA,
				CODIGO: xModel.CODIGO,
				TEXTO: xModel.TEXTO,
				ORDEN: xModel.ORDEN,
				ACTIVO: xModel.ACTIVO,
				USUARIO_CREA: xModel.USUARIO_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
			};
		}

		return {
			CORR_OPCION: 0,
			CORR_PREGUNTA: 0,
			CODIGO: '',
			TEXTO: '',
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

	// Qué hace: carga el catálogo de preguntas para el select.
	// Cómo lo hace: getLookUp GetCORR_PREGUNTA → mCORR_PREGUNTA y refresca items del form.
	getCORR_PREGUNTA(): void {
		this.service
			.getCORR_PREGUNTA()
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response?.Result && Array.isArray(response.Data)) {
						this.mCORR_PREGUNTA = response.Data.map((item: AcaSePreguntaLookup) => ({
							CORR_PREGUNTA: Number(item.CORR_PREGUNTA),
							CODIGO: (item.CODIGO ?? '').trim(),
							ENUNCIADO: (item.ENUNCIADO ?? '').trim(),
							ACTIVO: item.ACTIVO,
						}));
					} else {
						this.mCORR_PREGUNTA = [];
					}
					this.items = this.service.getItems({ preguntas: this.mCORR_PREGUNTA });
				},
				error: () => {
					this.mCORR_PREGUNTA = [];
					this.items = this.service.getItems({ preguntas: this.mCORR_PREGUNTA });
				},
			});
	}

	private ordenarModels(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort((a, b) => {
			const p = Number(a.CORR_PREGUNTA) - Number(b.CORR_PREGUNTA);
			if (p !== 0) {
				return p;
			}
			const o = Number(a.ORDEN) - Number(b.ORDEN);
			return o !== 0 ? o : Number(a.CORR_OPCION) - Number(b.CORR_OPCION);
		});
	}

	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as AcaSeOpcion);
		const key = this.mttoGridKeyExpr as keyof AcaSeOpcion;

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

		const key = this.mttoGridKeyExpr as keyof AcaSeOpcion;
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
		this.editarClick(e);
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
			this.habilitar();
		});
	}

	override nuevo(): void {
		super.nuevo();
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
		super.cancelar((item: any) => item.CORR_OPCION === this.modelUpdate.CORR_OPCION);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.convertirErrorMttoEnWarning(this.service.delete(this.fillParam(e.data.CORR_OPCION))),
		});
	}

	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_OPCION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CORR_PREGUNTA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('TEXTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ORDEN')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ACTIVO')?.option('readOnly', true);
	}

	override habilitar(): void {
		const estadoSoloLectura = this.banderaMtto === UpdateType.Update;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_OPCION')?.option('readOnly', true);
			this.dataForm.instance.getEditor('CORR_PREGUNTA')?.option('readOnly', false);
			this.dataForm.instance.getEditor('CODIGO')?.option('readOnly', false);
			this.dataForm.instance.getEditor('TEXTO')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ORDEN')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ACTIVO')?.option('readOnly', estadoSoloLectura);
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_PREGUNTA')?.focus();
		});
	}
}
