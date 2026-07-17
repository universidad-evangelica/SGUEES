import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ScFrecuencia } from './models/sc-frecuencia';
import { ScFrecuenciaService } from './sc-frecuencia.service';

const ESTADO_FIELD = 'ESTADO_FRECUENCIA';

@Component({
	selector: 'app-sc-frecuencia',
	templateUrl: './sc-frecuencia.component.html',
	styleUrls: ['./sc-frecuencia.component.scss'],
})
export class ScFrecuenciaComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'la frecuencia';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_FRECUENCIA';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'NOMBRE_FRECUENCIA';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de Frecuencia';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScFrecuenciaService
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
		this.consultar();
	}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	fillParam(xCORR_FRECUENCIA?: number): any {
		return { CORR_FRECUENCIA: xCORR_FRECUENCIA ?? 0 };
	}

	override fillData(xModel?: ScFrecuencia): ScFrecuencia {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_FRECUENCIA: xModel.CORR_FRECUENCIA,
				NOMBRE_FRECUENCIA: xModel.NOMBRE_FRECUENCIA,
				ESTADO_FRECUENCIA: xModel.ESTADO_FRECUENCIA,
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
			CORR_FRECUENCIA: 0,
			NOMBRE_FRECUENCIA: '',
			ESTADO_FRECUENCIA: true,
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
				this.ordenarModelsPorCorr();
				this.refrescarGridTrasCarga(resetPage);
			},
		});
	}

	private ordenarModelsPorCorr(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort((a, b) => Number(a.CORR_FRECUENCIA) - Number(b.CORR_FRECUENCIA));
	}

	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as ScFrecuencia);
		const key = this.mttoGridKeyExpr;

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

	protected override quitarRegistroDeGrid(keyValue: unknown): void {
		if (!this.mttoGridKeyExpr || !Array.isArray(this.models)) {
			super.quitarRegistroDeGrid(keyValue);
			return;
		}

		const key = this.mttoGridKeyExpr;
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
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
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
			insert: () =>
				this.convertirErrorMttoEnWarning(
					this.service.insert(this.model),
					'El nombre ingresado ya está registrado para otra frecuencia.'
				),
			update: () =>
				this.convertirErrorMttoEnWarning(
					this.service.update(this.model),
					'El nombre ingresado ya está registrado para otra frecuencia.'
				),
		});
	}

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

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_FRECUENCIA === this.modelUpdate.CORR_FRECUENCIA);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirErrorMttoEnWarning(
					this.service.delete(this.fillParam(e.data.CORR_FRECUENCIA)),
					undefined,
					true
				),
		});
	}

	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_FRECUENCIA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_FRECUENCIA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTADO_FRECUENCIA')?.option('readOnly', true);
	}

	override habilitar(): void {
		const estadoSoloLectura = this.banderaMtto === UpdateType.Update;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_FRECUENCIA')?.option('readOnly', true);
			this.dataForm.instance.getEditor('NOMBRE_FRECUENCIA')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ESTADO_FRECUENCIA')?.option('readOnly', estadoSoloLectura);
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_FRECUENCIA')?.focus();
		});
	}
}
