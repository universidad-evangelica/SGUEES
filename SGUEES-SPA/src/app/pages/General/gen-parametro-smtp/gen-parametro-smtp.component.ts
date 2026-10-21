// Qué hace: componente de mantenimiento (CRUD) para la configuración de Parámetros SMTP.
// Cómo lo hace: extiende de CBaseComponent, implementa parche en memoria tras guardar y gestiona el formulario y grilla DevExtreme.
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { GenParametroSmtp } from './models/gen-parametro-smtp';
import { GenParametroSmtpService } from './gen-parametro-smtp.service';

@Component({
	selector: 'app-gen-parametro-smtp',
	templateUrl: './gen-parametro-smtp.component.html',
	styleUrls: ['./gen-parametro-smtp.component.scss'],
})
export class GenParametroSmtpComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'la configuración de correo';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_PARAMETRO_SMTP';
	protected override mttoCampoEstado = '';
	protected override mttoEstadoDescribeField = 'CORREO_REMITENTE';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Configuración de Correo';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenParametroSmtpService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
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

	fillParam(xCORR_PARAMETRO_SMTP?: number): any {
		return { CORR_PARAMETRO_SMTP: xCORR_PARAMETRO_SMTP ?? 0 };
	}

	// Qué hace: mapea el modelo de datos o inicializa uno vacío por defecto.
	// Cómo lo hace: copia propiedades de GenParametroSmtp asegurando valores por defecto no nulos.
	override fillData(xModel?: GenParametroSmtp): GenParametroSmtp {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_PARAMETRO_SMTP: xModel.CORR_PARAMETRO_SMTP,
				CORREO_REMITENTE: xModel.CORREO_REMITENTE ?? '',
				USUARIO_REMITENTE: xModel.USUARIO_REMITENTE ?? '',
				CONTRASENA_REMITENTE: xModel.CONTRASENA_REMITENTE ?? '',
				SERVIDOR_CORREO: xModel.SERVIDOR_CORREO ?? '',
				PUERTO_CORREO: xModel.PUERTO_CORREO ?? 587,
				USA_SSL_CORREO: !!xModel.USA_SSL_CORREO,
				USUARIO_CREA: xModel.USUARIO_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
			};
		}

		return {
			CORR_EMPRESA: 0,
			CORR_PARAMETRO_SMTP: 0,
			CORREO_REMITENTE: '',
			USUARIO_REMITENTE: '',
			CONTRASENA_REMITENTE: '',
			SERVIDOR_CORREO: '',
			PUERTO_CORREO: 587,
			USA_SSL_CORREO: true,
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: new Date(),
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: new Date(),
		};
	}

	// Qué hace: consulta inicial de registros del catálogo.
	// Cómo lo hace: limpia la selección actual, invoca service.getAll y refresca el grid.
	consultar(resetPage = false): void {
		this.model = this.fillData();
		this.consultarMtto({
			load: () => this.service.getAll(this.fillParam()),
			onData: () => {
				this.ordenarModelsPorCorr();
				this.refrescarGridTrasCarga(resetPage);
			},
		});
	}

	// Qué hace: ordena la lista de registros en memoria del más reciente al más antiguo.
	// Cómo lo hace: aplica sort descendente por CORR_PARAMETRO_SMTP numérico.
	private ordenarModelsPorCorr(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort(
			(a, b) => Number(b.CORR_PARAMETRO_SMTP) - Number(a.CORR_PARAMETRO_SMTP)
		);
	}

	// Qué hace: actualiza en memoria el registro insertado o modificado sin recargar con GetAll.
	// Cómo lo hace: busca por clave primaria en this.models y actualiza el array directamente.
	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as GenParametroSmtp);
		const key = this.mttoGridKeyExpr as keyof GenParametroSmtp;

		if (isAdd) {
			this.models = [...this.models, record];
		} else {
			const index = this.models.findIndex((item) => item?.[key] === record[key]);
			if (index >= 0) {
				this.models = this.models.map((item, i) =>
					i === index ? this.fillData({ ...item, ...record }) : item
				);
			}
		}

		this.ordenarModelsPorCorr();
		this.refrescarGridTrasCarga(isAdd);
	}

	// Qué hace: remueve de memoria la fila eliminada sin realizar GetAll.
	// Cómo lo hace: filtra this.models excluyendo la llave eliminada.
	protected override quitarRegistroDeGrid(keyValue: unknown): void {
		if (!this.mttoGridKeyExpr || !Array.isArray(this.models)) {
			super.quitarRegistroDeGrid(keyValue);
			return;
		}

		const key = this.mttoGridKeyExpr as keyof GenParametroSmtp;
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

	// Qué hace: valida y guarda la configuración del formulario SMTP con parche en memoria.
	// Cómo lo hace: ejecuta validación del formulario y delega en guardarMtto invocando insert o update.
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

	// Qué hace: cancela la edición actual del registro SMTP.
	// Cómo lo hace: restaura el estado y modelo previos mediante super.cancelar().
	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_PARAMETRO_SMTP === this.modelUpdate.CORR_PARAMETRO_SMTP);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirErrorMttoEnWarning(
					this.service.delete(this.fillParam(e.data.CORR_PARAMETRO_SMTP))
				),
		});
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORREO_REMITENTE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('SERVIDOR_CORREO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('PUERTO_CORREO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('USA_SSL_CORREO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('USUARIO_REMITENTE')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CONTRASENA_REMITENTE')?.option('readOnly', true);
	}

	override habilitar(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORREO_REMITENTE')?.option('readOnly', false);
			this.dataForm.instance.getEditor('SERVIDOR_CORREO')?.option('readOnly', false);
			this.dataForm.instance.getEditor('PUERTO_CORREO')?.option('readOnly', false);
			this.dataForm.instance.getEditor('USA_SSL_CORREO')?.option('readOnly', false);
			this.dataForm.instance.getEditor('USUARIO_REMITENTE')?.option('readOnly', false);
			this.dataForm.instance.getEditor('CONTRASENA_REMITENTE')?.option('readOnly', false);
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORREO_REMITENTE')?.focus();
		});
	}
}
