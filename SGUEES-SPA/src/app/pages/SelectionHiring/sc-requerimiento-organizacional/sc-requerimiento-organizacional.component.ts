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
	cloneRemoteGridFilters,
	hasRemoteFilterRowSearch,
	parseRemoteGridFilters,
	ParsedGridFilters,
} from 'src/app/shared/utils/remote-grid-filter.util';
import {
	clearGridHeaderFilterSelections,
	getColumnHeaderFilterSelection,
	invertEstadoExcludedHeaderFilterValues,
	invertExcludedHeaderFilterValues,
	isEstadoField,
	normalizeEstadoHeaderFilterValue,
	readGridFilterRowValues,
} from 'src/app/shared/utils/remote-header-filter.util';
import { ScRequerimientoOrganizacional } from './models/sc-requerimiento-organizacional';
import {
	EMPRESA_REGISTRO_ETIQUETA,
	getEmpresaWarningMessage,
	isEmpresaFkErrorMessage,
	isEmpresaWarningResponse,
	ScRequerimientoOrganizacionalService,
} from './sc-requerimiento-organizacional.service';

const GRID_FILTER_CONFIG = { estadoField: 'ESTADO_REQUERIMIENTO_ORGANIZACIONAL' };

@Component({
	selector: 'app-sc-requerimiento-organizacional',
	templateUrl: './sc-requerimiento-organizacional.component.html',
	styleUrls: ['./sc-requerimiento-organizacional.component.scss'],
})
export class ScRequerimientoOrganizacionalComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	readonly pageSizes = [5, 10, 25, 50, 100];
	private readonly maintenanceSubtitulo = 'Mantenimiento de Requerimiento Organizacional';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScRequerimientoOrganizacionalService,
		private messageService: MessageService,
		private authService: AuthService
	) {
		super(appInfoService, router);
		this.onEditClick = this.onEditClick.bind(this);
		this.onEliminarClick = this.onEliminarClick.bind(this);
		this.onActivarClick = this.onActivarClick.bind(this);
		this.onDesactivarClick = this.onDesactivarClick.bind(this);
		this.columns = this.service.getColumns(this.onEditClick, this.onEliminarClick, this.onActivarClick, this.onDesactivarClick, this.permiteEdit, this.permiteDele);
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
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

	override rowDblClick(e: any): void {
		const rowData = e?.data ?? e?.row?.data;
		if (rowData) {
			this.model = this.fillData(rowData);
			this.modelUpdate = this.fillData(rowData);
		}
		super.rowDblClick(e);
		setTimeout(() => {
			if (!this.dataForm?.instance) {
				return;
			}
			this.dataForm.instance.option('formData', this.model);
			this.bloquear();
		});
	}

	onEditClick(e: any): void {
		if (!e?.row?.data) {
			return;
		}

		this.model = e.row.data;
		this.editarClick(e);
	}

	fillParam(
		xCORR_REQUERIMIENTO_ORGANIZACIONAL?: number,
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
			CORR_REQUERIMIENTO_ORGANIZACIONAL: xCORR_REQUERIMIENTO_ORGANIZACIONAL ?? 0,
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
		const gridFilters = parseRemoteGridFilters(combinedFilter, grid, GRID_FILTER_CONFIG);
		const hasFilterRowSearch = hasRemoteFilterRowSearch(gridFilters);
		const filtersForDistinct: ParsedGridFilters = {
			estado: hasFilterRowSearch ? gridFilters.estado : null,
			filterRow: hasFilterRowSearch ? gridFilters.filterRow : {},
			filterRowExact: hasFilterRowSearch ? gridFilters.filterRowExact : {},
			headerAnyOf: {},
		};

		return lastValueFrom(
			this.service.getDistinctValues(
				this.fillParam(0, 1, 0, '', filtersForDistinct, field, searchValue ?? '')
			)
		).then((response) => {
			if (!response.Result) {
				throw new Error(response.ErrorMessage || 'No se pudieron cargar los valores del filtro.');
			}

			return response.Data ?? [];
		});
	};

	override fillData(xModel?: ScRequerimientoOrganizacional): ScRequerimientoOrganizacional {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_REQUERIMIENTO_ORGANIZACIONAL: xModel.CORR_REQUERIMIENTO_ORGANIZACIONAL,
				DESCRIPCION: xModel.DESCRIPCION,
				ESTADO_REQUERIMIENTO_ORGANIZACIONAL: xModel.ESTADO_REQUERIMIENTO_ORGANIZACIONAL,
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
			CORR_REQUERIMIENTO_ORGANIZACIONAL: 0,
			DESCRIPCION: '',
			ESTADO_REQUERIMIENTO_ORGANIZACIONAL: true,
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: new Date(),
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: new Date(),
		};
	}

	consultar(): void {
		this.dataGrid?.refreshData(true);
	}

	override nuevo(): void {
		if (!this.validarEmpresaSesion()) {
			return;
		}
		super.nuevo();
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

		const formData = this.dataForm?.instance?.option('formData');
		if (formData) {
			this.model = { ...this.model, ...formData };
		}

		const formValidation = this.dataForm?.instance?.validate();
		if (formValidation && !formValidation.isValid) {
			this.service.esValido(this.model, this.notifyFx.bind(this));
			return;
		}

		if (!this.service.esValido(this.model, this.notifyFx.bind(this))) {
			return;
		}

		this.loadingVisible = true;
		if (this.banderaMtto === UpdateType.Add) {
			this.service
				.insert(this.model)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.model = response.Data;
							this.AsignaStatus(UpdateType.Browse);
							this.consultar();
							this.notifyFx('Registro creado con exito!', NotifyType.Success);
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
		} else if (this.banderaMtto === UpdateType.Update) {
			this.service
				.update(this.model)
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (response.Result) {
							this.model = response.Data;
							this.AsignaStatus(UpdateType.Browse);
							this.consultar();
							this.notifyFx('Registro modificado con exito!', NotifyType.Success);
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
	}

	override cancelar(): void {
		this.model = this.modelUpdate;
		this.AsignaStatus(UpdateType.Browse);
		this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
	}

	onActivarClick(e: any): void {
		const row = e.row?.data as ScRequerimientoOrganizacional;
		if (!row) {
			return;
		}

		this.confirmEstado(
			'Activar registro',
			`Desea activar el requerimiento organizacional "${row.DESCRIPCION}"?`,
			() => this.cambiarEstado(row, true)
		);
	}

	onEliminarClick(e: any): void {
		const row = e.row?.data as ScRequerimientoOrganizacional;
		if (!row) {
			return;
		}

		this.confirmEstado(
			'Eliminar registro',
			`Desea eliminar "${row.DESCRIPCION}"?`,
			() => this.eliminarRegistro(row)
		);
	}

	onDesactivarClick(e: any): void {
		const row = e.row?.data as ScRequerimientoOrganizacional;
		if (!row) {
			return;
		}

		this.confirmEstado(
			'Desactivar registro',
			`Desea desactivar "${row.DESCRIPCION}"?`,
			() => this.cambiarEstado(row, false)
		);
	}

	rowRemoving(e: any): void {
		e.cancel = true;
		this.onEliminarClick({ row: { data: e.data } });
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_REQUERIMIENTO_ORGANIZACIONAL')?.option('readOnly', true);
		this.dataForm.instance.getEditor('DESCRIPCION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTADO_REQUERIMIENTO_ORGANIZACIONAL')?.option('readOnly', true);
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('DESCRIPCION')?.focus();
		});
	}

	private configurarDataSource(): void {
		this.models = new CustomStore({
			key: 'CORR_REQUERIMIENTO_ORGANIZACIONAL',
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

				const gridFilters = parseRemoteGridFilters(loadOptions.filter, grid, GRID_FILTER_CONFIG);
				if (!hasRemoteFilterRowSearch(gridFilters)) {
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
					throw new Error(response.ErrorMessage || 'No se pudo cargar el requerimiento organizacional.');
				}

				return {
					data: response.Data || [],
					totalCount: response.RowsAffected || 0,
				};
			},
		});
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

			if (isEstadoField(dataField)) {
				const included = invertEstadoExcludedHeaderFilterValues(
					selection.values.map((item) => normalizeEstadoHeaderFilterValue(item))
				);
				result.headerAnyOf[dataField] = included.length ? included : ['__NO_MATCH__'];
				continue;
			}

			const filtersForDistinct = cloneRemoteGridFilters(result);
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
			result.headerAnyOf[dataField] = included.length ? included : ['__NO_MATCH__'];
		}
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

	private cambiarEstado(row: ScRequerimientoOrganizacional, activo: boolean): void {
		const request = { ...row, ESTADO_REQUERIMIENTO_ORGANIZACIONAL: activo };
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

	private eliminarRegistro(row: ScRequerimientoOrganizacional): void {
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
							response.ErrorMessage || 'No se puede eliminar el requerimiento organizacional porque tiene registros asociados en otras tablas.',
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
				{
					text: 'Si',
					type: 'default',
					onClick: () => true,
				},
				{
					text: 'No',
					onClick: () => false,
				},
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
		const message = (response?.ErrorMessage || '').toLowerCase();
		return response?.ErrorCode === 2627 || message.includes('ya existe') || message.includes('duplicad')
			? NotifyType.Warning
			: NotifyType.Error;
	}

	private getErrorNotifyType(error: any): NotifyType {
		return isEmpresaFkErrorMessage(this.getErrorMessage(error)) ? NotifyType.Warning : NotifyType.Error;
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
		if (value.includes('ya existe') || value.includes('duplicad')) {
			return 'Ya existe un registro con ese código. Escriba otro código para continuar.';
		}
		if (value.includes('hijos asociados') || value.includes('registros asociados') || value.includes('asociados')) {
			return 'No se puede eliminar porque tiene registros relacionados. Revise los datos asociados antes de continuar.';
		}
		return cleanMessage;
	}
}


