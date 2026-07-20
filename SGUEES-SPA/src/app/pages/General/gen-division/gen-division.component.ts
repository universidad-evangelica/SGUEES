// Vista de mantenimiento de divisiones (CRUD sobre GEN_DIVISION).
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { GenDivision } from './models/gen-division';
import { GenDivisionService } from './gen-division.service';

@Component({
	selector: 'app-gen-division',
	templateUrl: './gen-division.component.html',
	styleUrls: ['./gen-division.component.scss'],
})
// Qué hace: coordina la grilla, el formulario y las llamadas al servicio de divisiones.
// Cómo: extiende CBaseComponent y usa GenDivisionService para el CRUD.
export class GenDivisionComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'la division';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_DIVISION';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de Divisiones';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenDivisionService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	// Qué hace: entrega el grid de mantenimiento al flujo base.
	// Cómo: retorna dataGrid o null.
	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	// Qué hace: prepara la pantalla al abrirla.
	// Cómo: fija el subtítulo y llama a consultar para cargar divisiones.
	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.consultar();
	}

	// Qué hace: sincroniza el estado del mantenimiento con la barra.
	// Cómo: llama a AsignaStatus base y restaura subtítulo en Browse.
	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	// Qué hace: arma el filtro por CORR_DIVISION.
	fillParam(xCORR_DIVISION?: number): any {
		return { CORR_DIVISION: xCORR_DIVISION ?? 0 };
	}

	// Qué hace: construye el modelo editable del formulario.
	// Cómo: copia campos de xModel o devuelve valores iniciales.
	override fillData(xModel?: GenDivision): GenDivision {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
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
			CORR_DIVISION: 0,
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

	// Qué hace: carga el listado de divisiones en el grid.
	// Cómo: llama a getAll del GenDivisionService mediante consultarMtto.
	consultar(resetPage = false): void {
		this.consultarMtto({
			load: () => this.service.getAll(this.fillParam()),
			onData: () => {
				this.ordenarModelsPorCorr();
				this.refrescarGridTrasCarga(resetPage);
			},
		});
	}

	// Qué hace: ordena el listado por correlativo.
	// Cómo: crea una copia ordenada de this.models.
	private ordenarModelsPorCorr(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort((a, b) => Number(a.CORR_DIVISION) - Number(b.CORR_DIVISION));
	}

	// Qué hace: integra el registro guardado en el listado local.
	// Cómo: inserta o reemplaza por clave y reordena.
	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as GenDivision);
		const key = this.mttoGridKeyExpr as keyof GenDivision;

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

	// Qué hace: quita el registro eliminado del listado local.
	// Cómo: filtra por clave y refresca el grid.
	protected override quitarRegistroDeGrid(keyValue: unknown): void {
		if (!this.mttoGridKeyExpr || !Array.isArray(this.models)) {
			super.quitarRegistroDeGrid(keyValue);
			return;
		}

		const key = this.mttoGridKeyExpr as keyof GenDivision;
		this.models = this.models.filter((item) => item?.[key] !== keyValue);
		this.refrescarGridTrasCarga(true);
	}

	// Qué hace: refresca el grid tras una carga.
	// Cómo: llama a refreshData en el siguiente tick.
	private refrescarGridTrasCarga(resetPage = false): void {
		setTimeout(() => {
			this.dataGrid?.refreshData(resetPage);
		}, 0);
	}

	// Qué hace: abre el registro en modo consulta al hacer doble clic.
	// Cómo: llena model/modelUpdate, bloquea el formulario.
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

	// Qué hace: abre la fila seleccionada para edición.
	// Cómo: llena el modelo, llama a editarClick y habilitar.
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

	// Qué hace: inicia la creación de un registro nuevo.
	// Cómo: valida empresa de sesión y llama a nuevo del base.
	override nuevo(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		super.nuevo();
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
		});
	}

	// Qué hace: valida y guarda la división (creación o actualización).
	// Cómo: llama a insert o update del GenDivisionService según banderaMtto.
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
			insert: () => this.convertirCodigoDuplicadoEnWarning(this.service.insert(this.model)),
			update: () => this.convertirCodigoDuplicadoEnWarning(this.service.update(this.model)),
		});
	}

	// Qué hace: convierte errores de código duplicado en advertencia controlada.
	// Cómo: intercepta ErrorCode 2601/2627 o mensajes de duplicado.
	private convertirCodigoDuplicadoEnWarning<T>(request: Observable<T>): Observable<T> {
		return request.pipe(
			catchError((error: any) => {
				const message = this.obtenerMensajeApiLocal(error).toLowerCase();
				const errorCode = Number(error?.ErrorCode ?? error?.error?.ErrorCode);
				if (errorCode === 2601 || errorCode === 2627 || this.esErrorDuplicadoLocal(message)) {
					return of({
						Result: false,
						ErrorCode: 2627,
						ErrorMessage: 'El código de división ingresado está registrado. Escriba otro código para continuar.',
					} as T);
				}

				return throwError(() => error);
			})
		);
	}

	// Qué hace: convierte errores de integridad al eliminar en advertencia.
	// Cómo: intercepta ErrorCode 547 o mensajes de FK/relacionados.
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

	// Qué hace: detecta mensajes de registro duplicado.
	private esErrorDuplicadoLocal(message: string): boolean {
		return ['ya existe', 'duplicad', 'primary key', 'unique key', 'mismo tiempo', 'llave primaria', 'clave primaria'].some(
			(fragment) => message.includes(fragment)
		);
	}

	// Qué hace: detecta mensajes de integridad referencial.
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

	// Qué hace: obtiene el mensaje usable desde un error del API.
	private obtenerMensajeApiLocal(error: any): string {
		if (typeof error === 'string') {
			return error;
		}

		if (typeof error?.error === 'string') {
			return error.error;
		}

		return `${error?.ErrorMessage ?? error?.error?.ErrorMessage ?? error?.message ?? error ?? ''}`;
	}

	// Qué hace: cancela la edición y vuelve a modo consulta.
	// Cómo: llama a cancelar del base con la clave del registro.
	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_DIVISION === this.modelUpdate.CORR_DIVISION);
	}

	// Qué hace: elimina la división seleccionada en el grid.
	// Cómo: llama a delete del servicio vía rowRemovingMtto.
	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirEliminacionRelacionadaEnWarning(this.service.delete(this.fillParam(e.data.CORR_DIVISION))),
		});
	}

	// Qué hace: deja el formulario en solo lectura (modo consulta).
	// Cómo: marca readOnly en correlativo, nombre y código.
	override bloquear(): void {
		this.dataForm?.instance?.getEditor('CORR_DIVISION')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('NOMBRE_DIVISION')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('CODIGO_DIVISION')?.option('readOnly', true);
	}

	// Qué hace: habilita nombre y código; deja el correlativo bloqueado.
	override habilitar(): void {
		setTimeout(() => {
			this.dataForm?.instance?.getEditor('CORR_DIVISION')?.option('readOnly', true);
			this.dataForm?.instance?.getEditor('NOMBRE_DIVISION')?.option('readOnly', false);
			this.dataForm?.instance?.getEditor('CODIGO_DIVISION')?.option('readOnly', false);
		});
	}

	// Qué hace: enfoca el campo nombre para agilizar la captura.
	override setFocus(): void {
		setTimeout(() => {
			this.dataForm?.instance?.getEditor('NOMBRE_DIVISION')?.focus();
		});
	}
}
