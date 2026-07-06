import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import CustomStore from 'devextreme/data/custom_store';
import { lastValueFrom } from 'rxjs';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { getApiErrorMessage } from 'src/app/shared/mtto/mtto-api-messages';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ScImpactoEconomico } from './models/sc-impacto-economico';
import { ScImpactoEconomicoService } from './sc-impacto-economico.service';

const ESTADO_FIELD = 'ESTADO_IMPACTO_ECONOMICO';

@Component({
	selector: 'app-sc-impacto-economico',
	templateUrl: './sc-impacto-economico.component.html',
})
export class ScImpactoEconomicoComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	protected override etiquetaRegistro = 'el impacto económico';
	protected override requiereEmpresaSesion = true;
	protected override mttoRemoteOperations = { paging: true, sorting: true, filtering: false };
	protected override mttoGridKeyExpr = 'CORR_IMPACTO_ECONOMICO';
	protected override mttoCampoEstado = ESTADO_FIELD;
	protected override mttoEstadoDescribeField = 'DESCRIPCION';

	private readonly maintenanceSubtitulo = 'Mantenimiento de Impacto Economico';

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ScImpactoEconomicoService
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
		this.subTituloVentana = this.maintenanceSubtitulo;
		this.configurarDataSource();
	}

	override AsignaStatus(xEstado: UpdateType): void {
		super.AsignaStatus(xEstado);
		if (xEstado === UpdateType.Browse) {
			this.subTituloVentana = this.maintenanceSubtitulo;
		}
	}
	//#endregion

	//#region <Metodos Mtto>
	fillParam(
		xCORR_IMPACTO_ECONOMICO?: number,
		page = 1,
		pageSize = this.mttoPageSize,
		sortField = '',
		sortDesc = false
	): any {
		return {
			CORR_IMPACTO_ECONOMICO: xCORR_IMPACTO_ECONOMICO ?? 0,
			PAGE: page,
			PAGE_SIZE: pageSize,
			SORT_FIELD: sortField,
			SORT_DESC: sortDesc,
		};
	}

	override fillData(xModel?: ScImpactoEconomico): ScImpactoEconomico {
		if (xModel !== undefined) {
			return {
				CORR_EMPRESA: xModel.CORR_EMPRESA,
				CORR_IMPACTO_ECONOMICO: xModel.CORR_IMPACTO_ECONOMICO,
				DESCRIPCION: xModel.DESCRIPCION,
				ESTADO_IMPACTO_ECONOMICO: xModel.ESTADO_IMPACTO_ECONOMICO,
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
			CORR_IMPACTO_ECONOMICO: 0,
			DESCRIPCION: '',
			ESTADO_IMPACTO_ECONOMICO: true,
			USUARIO_CREA: '',
			ESTACION_CREA: '',
			FECHA_CREA: new Date(),
			USUARIO_ACTU: '',
			ESTACION_ACTU: '',
			FECHA_ACTU: new Date(),
		};
	}

	consultar(resetPage = true): void {
		this.refrescarGridMtto(resetPage);
	}

	override nuevo(): void {
		if (!this.asegurarEmpresaSesion()) {
			return;
		}
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
		super.cancelar((item: any) => item.CORR_IMPACTO_ECONOMICO === this.modelUpdate.CORR_IMPACTO_ECONOMICO);
	}

	rowRemoving(e: any): void {
		this.rowRemovingMtto(e, {
			deleteFn: () => this.service.delete(this.fillParam(e.data.CORR_IMPACTO_ECONOMICO)),
		});
	}

	onActivarToolbar(): void {
		const row = this.obtenerFilaSeleccionada() as ScImpactoEconomico | null;
		if (!row) {
			this.notificarSeleccionRequerida();
			return;
		}

		this.confirmaAccion(
			'Activar registro',
			`Desea activar el impacto economico "${row.DESCRIPCION}"?`,
			() => this.cambiarEstado(row, true)
		);
	}

	onDesactivarToolbar(): void {
		const row = this.obtenerFilaSeleccionada() as ScImpactoEconomico | null;
		if (!row) {
			this.notificarSeleccionRequerida();
			return;
		}

		this.confirmaAccion(
			'Desactivar registro',
			`Desea desactivar "${row.DESCRIPCION}"?`,
			() => this.cambiarEstado(row, false)
		);
	}

	override bloquear(): void {
		this.dataForm.instance.getEditor('CORR_IMPACTO_ECONOMICO')?.option('readOnly', true);
		this.dataForm.instance.getEditor('DESCRIPCION')?.option('readOnly', true);
		this.dataForm.instance.getEditor('ESTADO_IMPACTO_ECONOMICO')?.option('readOnly', true);
	}

	override habilitar(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('CORR_IMPACTO_ECONOMICO')?.option('readOnly', true);
			this.dataForm.instance.getEditor('DESCRIPCION')?.option('readOnly', false);
			this.dataForm.instance.getEditor('ESTADO_IMPACTO_ECONOMICO')?.option('readOnly', false);
		});
	}

	override setFocus(): void {
		setTimeout(() => {
			this.dataForm.instance.getEditor('DESCRIPCION')?.focus();
		});
	}
	//#endregion

	//#region <Grid paginado servidor>
	private configurarDataSource(): void {
		this.models = new CustomStore({
			key: this.mttoGridKeyExpr,
			loadMode: 'processed',
			cacheRawData: false,
			load: async (loadOptions: any) => {
				try {
					const requestedTake = loadOptions.take;
					const pageSize = !requestedTake ? 0 : requestedTake;
					const skipRows = loadOptions.skip || 0;
					const page = pageSize > 0 ? Math.floor(skipRows / pageSize) + 1 : 1;
					const sort = this.getGridSort(loadOptions.sort);

					const response = await lastValueFrom(
						this.service.getAll(
							this.fillParam(0, page, pageSize, sort?.field ?? '', sort?.desc ?? false)
						)
					);

					if (!response.Result) {
						throw new Error(response.ErrorMessage || 'No se pudo cargar el impacto economico.');
					}

					return {
						data: response.Data || [],
						totalCount: response.RowsAffected || 0,
					};
				} catch (error) {
					this.notifyApiError(error);
					throw new Error(getApiErrorMessage(error));
				}
			},
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

	private cambiarEstado(row: ScImpactoEconomico, activo: boolean): void {
		const request = { ...row, ESTADO_IMPACTO_ECONOMICO: activo };
		this.ejecutarCambioEstado({
			activar: () => this.service.activar(request),
			desactivar: () => this.service.desactivar(request),
			activo,
		});
	}
	//#endregion
}
