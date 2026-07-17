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

	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.getNIVEL();
		this.consultar();
	}

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

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

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

	fillParam(xCORR_COMPETENCIAS_TECNICAS?: number): any {
		return { CORR_COMPETENCIAS_TECNICAS: xCORR_COMPETENCIAS_TECNICAS ?? 0 };
	}

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
			(a, b) => Number(a.CORR_COMPETENCIAS_TECNICAS) - Number(b.CORR_COMPETENCIAS_TECNICAS)
		);
	}

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

	protected override quitarRegistroDeGrid(keyValue: unknown): void {
		if (!this.mttoGridKeyExpr || !Array.isArray(this.models)) {
			super.quitarRegistroDeGrid(keyValue);
			return;
		}

		const key = this.mttoGridKeyExpr as keyof ScCompetenciasTecnicas;
		this.models = this.models.filter((item) => item?.[key] !== keyValue);
		this.refrescarGridTrasCarga(true);
	}

	private refrescarGridTrasCarga(resetPage = false): void {
		setTimeout(() => {
			this.dataGrid?.refreshData(resetPage);
		}, 0);
	}

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
			insert: () =>
				this.convertirErrorMttoEnWarning(
					this.service.insert(this.service.prepararModeloParaGuardar(this.model, true))
				),
			update: () =>
				this.convertirErrorMttoEnWarning(
					this.service.update(this.service.prepararModeloParaGuardar(this.model, false))
				),
		});
	}

	private convertirErrorMttoEnWarning<T>(request: Observable<T>, esEliminacion = false): Observable<T> {
		return request.pipe(
			catchError((error: any) => {
				const message = this.obtenerMensajeApiLocal(error);
				const normalized = message.toLowerCase();
				const esDuplicado =
					!esEliminacion &&
					['ya existe', 'duplicad', 'primary key', 'unique key', 'mismo tiempo', 'llave primaria', 'clave primaria'].some(
						(texto) => normalized.includes(texto)
					);
				const tieneRelacion =
					esEliminacion &&
					[
						'foreign key',
						'reference constraint',
						'clave externa',
						'clave foránea',
						'llave foránea',
						'hijos',
						'registros relacionados',
						'registros asociados',
						'asociados',
					].some((texto) => normalized.includes(texto));

				if (esDuplicado || tieneRelacion) {
					return of({
						Result: false,
						ErrorCode: 2627,
						ErrorMessage: tieneRelacion
							? 'No se puede eliminar porque tiene registros relacionados.'
							: this.obtenerMensajeCodigoDuplicado(),
					} as T);
				}

				return throwError(() => error);
			})
		);
	}

	private obtenerMensajeApiLocal(error: any): string {
		if (typeof error === 'string') {
			return error;
		}

		return `${
			error?.ErrorMessage ?? error?.error?.ErrorMessage ?? error?.error?.message ?? error?.error ?? error?.message ?? error ?? ''
		}`;
	}

	private obtenerMensajeCodigoDuplicado(): string {
		if (this.model.NIVEL === SC_COMPETENCIA_NIVEL.DOS) {
			return 'El sufijo de Nivel 2 ingresado está registrado para otra competencia técnica.';
		}

		if (this.model.NIVEL === SC_COMPETENCIA_NIVEL.UNO) {
			return 'El código de Nivel 1 ingresado está registrado para otra competencia técnica.';
		}

		return 'El código generado está registrado para otra competencia técnica.';
	}

	override cancelar(): void {
		this.padreInvalido = false;
		super.cancelar((item: any) => item.CORR_COMPETENCIAS_TECNICAS === this.modelUpdate.CORR_COMPETENCIAS_TECNICAS);
	}

	override focusedRowChanged(e: any): void {
		const rowData = e?.data ?? e?.row?.data;
		if (!rowData || !this.isBrowse()) {
			return;
		}

		this.model = this.fillData(rowData);
		this.modelUpdate = this.fillData(rowData);
		this.bloquear();
	}

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

	private actualizarEstadoValidacionPadre(): void {
		const requierePadre =
			this.model?.NIVEL === SC_COMPETENCIA_NIVEL.DOS ||
			this.model?.NIVEL === SC_COMPETENCIA_NIVEL.TRES;
		this.padreInvalido = requierePadre && !this.model?.CORR_COMPETENCIAS_TECNICAS_PADRE;
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () =>
				this.convertirErrorMttoEnWarning(
					this.service.delete(this.fillParam(e.data.CORR_COMPETENCIAS_TECNICAS)),
					true
				),
		});
	}

	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

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

	override setFocus(): void {
		setTimeout(() => {
			if (this.model.NIVEL === SC_COMPETENCIA_NIVEL.UNO) {
				this.dataForm.instance.getEditor('CODIGO_COMPETENCIAS_TECNICAS')?.focus();
				return;
			}

			this.dataForm.instance.getEditor('CORR_COMPETENCIAS_TECNICAS_PADRE')?.focus();
		});
	}

	selectedLookUpNIVEL(vRow: any): string {
		return vRow[0].Key;
	}

	selectedLookUpCORR_COMPETENCIAS_TECNICAS_PADRE(vRow: any): number {
		return vRow[0].CORR_COMPETENCIAS_TECNICAS;
	}

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

	private actualizarEstadoRegistroSeleccionado(): void {
		const padre = this.padres.find((item) => item.CORR_COMPETENCIAS_TECNICAS === this.model?.CORR_COMPETENCIAS_TECNICAS_PADRE);
		this.registroSeleccionadoInactivo = padre?.ESTADO_COMPETENCIAS_TECNICAS === false;
	}
}
