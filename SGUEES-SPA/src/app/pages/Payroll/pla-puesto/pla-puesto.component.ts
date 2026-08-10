// Qué hace: vista de mantenimiento de Puesto (CRUD del catálogo Payroll PLA_PUESTO).
// Cómo: grilla + formulario con lookups de tipo/gerencia/nivel; coordina PlaPuestoService.
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

const ESTADO_FIELD = 'ESTADO_PUESTO';

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
	mCORR_GERENCIA: any[] = [];
	mCORR_NIVEL_ACADEMICO: any[] = [];
	readOnly = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de Puesto';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: PlaPuestoService
	) {
		super(appInfoService, router);
		this.selectedLookUpCORR_TIPO_PUESTO = this.selectedLookUpCORR_TIPO_PUESTO.bind(this);
		this.selectedLookUpCORR_GERENCIA = this.selectedLookUpCORR_GERENCIA.bind(this);
		this.selectedLookUpCORR_NIVEL_ACADEMICO = this.selectedLookUpCORR_NIVEL_ACADEMICO.bind(this);
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
		this.readOnly = xEstado === UpdateType.Browse || xEstado === UpdateType.Consult;
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	llenaComboBox(): void {
		this.getCORR_TIPO_PUESTO();
		this.getCORR_GERENCIA();
		this.getCORR_NIVEL_ACADEMICO();
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

	getCORR_GERENCIA(): void {
		this.appInfoService
			.getLookUp('PLA_PUESTO', 'GEN_GERENCIA', 'GetCORR_GERENCIA', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_GERENCIA = response?.Result && Array.isArray(response.Data) ? response.Data : [];
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	getCORR_NIVEL_ACADEMICO(): void {
		this.appInfoService
			.getLookUp(
				'PLA_PUESTO',
				'PLA_NIVEL_ACADEMICO',
				'GetCORR_NIVEL_ACADEMICO',
				undefined,
				environment.UrlTALENTOHUMANONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.mCORR_NIVEL_ACADEMICO = response?.Result && Array.isArray(response.Data) ? response.Data : [];
				},
				error: (error) => this.notifyApiError(error),
			});
	}

	selectedLookUpCORR_TIPO_PUESTO(vRow: any): number {
		return vRow[0].CORR_TIPO_PUESTO;
	}

	selectedLookUpCORR_GERENCIA(vRow: any): number {
		return vRow[0].CORR_GERENCIA;
	}

	selectedLookUpCORR_NIVEL_ACADEMICO(vRow: any): number {
		return vRow[0].CORR_NIVEL_ACADEMICO;
	}

	onTipoPuestoChanged(value: number | null): void {
		this.model.CORR_TIPO_PUESTO = value != null && Number(value) > 0 ? Number(value) : null;
	}

	onGerenciaChanged(value: number | null): void {
		this.model.CORR_GERENCIA = value != null && Number(value) > 0 ? Number(value) : null;
	}

	onNivelAcademicoChanged(value: number | null): void {
		this.model.CORR_NIVEL_ACADEMICO = value != null && Number(value) > 0 ? Number(value) : null;
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
				CORR_GERENCIA: xModel.CORR_GERENCIA != null && Number(xModel.CORR_GERENCIA) > 0 ? Number(xModel.CORR_GERENCIA) : null,
				NOMBRE_GERENCIA: xModel.NOMBRE_GERENCIA ?? '',
				CORR_UNIDAD: xModel.CORR_UNIDAD != null ? Number(xModel.CORR_UNIDAD) : null,
				NOMBRE_UNIDAD: xModel.NOMBRE_UNIDAD ?? '',
				CORR_NIVEL_ACADEMICO:
					xModel.CORR_NIVEL_ACADEMICO != null && Number(xModel.CORR_NIVEL_ACADEMICO) > 0
						? Number(xModel.CORR_NIVEL_ACADEMICO)
						: null,
				NOMBRE_NIVEL_ACADEMICO: xModel.NOMBRE_NIVEL_ACADEMICO ?? '',
				CORR_TIPO_PUESTO:
					xModel.CORR_TIPO_PUESTO != null && Number(xModel.CORR_TIPO_PUESTO) > 0
						? Number(xModel.CORR_TIPO_PUESTO)
						: null,
				NOMBRE_TIPO_PUESTO: xModel.NOMBRE_TIPO_PUESTO ?? '',
				ESTADO_PUESTO: xModel.ESTADO_PUESTO !== false,
				APROBACION_PUESTO: xModel.APROBACION_PUESTO === true,
				SALARIO_INICIAL: xModel.SALARIO_INICIAL != null ? Number(xModel.SALARIO_INICIAL) : null,
				SALARIO_FINAL: xModel.SALARIO_FINAL != null ? Number(xModel.SALARIO_FINAL) : null,
				USUARIO_VALIDA: xModel.USUARIO_VALIDA ?? '',
				USUARIO_AUTORIZA: xModel.USUARIO_AUTORIZA ?? '',
				MISION_PUESTO: xModel.MISION_PUESTO ?? '',
				OTROS_ASPECTOS: xModel.OTROS_ASPECTOS ?? '',
				CODIGO_PUESTO: xModel.CODIGO_PUESTO ?? '',
				CODIGO_FORMATO: xModel.CODIGO_FORMATO ?? '',
				VERSION_FORMATO: xModel.VERSION_FORMATO ?? '',
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
			CORR_GERENCIA: null,
			NOMBRE_GERENCIA: '',
			CORR_UNIDAD: null,
			NOMBRE_UNIDAD: '',
			CORR_NIVEL_ACADEMICO: null,
			NOMBRE_NIVEL_ACADEMICO: '',
			CORR_TIPO_PUESTO: null,
			NOMBRE_TIPO_PUESTO: '',
			ESTADO_PUESTO: true,
			APROBACION_PUESTO: false,
			SALARIO_INICIAL: null,
			SALARIO_FINAL: null,
			USUARIO_VALIDA: '',
			USUARIO_AUTORIZA: '',
			MISION_PUESTO: '',
			OTROS_ASPECTOS: '',
			CODIGO_PUESTO: '',
			CODIGO_FORMATO: '',
			VERSION_FORMATO: '',
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
			insert: () => this.convertirDuplicadoEnWarning(this.service.insert(this.model)),
			update: () => this.convertirDuplicadoEnWarning(this.service.update(this.model)),
		});
	}

	private convertirDuplicadoEnWarning<T>(request: Observable<T>): Observable<T> {
		return request.pipe(
			catchError((error: any) => {
				const message = this.obtenerMensajeApiLocal(error);
				const normalized = message.toLowerCase();
				const errorCode = Number(error?.ErrorCode ?? error?.error?.ErrorCode);
				if (errorCode === 2601 || errorCode === 2627 || this.esErrorDuplicadoLocal(normalized)) {
					return of({
						Result: false,
						ErrorCode: 2627,
						ErrorMessage: 'El nombre de puesto ingresado esta registrado. Escriba otro nombre para continuar.',
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
		super.cancelar((item: any) => item.CORR_PUESTO === this.modelUpdate.CORR_PUESTO);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirEliminacionRelacionadaEnWarning(this.service.delete(this.fillParam(e.data.CORR_PUESTO))),
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
			'SALARIO_INICIAL',
			'SALARIO_FINAL',
			'CODIGO_FORMATO',
			'VERSION_FORMATO',
			'USUARIO_VALIDA',
			'USUARIO_AUTORIZA',
			'MISION_PUESTO',
			'OTROS_ASPECTOS',
			'APROBACION_PUESTO',
			'ESTADO_PUESTO',
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
				'SALARIO_INICIAL',
				'SALARIO_FINAL',
				'CODIGO_FORMATO',
				'VERSION_FORMATO',
				'USUARIO_VALIDA',
				'USUARIO_AUTORIZA',
				'MISION_PUESTO',
				'OTROS_ASPECTOS',
				'APROBACION_PUESTO',
			].forEach((field) => this.dataForm.instance.getEditor(field)?.option('readOnly', false));
			this.dataForm.instance.getEditor('ESTADO_PUESTO')?.option('readOnly', estadoSoloLectura);
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_PUESTO')?.focus();
		});
	}
}
