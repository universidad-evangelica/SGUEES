// Qué hace: vista de mantenimiento de Tipo Documento Identidad.
// Cómo: administra el CRUD del catálogo GEN_TIPO_DOCUMENTO_IDENTIDAD (sin empresa).
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { environment } from 'src/environments/environment';
import { GenTipoDocumentoIdentidad } from './models/gen-tipo-documento-identidad';
import { GenTipoDocumentoIdentidadService } from './gen-tipo-documento-identidad.service';

const ESTADO_FIELD = 'ACTIVO_TIPO_DOCUMENTO_IDENTIDAD';

@Component({
	selector: 'app-gen-tipo-documento-identidad',
	templateUrl: './gen-tipo-documento-identidad.component.html',
	styleUrls: ['./gen-tipo-documento-identidad.component.scss'],
})
export class GenTipoDocumentoIdentidadComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'el tipo de documento de identidad';
	protected override requiereEmpresaSesion = false;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_TIPO_DOCUMENTO_IDENTIDAD';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'NOMBRE_TIPO_DOCUMENTO_IDENTIDAD';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de Tipo Documento Identidad';

	/** Listas GEN_LISTA para lookups del formulario. */
	mFORMATO_CARACTERES: any[] = [];
	mAPLICA_PARA: any[] = [];
	readOnly = false;

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenTipoDocumentoIdentidadService
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
		this.cargarLookups();
		this.consultar();
	}

	// Qué hace: carga listas FORMATO_CARACTERES y APLICA_PARA desde GEN_LISTA.
	private cargarLookups(): void {
		this.appInfoService
			.getLookUp('GEN_TIPO_DOCUMENTO_IDENTIDAD', 'GEN_LISTA', 'GetFORMATO_CARACTERES', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response?.Result) {
						this.mFORMATO_CARACTERES = response.Data ?? [];
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});

		this.appInfoService
			.getLookUp('GEN_TIPO_DOCUMENTO_IDENTIDAD', 'GEN_LISTA', 'GetAPLICA_PARA', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response?.Result) {
						this.mAPLICA_PARA = response.Data ?? [];
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	selectedLookUpLista(vRow: any): any {
		return vRow?.[0]?.Key;
	}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	fillParam(xCORR?: number): any {
		return { CORR_TIPO_DOCUMENTO_IDENTIDAD: xCORR ?? 0 };
	}

	override fillData(xModel?: GenTipoDocumentoIdentidad): GenTipoDocumentoIdentidad {
		if (xModel !== undefined) {
			return {
				CORR_TIPO_DOCUMENTO_IDENTIDAD: xModel.CORR_TIPO_DOCUMENTO_IDENTIDAD,
				NOMBRE_TIPO_DOCUMENTO_IDENTIDAD: xModel.NOMBRE_TIPO_DOCUMENTO_IDENTIDAD,
				NOMBRE_CORTO: xModel.NOMBRE_CORTO,
				ACTIVO_TIPO_DOCUMENTO_IDENTIDAD: xModel.ACTIVO_TIPO_DOCUMENTO_IDENTIDAD,
				NUMERO_CARACTERES: xModel.NUMERO_CARACTERES,
				ACTIVO_CARACTERES: xModel.ACTIVO_CARACTERES,
				FORMATO_CARACTERES: xModel.FORMATO_CARACTERES ?? '',
				NOMBRE_FORMATO_CARACTERES: xModel.NOMBRE_FORMATO_CARACTERES ?? '',
				APLICA_PARA: xModel.APLICA_PARA ?? '',
				NOMBRE_APLICA_PARA: xModel.NOMBRE_APLICA_PARA ?? '',
				USUARIO_CREA: xModel.USUARIO_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
			};
		}

		return {
			CORR_TIPO_DOCUMENTO_IDENTIDAD: 0,
			NOMBRE_TIPO_DOCUMENTO_IDENTIDAD: '',
			NOMBRE_CORTO: '',
			ACTIVO_TIPO_DOCUMENTO_IDENTIDAD: true,
			NUMERO_CARACTERES: 0,
			ACTIVO_CARACTERES: false,
			FORMATO_CARACTERES: '',
			NOMBRE_FORMATO_CARACTERES: '',
			APLICA_PARA: '',
			NOMBRE_APLICA_PARA: '',
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

		this.models = [...this.models].sort(
			(a, b) => Number(a.CORR_TIPO_DOCUMENTO_IDENTIDAD) - Number(b.CORR_TIPO_DOCUMENTO_IDENTIDAD)
		);
	}

	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as GenTipoDocumentoIdentidad);
		const key = this.mttoGridKeyExpr as keyof GenTipoDocumentoIdentidad;

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

		const key = this.mttoGridKeyExpr as keyof GenTipoDocumentoIdentidad;
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
		super.cancelar(
			(item: any) => item.CORR_TIPO_DOCUMENTO_IDENTIDAD === this.modelUpdate.CORR_TIPO_DOCUMENTO_IDENTIDAD
		);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirErrorMttoEnWarning(
					this.service.delete(this.fillParam(e.data.CORR_TIPO_DOCUMENTO_IDENTIDAD))
				),
		});
	}

	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	override bloquear(): void {
		this.readOnly = true;
		this.dataForm.instance.getEditor('CORR_TIPO_DOCUMENTO_IDENTIDAD')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_TIPO_DOCUMENTO_IDENTIDAD')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_CORTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NUMERO_CARACTERES')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ACTIVO_CARACTERES')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ACTIVO_TIPO_DOCUMENTO_IDENTIDAD')?.option('readOnly', true);
	}

	override habilitar(): void {
		const estadoSoloLectura = this.banderaMtto === UpdateType.Update;
		this.readOnly = false;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_TIPO_DOCUMENTO_IDENTIDAD')?.option('readOnly', true);
			this.dataForm.instance.getEditor('NOMBRE_TIPO_DOCUMENTO_IDENTIDAD')?.option('readOnly', false);
			this.dataForm.instance.getEditor('NOMBRE_CORTO')?.option('readOnly', false);
			this.dataForm.instance.getEditor('NUMERO_CARACTERES')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ACTIVO_CARACTERES')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ACTIVO_TIPO_DOCUMENTO_IDENTIDAD')?.option('readOnly', estadoSoloLectura);
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_TIPO_DOCUMENTO_IDENTIDAD')?.focus();
		});
	}
}
