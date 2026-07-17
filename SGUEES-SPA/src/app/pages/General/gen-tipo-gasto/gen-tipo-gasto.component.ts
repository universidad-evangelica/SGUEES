import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import CustomStore from 'devextreme/data/custom_store';
import { lastValueFrom } from 'rxjs';
import { take } from 'rxjs/internal/operators/take';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
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
import { GenTipoGasto } from './models/gen-tipo-gasto';
import { GenTipoGastoService } from './gen-tipo-gasto.service';
import { IParam } from 'src/app/FxAPI/IParam';

@Component({
	selector: 'app-gen-tipo-gasto',
	templateUrl: './gen-tipo-gasto.component.html',
})
export class GenTipoGastoComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'el tipo de gasto';
	protected override requiereEmpresaSesion = true;
	protected override mttoHybridPaging = true;
	protected override mttoPageSize = 15;
	protected override mttoApiPageSize = 50;
	protected override mttoApiPageSizes: (number | 'all')[] = [50, 100, 'all'];
	protected override mttoRemoteOperations = { paging: true, sorting: true, filtering: false };
	protected override mttoGridKeyExpr = 'CORR_TIPO_GASTO';

	private readonly pagedStoreCacheState: MttoPagedStoreCacheState = createMttoPagedStoreCacheState(
		this.mttoPageSize,
		this.mttoApiPageSize
	);
	private pagedStoreInflightKey: string | null = null;
	private pagedStoreInflightPromise: Promise<MttoPagedStorePageResult> | null = null;

  //#region <Declarando Variales>
  readOnly = false;
  mGEN_TIPO_GASTO_IMPUESTO: any;
  mCORR_RUBRO: any;

  // #endregion
	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: GenTipoGastoService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns();
		this.summary = this.service.getSummary();
		this.items = this.service.getItems();
	}

	protected override getMttoDataGrid(): DataGridMttoComponent | null {
		return this.dataGrid ?? null;
	}

	//#region <Inicializando Opciones>
	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.configurarDataSource();
	}

	inicializaOpciones() {}
	// #endregion

	//#region <Manejo de Combos>
	llenaComboBox() {
    this.getCORR_RUBROLookup();
	}

  getCORR_RUBROLookup() {
    let xWhere: IParam[] = [{ Parameter: 'OPCION_CONSULTA', Value: 2 }];

    this.appInfoService
      .getLookUp('GEN_TIPO_GASTO', 'GEN_RUBRO', 'GetCORR_RUBRO', xWhere, environment.UrlGENERALAPI)
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.mCORR_RUBRO = response.Data;
          }
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
        },
      });
  }
	//#endregion

	//#region <Metodos Mtto>
	fillParam(
		xCORR_TIPO_GASTO?: number,
		page = 1,
		pageSize = this.mttoApiPageSize,
		sortField = '',
		sortDesc = false
	): any {
		return {
			CORR_TIPO_GASTO: xCORR_TIPO_GASTO ?? 0,
			PAGE: page,
			PAGE_SIZE: pageSize,
			SORT_FIELD: sortField,
			SORT_DESC: sortDesc,
		};
	}

	override fillData(xModel?: GenTipoGasto): GenTipoGasto {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_TIPO_GASTO: xModel.CORR_TIPO_GASTO,
				NOMBRE_TIPO_GASTO: xModel.NOMBRE_TIPO_GASTO,
				ES_SERVICIO: xModel.ES_SERVICIO,
				ES_INTANGIBLE: xModel.ES_INTANGIBLE,
			};
		} else {
			return {
				CORR_EMPRESA: 1,
				CORR_TIPO_GASTO: 0,
				NOMBRE_TIPO_GASTO: '',
				ES_SERVICIO: false,
				ES_INTANGIBLE: false,
			};
		}
	}

  override nuevo(): void {
    super.nuevo();
    this.consultarGEN_TIPO_GASTO_IMPUESTO();
  }
  override editarClick(e: any): void {
    this.model=e.row.data;
    super.editarClick(e);
    this.consultarGEN_TIPO_GASTO_IMPUESTO();
  }
  override rowDblClick(e: any): void {
    super.rowDblClick(e);
    this.consultarGEN_TIPO_GASTO_IMPUESTO();
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

	guardar(xTieneDetalle?: Function, data?: any): void {
		if (!xTieneDetalle) {
			this.guardarMtto({
				esValido: () => this.service.esValido(this.model, this.notifyFx.bind(this)),
				insert: () => this.service.insert(this.model),
				update: () => this.service.update(this.model),
			});
			return;
		}

		if (!this.service.esValido(this.model, this.notifyFx)) {
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
              if (xTieneDetalle) {
								this.AsignaStatus(UpdateType.Update);
								data.CORR_TIPO_GASTO = response.Data.CORR_TIPO_GASTO;
								this.consultar(false);
								xTieneDetalle(data);
							} else {
								this.AsignaStatus(UpdateType.Browse);
								this.notifyFx('Registro creado con exito!', NotifyType.Success);
							}
						} else {
							this.notifyFx(response.ErrorMessage, NotifyType.Error);
						}
						this.loadingVisible = false;
					},
					error: (error: any) => {
						this.notifyFx(error, NotifyType.Error);
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
							this.consultar(false);
							this.notifyFx('Registro modificado con exito!', NotifyType.Success);
						} else {
							this.notifyFx(response.ErrorMessage, NotifyType.Error);
						}
						this.loadingVisible = false;
					},
					error: (error: any) => {
						this.notifyFx(error, NotifyType.Error);
						this.loadingVisible = false;
					},
				});
		}
	}

	override cancelar(): void {
		super.cancelar((item: any) => item.CORR_TIPO_GASTO === this.modelUpdate.CORR_TIPO_GASTO);
	}

	rowRemoving(e: any) {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_TIPO_GASTO)),
		});
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_TIPO_GASTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('NOMBRE_TIPO_GASTO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ES_SERVICIO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ES_INTANGIBLE')?.option('readOnly', true);
		this.readOnly = true;
	}

  override habilitar(): void {
		this.readOnly = false;
	}
	override setFocus() {
		setTimeout(() => {
			this.dataForm.instance.getEditor('NOMBRE_TIPO_GASTO')?.focus();
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}
  selectedLookUpCORR_RUBRO(vRow: any): any {
		return vRow[0].CORR_RUBRO;
	}

  //#region <Impuestos>
  consultarGEN_TIPO_GASTO_IMPUESTO() {
    this.service
      .getAllGEN_TIPO_GASTO_IMPUESTO({ CORR_TIPO_GASTO: this.model.CORR_TIPO_GASTO })
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.mGEN_TIPO_GASTO_IMPUESTO = response.Data;
          }
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
        },
      });
  }

  gDataTipoGastoImpuestoInitNewRow(e:any){
    e.data.CORR_TIPO_GASTO = this.model.CORR_TIPO_GASTO;
    e.data.CORR_RUBRO = 0;
    e.data.IMPUESTO_INCLUIDO = false;
    e.data.ORDEN_TOTAL = 0;
    e.data.PERMITE_EDITAR = false;
  }

  gDataTipoGastoImpuestoRowInserting(e:any){
    e.data.CORR_TIPO_GASTO = this.model.CORR_TIPO_GASTO;
    this.loadingVisible = true;
    const isCanceled=new Promise((resolve, reject) => {
      let insertDeta = (data: any) => {
        this.service
          .insertGEN_TIPO_GASTO_IMPUESTO(data)
          .pipe(take(1))
          .subscribe({
            next: (response: any) => {
              if (response.Result) {
                data=response.Data;
                this.loadingVisible = false;
								this.notifyFx('Registro guardado con exito!', NotifyType.Success);
								resolve(false);
              }
            },
            error: (error: any) => {
              this.loadingVisible = false;
              this.notifyFx(error, NotifyType.Error);
              reject(error);
            },
          });
      }

      if (this.banderaMtto === UpdateType.Add) {
        if (!this.service.esValido(this.model, this.notifyFx)) {
					this.loadingVisible = false;
					reject('Debe completar la información del tipo de gasto');
				}
				this.guardar(insertDeta, e.data);
			} else if (this.banderaMtto === UpdateType.Update) {
				e.data.CORR_TIPO_GASTO = this.model.CORR_TIPO_GASTO;
				insertDeta(e.data);
			}
    });
    e.cancel=isCanceled;
  }

  gDataTipoGastoImpuestoRowUpdating(e:any){
    e.data.CORR_TIPO_GASTO = this.model.CORR_TIPO_GASTO;
    this.loadingVisible = true;
    this.service
      .updateGEN_TIPO_GASTO_IMPUESTO(e.data)
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.loadingVisible = false;
            this.notifyFx('Registro actualizado con éxito!', NotifyType.Success);
          }
        },
        error: (error: any) => {
          this.loadingVisible = false;
          this.notifyFx(error, NotifyType.Error);
        },
      });
  }

  gDataTipoGastoImpuestoRowRemoving(e:any){
    this.service
      .deleteGEN_TIPO_GASTO_IMPUESTO(e.data)
      .pipe(take(1))
      .subscribe({
        next: (response: any) => {
          if (response.Result) {
            this.notifyFx('Registro eliminado con éxito!', NotifyType.Success);
          }
        },
        error: (error: any) => {
          this.notifyFx(error, NotifyType.Error);
        },
      });
  }
  gDataTipoGastoImpuestoRowValidating(e:any){
    if (e.newData.CORR_RUBRO === 0) {
      this.loadingVisible = false;
      e.errorText = 'Debe seleccionar un rubro';
      e.isValid = false;
    }
  }
  //#endregion

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
			throw new Error(response.ErrorMessage || 'No se pudo cargar los tipos de gasto.');
		}

		return {
			data: response.Data || [],
			totalCount: response.RowsAffected || 0,
		};
	}
}
