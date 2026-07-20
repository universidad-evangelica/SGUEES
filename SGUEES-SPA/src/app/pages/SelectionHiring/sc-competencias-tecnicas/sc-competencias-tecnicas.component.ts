// Qué hace: vista de mantenimiento de Competencias Técnicas.
// Cómo: administra el CRUD del catálogo SC_COMPETENCIAS_TECNICAS coordinando la grilla, el formulario jerárquico y ScCompetenciasTecnicasService.
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
import {
	SC_COMPETENCIA_NIVEL,
	ScCompetenciaPadreOption,
	ScCompetenciasTecnicas,
} from './models/sc-competencias-tecnicas';
import { ScCompetenciasTecnicasService } from './sc-competencias-tecnicas.service';

const ESTADO_FIELD = 'ESTADO_COMPETENCIAS_TECNICAS';

@Component({
	selector: 'app-sc-competencias-tecnicas',
	templateUrl: './sc-competencias-tecnicas.component.html',
	styleUrls: ['./sc-competencias-tecnicas.component.scss'],
})
// Qué hace: componente de mantenimiento de Competencias Técnicas.
// Cómo: extiende CBaseComponent y coordina la grilla, el formulario jerárquico y las llamadas a ScCompetenciasTecnicasService.
export class ScCompetenciasTecnicasComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'la competencia técnica';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 5;
	protected override mttoPageSizes = [5, 10, 25, 50, 100];
	protected override mttoGridKeyExpr = 'CORR_COMPETENCIAS_TECNICAS';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'CODIGO_COMPETENCIAS_TECNICAS';
	protected override mttoParchearGridTrasGuardar = true;
	protected override mttoRemoteOperations = false;

	readonly UpdateType = UpdateType;
	private readonly maintenanceSubtitulo = 'Catalogo de Competencias Tecnicas';
	padres: ScCompetenciaPadreOption[] = [];
	mNIVEL: Array<{ Key: any; Value: string }> = [];
	nivelLookupColumns = [
		{ dataField: 'Key', caption: 'Codigo', width: 90 },
		{ dataField: 'Value', caption: 'Nivel', width: 140 },
	];
	padreLookupColumns = [
		{ dataField: 'CODIGO_COMPETENCIAS_TECNICAS', caption: 'Codigo', width: 120 },
		{ dataField: 'NOMBRE_COMPETENCIAS_TECNICAS', caption: 'Nombre', width: 200 },
		{ dataField: 'DESCRIPCION', caption: 'Definicion', width: 280 },
		{ dataField: 'NIVEL', caption: 'Nivel', width: 80 },
	];
	registroSeleccionadoInactivo = false;
	padreInvalido = false;

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScCompetenciasTecnicasService
	) {
		super(appInfoService, router);
		this.onNivelChanged = this.onNivelChanged.bind(this);
		this.onPadreChanged = this.onPadreChanged.bind(this);
		this.selectedLookUpNIVEL = this.selectedLookUpNIVEL.bind(this);
		this.selectedLookUpCORR_COMPETENCIAS_TECNICAS_PADRE =
			this.selectedLookUpCORR_COMPETENCIAS_TECNICAS_PADRE.bind(this);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.refreshFormItems();
	}

	// Qué hace: entrega el grid de mantenimiento al flujo base de CBaseComponent.
	// Cómo: devuelve la referencia dataGrid enlazada con @ViewChild, o null si aún no está disponible.
	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	// Qué hace: inicializa la vista al abrirla.
	// Cómo: fija el subtítulo de mantenimiento, llama a getNIVEL para cargar los niveles y consultar para cargar el catálogo.
	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.getNIVEL();
		this.consultar();
	}

	// Qué hace: carga el catálogo de niveles (NIV1/NIV2/NIV3) para el lookup del formulario.
	// Cómo: llama a getLookUp con SC_LISTA/GetNIVEL, guarda el resultado en mNIVEL y reconstruye los items con refreshFormItems.
	getNIVEL(): void {
		this.appInfoService
			.getLookUp(
				'SC_COMPETENCIAS_TECNICAS',
				'SC_LISTA',
				'GetNIVEL',
				undefined,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response?.Result && Array.isArray(response.Data)) {
						this.mNIVEL = response.Data;
					} else {
						this.mNIVEL = [];
					}
					this.refreshFormItems();
				},
				error: (error: any) => {
					this.mNIVEL = [];
					this.notifyFx(error, NotifyType.Error);
					this.refreshFormItems();
				},
			});
	}

	// Qué hace: reacciona a los cambios de estado del formulario (nuevo, editar, ver, browse).
	// Cómo: llama a AsignaStatus del componente base y, al volver a modo Browse, restaura el subtítulo de mantenimiento.
	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	// Qué hace: inicia un registro nuevo en el formulario.
	// Cómo: valida la empresa con asegurarEmpresaSesion, llama a nuevo del base, reinicia padres y modelo con fillData, y reconstruye los items con refreshFormItems.
	override nuevo(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		super.nuevo();
		this.padreInvalido = false;
		this.model = this.fillData();
		this.padres = [];
		this.registroSeleccionadoInactivo = false;
		this.refreshFormItems();
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
		});
	}

	// Qué hace: abre un registro existente en modo edición.
	// Cómo: prepara el modelo con fillData, llama a editarClick y carga los padres con cargarPadres según el nivel antes de habilitar el formulario.
	onEditClick(e: any): void {
		if (!e?.row?.data) {
			return;
		}

		this.padreInvalido = false;
		this.model = this.fillData(e.row.data);
		this.editarClick(e);
		if (this.model.NIVEL === SC_COMPETENCIA_NIVEL.DOS) {
			this.cargarPadres(SC_COMPETENCIA_NIVEL.UNO);
		} else if (this.model.NIVEL === SC_COMPETENCIA_NIVEL.TRES) {
			this.cargarPadres(SC_COMPETENCIA_NIVEL.DOS);
		} else {
			this.refreshFormItems();
		}
		setTimeout(() => {
			this.dataForm?.instance?.option('formData', this.model);
			this.habilitar();
		});
	}

	// Qué hace: construye el filtro por correlativo.
	// Cómo: devuelve un objeto con CORR_COMPETENCIAS_TECNICAS, usado en consultar y en rowRemoving.
	fillParam(xCORR_COMPETENCIAS_TECNICAS?: number): any {
		return { CORR_COMPETENCIAS_TECNICAS: xCORR_COMPETENCIAS_TECNICAS ?? 0 };
	}

	// Qué hace: construye el modelo de competencia técnica para el formulario.
	// Cómo: si recibe xModel copia sus campos y separa prefijo/sufijo del código; si no recibe nada, devuelve el modelo inicial para un registro nuevo.
	override fillData(xModel?: ScCompetenciasTecnicas): ScCompetenciasTecnicas {
		if (xModel !== undefined) {
			const model = {
				...xModel,
				NIVEL: `${xModel.NIVEL ?? SC_COMPETENCIA_NIVEL.UNO}`,
				CODIGO_PREFIJO: xModel.CODIGO_PADRE ?? '',
				CODIGO_SUFIJO: '',
			};

			if (model.NIVEL === SC_COMPETENCIA_NIVEL.DOS && model.CODIGO_PADRE && model.CODIGO_COMPETENCIAS_TECNICAS) {
				model.CODIGO_SUFIJO = model.CODIGO_COMPETENCIAS_TECNICAS.substring(model.CODIGO_PADRE.length);
			}

			return model;
		}

		return {
			CORR_EMPRESA: 1,
			CORR_COMPETENCIAS_TECNICAS: 0,
			CORR_COMPETENCIAS_TECNICAS_PADRE: null,
			CODIGO_COMPETENCIAS_TECNICAS: '',
			NOMBRE_COMPETENCIAS_TECNICAS: '',
			DESCRIPCION: '',
			NIVEL: SC_COMPETENCIA_NIVEL.UNO,
			ESTADO_COMPETENCIAS_TECNICAS: true,
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: new Date(),
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: new Date(),
			CODIGO_PREFIJO: '',
			CODIGO_SUFIJO: '',
		};
	}

	// Qué hace: carga las competencias técnicas y actualiza la grilla.
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
	// Cómo: si models es un arreglo, lo reordena de forma ascendente por CORR_COMPETENCIAS_TECNICAS.
	private ordenarModelsPorCorr(): void {
		if (!Array.isArray(this.models)) {
			return;
		}

		this.models = [...this.models].sort(
			(a, b) => Number(a.CORR_COMPETENCIAS_TECNICAS) - Number(b.CORR_COMPETENCIAS_TECNICAS)
		);
	}

	// Qué hace: refleja en la grilla el registro recién guardado.
	// Cómo: agrega el registro si es nuevo, o lo reemplaza por su llave (mttoGridKeyExpr) si ya existía, y luego ordena y refresca la grilla.
	protected override aplicarRegistroEnGrid(data: unknown, isAdd: boolean): void {
		if (!this.mttoGridKeyExpr || !data || typeof data !== 'object' || !Array.isArray(this.models)) {
			super.aplicarRegistroEnGrid(data, isAdd);
			return;
		}

		const record = this.fillData(data as ScCompetenciasTecnicas);
		const key = this.mttoGridKeyExpr as keyof ScCompetenciasTecnicas;

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

	// Qué hace: retira de la grilla el registro eliminado sin recargar el catálogo.
	// Cómo: filtra models por mttoGridKeyExpr y refresca la grilla con refrescarGridTrasCarga.
	protected override quitarRegistroDeGrid(keyValue: unknown): void {
		if (!this.mttoGridKeyExpr || !Array.isArray(this.models)) {
			super.quitarRegistroDeGrid(keyValue);
			return;
		}

		const key = this.mttoGridKeyExpr as keyof ScCompetenciasTecnicas;
		this.models = this.models.filter((item) => item?.[key] !== keyValue);
		this.refrescarGridTrasCarga(true);
	}

	// Qué hace: espera la actualización de Angular antes de refrescar la grilla.
	// Cómo: usa setTimeout para llamar a refreshData del dataGrid con resetPage opcional.
	private refrescarGridTrasCarga(resetPage = false): void {
		setTimeout(() => {
			this.dataGrid?.refreshData(resetPage);
		}, 0);
	}

	// Qué hace: valida y guarda la competencia técnica según su nivel jerárquico.
	// Cómo: sincroniza formData, valida con esValido y prepararModeloParaGuardar del servicio, y ejecuta insert o update mediante guardarMtto.
	guardar(): void {
		const isAdd = this.banderaMtto === UpdateType.Add;
		const formData = this.dataForm?.instance?.option('formData');
		if (formData) {
			this.model = { ...this.model, ...formData };
		}

		this.actualizarEstadoValidacionPadre();
		const formValidation = this.dataForm?.instance?.validate();
		if (formValidation && !formValidation.isValid) {
			this.actualizarEstadoValidacionPadre();
			this.service.esValido(this.model, this.notifyFx.bind(this), isAdd);
			return;
		}

		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this), isAdd),
			insert: () => this.service.insert(this.service.prepararModeloParaGuardar(this.model, true)),
			update: () => this.service.update(this.service.prepararModeloParaGuardar(this.model, false)),
		});
	}

	// Qué hace: convierte errores de integridad referencial en advertencia controlada al eliminar.
	// Cómo: intercepta el Observable con catchError, detecta mensajes de clave foránea con obtenerMensajeApiLocal y devuelve un resultado con ErrorCode 2627.
	private convertirErrorMttoEnWarning<T>(request: Observable<T>): Observable<T> {
		return request.pipe(
			catchError((error: any) => {
				const message = this.obtenerMensajeApiLocal(error).toLowerCase();
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
				].some((texto) => message.includes(texto));

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

	// Qué hace: extrae el mensaje útil de las distintas formas de error del API.
	// Cómo: evalúa ErrorMessage, error.message y otras variantes del objeto de error recibido.
	private obtenerMensajeApiLocal(error: any): string {
		if (typeof error === 'string') {
			return error;
		}

		return `${
			error?.ErrorMessage ?? error?.error?.ErrorMessage ?? error?.error?.message ?? error?.error ?? error?.message ?? error ?? ''
		}`;
	}

	// Qué hace: descarta la edición y restaura el registro original en la grilla.
	// Cómo: reinicia padreInvalido y llama a cancelar del base filtrando por CORR_COMPETENCIAS_TECNICAS del modelUpdate.
	override cancelar(): void {
		this.padreInvalido = false;
		super.cancelar((item: any) => item.CORR_COMPETENCIAS_TECNICAS === this.modelUpdate.CORR_COMPETENCIAS_TECNICAS);
	}

	// Qué hace: sincroniza el modelo con la fila enfocada en modo consulta.
	// Cómo: si hay datos de fila y el modo es Browse, actualiza model y modelUpdate con fillData y bloquea el formulario.
	override focusedRowChanged(e: any): void {
		const rowData = e?.data ?? e?.row?.data;
		if (!rowData || !this.isBrowse()) {
			return;
		}

		this.model = this.fillData(rowData);
		this.modelUpdate = this.fillData(rowData);
		this.bloquear();
	}

	// Qué hace: abre el registro al hacer doble clic y carga los padres válidos para su nivel.
	// Cómo: prepara el modelo con fillData, llama a rowDblClick del base y ejecuta cargarPadres según NIVEL antes de bloquear el formulario.
	override rowDblClick(e: any): void {
		const rowData = e?.data ?? e?.row?.data;
		if (!rowData) {
			return;
		}

		this.padreInvalido = false;
		this.model = this.fillData(rowData);
		this.modelUpdate = this.fillData(rowData);
		this.refreshFormItems();
		super.rowDblClick(e);
		if (this.model.NIVEL === SC_COMPETENCIA_NIVEL.DOS) {
			this.cargarPadres(SC_COMPETENCIA_NIVEL.UNO);
		} else if (this.model.NIVEL === SC_COMPETENCIA_NIVEL.TRES) {
			this.cargarPadres(SC_COMPETENCIA_NIVEL.DOS);
		}
		setTimeout(() => {
			if (!this.dataForm?.instance) {
				return;
			}
			this.dataForm.instance.option('formData', this.model);
			this.bloquear();
		});
	}

	// Qué hace: reacciona al cambio de nivel jerárquico en el formulario.
	// Cómo: reinicia padre, código y nombre, reconstruye los items con refreshFormItems y carga los padres con cargarPadres según el nivel seleccionado.
	onNivelChanged(value: string | null): void {
		const nivel = `${value ?? this.model.NIVEL ?? SC_COMPETENCIA_NIVEL.UNO}`;
		this.padreInvalido = false;
		this.model.NIVEL = nivel;
		this.model.CORR_COMPETENCIAS_TECNICAS_PADRE = null;
		this.model.CODIGO_COMPETENCIAS_TECNICAS = '';
		this.model.CODIGO_PREFIJO = '';
		this.model.CODIGO_SUFIJO = '';
		this.model.NOMBRE_COMPETENCIAS_TECNICAS = '';
		this.padres = [];
		this.registroSeleccionadoInactivo = false;
		this.refreshFormItems();

		if (nivel === SC_COMPETENCIA_NIVEL.DOS) {
			this.cargarPadres(SC_COMPETENCIA_NIVEL.UNO);
		} else if (nivel === SC_COMPETENCIA_NIVEL.TRES) {
			this.cargarPadres(SC_COMPETENCIA_NIVEL.DOS);
		}
	}

	// Qué hace: reacciona al cambio de competencia padre en el formulario.
	// Cómo: actualiza CORR_COMPETENCIAS_TECNICAS_PADRE, aplica CODIGO_PREFIJO en nivel 2 o solicita el siguiente código con getNextCodigo en nivel 3.
	onPadreChanged(value: number | null): void {
		const corrPadre = value != null && Number(value) > 0 ? Number(value) : null;
		this.model.CORR_COMPETENCIAS_TECNICAS_PADRE = corrPadre;
		if (corrPadre) {
			this.padreInvalido = false;
		}

		if (!corrPadre) {
			this.model.CODIGO_PREFIJO = '';
			this.model.CODIGO_COMPETENCIAS_TECNICAS = '';
			this.registroSeleccionadoInactivo = false;
			this.refreshFormItems();
			return;
		}

		const padre = this.padres.find((item) => Number(item.CORR_COMPETENCIAS_TECNICAS) === corrPadre);
		if (!padre) {
			return;
		}
		this.actualizarEstadoRegistroSeleccionado();

		if (this.model.NIVEL === SC_COMPETENCIA_NIVEL.DOS) {
			this.model.CODIGO_PREFIJO = padre.CODIGO_COMPETENCIAS_TECNICAS;
			this.model.CODIGO_SUFIJO = '';
			this.refreshFormItems();
			return;
		}

		if (this.model.NIVEL === SC_COMPETENCIA_NIVEL.TRES) {
			this.service
				.getNextCodigo(corrPadre)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.model.CODIGO_COMPETENCIAS_TECNICAS = response.Data?.CODIGO_COMPETENCIAS_TECNICAS ?? '';
							this.refreshFormItems();
						} else {
							this.notifyFx(response.ErrorMessage || 'No se pudo generar el codigo.', NotifyType.Error);
						}
					},
					error: (error: any) => {
						this.notifyFx(error, NotifyType.Error);
					},
				});
		}
	}

	// Qué hace: marca si falta seleccionar padre en niveles 2 y 3.
	// Cómo: evalúa NIVEL y CORR_COMPETENCIAS_TECNICAS_PADRE del modelo y actualiza padreInvalido.
	private actualizarEstadoValidacionPadre(): void {
		const requierePadre =
			this.model?.NIVEL === SC_COMPETENCIA_NIVEL.DOS ||
			this.model?.NIVEL === SC_COMPETENCIA_NIVEL.TRES;
		this.padreInvalido = requierePadre && !this.model?.CORR_COMPETENCIAS_TECNICAS_PADRE;
	}

	// Qué hace: solicita la eliminación de la competencia técnica seleccionada.
	// Cómo: llama a rowRemovingMtto con delete del servicio envuelto en convertirErrorMttoEnWarning para controlar errores de integridad.
	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirErrorMttoEnWarning(this.service.delete(this.fillParam(e.data.CORR_COMPETENCIAS_TECNICAS))),
		});
	}

	// Qué hace: cambia el estado activo/inactivo del registro seleccionado.
	// Cómo: llama a invocarActivarInactivar del base con activarInactivar del servicio.
	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	// Qué hace: deja el formulario en solo lectura (modo consulta).
	// Cómo: marca readOnly en true en los editores del dx-form según el campo.
	override bloquear(): void {
		this.dataForm?.instance?.getEditor('CORR_COMPETENCIAS_TECNICAS')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('NIVEL')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('CORR_COMPETENCIAS_TECNICAS_PADRE')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('CODIGO_COMPETENCIAS_TECNICAS')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('CODIGO_PREFIJO')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('CODIGO_SUFIJO')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('NOMBRE_COMPETENCIAS_TECNICAS')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('DESCRIPCION')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('ESTADO_COMPETENCIAS_TECNICAS')?.option('readOnly', true);
	}

	// Qué hace: habilita los campos editables del formulario según el nivel y el modo.
	// Cómo: ajusta readOnly en cada editor del dx-form; el estado queda bloqueado al editar y el código en nivel 3 permanece de solo lectura.
	override habilitar(): void {
		const estadoSoloLectura = this.banderaMtto === UpdateType.Update;
		setTimeout(() => {
			this.dataForm?.instance?.getEditor('CORR_COMPETENCIAS_TECNICAS')?.option('readOnly', true);
			this.dataForm?.instance?.getEditor('NIVEL')?.option('readOnly', true);
			this.dataForm?.instance?.getEditor('CORR_COMPETENCIAS_TECNICAS_PADRE')?.option('readOnly', true);
			this.dataForm?.instance?.getEditor('CODIGO_COMPETENCIAS_TECNICAS')?.option('readOnly', estadoSoloLectura || this.model.NIVEL === SC_COMPETENCIA_NIVEL.TRES);
			this.dataForm?.instance?.getEditor('CODIGO_PREFIJO')?.option('readOnly', true);
			this.dataForm?.instance?.getEditor('CODIGO_SUFIJO')?.option('readOnly', estadoSoloLectura);
			this.dataForm?.instance?.getEditor('NOMBRE_COMPETENCIAS_TECNICAS')?.option('readOnly', false);
			this.dataForm?.instance?.getEditor('DESCRIPCION')?.option('readOnly', false);
			this.dataForm?.instance?.getEditor('ESTADO_COMPETENCIAS_TECNICAS')?.option('readOnly', estadoSoloLectura);
		});
	}

	// Qué hace: coloca el foco en el primer campo editable del formulario.
	// Cómo: en nivel 1 enfoca CODIGO_COMPETENCIAS_TECNICAS; en niveles 2 y 3 enfoca CORR_COMPETENCIAS_TECNICAS_PADRE.
	override setFocus(): void {
		setTimeout(() => {
			if (this.model.NIVEL === SC_COMPETENCIA_NIVEL.UNO) {
				this.dataForm.instance.getEditor('CODIGO_COMPETENCIAS_TECNICAS')?.focus();
				return;
			}

			this.dataForm.instance.getEditor('CORR_COMPETENCIAS_TECNICAS_PADRE')?.focus();
		});
	}

	// Qué hace: devuelve la clave del nivel seleccionado en el lookup.
	// Cómo: retorna la propiedad Key de la primera fila recibida en vRow.
	selectedLookUpNIVEL(vRow: any): string {
		return vRow[0].Key;
	}

	// Qué hace: devuelve la clave del padre seleccionado en el lookup.
	// Cómo: retorna CORR_COMPETENCIAS_TECNICAS de la primera fila recibida en vRow.
	selectedLookUpCORR_COMPETENCIAS_TECNICAS_PADRE(vRow: any): number {
		return vRow[0].CORR_COMPETENCIAS_TECNICAS;
	}

	// Qué hace: reconstruye los editores del formulario según nivel, modo y padres disponibles.
	// Cómo: llama a getItems del servicio con el contexto actual y bloquea el formulario si no está en modo Add o Update.
	private refreshFormItems(): void {
		this.items = this.service.getItems({
			nivel: `${this.model?.NIVEL ?? SC_COMPETENCIA_NIVEL.UNO}`,
			isAdd: this.banderaMtto === UpdateType.Add,
			padres: this.padres,
			niveles: this.mNIVEL,
			registroSeleccionadoInactivo: this.registroSeleccionadoInactivo,
			onNivelChanged: this.onNivelChanged,
			onPadreChanged: this.onPadreChanged,
		});

		if (this.banderaMtto !== UpdateType.Add && this.banderaMtto !== UpdateType.Update) {
			setTimeout(() => this.bloquear());
		}
	}

	// Qué hace: carga los candidatos padre para el nivel jerárquico indicado.
	// Cómo: llama a getLookUp con GetCORR_COMPETENCIAS_TECNICAS_PADRE, normaliza cada registro con mapPadreLookupItem y completa el padre actual con agregarPadreActualSiNoExiste.
	private cargarPadres(nivelPadre: string): void {
		const incluirInactivos = this.banderaMtto !== UpdateType.Add;
		const xWhere: Array<{ Parameter: string; Value: any }> = [{ Parameter: 'NIVEL_PADRE', Value: nivelPadre }];
		if (incluirInactivos) {
			xWhere.push({ Parameter: 'OPCION_CONSULTA', Value: 1 });
		}

		this.appInfoService
			.getLookUp(
				'SC_COMPETENCIAS_TECNICAS',
				'SC_COMPETENCIAS_TECNICAS',
				'GetCORR_COMPETENCIAS_TECNICAS_PADRE',
				xWhere,
				environment.UrlSELECCIONCONTRATACIONAPI
			)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.padres = (response.Data ?? []).map((item: any) => this.mapPadreLookupItem(item));
						this.agregarPadreActualSiNoExiste(() => this.refreshFormItems());
					} else {
						this.notifyFx(response.ErrorMessage || 'No se pudieron cargar los registros padre.', NotifyType.Error);
					}
				},
				error: (error: any) => {
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	// Qué hace: normaliza un registro padre para mostrarlo en el lookup.
	// Cómo: recorta código, nombre y descripción, y construye NOMBRE_DISPLAY combinando código y descripción o nombre.
	private mapPadreLookupItem(item: any): ScCompetenciaPadreOption {
		const codigo = (item.CODIGO_COMPETENCIAS_TECNICAS ?? '').trim();
		const nombre = (item.NOMBRE_COMPETENCIAS_TECNICAS ?? '').trim();
		const descripcion = (item.DESCRIPCION ?? '').trim();
		const nombreDisplay =
			(item.NOMBRE_DISPLAY ?? '').trim() ||
			[codigo, descripcion || nombre].filter((parte) => !!parte).join(' - ');

		return {
			CORR_COMPETENCIAS_TECNICAS: Number(item.CORR_COMPETENCIAS_TECNICAS),
			CODIGO_COMPETENCIAS_TECNICAS: codigo,
			NOMBRE_COMPETENCIAS_TECNICAS: nombre,
			DESCRIPCION: descripcion,
			NOMBRE_DISPLAY: nombreDisplay || codigo || '(Sin nombre)',
			NIVEL: item.NIVEL ?? '',
			ESTADO_COMPETENCIAS_TECNICAS: item.ESTADO_COMPETENCIAS_TECNICAS,
		};
	}

	// Qué hace: conserva el padre actual aunque ya no forme parte del lookup activo.
	// Cómo: busca el padre en padres o models, lo enriquece con mapPadreLookupItem o lo agrega con agregarPadreActual, y ejecuta onDone al finalizar.
	private agregarPadreActualSiNoExiste(onDone: () => void): void {
		if (this.banderaMtto === UpdateType.Add || !this.model?.CORR_COMPETENCIAS_TECNICAS_PADRE) {
			onDone();
			return;
		}

		const padreIndex = this.padres.findIndex(
			(item) => item.CORR_COMPETENCIAS_TECNICAS === this.model.CORR_COMPETENCIAS_TECNICAS_PADRE
		);
		const padreEnLista = padreIndex >= 0 ? this.padres[padreIndex] : null;
		if (padreEnLista?.ESTADO_COMPETENCIAS_TECNICAS !== undefined) {
			this.actualizarEstadoRegistroSeleccionado();
			onDone();
			return;
		}

		const padreLocal = Array.isArray(this.models)
			? this.models.find(
					(item) => item.CORR_COMPETENCIAS_TECNICAS === this.model.CORR_COMPETENCIAS_TECNICAS_PADRE
				)
			: null;

		if (padreIndex >= 0) {
			this.padres[padreIndex] = this.mapPadreLookupItem({
				...this.padres[padreIndex],
				CODIGO_COMPETENCIAS_TECNICAS:
					padreLocal?.CODIGO_COMPETENCIAS_TECNICAS || this.padres[padreIndex].CODIGO_COMPETENCIAS_TECNICAS,
				NOMBRE_COMPETENCIAS_TECNICAS:
					padreLocal?.NOMBRE_COMPETENCIAS_TECNICAS || this.padres[padreIndex].NOMBRE_COMPETENCIAS_TECNICAS,
				DESCRIPCION: padreLocal?.DESCRIPCION || this.padres[padreIndex].DESCRIPCION,
				ESTADO_COMPETENCIAS_TECNICAS: padreLocal?.ESTADO_COMPETENCIAS_TECNICAS,
			});
			this.actualizarEstadoRegistroSeleccionado();
		} else {
			this.agregarPadreActual(padreLocal ?? undefined);
		}

		onDone();
	}

	// Qué hace: inserta en el lookup el padre actual cuando no viene en la lista activa.
	// Cómo: construye la opción con mapPadreLookupItem usando datos del modelo o del padre local, la antepone a padres y actualiza registroSeleccionadoInactivo.
	private agregarPadreActual(padre?: ScCompetenciasTecnicas): void {
		const item = this.mapPadreLookupItem({
			CORR_COMPETENCIAS_TECNICAS: this.model.CORR_COMPETENCIAS_TECNICAS_PADRE,
			CODIGO_COMPETENCIAS_TECNICAS:
				padre?.CODIGO_COMPETENCIAS_TECNICAS || this.model.CODIGO_PADRE || this.model.CODIGO_PREFIJO || 'Padre',
			NOMBRE_COMPETENCIAS_TECNICAS: padre?.NOMBRE_COMPETENCIAS_TECNICAS || this.model.NOMBRE_PADRE || '',
			DESCRIPCION:
				padre?.DESCRIPCION || this.model.DESCRIPCION_PADRE || this.model.NOMBRE_PADRE || this.model.CODIGO_PADRE || '',
			ESTADO_COMPETENCIAS_TECNICAS: padre?.ESTADO_COMPETENCIAS_TECNICAS ?? false,
		});
		this.padres = [item, ...this.padres];
		this.actualizarEstadoRegistroSeleccionado();
	}

	// Qué hace: indica si el padre seleccionado está inactivo para advertir al usuario.
	// Cómo: busca el padre en padres por CORR_COMPETENCIAS_TECNICAS_PADRE y actualiza registroSeleccionadoInactivo según ESTADO_COMPETENCIAS_TECNICAS.
	private actualizarEstadoRegistroSeleccionado(): void {
		const padre = this.padres.find((item) => item.CORR_COMPETENCIAS_TECNICAS === this.model?.CORR_COMPETENCIAS_TECNICAS_PADRE);
		this.registroSeleccionadoInactivo = padre?.ESTADO_COMPETENCIAS_TECNICAS === false;
	}
}
