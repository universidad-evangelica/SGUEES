// Qué hace: vista de mantenimiento de documentos de admisión.
// Cómo: administra el CRUD del catálogo ACA_DOCUMENTO_ADMISION (patrón gen-religion, sin empresa).
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { AcaDocumentoAdmision } from './models/aca-documento-admision';
import { AcaDocumentoAdmisionService } from './aca-documento-admision.service';

const ESTADO_FIELD = 'ACTIVO';

@Component({
	selector: 'app-aca-documento-admision',
	templateUrl: './aca-documento-admision.component.html',
	styleUrls: ['./aca-documento-admision.component.scss'],
})
export class AcaDocumentoAdmisionComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'el documento';
	protected override requiereEmpresaSesion = false;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_DOCUMENTO_ADMISION';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'NOMBRE_DOCUMENTO';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de documentos de admisión';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: AcaDocumentoAdmisionService
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

	fillParam(xCORR_DOCUMENTO_ADMISION?: number): any {
		return { CORR_DOCUMENTO_ADMISION: xCORR_DOCUMENTO_ADMISION ?? 0 };
	}

	override fillData(xModel?: AcaDocumentoAdmision): AcaDocumentoAdmision {
		if (xModel !== undefined) {
			return {
				CORR_DOCUMENTO_ADMISION: xModel.CORR_DOCUMENTO_ADMISION,
				NOMBRE_DOCUMENTO: xModel.NOMBRE_DOCUMENTO,
				CODIGO: xModel.CODIGO,
				OBLIGATORIO: xModel.OBLIGATORIO,
				ORDEN: xModel.ORDEN,
				ACTIVO: xModel.ACTIVO,
				FORMATOS_PERMITIDOS: xModel.FORMATOS_PERMITIDOS,
				TAMANO_MAXIMO_MB: xModel.TAMANO_MAXIMO_MB,
				USUARIO_CREA: xModel.USUARIO_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
			};
		}

		return {
			CORR_DOCUMENTO_ADMISION: 0,
			NOMBRE_DOCUMENTO: '',
			CODIGO: '',
			OBLIGATORIO: false,
			ORDEN: 0,
			ACTIVO: true,
			FORMATOS_PERMITIDOS: 'PDF,JPG,PNG',
			TAMANO_MAXIMO_MB: 10,
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
				this.ordenarModelsPorOrden();
				this.refrescarGridTrasCarga(resetPage);
			},
		});
	}

	private ordenarModelsPorOrden(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort((a, b) => {
			const orden = Number(a.ORDEN) - Number(b.ORDEN);
			return orden !== 0 ? orden : Number(a.CORR_DOCUMENTO_ADMISION) - Number(b.CORR_DOCUMENTO_ADMISION);
		});
	}

	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as AcaDocumentoAdmision);
		const key = this.mttoGridKeyExpr as keyof AcaDocumentoAdmision;

		if (isAdd) {
			this.models = [...this.models, record];
		} else {
			const index = this.models.findIndex((item) => item?.[key] === record[key]);
			if (index >= 0) {
				this.models = this.models.map((item, i) => (i === index ? this.fillData({ ...item, ...record }) : item));
			}
		}

		this.ordenarModelsPorOrden();
		this.refrescarGridTrasCarga(isAdd);
	}

	protected override quitarRegistroDeGrid(keyValue: unknown): void {
		if (!this.mttoGridKeyExpr || !Array.isArray(this.models)) {
			super.quitarRegistroDeGrid(keyValue);
			return;
		}

		const key = this.mttoGridKeyExpr as keyof AcaDocumentoAdmision;
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
		super.cancelar((item: any) => item.CORR_DOCUMENTO_ADMISION === this.modelUpdate.CORR_DOCUMENTO_ADMISION);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.convertirErrorMttoEnWarning(this.service.delete(this.fillParam(e.data.CORR_DOCUMENTO_ADMISION))),
		});
	}

	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_DOCUMENTO_ADMISION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_DOCUMENTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('OBLIGATORIO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ORDEN')?.option('readOnly', true);
		this.dataForm.instance.getEditor('FORMATOS_PERMITIDOS')?.option('readOnly', true);
		this.dataForm.instance.getEditor('TAMANO_MAXIMO_MB')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ACTIVO')?.option('readOnly', true);
	}

	override habilitar(): void {
		const estadoSoloLectura = this.banderaMtto === UpdateType.Update;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_DOCUMENTO_ADMISION')?.option('readOnly', true);
			this.dataForm.instance.getEditor('CODIGO')?.option('readOnly', false);
			this.dataForm.instance.getEditor('NOMBRE_DOCUMENTO')?.option('readOnly', false);
			this.dataForm.instance.getEditor('OBLIGATORIO')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ORDEN')?.option('readOnly', false);
			this.dataForm.instance.getEditor('FORMATOS_PERMITIDOS')?.option('readOnly', false);
			this.dataForm.instance.getEditor('TAMANO_MAXIMO_MB')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ACTIVO')?.option('readOnly', estadoSoloLectura);
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CODIGO')?.focus();
		});
	}
}
