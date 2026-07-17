import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import CustomStore from 'devextreme/data/custom_store';
import { lastValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { getApiErrorMessage } from 'src/app/shared/mtto/mtto-api-messages';
import {
	createMttoPagedStoreCacheState,
	invalidateMttoPagedStoreCache,
	loadMttoHybridDisplayPage,
	MttoPagedStoreCacheState,
	MttoPagedStorePageResult,
	resolveMttoHybridLoadPlan,
	syncMttoHybridApiPageSize,
} from 'src/app/shared/mtto/mtto-paged-store.helpers';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { GenGerencia } from './models/gen-gerencia';
import { GenGerenciaService } from './gen-gerencia.service';

@Component({
	selector: 'app-gen-gerencia',
	templateUrl: './gen-gerencia.component.html',
})
export class GenGerenciaComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'la gerencia';
	protected override requiereEmpresaSesion = true;
	protected override mttoHybridPaging = true;
	protected override mttoPageSize = 15;
	protected override mttoApiPageSize = 50;
	protected override mttoApiPageSizes: (number | 'all')[] = [50, 100, 'all'];
	protected override mttoRemoteOperations = { paging: true, sorting: true, filtering: false };
	protected override mttoGridKeyExpr = 'CORR_GERENCIA';

	mCORR_DIVISION: any[] = [];
	readOnly = false;

	private readonly pagedStoreCacheState: MttoPagedStoreCacheState = createMttoPagedStoreCacheState(
		this.mttoPageSize,
		this.mttoApiPageSize
	);
	private pagedStoreInflightKey: string | null = null;
	private pagedStoreInflightPromise: Promise<MttoPagedStorePageResult> | null = null;

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenGerenciaService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.refreshFormItems();
	}

	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	ngOnInit(): void {
		this.configurarDataSource();
	}

	llenaComboBox(): void {
		if (this.mCORR_DIVISION.length > 0) {
			return;
		}
		this.getCORR_DIVISION();
	}

	getCORR_DIVISION(): void {
		this.appInfoService
			.getLookUp('GEN_GERENCIA', 'GEN_DIVISION', 'GetCORR_DIVISION', undefined, environment.UrlGENERALAPI)
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCORR_DIVISION = response.Data ?? [];
						this.refreshFormItems();
					}
				},
				error: (error: any) => {
					this.notifyApiError(error);
				},
			});
	}

	private refreshFormItems(): void {
		this.items = this.service.getItems({
			divisiones: this.mCORR_DIVISION,
			readOnly: this.readOnly,
		});

		if (this.dataForm?.instance) {
			this.dataForm.instance.option('items', this.items);
		}
	}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
	}

	override rowDblClick(e: any): void {
		const rowData = e?.data ?? e?.row?.data;
		if (rowData) {
			this.model = this.fillData(rowData);
			this.modelUpdate = this.fillData(rowData);
		}
		this.readOnly = true;
		this.llenaComboBox();
		super.rowDblClick(e);
		setTimeout(() => {
			if (!this.dataForm?.instance) {
				return;
			}
			this.dataForm.instance.option('formData', this.model);
			this.bloquear();
		});
	}

	fillParam(
		xCORR_GERENCIA?: number,
		page = 1,
		pageSize = this.mttoApiPageSize,
		sortField = '',
		sortDesc = false
	): any {
		return {
			CORR_GERENCIA: xCORR_GERENCIA ?? 0,
			PAGE: page,
			PAGE_SIZE: pageSize,
			SORT_FIELD: sortField,
			SORT_DESC: sortDesc,
		};
	}

	override fillData(xModel?: GenGerencia): GenGerencia {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_GERENCIA: xModel.CORR_GERENCIA,
				NOMBRE_GERENCIA: xModel.NOMBRE_GERENCIA,
				CODIGO_GERENCIA: xModel.CODIGO_GERENCIA,
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
			CORR_GERENCIA: 0,
			NOMBRE_GERENCIA: '',
			CODIGO_GERENCIA: '',
			CORR_DIVISION: null,
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

	consultar(resetPage = true): void {
		invalidateMttoPagedStoreCache(this.pagedStoreCacheState);
		this.pagedStoreInflightKey = null;
		this.pagedStoreInflightPromise = null;
		this.refrescarGridMtto(resetPage);
	}

	onApiPageSizeChange(apiPageSize: number): void {
		this.mttoApiPageSize = apiPageSize;
		syncMttoHybridApiPageSize(this.pagedStoreCacheState, apiPageSize);
		this.pagedStoreInflightKey = null;
		this.pagedStoreInflightPromise = null;
	}

	override nuevo(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		super.nuevo();
		this.readOnly = false;
		this.llenaComboBox();
		this.refreshFormItems();
	}

	guardar(): void {
		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
		});
	}

	override cancelar(): void {
		super.cancelar((item: GenGerencia) => item.CORR_GERENCIA === this.modelUpdate.CORR_GERENCIA);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(e.data),
		});
	}

	override bloquear(): void {
		this.readOnly = true;
		this.refreshFormItems();
		this.dataForm?.instance?.getEditor('CORR_GERENCIA')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('NOMBRE_GERENCIA')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('CODIGO_GERENCIA')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('CORR_DIVISION')?.option('readOnly', true);
	}

	override habilitar(): void {
		this.readOnly = false;
		this.refreshFormItems();
		this.dataForm?.instance?.getEditor('CORR_GERENCIA')?.option('readOnly', true);
		this.dataForm?.instance?.getEditor('NOMBRE_GERENCIA')?.option('readOnly', false);
		this.dataForm?.instance?.getEditor('CODIGO_GERENCIA')?.option('readOnly', false);
		this.dataForm?.instance?.getEditor('CORR_DIVISION')?.option('readOnly', false);
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_GERENCIA')?.focus();
		});
	}

	private configurarDataSource(): void {
		this.models = new CustomStore({
			key: this.mttoGridKeyExpr,
			loadMode: 'processed',
			cacheRawData: false,
			load: async (loadOptions: any) => {
				const loadGeneration = this.pagedStoreCacheState.loadGeneration;

				try {
					const plan = resolveMttoHybridLoadPlan(
						loadOptions,
						this.pagedStoreCacheState,
						this.mttoGridKeyExpr,
						this.mttoPageSize
					);

					if (this.pagedStoreInflightKey === plan.displayKey && this.pagedStoreInflightPromise) {
						return this.pagedStoreInflightPromise;
					}

					this.pagedStoreInflightKey = plan.displayKey;
					this.pagedStoreInflightPromise = loadMttoHybridDisplayPage(
						plan,
						this.pagedStoreCacheState,
						(apiPage, apiPageSize, sortField, sortDesc) =>
							this.fetchPaged(apiPage, apiPageSize, sortField, sortDesc, loadGeneration),
						this.mttoPageSize
					);

					try {
						return await this.pagedStoreInflightPromise;
					} finally {
						if (this.pagedStoreInflightKey === plan.displayKey) {
							this.pagedStoreInflightKey = null;
							this.pagedStoreInflightPromise = null;
						}
					}
				} catch (error) {
					this.notifyApiError(error);
					throw new Error(getApiErrorMessage(error));
				}
			},
		});
	}

	private async fetchPaged(
		page: number,
		pageSize: number,
		sortField: string,
		sortDesc: boolean,
		loadGeneration: number
	): Promise<MttoPagedStorePageResult> {
		const response = await lastValueFrom(
			this.service.getAll(this.fillParam(0, page, pageSize, sortField, sortDesc))
		);

		if (loadGeneration !== this.pagedStoreCacheState.loadGeneration) {
			return { data: [], totalCount: 0 };
		}

		if (!response.Result) {
			throw new Error(response.ErrorMessage || 'No se pudo cargar las gerencias.');
		}

		return {
			data: response.Data || [],
			totalCount: response.RowsAffected || 0,
		};
	}
}
