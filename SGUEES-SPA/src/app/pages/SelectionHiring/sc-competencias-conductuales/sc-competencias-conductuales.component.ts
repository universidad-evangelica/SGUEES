// Qué hace: vista de mantenimiento de Competencias Conductuales.
// Cómo: administra el CRUD del catálogo SC_COMPETENCIAS_CONDUCTUALES coordinando la grilla, el formulario y ScCompetenciasConductualesService.
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { catchError, take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ScCompetenciasConductuales } from './models/sc-competencias-conductuales';
import { ScCompetenciasConductualesService } from './sc-competencias-conductuales.service';

const ESTADO_FIELD = 'ESTADO_COMPETENCIAS_CONDUCTUALES';

@Component({
	selector: 'app-sc-competencias-conductuales',
	templateUrl: './sc-competencias-conductuales.component.html',
	styleUrls: ['./sc-competencias-conductuales.component.scss'],
})
// Qué hace: componente de mantenimiento de Competencias Conductuales.
// Cómo: extiende CBaseComponent y coordina la grilla, el formulario y las llamadas a ScCompetenciasConductualesService.
export class ScCompetenciasConductualesComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'la competencia conductual';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_COMPETENCIAS_CONDUCTUALES';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'NOMBRE_COMPETENCIAS_CONDUCTUALES';

	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	mCORR_TIPO_PUESTO: any;
	readOnly = false;
	tipoPuestoInvalido = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de Competencias Conductuales';

	// Qué hace: configura el componente con columnas, resumen e items del servicio.
	// Cómo: llama a super, vincula selectedLookUpCORR_TIPO_PUESTO y asigna columns, summary e items desde ScCompetenciasConductualesService.
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScCompetenciasConductualesService
	) {
		super(appInfoService, router);
		this.selectedLookUpCORR_TIPO_PUESTO = this.selectedLookUpCORR_TIPO_PUESTO.bind(this);
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
	// Cómo: fija el subtítulo de mantenimiento, llama a llenaComboBox para cargar lookups y luego a consultar para cargar el catálogo.
	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.llenaComboBox();
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

	// Qué hace: carga los lookups necesarios para el formulario.
	// Cómo: llama a getCORR_TIPO_PUESTO para obtener el catálogo de tipos de puesto.
	llenaComboBox(): void {
		this.getCORR_TIPO_PUESTO();
	}

	// Qué hace: obtiene el catálogo de tipos de puesto para el lookup del formulario.
	// Cómo: consulta getLookUp con la entidad SC_COMPETENCIAS_CONDUCTUALES y la tabla PLA_TIPO_PUESTO, y asigna la respuesta a mCORR_TIPO_PUESTO.
	getCORR_TIPO_PUESTO(): void {
		this.appInfoService
			.getLookUp(
				'SC_COMPETENCIAS_CONDUCTUALES',
				'PLA_TIPO_PUESTO',
				'GetCORR_TIPO_PUESTO',
				undefined,
				environment.UrlTALENTOHUMANONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_TIPO_PUESTO = response.Data;
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	// Qué hace: devuelve la clave del tipo de puesto seleccionado en el lookup.
	// Cómo: toma la fila del lookup (vRow) y retorna el valor de CORR_TIPO_PUESTO.
	selectedLookUpCORR_TIPO_PUESTO(vRow: any): any {
		return vRow[0].CORR_TIPO_PUESTO;
	}

	// Qué hace: construye el filtro por correlativo.
	// Cómo: devuelve un objeto con CORR_COMPETENCIAS_CONDUCTUALES, usado en consultar y en rowRemoving.
	fillParam(xCORR_COMPETENCIAS_CONDUCTUALES?: number): any {
		return {
			CORR_COMPETENCIAS_CONDUCTUALES: xCORR_COMPETENCIAS_CONDUCTUALES ?? 0,
		};
	}

	// Qué hace: construye el modelo de competencia conductual para el formulario.
	// Cómo: si recibe xModel copia sus campos; si no recibe nada, devuelve el modelo inicial para un registro nuevo.
	override fillData(xModel?: ScCompetenciasConductuales): ScCompetenciasConductuales {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_COMPETENCIAS_CONDUCTUALES: xModel.CORR_COMPETENCIAS_CONDUCTUALES,
				CORR_TIPO_PUESTO: xModel.CORR_TIPO_PUESTO,
				NOMBRE_COMPETENCIAS_CONDUCTUALES: xModel.NOMBRE_COMPETENCIAS_CONDUCTUALES,
				DESCRIPCION: xModel.DESCRIPCION,
				ESTADO_COMPETENCIAS_CONDUCTUALES: xModel.ESTADO_COMPETENCIAS_CONDUCTUALES,
				NOMBRE_TIPO_PUESTO: xModel.NOMBRE_TIPO_PUESTO,
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
			CORR_COMPETENCIAS_CONDUCTUALES: 0,
			CORR_TIPO_PUESTO: null,
			NOMBRE_COMPETENCIAS_CONDUCTUALES: '',
			DESCRIPCION: '',
			ESTADO_COMPETENCIAS_CONDUCTUALES: true,
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: new Date(),
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: new Date(),
		};
	}

	// Qué hace: carga las competencias conductuales y actualiza la grilla.
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
	// Cómo: si models es un arreglo, lo reordena de forma ascendente por CORR_COMPETENCIAS_CONDUCTUALES.
	private ordenarModelsPorCorr(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort(
			(a, b) => Number(a.CORR_COMPETENCIAS_CONDUCTUALES) - Number(b.CORR_COMPETENCIAS_CONDUCTUALES)
		);
	}

	// Qué hace: refleja en la grilla el registro recién guardado.
	// Cómo: agrega el registro si es nuevo, o lo reemplaza por su llave (mttoGridKeyExpr) si ya existía, y luego ordena y refresca la grilla.
	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as ScCompetenciasConductuales);
		const key = this.mttoGridKeyExpr as keyof ScCompetenciasConductuales;

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

	// Qué hace: retira de la grilla el registro eliminado.
	// Cómo: filtra models excluyendo el registro con la llave indicada y refresca la grilla sin volver a consultar el catálogo.
	protected override quitarRegistroDeGrid(keyValue: unknown): void {
		if (!this.mttoGridKeyExpr || !Array.isArray(this.models)) {
			super.quitarRegistroDeGrid(keyValue);
			return;
		}

		const key = this.mttoGridKeyExpr as keyof ScCompetenciasConductuales;
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
	// Cómo: toma los datos de la fila, llama a fillData y a rowDblClick del componente base, pone readOnly en true y bloquea el formulario.
	override rowDblClick(e: any): void {
		const rowData = e?.data ?? e?.row?.data;
		if (rowData) {
			this.model = this.fillData(rowData);
			this.modelUpdate = this.fillData(rowData);
		}
		this.readOnly = true;
		super.rowDblClick(e);
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
			this.bloquear();
		});
	}

	// Qué hace: prepara el registro seleccionado para editarlo.
	// Cómo: llama a fillData con los datos de la fila, resetea readOnly y tipoPuestoInvalido, luego a editarClick del componente base y habilita el formulario.
	onEditClick(e: any): void {
		if (!e?.row?.data) {
			return;
		}

		this.readOnly = false;
		this.tipoPuestoInvalido = false;
		this.model = this.fillData(e.row.data);
		this.editarClick(e);
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
			this.habilitar();
		});
	}

	// Qué hace: inicia el registro de una nueva competencia conductual.
	// Cómo: valida que haya empresa en sesión con asegurarEmpresaSesion, resetea readOnly y tipoPuestoInvalido, llama a nuevo del componente base y sincroniza el formulario con el modelo.
	override nuevo(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		this.readOnly = false;
		this.tipoPuestoInvalido = false;
		super.nuevo();
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
		});
	}

	// Qué hace: actualiza el tipo de puesto seleccionado en el modelo.
	// Cómo: asigna el valor recibido a model.CORR_TIPO_PUESTO y, si es válido, limpia la marca tipoPuestoInvalido.
	onTipoPuestoChanged(value: number | null): void {
		this.model.CORR_TIPO_PUESTO = value;
		if (value != null && value > 0) {
			this.tipoPuestoInvalido = false;
		}
	}

	// Qué hace: marca el lookup de tipo de puesto como inválido cuando no hay selección válida.
	// Cómo: evalúa model.CORR_TIPO_PUESTO y asigna true a tipoPuestoInvalido si el valor es nulo, NaN o menor o igual a cero.
	private actualizarEstadoValidacionLookup(): void {
		const value = Number(this.model?.CORR_TIPO_PUESTO);
		this.tipoPuestoInvalido = Number.isNaN(value) || value <= 0;
	}

	// Qué hace: valida el formulario y guarda la competencia conductual.
	// Cómo: combina model con los datos del formulario, valida con actualizarEstadoValidacionLookup y dataForm.instance.validate, y llama a guardarMtto, que usa esValido, insert o update del servicio.
	guardar(): void {
		const formData = this.dataForm?.instance?.option('formData');
		if (formData) {
			this.model = { ...this.model, ...formData };
		}

		this.actualizarEstadoValidacionLookup();
		const formValidation = this.dataForm?.instance?.validate();
		if (formValidation && !formValidation.isValid) {
			this.actualizarEstadoValidacionLookup();
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
	// Cómo: limpia tipoPuestoInvalido y llama a cancelar del componente base, que restaura en la grilla el registro cuyo CORR_COMPETENCIAS_CONDUCTUALES coincide con modelUpdate.
	override cancelar(): void {
		this.tipoPuestoInvalido = false;
		super.cancelar((item: any) => item.CORR_COMPETENCIAS_CONDUCTUALES === this.modelUpdate.CORR_COMPETENCIAS_CONDUCTUALES);
	}

	// Qué hace: elimina la competencia conductual de la fila indicada.
	// Cómo: llama a rowRemovingMtto con delete del servicio, envuelto en convertirErrorMttoEnWarning para controlar dependencias asociadas.
	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirErrorMttoEnWarning(
					this.service.delete(this.fillParam(e.data.CORR_COMPETENCIAS_CONDUCTUALES))
				),
		});
	}

	// Qué hace: cambia el estado de la competencia conductual seleccionada.
	// Cómo: llama a invocarActivarInactivar con activarInactivar del servicio.
	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	// Qué hace: deja el formulario en solo lectura (modo consulta).
	// Cómo: pone readOnly en true y bloquea los editores CORR_COMPETENCIAS_CONDUCTUALES, NOMBRE_COMPETENCIAS_CONDUCTUALES, DESCRIPCION y ESTADO_COMPETENCIAS_CONDUCTUALES del formulario.
	override bloquear(): void {
		this.readOnly = true;
		this.dataForm.instance.getEditor('CORR_COMPETENCIAS_CONDUCTUALES')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_COMPETENCIAS_CONDUCTUALES')?.option('readOnly', true);
		this.dataForm.instance.getEditor('DESCRIPCION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTADO_COMPETENCIAS_CONDUCTUALES')?.option('readOnly', true);
	}

	// Qué hace: habilita los campos editables del formulario.
	// Cómo: con setTimeout habilita NOMBRE_COMPETENCIAS_CONDUCTUALES y DESCRIPCION, bloquea CORR_COMPETENCIAS_CONDUCTUALES; ESTADO_COMPETENCIAS_CONDUCTUALES queda en solo lectura cuando se está editando (banderaMtto es Update).
	override habilitar(): void {
		this.readOnly = false;
		const estadoSoloLectura = this.banderaMtto === UpdateType.Update;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_COMPETENCIAS_CONDUCTUALES')?.option('readOnly', true);
			this.dataForm.instance.getEditor('NOMBRE_COMPETENCIAS_CONDUCTUALES')?.option('readOnly', false);
			this.dataForm.instance.getEditor('DESCRIPCION')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ESTADO_COMPETENCIAS_CONDUCTUALES')?.option('readOnly', estadoSoloLectura);
		});
	}

	// Qué hace: ubica el foco al abrir el formulario.
	// Cómo: con setTimeout enfoca el editor NOMBRE_COMPETENCIAS_CONDUCTUALES.
	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_COMPETENCIAS_CONDUCTUALES')?.focus();
		});
	}
}
