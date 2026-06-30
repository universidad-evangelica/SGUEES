import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import CustomStore from 'devextreme/data/custom_store';
import { custom } from 'devextreme/ui/dialog';
import { MessageService } from 'primeng/api';
import { lastValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { AuthService } from 'src/app/shared/services/auth.service';
import {
	clearGridHeaderFilterSelections,
	getColumnHeaderFilterSelection,
	hasColumnHeaderFilterSelection,
	invertEstadoExcludedHeaderFilterValues,
	invertExcludedHeaderFilterValues,
	isHeaderFilterExclude,
	normalizeEstadoHeaderFilterValue,
	readGridFilterRowValues,
} from 'src/app/shared/utils/remote-header-filter.util';
import {
	SC_COMPETENCIA_NIVEL,
	ScCompetenciaPadreOption,
	ScCompetenciasTecnicas,
} from './models/sc-competencias-tecnicas';
import {
	EMPRESA_REGISTRO_ETIQUETA,
	getEmpresaWarningMessage,
	isEmpresaFkErrorMessage,
	isEmpresaWarningResponse,
	ScCompetenciasTecnicasService,
} from './sc-competencias-tecnicas.service';

type EstadoFiltro = boolean | null;

interface ParsedGridFilters {
	estado: EstadoFiltro;
	filterRow: Record<string, unknown>;
	filterRowExact: Record<string, unknown>;
	headerAnyOf: Record<string, unknown[]>;
}

@Component({
	selector: 'app-sc-competencias-tecnicas',
	templateUrl: './sc-competencias-tecnicas.component.html',
	styleUrls: ['./sc-competencias-tecnicas.component.scss'],
})
export class ScCompetenciasTecnicasComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	readonly pageSizes = [5, 10, 25, 50, 100];
	private readonly maintenanceSubtitulo = 'Catalogo de Competencias Tecnicas';
	padres: ScCompetenciaPadreOption[] = [];
	registroSeleccionadoInactivo = false;

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScCompetenciasTecnicasService,
		private messageService: MessageService,
		private authService: AuthService
	) {
		super(appInfoService, router);
		this.onEditClick = this.onEditClick.bind(this);
		this.onEliminarClick = this.onEliminarClick.bind(this);
		this.onActivarClick = this.onActivarClick.bind(this);
		this.onDesactivarClick = this.onDesactivarClick.bind(this);
		this.onNivelChanged = this.onNivelChanged.bind(this);
		this.onPadreChanged = this.onPadreChanged.bind(this);
		this.columns = this.service.getColumns(this.onEditClick, this.onEliminarClick, this.onActivarClick, this.onDesactivarClick, this.permiteEdit, this.permiteDele);
		this.summary = this.service.getSummary();
		this.refreshFormItems();
	}

	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.configurarDataSource();
	}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	override nuevo(): void {
		if (!this.validarEmpresaSesion()) {
			return;
		}
		super.nuevo();
		this.model = this.fillData();
		this.padres = [];
		this.refreshFormItems();
	}

	onEditClick(e: any): void {
		if (!e?.row?.data) {
			return;
		}

		this.model = this.fillData(e.row.data);
		this.editarClick(e);
		if (this.model.NIVEL === SC_COMPETENCIA_NIVEL.DOS) {
			this.cargarPadres(SC_COMPETENCIA_NIVEL.UNO);
		} else if (this.model.NIVEL === SC_COMPETENCIA_NIVEL.TRES) {
			this.cargarPadres(SC_COMPETENCIA_NIVEL.DOS);
		} else {
			this.refreshFormItems();
		}
	}

	fillParam(
		xCORR_COMPETENCIAS_TECNICAS?: number,
		page = 1,
		pageSize = 5,
		busqueda = '',
		gridFilters: ParsedGridFilters = { estado: null, filterRow: {}, filterRowExact: {}, headerAnyOf: {} },
		distinctField = '',
		headerFilterSearch = '',
		sortField = '',
		sortDesc = false
	): any {
		return {
			CORR_COMPETENCIAS_TECNICAS: xCORR_COMPETENCIAS_TECNICAS ?? 0,
			BUSQUEDA: busqueda,
			PAGE: page,
			PAGE_SIZE: pageSize,
			DISTINCT_FIELD: distinctField,
			HEADER_FILTER_SEARCH: headerFilterSearch,
			SORT_FIELD: sortField,
			SORT_DESC: sortDesc,
			gridFilters,
		};
	}

	loadHeaderFilterValues = (field: string, searchValue?: string): Promise<unknown[]> => {
		const grid = this.dataGrid?.gData?.instance;
		const combinedFilter = grid?.getCombinedFilter?.(false);
		const gridFilters = this.getGridFilters(combinedFilter, grid);
		const hasFilterRowSearch = this.hasFilterRowSearch(gridFilters);
		const scopeDistinctToFilterRow = hasFilterRowSearch;
		const filtersForDistinct: ParsedGridFilters = {
			estado: scopeDistinctToFilterRow ? gridFilters.estado : null,
			filterRow: scopeDistinctToFilterRow ? gridFilters.filterRow : {},
			filterRowExact: scopeDistinctToFilterRow ? gridFilters.filterRowExact : {},
			headerAnyOf: {},
		};

		return lastValueFrom(
			this.service.getDistinctValues(
				this.fillParam(
					0,
					1,
					0,
					'',
					filtersForDistinct,
					field,
					searchValue ?? ''
				)
			)
		).then((response) => {
			if (!response.Result) {
				throw new Error(response.ErrorMessage || 'No se pudieron cargar los valores del filtro.');
			}

			return response.Data ?? [];
		});
	};

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

	consultar(): void {
		this.dataGrid?.refreshData(true);
	}

	override notifyFx(xMessage: string, xType: NotifyType): void {
		const cleanMessage = `${xMessage ?? ''}`.replace(/^error:\s*/i, '').trim();
		const warningDetail = this.getWarningMessage(xMessage);
		const isWarning = xType === NotifyType.Warning || warningDetail !== cleanMessage;
		const severity = xType === NotifyType.Success ? 'success' : isWarning ? 'warn' : 'error';
		const summary = xType === NotifyType.Success ? 'Éxito' : isWarning ? 'Advertencia' : 'Error';
		const detail = isWarning ? warningDetail : cleanMessage;
		this.messageService.add({ severity, summary, detail });
	}

	guardar(): void {
		if (!this.validarEmpresaSesion()) {
			return;
		}

		const isAdd = this.banderaMtto === UpdateType.Add;

		const formData = this.dataForm?.instance?.option('formData');
		if (formData) {
			this.model = { ...this.model, ...formData };
		}

		const formValidation = this.dataForm?.instance?.validate();
		if (formValidation && !formValidation.isValid) {
			this.service.esValido(this.model, this.notifyFx.bind(this), isAdd);
			return;
		}

		if (!this.service.esValido(this.model, this.notifyFx.bind(this), isAdd)) {
			return;
		}

		const payload = this.service.prepararModeloParaGuardar(this.model, isAdd);
		this.loadingVisible = true;

		const request = isAdd ? this.service.insert(payload) : this.service.update(payload);
		request.pipe(take(1)).subscribe({
			next: (response: any) => {
				if (response.Result) {
					this.model = response.Data;
					this.AsignaStatus(UpdateType.Browse);
					this.consultar();
					this.notifyFx(isAdd ? 'Registro creado con exito!' : 'Registro modificado con exito!', NotifyType.Success);
				} else {
					this.notifyFx(response.ErrorMessage, this.getNotifyType(response));
				}
				this.loadingVisible = false;
			},
			error: (error: any) => {
				this.notifyFx(this.getErrorMessage(error), this.getErrorNotifyType(error));
				this.loadingVisible = false;
			},
		});
	}

	override cancelar(): void {
		this.model = this.modelUpdate;
		this.AsignaStatus(UpdateType.Browse);
		this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
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

	onNivelChanged(e: any): void {
		const nivel = `${e?.value ?? this.model.NIVEL ?? SC_COMPETENCIA_NIVEL.UNO}`;
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

	onPadreChanged(e: any): void {
		const corrPadre = e?.value ?? this.model.CORR_COMPETENCIAS_TECNICAS_PADRE;
		if (!corrPadre) {
			this.model.CODIGO_PREFIJO = '';
			this.model.CODIGO_COMPETENCIAS_TECNICAS = '';
			this.registroSeleccionadoInactivo = false;
			this.refreshFormItems();
			return;
		}

		const padre = this.padres.find((item) => item.CORR_COMPETENCIAS_TECNICAS === corrPadre);
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
						this.notifyFx(this.getErrorMessage(error), NotifyType.Error);
					},
				});
		}
	}

	onActivarClick(e: any): void {
		const row = e.row?.data as ScCompetenciasTecnicas;
		if (!row) {
			return;
		}

		this.confirmEstado(
			'Activar registro',
			`Desea activar la competencia "${row.CODIGO_COMPETENCIAS_TECNICAS}"?`,
			() => this.cambiarEstado(row, true)
		);
	}

	onEliminarClick(e: any): void {
		const row = e.row?.data as ScCompetenciasTecnicas;
		if (!row) {
			return;
		}

		this.confirmEstado(
			'Eliminar registro',
			`Desea eliminar la competencia "${row.CODIGO_COMPETENCIAS_TECNICAS}"?`,
			() => this.eliminarRegistro(row)
		);
	}

	onDesactivarClick(e: any): void {
		const row = e.row?.data as ScCompetenciasTecnicas;
		if (!row) {
			return;
		}

		this.confirmEstado(
			'Desactivar registro',
			`Desea desactivar la competencia "${row.CODIGO_COMPETENCIAS_TECNICAS}"?`,
			() => this.cambiarEstado(row, false)
		);
	}

	rowRemoving(e: any): void {
		e.cancel = true;
		this.onEliminarClick({ row: { data: e.data } });
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

	override setFocus(): void {
		setTimeout(() => {
			if (this.model.NIVEL === SC_COMPETENCIA_NIVEL.UNO) {
				this.dataForm.instance.getEditor('CODIGO_COMPETENCIAS_TECNICAS')?.focus();
				return;
			}

			this.dataForm.instance.getEditor('CORR_COMPETENCIAS_TECNICAS_PADRE')?.focus();
		});
	}

	private refreshFormItems(): void {
		this.items = this.service.getItems({
			nivel: `${this.model?.NIVEL ?? SC_COMPETENCIA_NIVEL.UNO}`,
			isAdd: this.banderaMtto === UpdateType.Add,
			padres: this.padres,
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
		this.service
			.getPadres(nivelPadre, incluirInactivos)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.padres = response.Data ?? [];
						this.agregarPadreActualSiNoExiste(() => this.refreshFormItems());
					} else {
						this.notifyFx(response.ErrorMessage || 'No se pudieron cargar los registros padre.', NotifyType.Error);
					}
				},
				error: (error: any) => {
					this.notifyFx(this.getErrorMessage(error), NotifyType.Error);
				},
			});
	}

	private agregarPadreActualSiNoExiste(onDone: () => void): void {
		if (
			this.banderaMtto === UpdateType.Add ||
			!this.model?.CORR_COMPETENCIAS_TECNICAS_PADRE
		) {
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

		this.service
			.getAll(this.fillParam(this.model.CORR_COMPETENCIAS_TECNICAS_PADRE, 1, 1))
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					const padre = response.Result && Array.isArray(response.Data) ? response.Data[0] : null;
					if (padreIndex >= 0) {
						this.padres[padreIndex] = {
							...this.padres[padreIndex],
							CODIGO_COMPETENCIAS_TECNICAS: padre?.CODIGO_COMPETENCIAS_TECNICAS || this.padres[padreIndex].CODIGO_COMPETENCIAS_TECNICAS,
							NOMBRE_COMPETENCIAS_TECNICAS: padre?.NOMBRE_COMPETENCIAS_TECNICAS || this.padres[padreIndex].NOMBRE_COMPETENCIAS_TECNICAS,
							DESCRIPCION: padre?.DESCRIPCION || this.padres[padreIndex].DESCRIPCION,
							ESTADO_COMPETENCIAS_TECNICAS: padre?.ESTADO_COMPETENCIAS_TECNICAS,
						};
						this.actualizarEstadoRegistroSeleccionado();
					} else {
						this.agregarPadreActual(padre);
					}
					onDone();
				},
				error: () => {
					this.agregarPadreActual();
					onDone();
				},
			});
	}

	private agregarPadreActual(padre?: ScCompetenciasTecnicas): void {
		this.padres = [
			{
				CORR_COMPETENCIAS_TECNICAS: this.model.CORR_COMPETENCIAS_TECNICAS_PADRE,
				CODIGO_COMPETENCIAS_TECNICAS: padre?.CODIGO_COMPETENCIAS_TECNICAS || this.model.CODIGO_PADRE || this.model.CODIGO_PREFIJO || 'Padre',
				NOMBRE_COMPETENCIAS_TECNICAS: padre?.NOMBRE_COMPETENCIAS_TECNICAS || this.model.NOMBRE_PADRE || '',
				DESCRIPCION: padre?.DESCRIPCION || this.model.DESCRIPCION_PADRE || this.model.NOMBRE_PADRE || this.model.CODIGO_PADRE || '',
				ESTADO_COMPETENCIAS_TECNICAS: padre?.ESTADO_COMPETENCIAS_TECNICAS ?? false,
			},
			...this.padres,
		];
		this.actualizarEstadoRegistroSeleccionado();
	}

	private actualizarEstadoRegistroSeleccionado(): void {
		const padre = this.padres.find((item) => item.CORR_COMPETENCIAS_TECNICAS === this.model?.CORR_COMPETENCIAS_TECNICAS_PADRE);
		this.registroSeleccionadoInactivo = padre?.ESTADO_COMPETENCIAS_TECNICAS === false;
	}

	private configurarDataSource(): void {
		this.models = new CustomStore({
			key: 'CORR_COMPETENCIAS_TECNICAS',
			loadMode: 'processed',
			cacheRawData: false,
			load: async (loadOptions: any) => {
				const takeRows = loadOptions.take || 5;
				const skipRows = loadOptions.skip || 0;
				const page = Math.floor(skipRows / takeRows) + 1;
				const grid = this.dataGrid?.gData?.instance;
				if (grid) {
					const filterRowValues = readGridFilterRowValues(grid);
					const hasFilterRow =
						Object.keys(filterRowValues.filterRow).length > 0 ||
						Object.keys(filterRowValues.filterRowExact).length > 0;
					if (hasFilterRow) {
						clearGridHeaderFilterSelections(grid);
					}
				}
				const gridFilters = this.getGridFilters(loadOptions.filter, grid);
				if (!this.hasFilterRowSearch(gridFilters)) {
					await this.resolveExcludeHeaderFilters(grid, gridFilters);
				}
				const sort = this.getGridSort(loadOptions.sort);
				const response = await lastValueFrom(
					this.service.getAll(
						this.fillParam(
							0,
							page,
							takeRows,
							'',
							gridFilters,
							'',
							'',
							sort?.field ?? '',
							sort?.desc ?? false
						)
					)
				);

				if (!response.Result) {
					throw new Error(response.ErrorMessage || 'No se pudo cargar el catalogo de competencias tecnicas.');
				}

				return {
					data: response.Data || [],
					totalCount: response.RowsAffected || 0,
				};
			},
		});
	}

	private getGridFilters(filter: any, grid?: any): ParsedGridFilters {
		const result: ParsedGridFilters = {
			estado: null,
			filterRow: {},
			filterRowExact: {},
			headerAnyOf: {},
		};

		const headerEquals = new Map<string, unknown[]>();
		const headerFilterFields = this.getActiveHeaderFilterFields(grid);
		const filterRowFromGrid = readGridFilterRowValues(grid);
		const filterRowFields = new Set([
			...Object.keys(filterRowFromGrid.filterRow),
			...Object.keys(filterRowFromGrid.filterRowExact),
		]);
		const flatConditions = this.flattenFilter(filter);

		for (const node of flatConditions) {
			const field = node[0];
			const operator = node[1];
			const value = node[2];

			if (operator === 'anyof' && Array.isArray(value) && value.length) {
				if (grid && isHeaderFilterExclude(grid, field)) {
					continue;
				}

				const normalizedValues =
					field === 'ESTADO_COMPETENCIAS_TECNICAS'
						? value.map((item) => normalizeEstadoHeaderFilterValue(item))
						: value;

				result.headerAnyOf[field] = this.mergeAnyOfValues(result.headerAnyOf[field], normalizedValues);
				continue;
			}

			if (operator === '=' || operator === '==') {
				if (filterRowFields.has(field)) {
					continue;
				}

				const values = headerEquals.get(field) ?? [];
				values.push(value);
				headerEquals.set(field, values);
				continue;
			}

			if (operator === '<' || operator === '>' || operator === '<=' || operator === '>=') {
				if (filterRowFields.has(field)) {
					continue;
				}

				result.filterRowExact[field] = value;
				continue;
			}

			if (value !== null && value !== undefined && `${value}`.trim()) {
				if (filterRowFields.has(field)) {
					continue;
				}

				result.filterRow[field] = value;
			}
		}

		for (const [field, values] of headerEquals.entries()) {
			if (grid && isHeaderFilterExclude(grid, field)) {
				continue;
			}

			if (values.length > 1 || headerFilterFields.has(field)) {
				const normalizedValues =
					field === 'ESTADO_COMPETENCIAS_TECNICAS'
						? values.map((item) => normalizeEstadoHeaderFilterValue(item))
						: values;

				result.headerAnyOf[field] = this.mergeAnyOfValues(result.headerAnyOf[field], normalizedValues);
				continue;
			}

			result.filterRowExact[field] = values[0];
		}

		result.filterRow = filterRowFromGrid.filterRow;
		result.filterRowExact = filterRowFromGrid.filterRowExact;
		this.applyEstadoFilterRow(result);
		this.applyHeaderFiltersFromGrid(grid, result);

		if (this.hasFilterRowSearch(result)) {
			result.headerAnyOf = {};
		}

		return result;
	}

	private applyHeaderFiltersFromGrid(grid: any, result: ParsedGridFilters): void {
		if (!grid?.getVisibleColumns) {
			return;
		}

		for (const column of grid.getVisibleColumns()) {
			const dataField = column?.dataField;
			if (!dataField || column.allowHeaderFiltering === false) {
				continue;
			}

			const selection = getColumnHeaderFilterSelection(grid, dataField);
			if (!selection || selection.filterType === 'exclude' || !selection.values.length) {
				continue;
			}

			const values =
				dataField === 'ESTADO_COMPETENCIAS_TECNICAS'
					? selection.values.map((item) => normalizeEstadoHeaderFilterValue(item))
					: selection.values;

			result.headerAnyOf[dataField] = this.mergeAnyOfValues(result.headerAnyOf[dataField], values);
		}
	}

	private applyEstadoFilterRow(result: ParsedGridFilters): void {
		const estadoValue =
			result.filterRowExact['ESTADO_COMPETENCIAS_TECNICAS'] ??
			result.filterRow['ESTADO_COMPETENCIAS_TECNICAS'];

		if (estadoValue === undefined) {
			return;
		}

		if (estadoValue === '__ALL__' || estadoValue === null) {
			result.estado = null;
		} else {
			result.estado = estadoValue === true || estadoValue === 'true';
		}

		delete result.filterRowExact['ESTADO_COMPETENCIAS_TECNICAS'];
		delete result.filterRow['ESTADO_COMPETENCIAS_TECNICAS'];
	}

	private hasFilterRowSearch(filters: ParsedGridFilters): boolean {
		return (
			filters.estado !== null && filters.estado !== undefined ||
			Object.keys(filters.filterRow).length > 0 ||
			Object.keys(filters.filterRowExact).length > 0
		);
	}

	private async resolveExcludeHeaderFilters(grid: any, result: ParsedGridFilters): Promise<void> {
		if (!grid?.getVisibleColumns) {
			return;
		}

		for (const column of grid.getVisibleColumns()) {
			const dataField = column?.dataField;
			if (!dataField || column.allowHeaderFiltering === false) {
				continue;
			}

			const selection = getColumnHeaderFilterSelection(grid, dataField);
			if (!selection || selection.filterType !== 'exclude' || !selection.values.length) {
				continue;
			}

			if (dataField === 'ESTADO_COMPETENCIAS_TECNICAS') {
				const included = invertEstadoExcludedHeaderFilterValues(
					selection.values.map((item) => normalizeEstadoHeaderFilterValue(item))
				);
				result.headerAnyOf[dataField] = included.length ? included : ['__NO_MATCH__'];
				continue;
			}

			const filtersForDistinct = this.cloneGridFilters(result);
			delete filtersForDistinct.headerAnyOf[dataField];
			delete filtersForDistinct.filterRow[dataField];
			delete filtersForDistinct.filterRowExact[dataField];

			const response = await lastValueFrom(
				this.service.getDistinctValues(this.fillParam(0, 1, 0, '', filtersForDistinct, dataField, ''))
			);

			if (!response.Result) {
				continue;
			}

			const included = invertExcludedHeaderFilterValues(selection.values, response.Data ?? []);
			if (included.length) {
				result.headerAnyOf[dataField] = included;
			} else {
				result.headerAnyOf[dataField] = ['__NO_MATCH__'];
			}
		}
	}

	private cloneGridFilters(source: ParsedGridFilters): ParsedGridFilters {
		return {
			estado: source.estado,
			filterRow: { ...source.filterRow },
			filterRowExact: { ...source.filterRowExact },
			headerAnyOf: { ...source.headerAnyOf },
		};
	}

	private getActiveHeaderFilterFields(grid: any): Set<string> {
		const fields = new Set<string>();

		if (!grid?.getVisibleColumns) {
			return fields;
		}

		for (const column of grid.getVisibleColumns()) {
			const dataField = column?.dataField;
			if (!dataField || column.allowHeaderFiltering === false) {
				continue;
			}

			const selection = getColumnHeaderFilterSelection(grid, dataField);
			if (hasColumnHeaderFilterSelection(selection) && selection!.filterType !== 'exclude') {
				fields.add(dataField);
			}
		}

		return fields;
	}

	private flattenFilter(node: any): any[] {
		if (!Array.isArray(node) || !node.length) {
			return [];
		}

		if (node.length === 3 && (node[1] === 'and' || node[1] === 'or') && Array.isArray(node[0])) {
			return [...this.flattenFilter(node[0]), ...this.flattenFilter(node[2])];
		}

		if (typeof node[0] === 'string' && node.length >= 3) {
			return [node];
		}

		return node.flatMap((child) => this.flattenFilter(child));
	}

	private mergeAnyOfValues(current: unknown[] | undefined, incoming: unknown[]): unknown[] {
		const merged = [...(current ?? []), ...incoming];
		const seen = new Set<string>();

		return merged.filter((value) => {
			const key = value === null || value === undefined ? '__null__' : `${typeof value}:${value}`;
			if (seen.has(key)) {
				return false;
			}

			seen.add(key);
			return true;
		});
	}

	private getGridSort(sort: any): { field: string; desc: boolean } | null {
		if (!Array.isArray(sort) || !sort.length) {
			return null;
		}

		const first = sort[0];
		if (!first?.selector) {
			return null;
		}

		return {
			field: `${first.selector}`,
			desc: !!first.desc,
		};
	}

	private cambiarEstado(row: ScCompetenciasTecnicas, activo: boolean): void {
		const request = { ...row, ESTADO_COMPETENCIAS_TECNICAS: activo };
		const action = activo ? this.service.activar(request) : this.service.desactivar(request);

		this.loadingVisible = true;
		action.pipe(take(1)).subscribe({
			next: (response: any) => {
				if (response.Result) {
					this.consultar();
					this.notifyFx(activo ? 'Registro activado con exito!' : 'Registro desactivado con exito!', NotifyType.Success);
				} else {
					this.notifyFx(response.ErrorMessage || 'No se pudo cambiar el estado del registro.', NotifyType.Error);
				}
				this.loadingVisible = false;
			},
			error: (error: any) => {
				this.notifyFx(this.getErrorMessage(error), NotifyType.Error);
				this.loadingVisible = false;
			},
		});
	}

	private eliminarRegistro(row: ScCompetenciasTecnicas): void {
		this.loadingVisible = true;
		this.service
			.delete(row)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.consultar();
						this.notifyFx('Registro eliminado con exito!', NotifyType.Success);
					} else {
						this.notifyFx(
							response.ErrorMessage || 'No se puede eliminar la competencia porque tiene registros asociados.',
							NotifyType.Warning
						);
					}
					this.loadingVisible = false;
				},
				error: (error: any) => {
					this.notifyFx(this.getErrorMessage(error), NotifyType.Error);
					this.loadingVisible = false;
				},
			});
	}

	private confirmEstado(title: string, message: string, fn: () => void): void {
		const dialog = custom({
			title,
			messageHtml: `<div class="sguees-confirm-message">${message}</div>`,
			buttons: [
				{ text: 'Si', type: 'default', onClick: () => true },
				{ text: 'No', onClick: () => false },
			],
		});

		dialog.show().then((accepted: boolean) => {
			if (accepted) {
				fn();
			}
		});
	}

	private getErrorMessage(error: any): string {
		if (typeof error === 'string' && error.trim()) {
			return error;
		}

		return (
			error?.error?.ErrorMessage ||
			error?.error?.message ||
			error?.message ||
			'Ocurrio un error al procesar la solicitud.'
		);
	}

	private getNotifyType(response: any): NotifyType {
		if (isEmpresaWarningResponse(response)) {
			return NotifyType.Warning;
		}
		return this.isValidationWarningResponse(response) ? NotifyType.Warning : NotifyType.Error;
	}

	private getErrorNotifyType(error: any): NotifyType {
		const body = error?.error;
		if (body && typeof body === 'object' && body.ErrorMessage !== undefined) {
			return this.getNotifyType(body);
		}

		return this.isValidationWarningMessage(this.getErrorMessage(error)) ? NotifyType.Warning : NotifyType.Error;
	}

	private isValidationWarningResponse(response: any): boolean {
		if (!response || response.Result !== false) {
			return false;
		}

		if (response.ErrorCode === 2627) {
			return true;
		}

		const source = `${response.ErrorSource ?? ''}`;
		if (response.ErrorCode === -1 && source.includes('SC_COMPETENCIAS_TECNICASService')) {
			return true;
		}

		return this.isValidationWarningMessage(response.ErrorMessage);
	}

	private isValidationWarningMessage(message: string): boolean {
		const value = `${message ?? ''}`.toLowerCase();
		if (isEmpresaFkErrorMessage(message) || value.includes('no tiene una empresa asignada')) {
			return true;
		}

		return (
			value.includes('ya existe') ||
			value.includes('duplicad') ||
			value.includes('registrad') ||
			value.includes('otro usuario guard') ||
			value.includes('debe ') ||
			value.includes('no puede superar') ||
			value.includes('solo puede contener') ||
			value.includes('no es valido') ||
			value.includes('no se encontro') ||
			value.includes('debe iniciar con') ||
			value.includes('tiene registros hijos')
		);
	}

	private getCorrEmpresaSesion(): number {
		const value = Number(this.authService.decodedToken?.CORR_EMPRESA ?? 0);
		return Number.isFinite(value) ? value : 0;
	}

	private validarEmpresaSesion(): boolean {
		if (this.getCorrEmpresaSesion() > 0) {
			return true;
		}
		this.notifyFx(getEmpresaWarningMessage(EMPRESA_REGISTRO_ETIQUETA), NotifyType.Warning);
		return false;
	}

	private getWarningMessage(message: string): string {
		const cleanMessage = `${message ?? ''}`.replace(/^error:\s*/i, '').trim();
		const value = cleanMessage.toLowerCase();
		if (isEmpresaFkErrorMessage(cleanMessage) || value.includes('no tiene una empresa asignada')) {
			return getEmpresaWarningMessage(EMPRESA_REGISTRO_ETIQUETA);
		}
		if (this.isValidationWarningMessage(cleanMessage)) {
			return cleanMessage;
		}
		if (value.includes('hijos asociados') || value.includes('registros asociados') || value.includes('asociados')) {
			return 'No se puede eliminar porque tiene competencias hijas o registros relacionados.';
		}
		return cleanMessage;
	}
}
