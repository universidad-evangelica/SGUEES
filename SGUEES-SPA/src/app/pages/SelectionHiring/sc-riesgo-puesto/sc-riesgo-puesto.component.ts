// Vista de mantenimiento de Riesgo del Puesto (CRUD del catálogo SC).
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ScRiesgoPuesto } from './models/sc-riesgo-puesto';
import { ScRiesgoPuestoService } from './sc-riesgo-puesto.service';

const ESTADO_FIELD = 'ESTADO_RIESGO_PUESTO';

@Component({
	selector: 'app-sc-riesgo-puesto',
	templateUrl: './sc-riesgo-puesto.component.html',
	styleUrls: ['./sc-riesgo-puesto.component.scss'],
})
// Qué hace: coordina la grilla, el formulario y las llamadas al servicio de riesgo del puesto.
// Cómo: extiende CBaseComponent y usa ScRiesgoPuestoService para el CRUD y el cambio de estado.
export class ScRiesgoPuestoComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'el riesgo de puesto';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_RIESGO_PUESTO';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'NOMBRE_RIESGO_PUESTO';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de Riesgo de Puesto';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScRiesgoPuestoService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	// Qué hace: entrega la referencia del grid de mantenimiento al framework base.
	// Cómo: devuelve dataGrid enlazado con @ViewChild, o null si aún no está disponible.
	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	// Qué hace: prepara la pantalla al abrirla.
	// Cómo: fija el subtítulo de mantenimiento y llama a consultar para cargar el catálogo.
	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.consultar();
	}

	// Qué hace: reacciona a los cambios de estado del formulario.
	// Cómo: llama a AsignaStatus base y, al volver a modo Browse, restaura el subtítulo de mantenimiento.
	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	// Qué hace: construye el filtro por correlativo de riesgo del puesto.
	// Cómo: devuelve un objeto con CORR_RIESGO_PUESTO, usado en consultar y en rowRemoving.
	fillParam(xCORR_RIESGO_PUESTO?: number): any {
		return { CORR_RIESGO_PUESTO: xCORR_RIESGO_PUESTO ?? 0 };
	}

	// Qué hace: construye el modelo de riesgo del puesto para el formulario.
	// Cómo: si recibe xModel copia sus campos; si no recibe nada, devuelve un modelo vacío con los valores iniciales.
	override fillData(xModel?: ScRiesgoPuesto): ScRiesgoPuesto {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_RIESGO_PUESTO: xModel.CORR_RIESGO_PUESTO,
				NOMBRE_RIESGO_PUESTO: xModel.NOMBRE_RIESGO_PUESTO,
				ESTADO_RIESGO_PUESTO: xModel.ESTADO_RIESGO_PUESTO,
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
			CORR_RIESGO_PUESTO: 0,
			NOMBRE_RIESGO_PUESTO: '',
			ESTADO_RIESGO_PUESTO: true,
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: new Date(),
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: new Date(),
		};
	}

	// Qué hace: carga el listado de riesgos del puesto y refresca la grilla.
	// Cómo: llama a consultarMtto con getAll del servicio; al recibir los datos ordena por correlativo y refresca el grid.
	consultar(resetPage = false): void {
		this.consultarMtto({
			load: () => this.service.getAll(this.fillParam()),
			onData: () => {
				this.ordenarModelsPorCorr();
				this.refrescarGridTrasCarga(resetPage);
			},
		});
	}

	// Qué hace: mantiene los registros ordenados por correlativo.
	// Cómo: ordena this.models de forma ascendente por CORR_RIESGO_PUESTO.
	private ordenarModelsPorCorr(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort((a, b) => Number(a.CORR_RIESGO_PUESTO) - Number(b.CORR_RIESGO_PUESTO));
	}

	// Qué hace: agrega o reemplaza en la grilla el registro recién guardado.
	// Cómo: si isAdd agrega el registro a models; si no, busca por CORR_RIESGO_PUESTO y lo reemplaza; luego ordena y refresca.
	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as ScRiesgoPuesto);
		const key = this.mttoGridKeyExpr as keyof ScRiesgoPuesto;

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

	// Qué hace: retira de la grilla el registro eliminado.
	// Cómo: filtra models excluyendo el CORR_RIESGO_PUESTO eliminado y refresca la grilla.
	protected override quitarRegistroDeGrid(keyValue: unknown): void {
		if (!this.mttoGridKeyExpr || !Array.isArray(this.models)) {
			super.quitarRegistroDeGrid(keyValue);
			return;
		}

		const key = this.mttoGridKeyExpr as keyof ScRiesgoPuesto;
		this.models = this.models.filter((item) => item?.[key] !== keyValue);
		this.refrescarGridTrasCarga(true);
	}

	// Qué hace: refresca la grilla después de un cambio en los datos.
	// Cómo: usa setTimeout para esperar el ciclo de Angular y llama a dataGrid.refreshData.
	private refrescarGridTrasCarga(resetPage = false): void {
		setTimeout(() => {
			this.dataGrid?.refreshData(resetPage);
		}, 0);
	}

	// Qué hace: abre el registro seleccionado en modo consulta al hacer doble clic.
	// Cómo: toma los datos de la fila, llama al rowDblClick base y sincroniza el formulario en modo solo lectura.
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

	// Qué hace: prepara el registro seleccionado para editarlo desde el botón de la grilla.
	// Cómo: carga el modelo, llama a editarClick y habilita los campos del formulario.
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

	// Qué hace: inicia un registro nuevo de riesgo del puesto.
	// Cómo: valida que haya empresa en sesión con asegurarEmpresaSesion, llama al nuevo base y sincroniza el formulario.
	override nuevo(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		super.nuevo();
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
		});
	}

	// Qué hace: guarda el riesgo del puesto (crea o actualiza según corresponda).
	// Cómo: sincroniza formData, valida con esValido y llama a guardarMtto con insert/update del servicio.
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

	// Qué hace: descarta la edición y restaura el registro original en la grilla.
	// Cómo: llama a cancelar base comparando por CORR_RIESGO_PUESTO.
	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_RIESGO_PUESTO === this.modelUpdate.CORR_RIESGO_PUESTO);
	}

	// Qué hace: elimina el registro seleccionado en la grilla.
	// Cómo: llama a rowRemovingMtto con delete del servicio, convirtiendo errores de relación en advertencia.
	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirErrorMttoEnWarning(this.service.delete(this.fillParam(e.data.CORR_RIESGO_PUESTO))),
		});
	}

	// Qué hace: cambia el estado activo/inactivo del riesgo del puesto seleccionado.
	// Cómo: llama a invocarActivarInactivar con activarInactivar del servicio.
	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	// Qué hace: deja el formulario en solo lectura (modo consulta).
	// Cómo: pone readOnly en true a los editores de correlativo, nombre y estado.
	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_RIESGO_PUESTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_RIESGO_PUESTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTADO_RIESGO_PUESTO')?.option('readOnly', true);
	}

	// Qué hace: habilita los campos editables del formulario.
	// Cómo: habilita NOMBRE_RIESGO_PUESTO; bloquea el estado cuando la operación es de actualización.
	override habilitar(): void {
		const estadoSoloLectura = this.banderaMtto === UpdateType.Update;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_RIESGO_PUESTO')?.option('readOnly', true);
			this.dataForm.instance.getEditor('NOMBRE_RIESGO_PUESTO')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ESTADO_RIESGO_PUESTO')?.option('readOnly', estadoSoloLectura);
		});
	}

	// Qué hace: coloca el foco en el primer campo editable del formulario.
	// Cómo: enfoca el editor de NOMBRE_RIESGO_PUESTO con setTimeout.
	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_RIESGO_PUESTO')?.focus();
		});
	}
}
