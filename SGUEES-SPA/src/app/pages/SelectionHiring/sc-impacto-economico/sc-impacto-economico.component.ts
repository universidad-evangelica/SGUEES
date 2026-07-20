// Vista de mantenimiento de Impacto Económico (CRUD del catálogo SC).
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ScImpactoEconomico } from './models/sc-impacto-economico';
import { ScImpactoEconomicoService } from './sc-impacto-economico.service';

const ESTADO_FIELD = 'ESTADO_IMPACTO_ECONOMICO';

@Component({
	selector: 'app-sc-impacto-economico',
	templateUrl: './sc-impacto-economico.component.html',
	styleUrls: ['./sc-impacto-economico.component.scss'],
})
// Qué hace: coordina la grilla, el formulario y las llamadas al servicio de impacto económico.
// Cómo: extiende CBaseComponent y usa ScImpactoEconomicoService para el CRUD y el cambio de estado.
export class ScImpactoEconomicoComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'el impacto económico';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_IMPACTO_ECONOMICO';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'DESCRIPCION';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de Impacto Economico';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScImpactoEconomicoService
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

	// Qué hace: construye el filtro por correlativo de impacto económico.
	// Cómo: devuelve un objeto con CORR_IMPACTO_ECONOMICO, usado en consultar y en rowRemoving.
	fillParam(xCORR_IMPACTO_ECONOMICO?: number): any {
		return { CORR_IMPACTO_ECONOMICO: xCORR_IMPACTO_ECONOMICO ?? 0 };
	}

	// Qué hace: construye el modelo de impacto económico para el formulario.
	// Cómo: si recibe xModel copia sus campos; si no recibe nada, devuelve un modelo vacío con los valores iniciales.
	override fillData(xModel?: ScImpactoEconomico): ScImpactoEconomico {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_IMPACTO_ECONOMICO: xModel.CORR_IMPACTO_ECONOMICO,
				DESCRIPCION: xModel.DESCRIPCION,
				ESTADO_IMPACTO_ECONOMICO: xModel.ESTADO_IMPACTO_ECONOMICO,
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
			CORR_IMPACTO_ECONOMICO: 0,
			DESCRIPCION: '',
			ESTADO_IMPACTO_ECONOMICO: true,
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: new Date(),
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: new Date(),
		};
	}

	// Qué hace: carga el listado de impactos económicos y refresca la grilla.
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
	// Cómo: ordena this.models de forma ascendente por CORR_IMPACTO_ECONOMICO.
	private ordenarModelsPorCorr(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort((a, b) => Number(a.CORR_IMPACTO_ECONOMICO) - Number(b.CORR_IMPACTO_ECONOMICO));
	}

	// Qué hace: agrega o reemplaza en la grilla el registro recién guardado.
	// Cómo: si isAdd agrega el registro a models; si no, busca por CORR_IMPACTO_ECONOMICO y lo reemplaza; luego ordena y refresca.
	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as ScImpactoEconomico);
		const key = this.mttoGridKeyExpr as keyof ScImpactoEconomico;

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
	// Cómo: filtra models excluyendo el CORR_IMPACTO_ECONOMICO eliminado y refresca la grilla.
	protected override quitarRegistroDeGrid(keyValue: unknown): void {
		if (!this.mttoGridKeyExpr || !Array.isArray(this.models)) {
			super.quitarRegistroDeGrid(keyValue);
			return;
		}

		const key = this.mttoGridKeyExpr as keyof ScImpactoEconomico;
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

	// Qué hace: inicia un registro nuevo de impacto económico.
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

	// Qué hace: guarda el impacto económico (crea o actualiza según corresponda).
	// Cómo: valida con esValido y llama a guardarMtto con insert/update del servicio.
	guardar(): void {
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
	// Cómo: llama a cancelar base comparando por CORR_IMPACTO_ECONOMICO.
	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_IMPACTO_ECONOMICO === this.modelUpdate.CORR_IMPACTO_ECONOMICO);
	}

	// Qué hace: elimina el registro seleccionado en la grilla.
	// Cómo: llama a rowRemovingMtto con delete del servicio, convirtiendo errores de relación en advertencia.
	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirErrorMttoEnWarning(this.service.delete(this.fillParam(e.data.CORR_IMPACTO_ECONOMICO))),
		});
	}

	// Qué hace: cambia el estado activo/inactivo del impacto económico seleccionado.
	// Cómo: llama a invocarActivarInactivar con activarInactivar del servicio.
	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	// Qué hace: deja el formulario en solo lectura (modo consulta).
	// Cómo: pone readOnly en true a los editores de correlativo, descripción y estado.
	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_IMPACTO_ECONOMICO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('DESCRIPCION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTADO_IMPACTO_ECONOMICO')?.option('readOnly', true);
	}

	// Qué hace: habilita los campos editables del formulario.
	// Cómo: habilita la descripción; bloquea el estado cuando la operación es de actualización.
	override habilitar(): void {
		const estadoSoloLectura = this.banderaMtto === UpdateType.Update;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_IMPACTO_ECONOMICO')?.option('readOnly', true);
			this.dataForm.instance.getEditor('DESCRIPCION')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ESTADO_IMPACTO_ECONOMICO')?.option('readOnly', estadoSoloLectura);
		});
	}

	// Qué hace: coloca el foco en el primer campo editable del formulario.
	// Cómo: enfoca el editor de DESCRIPCION con setTimeout.
	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('DESCRIPCION')?.focus();
		});
	}
}
