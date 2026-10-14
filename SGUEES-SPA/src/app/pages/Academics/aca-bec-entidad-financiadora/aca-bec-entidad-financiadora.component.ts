import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { AcaBecEntidadFinanciadora } from './models/aca-bec-entidad-financiadora';
import { AcaBecEntidadFinanciadoraService } from './aca-bec-entidad-financiadora.service';

const ESTADO_FIELD = 'ACTIVO';

@Component({
	selector: 'app-aca-bec-entidad-financiadora',
	templateUrl: './aca-bec-entidad-financiadora.component.html',
	styleUrls: ['./aca-bec-entidad-financiadora.component.scss'],
})
export class AcaBecEntidadFinanciadoraComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'la entidad financiadora';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 10;
	protected override mttoPageSizes = [10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_ENTIDAD_FINANCIADORA';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'NOMBRE_ENTIDAD';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de Entidades Financiadoras';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: AcaBecEntidadFinanciadoraService
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

	fillParam(xCorrEntidadFinanciadora?: number): any {
		return { CORR_ENTIDAD_FINANCIADORA: xCorrEntidadFinanciadora ?? 0 };
	}

	override fillData(xModel?: AcaBecEntidadFinanciadora): AcaBecEntidadFinanciadora {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_ENTIDAD_FINANCIADORA: xModel.CORR_ENTIDAD_FINANCIADORA,
				CODIGO_ENTIDAD: xModel.CODIGO_ENTIDAD,
				NOMBRE_ENTIDAD: xModel.NOMBRE_ENTIDAD,
				TIPO_ENTIDAD: xModel.TIPO_ENTIDAD,
				CONTACTO: xModel.CONTACTO ?? null,
				TELEFONO: xModel.TELEFONO ?? null,
				CORREO: xModel.CORREO ?? null,
				ACTIVO: xModel.ACTIVO ?? true,
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
			CORR_ENTIDAD_FINANCIADORA: 0,
			CODIGO_ENTIDAD: '',
			NOMBRE_ENTIDAD: '',
			TIPO_ENTIDAD: 'OTRO',
			CONTACTO: null,
			TELEFONO: null,
			CORREO: null,
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
				this.ordenarModelsPorCorr();
				this.refrescarGridTrasCarga(resetPage);
			},
		});
	}

	private ordenarModelsPorCorr(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort((a, b) => Number(a.CORR_ENTIDAD_FINANCIADORA) - Number(b.CORR_ENTIDAD_FINANCIADORA));
	}

	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as AcaBecEntidadFinanciadora);
		const key = this.mttoGridKeyExpr as keyof AcaBecEntidadFinanciadora;

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

		const key = this.mttoGridKeyExpr as keyof AcaBecEntidadFinanciadora;
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
		this.model = this.service.normalizar(this.model);
		this.dataForm?.instance?.option('formData', this.model);

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
					'clave foranea',
					'llave foranea',
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
		super.cancelar((item: any) => item.CORR_ENTIDAD_FINANCIADORA === this.modelUpdate.CORR_ENTIDAD_FINANCIADORA);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.convertirErrorMttoEnWarning(this.service.delete(this.fillParam(e.data.CORR_ENTIDAD_FINANCIADORA))),
		});
	}

	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	override bloquear(): void {
		['CORR_ENTIDAD_FINANCIADORA', 'CODIGO_ENTIDAD', 'NOMBRE_ENTIDAD', 'TIPO_ENTIDAD', 'CONTACTO', 'TELEFONO', 'CORREO', 'ACTIVO'].forEach((field) =>
			this.dataForm.instance.getEditor(field)?.option('readOnly', true)
		);
	}

	override habilitar(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_ENTIDAD_FINANCIADORA')?.option('readOnly', true);
			['CODIGO_ENTIDAD', 'NOMBRE_ENTIDAD', 'TIPO_ENTIDAD', 'CONTACTO', 'TELEFONO', 'CORREO', 'ACTIVO'].forEach((field) =>
				this.dataForm.instance.getEditor(field)?.option('readOnly', false)
			);
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CODIGO_ENTIDAD')?.focus();
		});
	}
}
