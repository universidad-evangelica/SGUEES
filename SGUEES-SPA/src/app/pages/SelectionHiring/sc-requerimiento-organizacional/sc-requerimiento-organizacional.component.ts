import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import CustomStore from 'devextreme/data/custom_store';
import { custom } from 'devextreme/ui/dialog';
import { lastValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ScRequerimientoOrganizacional } from './models/sc-requerimiento-organizacional';
import { ScRequerimientoOrganizacionalService } from './sc-requerimiento-organizacional.service';

type EstadoFiltro = boolean | null;

@Component({ selector: 'app-sc-requerimiento-organizacional', templateUrl: './sc-requerimiento-organizacional.component.html', styleUrls: ['./sc-requerimiento-organizacional.component.scss'] })
export class ScRequerimientoOrganizacionalComponent extends CBaseComponent implements OnInit {
	@ViewChild(DataGridMttoComponent, { static: false }) dataGrid!: DataGridMttoComponent;

	readonly pageSizes = [5, 10, 25, 50, 100];
	private readonly maintenanceSubtitulo = 'Mantenimiento de Requerimiento Organizacional';

	constructor(public override appInfoService: AppInfoService, public override router: ActivatedRoute, private service: ScRequerimientoOrganizacionalService) {
		super(appInfoService, router);
		this.onEditClick = this.onEditClick.bind(this);
		this.onEliminarClick = this.onEliminarClick.bind(this);
		this.onActivarClick = this.onActivarClick.bind(this);
		this.onDesactivarClick = this.onDesactivarClick.bind(this);
		this.columns = this.service.getColumns(this.onEditClick, this.onEliminarClick, this.onActivarClick, this.onDesactivarClick);
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

	onEditClick(e: any): void {
		if (!e?.row?.data) return;
		this.model = e.row.data;
		this.editarClick(e);
	}

	fillParam(xCORR_REQUERIMIENTO_ORGANIZACIONAL?: number, page = 1, pageSize = 5, busqueda = '', estado: EstadoFiltro = null, columnFilters: Record<string, any> = {}): any {
		return { CORR_REQUERIMIENTO_ORGANIZACIONAL: xCORR_REQUERIMIENTO_ORGANIZACIONAL ?? 0, BUSQUEDA: busqueda, ESTADO_REQUERIMIENTO_ORGANIZACIONAL: estado, PAGE: page, PAGE_SIZE: pageSize, ...columnFilters };
	}

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

	guardar(): void {
		if (!this.service.esValido(this.model, this.notifyFx.bind(this))) return;
		this.loadingVisible = true;
		const isAdd = this.banderaMtto === UpdateType.Add;
		const action = this.banderaMtto === UpdateType.Add ? this.service.insert(this.model) : this.service.update(this.model);
		action.pipe(take(1)).subscribe({
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
				this.notifyFx(this.getErrorMessage(error), NotifyType.Error);
				this.loadingVisible = false;
			},
		});
	}

	override cancelar(): void {
		this.model = this.modelUpdate;
		this.AsignaStatus(UpdateType.Browse);
		this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
	}

	onActivarClick(e: any): void {
		const row = e.row?.data as ScRequerimientoOrganizacional;
		if (!row) return;
		this.confirmEstado('Activar registro', 'Desea activar el requerimiento organizacional "' + row.DESCRIPCION + '"?', () => this.cambiarEstado(row, true));
	}

	onEliminarClick(e: any): void {
		const row = e.row?.data as ScRequerimientoOrganizacional;
		if (!row) return;
		this.confirmEstado('Eliminar registro', 'Desea eliminar "' + row.DESCRIPCION + '"?', () => this.eliminarRegistro(row));
	}

