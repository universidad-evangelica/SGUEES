// Qué hace: vista de mantenimiento de Puesto (CRUD del catálogo Payroll PLA_PUESTO).
// Cómo: grilla + formulario con lookup de tipo de puesto; coordina PlaPuestoService.
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { environment } from 'src/environments/environment';
import { PlaPuesto } from './models/pla-puesto';
import { PlaPuestoService } from './pla-puesto.service';

const ESTADO_FIELD = 'ACTIVO_PUESTO';

@Component({
	selector: 'app-pla-puesto',
	templateUrl: './pla-puesto.component.html',
	styleUrls: ['./pla-puesto.component.scss'],
})
export class PlaPuestoComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'el puesto';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_PUESTO';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'NOMBRE_PUESTO';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	mCORR_TIPO_PUESTO: any[] = [];
	readOnly = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de Puesto';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: PlaPuestoService
	) {
		super(appInfoService, router);
		this.selectedLookUpCORR_TIPO_PUESTO = this.selectedLookUpCORR_TIPO_PUESTO.bind(this);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.llenaComboBox();
		this.consultar();
	}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
			this.readOnly = false;
		}
	}

	llenaComboBox(): void {
		this.getCORR_TIPO_PUESTO();
	}

	getCORR_TIPO_PUESTO(): void {
		this.appInfoService
			.getLookUp('PLA_PUESTO', 'PLA_TIPO_PUESTO', 'GetCORR_TIPO_PUESTO', undefined, environment.UrlTALENTOHUMANONAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_TIPO_PUESTO = response?.Result && Array.isArray(response.Data) ? response.Data : [];
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	selectedLookUpCORR_TIPO_PUESTO(vRow: any): number {
		return vRow[0].CORR_TIPO_PUESTO;
	}

	onTipoPuestoChanged(value: number | null): void {
		this.model.CORR_TIPO_PUESTO = value != null && Number(value) > 0 ? Number(value) : null;
	}

	fillParam(xCORR_PUESTO?: number): any {
		return { CORR_PUESTO: xCORR_PUESTO ?? 0 };
	}

	override fillData(xModel?: PlaPuesto): PlaPuesto {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: Number(xModel.CORR_EMPRESA ?? 0),
				CORR_PUESTO: Number(xModel.CORR_PUESTO ?? 0),
				NOMBRE_PUESTO: (xModel.NOMBRE_PUESTO ?? '').trim(),
				CODIGO_PUESTO: xModel.CODIGO_PUESTO ?? '',
				CORR_TIPO_PUESTO:
					xModel.CORR_TIPO_PUESTO != null && Number(xModel.CORR_TIPO_PUESTO) > 0
						? Number(xModel.CORR_TIPO_PUESTO)
						: null,
				NOMBRE_TIPO_PUESTO: xModel.NOMBRE_TIPO_PUESTO ?? '',
				ACTIVO_PUESTO: xModel.ACTIVO_PUESTO !== false,
				APROBACION_PUESTO: xModel.APROBACION_PUESTO === true,
				MISION_PUESTO: xModel.MISION_PUESTO ?? '',
				OTROS_ASPECTOS: xModel.OTROS_ASPECTOS ?? '',
				USUARIO_CREA: xModel.USUARIO_CREA ?? '',
				ESTACION_CREA: xModel.ESTACION_CREA ?? '',
				FECHA_CREA: xModel.FECHA_CREA ?? new Date(),
				USUARIO_ACTU: xModel.USUARIO_ACTU ?? '',
				ESTACION_ACTU: xModel.ESTACION_ACTU ?? '',
				FECHA_ACTU: xModel.FECHA_ACTU ?? new Date(),
			};
		}

		return {
			CORR_EMPRESA: 1,
			CORR_PUESTO: 0,
			NOMBRE_PUESTO: '',
			CODIGO_PUESTO: '',
			CORR_TIPO_PUESTO: null,
			NOMBRE_TIPO_PUESTO: '',
			ACTIVO_PUESTO: true,
			APROBACION_PUESTO: false,
			MISION_PUESTO: '',
			OTROS_ASPECTOS: '',
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
		this.models = [...this.models].sort((a, b) => Number(a.CORR_PUESTO) - Number(b.CORR_PUESTO));
	}

	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as PlaPuesto);
		const key = this.mttoGridKeyExpr as keyof PlaPuesto;

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

		const key = this.mttoGridKeyExpr as keyof PlaPuesto;
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
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
		});
	}

	// Qué hace: convierte un error de llave foránea al eliminar en una advertencia controlada.
	// Cómo: intercepta el error de la petición y, si el mensaje indica una relación, devuelve un IResult con advertencia.
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
		super.cancelar((item: any) => item.CORR_PUESTO === this.modelUpdate.CORR_PUESTO);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirErrorMttoEnWarning(this.service.delete(this.fillParam(e.data.CORR_PUESTO))),
		});
	}

	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	override bloquear(): void {
		this.readOnly = true;
		const fields = [
			'CORR_PUESTO',
			'CODIGO_PUESTO',
			'NOMBRE_PUESTO',
			'MISION_PUESTO',
			'OTROS_ASPECTOS',
			'APROBACION_PUESTO',
			'ACTIVO_PUESTO',
		];
		fields.forEach((field) => this.dataForm.instance.getEditor(field)?.option('readOnly', true));
	}

	override habilitar(): void {
		const estadoSoloLectura = this.banderaMtto === UpdateType.Update;
		this.readOnly = false;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_PUESTO')?.option('readOnly', true);
			[
				'CODIGO_PUESTO',
				'NOMBRE_PUESTO',
				'MISION_PUESTO',
				'OTROS_ASPECTOS',
				'APROBACION_PUESTO',
			].forEach((field) => this.dataForm.instance.getEditor(field)?.option('readOnly', false));
			this.dataForm.instance.getEditor('ACTIVO_PUESTO')?.option('readOnly', estadoSoloLectura);
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_PUESTO')?.focus();
		});
	}
}
