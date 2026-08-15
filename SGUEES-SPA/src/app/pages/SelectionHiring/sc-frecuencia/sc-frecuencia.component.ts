// Qué hace: vista de mantenimiento de Frecuencia.
// Cómo: administra el CRUD del catálogo SC_FRECUENCIA coordinando la grilla, el formulario y ScFrecuenciaService.
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ScFrecuencia } from './models/sc-frecuencia';
import { ScFrecuenciaService } from './sc-frecuencia.service';

const ESTADO_FIELD = 'ESTADO_FRECUENCIA';

@Component({
	selector: 'app-sc-frecuencia',
	templateUrl: './sc-frecuencia.component.html',
	styleUrls: ['./sc-frecuencia.component.scss'],
})
// Qué hace: componente de mantenimiento de Frecuencia.
// Cómo: extiende CBaseComponent y coordina la grilla, el formulario y las llamadas a ScFrecuenciaService.
export class ScFrecuenciaComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'la frecuencia';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_FRECUENCIA';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'NOMBRE_FRECUENCIA';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de Frecuencia';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScFrecuenciaService
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
	// Cómo: devuelve un objeto con CORR_FRECUENCIA, usado en consultar y en rowRemoving.
	fillParam(xCORR_FRECUENCIA?: number): any {
		return { CORR_FRECUENCIA: xCORR_FRECUENCIA ?? 0 };
	}

	// Qué hace: construye el modelo de frecuencia para el formulario.
	// Cómo: si recibe xModel copia sus campos; si no recibe nada, devuelve el modelo inicial para un registro nuevo.
	override fillData(xModel?: ScFrecuencia): ScFrecuencia {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_FRECUENCIA: xModel.CORR_FRECUENCIA,
				NOMBRE_FRECUENCIA: xModel.NOMBRE_FRECUENCIA,
				ESTADO_FRECUENCIA: xModel.ESTADO_FRECUENCIA,
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
			CORR_FRECUENCIA: 0,
			NOMBRE_FRECUENCIA: '',
			ESTADO_FRECUENCIA: true,
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: new Date(),
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: new Date(),
		};
	}

	// Qué hace: carga las frecuencias y actualiza la grilla.
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
	// Cómo: si models es un arreglo, lo reordena de forma ascendente por CORR_FRECUENCIA.
	private ordenarModelsPorCorr(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort((a, b) => Number(a.CORR_FRECUENCIA) - Number(b.CORR_FRECUENCIA));
	}

	// Qué hace: refleja en la grilla el registro recién guardado.
	// Cómo: agrega el registro si es nuevo, o lo reemplaza por su llave (mttoGridKeyExpr) si ya existía, y luego ordena y refresca la grilla.
	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as ScFrecuencia);
		const key = this.mttoGridKeyExpr as keyof ScFrecuencia;

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

		const key = this.mttoGridKeyExpr as keyof ScFrecuencia;
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

	// Qué hace: inicia el registro de una nueva frecuencia.
	// Cómo: valida que haya empresa en sesión con asegurarEmpresaSesion, llama a nuevo del componente base y sincroniza el formulario con el modelo.
	override nuevo(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		super.nuevo();
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
		});
	}

	// Qué hace: valida el formulario y guarda la frecuencia.
	// Cómo: combina model con los datos del formulario, valida con dataForm.instance.validate y llama a guardarMtto, que usa esValido, insert o update del servicio.
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
	// Cómo: intercepta el error del observable con catchError y, si el mensaje indica registros relacionados, devuelve un resultado con Result en false; de lo contrario, propaga el error.
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
	// Cómo: llama a cancelar del componente base, que restaura en la grilla el registro cuyo CORR_FRECUENCIA coincide con modelUpdate.
	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_FRECUENCIA === this.modelUpdate.CORR_FRECUENCIA);
	}

	// Qué hace: elimina la frecuencia de la fila indicada.
	// Cómo: llama a rowRemovingMtto con delete del servicio, envuelto en convertirErrorMttoEnWarning para controlar dependencias asociadas.
	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirErrorMttoEnWarning(this.service.delete(this.fillParam(e.data.CORR_FRECUENCIA))),
		});
	}

	// Qué hace: cambia el estado de la frecuencia seleccionada.
	// Cómo: llama a invocarActivarInactivar con activarInactivar del servicio.
	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	// Qué hace: deja el formulario en solo lectura (modo consulta).
	// Cómo: pone en readOnly los editores CORR_FRECUENCIA, NOMBRE_FRECUENCIA y ESTADO_FRECUENCIA del formulario.
	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_FRECUENCIA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_FRECUENCIA')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTADO_FRECUENCIA')?.option('readOnly', true);
	}

	// Qué hace: habilita los campos editables del formulario.
	// Cómo: con setTimeout habilita NOMBRE_FRECUENCIA y bloquea CORR_FRECUENCIA; ESTADO_FRECUENCIA queda en solo lectura cuando se está editando (banderaMtto es Update).
	override habilitar(): void {
		const estadoSoloLectura = this.banderaMtto === UpdateType.Update;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_FRECUENCIA')?.option('readOnly', true);
			this.dataForm.instance.getEditor('NOMBRE_FRECUENCIA')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ESTADO_FRECUENCIA')?.option('readOnly', estadoSoloLectura);
		});
	}

	// Qué hace: ubica el foco al abrir el formulario.
	// Cómo: con setTimeout enfoca el editor NOMBRE_FRECUENCIA.
	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_FRECUENCIA')?.focus();
		});
	}
}
