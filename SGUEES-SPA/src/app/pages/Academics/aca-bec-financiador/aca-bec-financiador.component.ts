import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, Observable, of, throwError } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { AcaBecEntidadFinanciadoraLookup, AcaBecFinanciador, AcaBecTipoLookup } from './models/aca-bec-financiador';
import { AcaBecFinanciadorService } from './aca-bec-financiador.service';

const ESTADO_FIELD = 'ACTIVO';

@Component({
	selector: 'app-aca-bec-financiador',
	templateUrl: './aca-bec-financiador.component.html',
	styleUrls: ['./aca-bec-financiador.component.scss'],
})
export class AcaBecFinanciadorComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'el financiador de beca';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 10;
	protected override mttoPageSizes = [10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_BECA_FINANCIADOR';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'NOMBRE_ENTIDAD';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de Financiadores';
	private tiposBeca: AcaBecTipoLookup[] = [];
	private entidadesFinanciadoras: AcaBecEntidadFinanciadoraLookup[] = [];

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: AcaBecFinanciadorService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.items = this.service.getItems();
		this.summary = this.service.getSummary();
	}

	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.cargarCatalogos();
		this.consultar();
	}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	fillParam(xCorrFinanciador?: number): any {
		return { CORR_BECA_FINANCIADOR: xCorrFinanciador ?? 0 };
	}

	override fillData(xModel?: AcaBecFinanciador): AcaBecFinanciador {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_BECA_FINANCIADOR: xModel.CORR_BECA_FINANCIADOR,
				CORR_BECA: xModel.CORR_BECA,
				CODIGO_BECA: xModel.CODIGO_BECA,
				NOMBRE_BECA: xModel.NOMBRE_BECA,
				CORR_ENTIDAD_FINANCIADORA: xModel.CORR_ENTIDAD_FINANCIADORA,
				CODIGO_ENTIDAD: xModel.CODIGO_ENTIDAD,
				NOMBRE_ENTIDAD: xModel.NOMBRE_ENTIDAD,
				TIPO_ENTIDAD: xModel.TIPO_ENTIDAD,
				CONCEPTO_COBERTURA: xModel.CONCEPTO_COBERTURA,
				PORCENTAJE_COBERTURA: Number(xModel.PORCENTAJE_COBERTURA ?? 0),
				MONTO_MAXIMO: xModel.MONTO_MAXIMO ?? null,
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
			CORR_BECA_FINANCIADOR: 0,
			CORR_BECA: 0,
			CORR_ENTIDAD_FINANCIADORA: 0,
			CONCEPTO_COBERTURA: 'ARANCELES',
			PORCENTAJE_COBERTURA: 100,
			MONTO_MAXIMO: null,
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

	private cargarCatalogos(): void {
		this.loadingVisible = true;
		forkJoin({
			tiposBeca: this.service.getTiposBeca().pipe(catchError(() => of({ Data: [] } as any))),
			entidadesFinanciadoras: this.service.getEntidadesFinanciadoras().pipe(catchError(() => of({ Data: [] } as any))),
		})
			.pipe(
				finalize(() => (this.loadingVisible = false))
			)
			.subscribe((result: any) => {
				this.tiposBeca = result?.tiposBeca?.Data ?? [];
				this.entidadesFinanciadoras = result?.entidadesFinanciadoras?.Data ?? [];
				this.items = this.service.getItems({
					tiposBeca: this.tiposBeca,
					entidadesFinanciadoras: this.entidadesFinanciadoras,
				});
			});
	}

	private ordenarModels(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort((a, b) => Number(a.CORR_BECA_FINANCIADOR) - Number(b.CORR_BECA_FINANCIADOR));
	}

	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as AcaBecFinanciador);
		const key = this.mttoGridKeyExpr as keyof AcaBecFinanciador;

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

		const key = this.mttoGridKeyExpr as keyof AcaBecFinanciador;
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
		super.cancelar((item: any) => item.CORR_BECA_FINANCIADOR === this.modelUpdate.CORR_BECA_FINANCIADOR);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.convertirErrorMttoEnWarning(this.service.delete(this.fillParam(e.data.CORR_BECA_FINANCIADOR))),
		});
	}

	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	override bloquear(): void {
		[
			'CORR_BECA_FINANCIADOR',
			'CORR_BECA',
			'CORR_ENTIDAD_FINANCIADORA',
			'CONCEPTO_COBERTURA',
			'PORCENTAJE_COBERTURA',
			'MONTO_MAXIMO',
			'ACTIVO',
		].forEach((field) =>
			this.dataForm.instance.getEditor(field)?.option('readOnly', true)
		);
	}

	override habilitar(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_BECA_FINANCIADOR')?.option('readOnly', true);
			['CORR_BECA', 'CORR_ENTIDAD_FINANCIADORA', 'CONCEPTO_COBERTURA', 'PORCENTAJE_COBERTURA', 'MONTO_MAXIMO', 'ACTIVO'].forEach((field) =>
				this.dataForm.instance.getEditor(field)?.option('readOnly', false)
			);
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_BECA')?.focus();
		});
	}
}


