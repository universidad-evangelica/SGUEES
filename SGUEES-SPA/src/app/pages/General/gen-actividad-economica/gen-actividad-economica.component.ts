// Qué hace: vista de mantenimiento de Actividad Económica.
// Cómo: administra el CRUD del catálogo GEN_ACTIVIDAD_ECONOMICA (patrón sc-frecuencia, sin empresa).
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { GenActividadEconomica } from './models/gen-actividad-economica';
import { GenActividadEconomicaService } from './gen-actividad-economica.service';

const ESTADO_FIELD = 'ACTIVO_ACTIVIDAD_ECONOMICA';

@Component({
	selector: 'app-gen-actividad-economica',
	templateUrl: './gen-actividad-economica.component.html',
	styleUrls: ['./gen-actividad-economica.component.scss'],
})
// Qué hace: componente de mantenimiento de Actividad Económica.
// Cómo: extiende CBaseComponent y coordina la grilla, el formulario y GenActividadEconomicaService.
export class GenActividadEconomicaComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'la actividad económica';
	protected override requiereEmpresaSesion = false;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_ACTIVIDAD_ECONOMICA';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'NOMBRE_ACTIVIDAD_ECONOMICA';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de Actividad Económica';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenActividadEconomicaService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	// Qué hace: entrega el grid de mantenimiento al flujo base de CBaseComponent.
	// Cómo: devuelve la referencia dataGrid enlazada con @ViewChild, o null si aún no está disponible.
	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	// Qué hace: inicializa la vista al abrirla.
	// Cómo: fija el subtítulo de mantenimiento y llama a consultar para cargar el catálogo.
	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.consultar();
	}

	// Qué hace: reacciona a los cambios de estado del formulario (nuevo, editar, ver, browse).
	// Cómo: llama a AsignaStatus del componente base y, al volver a modo Browse, restaura el subtítulo de mantenimiento.
	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	// Qué hace: construye el filtro por correlativo.
	// Cómo: devuelve un objeto con CORR_ACTIVIDAD_ECONOMICA, usado en consultar y en rowRemoving.
	fillParam(xCORR_ACTIVIDAD_ECONOMICA?: number): any {
		return { CORR_ACTIVIDAD_ECONOMICA: xCORR_ACTIVIDAD_ECONOMICA ?? 0 };
	}

	// Qué hace: construye el modelo de actividad económica para el formulario.
	// Cómo: si recibe xModel copia sus campos; si no recibe nada, devuelve el modelo inicial para un registro nuevo.
	override fillData(xModel?: GenActividadEconomica): GenActividadEconomica {
		if (xModel !== undefined) {
			return {
				CORR_ACTIVIDAD_ECONOMICA: xModel.CORR_ACTIVIDAD_ECONOMICA,
				CODIGO_ACTIVIDAD_ECONOMICA: xModel.CODIGO_ACTIVIDAD_ECONOMICA,
				NOMBRE_ACTIVIDAD_ECONOMICA: xModel.NOMBRE_ACTIVIDAD_ECONOMICA,
				ACTIVO_ACTIVIDAD_ECONOMICA: xModel.ACTIVO_ACTIVIDAD_ECONOMICA,
				USUARIO_CREA: xModel.USUARIO_CREA,
				ESTACION_CREA: xModel.ESTACION_CREA,
				FECHA_CREA: xModel.FECHA_CREA,
				USUARIO_ACTU: xModel.USUARIO_ACTU,
				ESTACION_ACTU: xModel.ESTACION_ACTU,
				FECHA_ACTU: xModel.FECHA_ACTU,
			};
		}

		return {
			CORR_ACTIVIDAD_ECONOMICA: 0,
			CODIGO_ACTIVIDAD_ECONOMICA: '',
			NOMBRE_ACTIVIDAD_ECONOMICA: '',
			ACTIVO_ACTIVIDAD_ECONOMICA: true,
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: new Date(),
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: new Date(),
		};
	}

	// Qué hace: carga las actividades económicas y actualiza la grilla.
	// Cómo: llama a consultarMtto con getAll del servicio y, al recibir los datos, ordena los registros y refresca la grilla.
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
	// Cómo: si models es un arreglo, lo reordena de forma ascendente por CORR_ACTIVIDAD_ECONOMICA.
	private ordenarModelsPorCorr(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort(
			(a, b) => Number(a.CORR_ACTIVIDAD_ECONOMICA) - Number(b.CORR_ACTIVIDAD_ECONOMICA)
		);
	}

	// Qué hace: refleja en la grilla el registro recién guardado.
	// Cómo: agrega el registro si es nuevo, o lo reemplaza por su llave (mttoGridKeyExpr) si ya existía, y luego ordena y refresca la grilla.
	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as GenActividadEconomica);
		const key = this.mttoGridKeyExpr as keyof GenActividadEconomica;

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
	// Cómo: filtra models excluyendo el registro con la llave indicada y refresca la grilla sin volver a consultar el catálogo.
	protected override quitarRegistroDeGrid(keyValue: unknown): void {
		if (!this.mttoGridKeyExpr || !Array.isArray(this.models)) {
			super.quitarRegistroDeGrid(keyValue);
			return;
		}

		const key = this.mttoGridKeyExpr as keyof GenActividadEconomica;
		this.models = this.models.filter((item) => item?.[key] !== keyValue);
		this.refrescarGridTrasCarga(true);
	}

	// Qué hace: refresca la grilla después de un cambio en los datos.
	// Cómo: espera con setTimeout el ciclo de Angular y luego llama a dataGrid.refreshData.
	private refrescarGridTrasCarga(resetPage = false): void {
		setTimeout(() => {
			this.dataGrid?.refreshData(resetPage);
		}, 0);
	}

	// Qué hace: abre el registro seleccionado en modo consulta.
	// Cómo: toma los datos de la fila, llama a fillData y a rowDblClick del componente base, y bloquea el formulario.
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

	// Qué hace: prepara el registro seleccionado para editarlo.
	// Cómo: llama a fillData con los datos de la fila, luego a editarClick del componente base y habilita el formulario.
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

	// Qué hace: inicia el registro de una nueva actividad económica.
	// Cómo: llama a nuevo del componente base y sincroniza el formulario con el modelo.
	override nuevo(): void {
		super.nuevo();
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
		});
	}

	// Qué hace: valida el formulario y guarda la actividad económica.
	// Cómo: combina model con los datos del formulario, valida con dataForm.instance.validate y llama a guardarMtto.
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
	// Cómo: intercepta el error del observable con catchError y, si el mensaje indica registros relacionados, devuelve un resultado con Result en false.
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

	// Qué hace: descarta la edición en curso.
	// Cómo: llama a cancelar del componente base, que restaura en la grilla el registro cuyo correlativo coincide con modelUpdate.
	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_ACTIVIDAD_ECONOMICA === this.modelUpdate.CORR_ACTIVIDAD_ECONOMICA);
	}

	// Qué hace: elimina la actividad económica de la fila indicada.
	// Cómo: llama a rowRemovingMtto con delete del servicio, envuelto en convertirErrorMttoEnWarning.
	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirErrorMttoEnWarning(this.service.delete(this.fillParam(e.data.CORR_ACTIVIDAD_ECONOMICA))),
		});
	}

	// Qué hace: cambia el estado de la actividad económica seleccionada.
	// Cómo: llama a invocarActivarInactivar con activarInactivar del servicio.
	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	// Qué hace: deja el formulario en solo lectura (modo consulta).
	// Cómo: pone en readOnly los editores del formulario.
	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_ACTIVIDAD_ECONOMICA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO_ACTIVIDAD_ECONOMICA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_ACTIVIDAD_ECONOMICA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ACTIVO_ACTIVIDAD_ECONOMICA')?.option('readOnly', true);
	}

	// Qué hace: habilita los campos editables del formulario.
	// Cómo: con setTimeout habilita código/nombre y bloquea correlativo; activo queda en solo lectura en Update.
	override habilitar(): void {
		const estadoSoloLectura = this.banderaMtto === UpdateType.Update;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_ACTIVIDAD_ECONOMICA')?.option('readOnly', true);
			this.dataForm.instance.getEditor('CODIGO_ACTIVIDAD_ECONOMICA')?.option('readOnly', false);
			this.dataForm.instance.getEditor('NOMBRE_ACTIVIDAD_ECONOMICA')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ACTIVO_ACTIVIDAD_ECONOMICA')?.option('readOnly', estadoSoloLectura);
		});
	}

	// Qué hace: ubica el foco al abrir el formulario.
	// Cómo: con setTimeout enfoca el editor CODIGO_ACTIVIDAD_ECONOMICA.
	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CODIGO_ACTIVIDAD_ECONOMICA')?.focus();
		});
	}
}