	onDesactivarClick(e: any): void {
		const row = e.row?.data as ScRequerimientoOrganizacional;
		if (!row) return;
		this.confirmEstado('Desactivar registro', 'Desea desactivar el requerimiento organizacional "' + row.DESCRIPCION + '"?', () => this.cambiarEstado(row, false));
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
		setTimeout(() => this.dataForm.instance.getEditor('DESCRIPCION')?.focus());
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
				const gridFilters = this.getGridFilters(loadOptions.filter);
				const estado = gridFilters.estado;
				const busqueda = '';
				const response = await lastValueFrom(this.service.getAll(this.fillParam(0, page, takeRows, busqueda, estado, gridFilters.columnas)));
				if (!response.Result) throw new Error(response.ErrorMessage || 'No se pudieron cargar los registros.');
				return { data: response.Data || [], totalCount: response.RowsAffected || 0 };
			},
		});
	}

	private getGridFilters(filter: any): { busqueda: string; estado: EstadoFiltro; columnas: Record<string, any> } {
		const result: { busqueda: string; estado: EstadoFiltro; columnas: Record<string, any> } = { busqueda: '', estado: null, columnas: {} };
		const visit = (node: any): void => {
			if (!Array.isArray(node)) return;
			if (typeof node[0] === 'string' && node.length >= 3) {
				const field = node[0];
				const value = node[2];
				if (field === 'ESTADO_REQUERIMIENTO_ORGANIZACIONAL') {
					if (value === '__ALL__' || value === null || value === undefined) { result.estado = null; return; }
					result.estado = value === true || value === 'true';
					return;
				}
				if (value !== null && value !== undefined && String(value).trim()) result.columnas[field] = value;
				return;
			}
			node.forEach((child) => visit(child));
		};
		visit(filter);
		return result;
	}

	private cambiarEstado(row: ScRequerimientoOrganizacional, activo: boolean): void {
		const request = { ...row, ESTADO_REQUERIMIENTO_ORGANIZACIONAL: activo };
		const action = activo ? this.service.activar(request) : this.service.desactivar(request);
		this.loadingVisible = true;
		action.pipe(take(1)).subscribe({
			next: (response: any) => {
				if (response.Result) { this.consultar(); this.notifyFx(activo ? 'Registro activado con exito!' : 'Registro desactivado con exito!', NotifyType.Success); }
				else this.notifyFx(response.ErrorMessage || 'No se pudo cambiar el estado del registro.', NotifyType.Error);
				this.loadingVisible = false;
			},
			error: (error: any) => { this.notifyFx(this.getErrorMessage(error), NotifyType.Error); this.loadingVisible = false; },
		});
	}

	private eliminarRegistro(row: ScRequerimientoOrganizacional): void {
		this.loadingVisible = true;
		this.service.delete(row).pipe(take(1)).subscribe({
			next: (response: any) => {
				if (response.Result) { this.consultar(); this.notifyFx('Registro eliminado con exito!', NotifyType.Success); }
				else this.notifyFx(response.ErrorMessage || 'No se puede eliminar el registro porque tiene registros asociados en otras tablas.', NotifyType.Error);
				this.loadingVisible = false;
			},
			error: (error: any) => { this.notifyFx(this.getErrorMessage(error), NotifyType.Error); this.loadingVisible = false; },
		});
	}

	private confirmEstado(title: string, message: string, fn: () => void): void {
		const dialog = custom({ title, messageHtml: '<div class="sguees-confirm-message">' + message + '</div>', buttons: [{ text: 'Si', type: 'default', onClick: () => true }, { text: 'No', onClick: () => false }] });
		dialog.show().then((accepted: boolean) => { if (accepted) fn(); });
	}

	private getErrorMessage(error: any): string {
		if (typeof error === 'string' && error.trim()) return error;
		return error?.error?.ErrorMessage || error?.error?.message || error?.message || 'Ocurrio un error al procesar la solicitud.';
	}

	private getNotifyType(response: any): NotifyType {
		return response?.ErrorCode === 2627 ? NotifyType.Warning : NotifyType.Error;
	}
}


