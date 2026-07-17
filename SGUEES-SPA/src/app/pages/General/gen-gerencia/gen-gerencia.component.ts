import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { GenGerencia } from './models/gen-gerencia';
import { GenGerenciaService } from './gen-gerencia.service';

@Component({
	selector: 'app-gen-gerencia',
	templateUrl: './gen-gerencia.component.html',
	styleUrls: ['./gen-gerencia.component.scss'],
})
export class GenGerenciaComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'la gerencia';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_GERENCIA';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	mCORR_DIVISION: any;
	readOnly = false;
	divisionInvalida = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de Gerencias';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenGerenciaService
	) {
		super(appInfoService, router);
		this.selectedLookUpCORR_DIVISION = this.selectedLookUpCORR_DIVISION.bind(this);
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
		}
	}

	llenaComboBox(): void {
		this.getCORR_DIVISION();
	}

	getCORR_DIVISION(): void {
		this.appInfoService
			.getLookUp('GEN_GERENCIA', 'GEN_DIVISION', 'GetCORR_DIVISION', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_DIVISION = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	selectedLookUpCORR_DIVISION(vRow: any): any {
		return vRow[0].CORR_DIVISION;
	}

	fillParam(xCORR_GERENCIA?: number): any {
		return { CORR_GERENCIA: xCORR_GERENCIA ?? 0 };
	}

	override fillData(xModel?: GenGerencia): GenGerencia {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_GERENCIA: xModel.CORR_GERENCIA,
				NOMBRE_GERENCIA: xModel.NOMBRE_GERENCIA,
				CODIGO_GERENCIA: xModel.CODIGO_GERENCIA,
				CORR_DIVISION: xModel.CORR_DIVISION,
				NOMBRE_DIVISION: xModel.NOMBRE_DIVISION,
				CODIGO_DIVISION: xModel.CODIGO_DIVISION,
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
			CORR_GERENCIA: 0,
			NOMBRE_GERENCIA: '',
			CODIGO_GERENCIA: '',
			CORR_DIVISION: null,
			NOMBRE_DIVISION: '',
			CODIGO_DIVISION: '',
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

		this.models = [...this.models].sort((a, b) => Number(a.CORR_GERENCIA) - Number(b.CORR_GERENCIA));
	}

	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as GenGerencia);
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
		this.readOnly = true;
		this.llenaComboBox();
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

		this.readOnly = false;
		this.divisionInvalida = false;
		this.model = this.fillData(e.row.data);
		this.llenaComboBox();
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
		this.readOnly = false;
		this.divisionInvalida = false;
		super.nuevo();
		this.llenaComboBox();
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
		});
	}

	onDivisionChanged(value: number | null): void {
		this.model.CORR_DIVISION = value;
		if (value != null && value > 0) {
			this.divisionInvalida = false;
		}
	}

	guardar(): void {
		const formData = this.dataForm?.instance?.option('formData');
		if (formData) {
			this.model = { ...this.model, ...formData };
		}

		const formValidation = this.dataForm?.instance?.validate();
		this.divisionInvalida = !this.model.CORR_DIVISION || this.model.CORR_DIVISION <= 0;
		if (this.divisionInvalida || (formValidation && !formValidation.isValid)) {
			this.service.esValido(this.model, this.notifyFx.bind(this));
			return;
		}

		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.convertirCodigoDuplicadoEnWarning(this.service.insert(this.model)),
			update: () => this.convertirCodigoDuplicadoEnWarning(this.service.update(this.model)),
		});
	}

	private convertirCodigoDuplicadoEnWarning<T>(request: Observable<T>): Observable<T> {
		return request.pipe(
			catchError((error: any) => {
				const message = this.obtenerMensajeApiLocal(error).toLowerCase();
				const errorCode = Number(error?.ErrorCode ?? error?.error?.ErrorCode);
				if (errorCode === 2601 || errorCode === 2627 || this.esErrorDuplicadoLocal(message)) {
					return of({
						Result: false,
						ErrorCode: 2627,
						ErrorMessage: 'El código de gerencia ingresado está registrado. Escriba otro código para continuar.',
					} as T);
				}

				return throwError(() => error);
			})
		);
	}

	private convertirEliminacionRelacionadaEnWarning<T>(request: Observable<T>): Observable<T> {
		return request.pipe(
			catchError((error: any) => {
				const message = this.obtenerMensajeApiLocal(error).toLowerCase();
				const errorCode = Number(error?.ErrorCode ?? error?.error?.ErrorCode);
				if (errorCode === 547 || this.esErrorRelacionadosLocal(message)) {
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

	private esErrorDuplicadoLocal(message: string): boolean {
		return ['ya existe', 'duplicad', 'primary key', 'unique key', 'mismo tiempo', 'llave primaria', 'clave primaria'].some(
			(fragment) => message.includes(fragment)
		);
	}

	private esErrorRelacionadosLocal(message: string): boolean {
		return [
			'foreign key',
			'reference constraint',
			'restricción reference',
			'restriccion reference',
			'hijos',
			'relacionad',
			'asociad',
		].some((fragment) => message.includes(fragment));
	}

	private obtenerMensajeApiLocal(error: any): string {
		if (typeof error === 'string') {
			return error;
		}

		if (typeof error?.error === 'string') {
			return error.error;
		}

		return `${error?.ErrorMessage ?? error?.error?.ErrorMessage ?? error?.message ?? error ?? ''}`;
	}

	override cancelar(): void {
		this.divisionInvalida = false;
		super.cancelar((item: any) => item.CORR_GERENCIA === this.modelUpdate.CORR_GERENCIA);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirEliminacionRelacionadaEnWarning(this.service.delete(this.fillParam(e.data.CORR_GERENCIA))),
		});
	}

	override bloquear(): void {
		this.readOnly = true;
		this.dataForm?.instance?.getEditor('CORR_GERENCIA')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('NOMBRE_GERENCIA')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('CODIGO_GERENCIA')?.option('readOnly', true);
	}

	override habilitar(): void {
		this.readOnly = false;
		setTimeout(() => {
			this.dataForm?.instance?.getEditor('CORR_GERENCIA')?.option('readOnly', true);
			this.dataForm?.instance?.getEditor('NOMBRE_GERENCIA')?.option('readOnly', false);
			this.dataForm?.instance?.getEditor('CODIGO_GERENCIA')?.option('readOnly', false);
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm?.instance?.getEditor('NOMBRE_GERENCIA')?.focus();
		});
	}
}
