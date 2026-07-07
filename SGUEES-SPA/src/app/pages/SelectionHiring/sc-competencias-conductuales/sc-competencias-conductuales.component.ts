import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import CustomStore from 'devextreme/data/custom_store';
import { PagerPageSize } from 'devextreme/common/grids';
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
	MttoPagedStoreCacheState,
	MttoPagedStorePageResult,
	rememberMttoPagedServerCache,
	resolveMttoPagedLoadParams,
	tryGetMttoPagedServerCache,
} from 'src/app/shared/mtto/mtto-paged-store.helpers';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ScCompetenciasConductuales } from './models/sc-competencias-conductuales';
import { ScCompetenciasConductualesService } from './sc-competencias-conductuales.service';

const ESTADO_FIELD = 'ESTADO_COMPETENCIAS_CONDUCTUALES';

@Component({
	selector: 'app-sc-competencias-conductuales',
	templateUrl: './sc-competencias-conductuales.component.html',
})
export class ScCompetenciasConductualesComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'la competencia conductual';
	protected override requiereEmpresaSesion = true;
	protected override mttoPageSize = 6;
	protected override mttoPageSizes: (number | PagerPageSize)[] = [5, 6, 10, 15, 20, 'all'];
	protected override mttoRemoteOperations = { paging: true, sorting: true, filtering: false };
	protected override mttoGridKeyExpr = 'CORR_COMPETENCIAS_CONDUCTUALES';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'NOMBRE_COMPETENCIAS_TECNICAS';

	mCORR_TIPO_PUESTO: any;
	readOnly = false;

	private readonly maintenanceSubtitulo = 'Mantenimiento de Competencias Conductuales';
	private readonly pagedStoreCacheState: MttoPagedStoreCacheState = createMttoPagedStoreCacheState(this.mttoPageSize);
	private pagedStoreInflightKey: string | null = null;
	private pagedStoreInflightPromise: Promise<MttoPagedStorePageResult> | null = null;

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

	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	ngOnInit(): void {
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.llenaComboBox();
		this.configurarDataSource();
	}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}

	llenaComboBox(): void {
		this.getCORR_TIPO_PUESTO();
	}

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

	selectedLookUpCORR_TIPO_PUESTO(vRow: any): any {
		return vRow[0].CORR_TIPO_PUESTO;
	}

	fillParam(
		xCORR_COMPETENCIAS_CONDUCTUALES?: number,
		page = 1,
		pageSize = this.mttoPageSize,
		sortField = '',
		sortDesc = false
	): any {
		return {
			CORR_COMPETENCIAS_CONDUCTUALES: xCORR_COMPETENCIAS_CONDUCTUALES ?? 0,
			PAGE: page,
			PAGE_SIZE: pageSize,
			SORT_FIELD: sortField,
			SORT_DESC: sortDesc,
		};
	}

	override fillData(xModel?: ScCompetenciasConductuales): ScCompetenciasConductuales {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_COMPETENCIAS_CONDUCTUALES: xModel.CORR_COMPETENCIAS_CONDUCTUALES,
				CORR_TIPO_PUESTO: xModel.CORR_TIPO_PUESTO,
				CODIGO_COMPETENCIAS_TECNICAS: xModel.CODIGO_COMPETENCIAS_TECNICAS,
				NOMBRE_COMPETENCIAS_TECNICAS: xModel.NOMBRE_COMPETENCIAS_TECNICAS,
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
			CODIGO_COMPETENCIAS_TECNICAS: '',
			NOMBRE_COMPETENCIAS_TECNICAS: '',
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

	consultar(resetPage = true): void {
		invalidateMttoPagedStoreCache(this.pagedStoreCacheState);
		this.pagedStoreInflightKey = null;
		this.pagedStoreInflightPromise = null;
		this.refrescarGridMtto(resetPage);
	}

	override nuevo(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
		this.readOnly = false;
		super.nuevo();
	}

	guardar(): void {
		this.guardarMtto({
			esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
			insert: () => this.service.insert(this.model),
			update: () => this.service.update(this.model),
		});
	}

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_COMPETENCIAS_CONDUCTUALES === this.modelUpdate.CORR_COMPETENCIAS_CONDUCTUALES);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_COMPETENCIAS_CONDUCTUALES)),
		});
	}

	activar_inactivar(): void {
		this.invocarActivarInactivar((row) => this.service.activarInactivar(row));
	}

	override bloquear(): void {
		this.readOnly = true;
		this.dataForm.instance.getEditor('CORR_COMPETENCIAS_CONDUCTUALES')?.option('readOnly', true);
		this.dataForm.instance.getEditor('CODIGO_COMPETENCIAS_TECNICAS')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_COMPETENCIAS_TECNICAS')?.option('readOnly', true);
		this.dataForm.instance.getEditor('DESCRIPCION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTADO_COMPETENCIAS_CONDUCTUALES')?.option('readOnly', true);
	}

	override habilitar(): void {
		this.readOnly = false;
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_COMPETENCIAS_CONDUCTUALES')?.option('readOnly', true);
			this.dataForm.instance.getEditor('CODIGO_COMPETENCIAS_TECNICAS')?.option('readOnly', false);
			this.dataForm.instance.getEditor('NOMBRE_COMPETENCIAS_TECNICAS')?.option('readOnly', false);
			this.dataForm.instance.getEditor('DESCRIPCION')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ESTADO_COMPETENCIAS_CONDUCTUALES')?.option('readOnly', false);
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CODIGO_COMPETENCIAS_TECNICAS')?.focus();
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
					const { page, pageSize, sortField, sortDesc, serverKey } = resolveMttoPagedLoadParams(
						loadOptions,
						this.pagedStoreCacheState.lastPageSize,
						this.mttoGridKeyExpr
					);

					const cached = tryGetMttoPagedServerCache(serverKey, this.pagedStoreCacheState);
					if (cached) {
						return cached;
					}

					if (this.pagedStoreInflightKey === serverKey && this.pagedStoreInflightPromise) {
						return this.pagedStoreInflightPromise;
					}

					this.pagedStoreInflightKey = serverKey;
					this.pagedStoreInflightPromise = this.fetchPagedCompetencias(
						page,
						pageSize,
						sortField,
						sortDesc,
						serverKey,
						loadGeneration
					);

					try {
						return await this.pagedStoreInflightPromise;
					} finally {
						if (this.pagedStoreInflightKey === serverKey) {
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

	private async fetchPagedCompetencias(
		page: number,
		pageSize: number,
		sortField: string,
		sortDesc: boolean,
		serverKey: string,
		loadGeneration: number
	): Promise<MttoPagedStorePageResult> {
		const response = await lastValueFrom(
			this.service.getAll(this.fillParam(0, page, pageSize, sortField, sortDesc))
		);

		if (loadGeneration !== this.pagedStoreCacheState.loadGeneration) {
			return { data: [], totalCount: 0 };
		}

		if (!response.Result) {
			throw new Error(response.ErrorMessage || 'No se pudo cargar las competencias conductuales.');
		}

		const result = {
			data: response.Data || [],
			totalCount: response.RowsAffected || 0,
		};

		rememberMttoPagedServerCache(serverKey, result, this.pagedStoreCacheState, pageSize);
		return result;
	}
}
