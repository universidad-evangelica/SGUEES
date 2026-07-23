import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { custom } from 'devextreme/ui/dialog';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { DataGridMttoComponent } from 'src/app/layouts/data-grid-mtto/data-grid-mtto.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { BanDocumentoDetaApiScope } from '../ban-documento/ban-documento-deta/ban-documento-deta.repository';
import { BanDocumentoDetaService } from '../ban-documento/ban-documento-deta/ban-documento-deta.service';
import {
	BanDocumentoProcesoModo,
	BanDocumentoProcesoService,
	FiltroContabilizado,
} from './ban-documento-proceso.service';

@Component({
	selector: 'app-ban-documento-proceso',
	templateUrl: './ban-documento-proceso.component.html',
	styleUrls: ['./ban-documento-proceso.component.scss'],
})
export class BanDocumentoProcesoComponent extends CBaseComponent implements OnInit {
	@ViewChild('gridProceso') gridProceso?: DataGridMttoComponent;

	modo: BanDocumentoProcesoModo = 'documento-aplicar';
	models: any[] = [];
	private modelsBase: any[] = [];
	vFECHA_INICIAL: Date = new Date();
	vFECHA_FINAL: Date = new Date();
	filtroContabilizado: FiltroContabilizado = 'pendiente';
	readonly filtroContabilizadoOpciones = [
		{ value: 'pendiente' as FiltroContabilizado, text: 'Pendientes de contabilizar' },
		{ value: 'contabilizado' as FiltroContabilizado, text: 'Contabilizados' },
		{ value: 'todos' as FiltroContabilizado, text: 'Todos' },
	];
	sinRegistrosMsg = '';
	btnAccion = '';
	btnDescontabilizar = '';

	documentoConsulta: any = {};
	detallesConsulta: any[] = [];
	documentoViewItems: any[] = [];
	detalleColumns: any[] = [];

	readonly documentoKeyExpr = ['ANIO_PERIODO', 'MES_PERIODO', 'CORR_TIPO_MOVIMIENTO', 'CORR_DOCUMENTO'];
	readonly documentoViewColCountByScreen = { xs: 1, sm: 1, md: 4, lg: 8 };

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: BanDocumentoProcesoService,
		private detaService: BanDocumentoDetaService
	) {
		super(appInfoService, router);
		this.columns = this.service.getColumns(this.modo);
	}

	ngOnInit(): void {
		const routeData = this.resolveRouteData();
		this.modo = (routeData['modo'] as BanDocumentoProcesoModo) || 'documento-aplicar';
		this.tituloVentana = (routeData['titulo'] as string) || this.service.getAccionLabel(this.modo);
		this.urlOpcion = this.service.getUrlOpcion(this.modo);
		this.getPermisos(this.appInfoService.getPermiso(this.urlOpcion));
		this.columns = this.service.getColumns(this.modo);
		this.summary = this.service.getSummary();
		this.documentoViewItems = this.service.getConsultaViewItems(this.esModoCheque());
		this.detalleColumns = this.service.getDetalleConsultaColumns();
		this.actualizarMensajeSinRegistros();
		this.refrescarBotones();

		const today = this.appInfoService.getDate();
		this.vFECHA_INICIAL = new Date(today.getFullYear(), today.getMonth(), 1);
		this.vFECHA_FINAL = new Date(today.getFullYear(), today.getMonth() + 1, 0);
		this.consultar();
	}

	esModoLote(): boolean {
		return this.service.esModoLote(this.modo);
	}

	esModoCheque(): boolean {
		return this.modo.startsWith('cheque');
	}

	private getDetaScope(): BanDocumentoDetaApiScope {
		return this.esModoCheque() ? 'cheque' : 'documento';
	}

	private resolveRouteData(): Record<string, unknown> {
		let route = this.router.snapshot;
		const merged: Record<string, unknown> = { ...route.data };
		while (route.firstChild) {
			route = route.firstChild;
			Object.assign(merged, route.data);
		}
		return merged;
	}

	refrescarBotones(): void {
		if (this.modo === 'cheque-imprimir') {
			this.btnAccion = this.permitePrint ? 'Imprimir Cheque' : '';
			this.btnDescontabilizar = '';
			return;
		}

		if (this.modo === 'documento-contabilizar') {
			this.btnAccion =
				this.permiteEdit && this.filtroContabilizado !== 'contabilizado' ? this.service.getAccionLabel(this.modo) : '';
			this.btnDescontabilizar =
				this.permiteEdit && this.filtroContabilizado !== 'pendiente' ? 'Des-contabilizar' : '';
			return;
		}

		this.btnAccion = this.permiteEdit ? this.service.getAccionLabel(this.modo) : '';
		this.btnDescontabilizar = '';
	}

	private actualizarMensajeSinRegistros(): void {
		if (this.modo !== 'documento-contabilizar') {
			this.sinRegistrosMsg = '';
			return;
		}

		if (this.filtroContabilizado === 'pendiente') {
			this.sinRegistrosMsg =
				'No hay documentos aplicados pendientes de contabilizar en el rango de fechas seleccionado.';
			return;
		}

		if (this.filtroContabilizado === 'contabilizado') {
			this.sinRegistrosMsg =
				'No hay documentos contabilizados en el rango de fechas. Verifique las fechas y pulse Consultar.';
			return;
		}

		this.sinRegistrosMsg = 'No hay documentos aplicados o impresos en el rango de fechas seleccionado.';
	}

	onFiltroContabilizadoChanged(): void {
		this.refrescarBotones();
		this.consultar();
	}

	private aplicarFiltroContabilizado(): void {
		if (this.modo !== 'documento-contabilizar') {
			this.models = this.modelsBase;
			return;
		}

		this.models = [...this.modelsBase];
		this.columns = this.service.getColumns(this.modo, this.filtroContabilizado === 'todos');
		this.actualizarMensajeSinRegistros();
	}

	fillParam(): any {
		const param: any = {
			FECHA_INICIAL: this.appInfoService.toDate(this.vFECHA_INICIAL),
			FECHA_FINAL: this.appInfoService.toDate(this.vFECHA_FINAL),
		};

		if (this.modo === 'documento-contabilizar') {
			param.FILTRO_ESTA_CONTABILIZADO = this.resolveFiltroContabilizadoApi();
		}

		return param;
	}

	private resolveFiltroContabilizadoApi(): number {
		if (this.filtroContabilizado === 'pendiente') {
			return 0;
		}
		if (this.filtroContabilizado === 'contabilizado') {
			return 1;
		}
		return -1;
	}

	private esContabilizado(row: any): boolean {
		const valor = row?.ESTA_CONTABILIZADO;
		return valor === true || valor === 1 || valor === '1';
	}

	consultar(): void {
		this.loadingVisible = true;
		this.service
			.getAll(this.modo, this.fillParam())
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (response.Result) {
						this.modelsBase = response.Data || [];
						this.aplicarFiltroContabilizado();
						if (this.esModoLote()) {
							setTimeout(() => this.gridProceso?.clearSelection());
						}
					} else {
						this.modelsBase = [];
						this.models = [];
						this.notifyFx(response.ErrorMessage || 'No se pudo consultar', NotifyType.Error);
					}
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.modelsBase = [];
					this.models = [];
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	selectTodos(): void {
		this.gridProceso?.selectAllOnPage();
	}

	selectNinguno(): void {
		this.gridProceso?.clearSelection();
	}

	override focusedRowChanged(e: any): void {
		if (e?.row?.data) {
			this.model = e.row.data;
		}
	}

	override rowDblClick(e: any): void {
		super.rowDblClick(e);
		const row = e?.data || e?.row?.data;
		if (!row) {
			return;
		}
		this.model = row;
		this.documentoConsulta = this.buildDocumentoConsulta(row);
		this.cargarDetalleConsulta(row);
	}

	private buildDocumentoConsulta(row: any): any {
		return {
			...row,
			ESTA_CONTABILIZADO: this.esContabilizado(row),
		};
	}

	private cargarDetalleConsulta(row: any): void {
		this.detallesConsulta = [];
		if (!row?.CORR_DOCUMENTO) {
			return;
		}

		this.detaService
			.getAll(this.getDetaScope(), {
				ANIO_PERIODO: row.ANIO_PERIODO,
				MES_PERIODO: row.MES_PERIODO,
				CORR_TIPO_MOVIMIENTO: row.CORR_TIPO_MOVIMIENTO,
				CORR_DOCUMENTO: row.CORR_DOCUMENTO,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.detallesConsulta = response.Data || [];
					}
				},
				error: (error: any) => this.notifyFx(error, NotifyType.Error),
			});
	}

	volverAlListado(): void {
		this.AsignaStatus(UpdateType.Browse);
		this.refrescarBotones();
	}

	ejecutarAccion(): void {
		if (this.esModoLote()) {
			this.contabilizarDocumentos();
			return;
		}

		if (!this.model?.CORR_DOCUMENTO) {
			this.notifyFx('Seleccione un registro en la grilla', NotifyType.Warning);
			return;
		}

		const titulo =
			this.modo === 'cheque-imprimir'
				? 'Confirmación de Impresión'
				: this.modo === 'documento-anular' || this.modo === 'cheque-anular'
					? 'Confirmación de Anulación'
					: 'Confirmación de Aplicar';
		const mensaje =
			this.modo === 'cheque-imprimir'
				? '¿Realmente quiere imprimir el cheque seleccionado?'
				: this.modo === 'documento-anular' || this.modo === 'cheque-anular'
					? '¿Realmente quiere anular el documento seleccionado?'
					: '¿Realmente quiere aplicar el documento seleccionado?';

		const confirma = custom({
			title: titulo,
			messageHtml: mensaje,
			buttons: [
				{
					text: 'Sí',
					onClick: () => {
						this.loadingVisible = true;
						this.service
							.ejecutar(this.modo, this.model)
							.pipe(take(1))
							.subscribe({
								next: (response: any) => {
									this.loadingVisible = false;
									if (response.Result && response.ErrorCode === 0) {
										this.notifyFx(this.service.getExitoLabel(this.modo), NotifyType.Success);
										this.consultar();
									} else {
										this.notifyFx(response.ErrorMessage, NotifyType.Error);
									}
								},
								error: (error: any) => {
									this.loadingVisible = false;
									this.notifyFx(error, NotifyType.Error);
								},
							});
					},
				},
				{ text: 'No', onClick: () => false },
			],
		});
		confirma.show();
	}

	descontabilizarDocumentos(): void {
		const seleccionados = (this.gridProceso?.getSelectedRows() ?? []).filter((row) => this.esContabilizado(row));
		if (!seleccionados.length) {
			this.notifyFx('Seleccione al menos un documento contabilizado', NotifyType.Warning);
			return;
		}

		const confirma = custom({
			title: 'Confirmación',
			messageHtml: `¿Realmente quiere des-contabilizar ${seleccionados.length} documento(s) bancario(s)?`,
			buttons: [
				{
					text: 'Sí',
					onClick: () => this.ejecutarDescontabilizacion(seleccionados),
				},
				{ text: 'No', onClick: () => false },
			],
		});
		confirma.show();
	}

	private contabilizarDocumentos(): void {
		const seleccionados = (this.gridProceso?.getSelectedRows() ?? []).filter((row) => !this.esContabilizado(row));
		if (!seleccionados.length) {
			this.notifyFx('Seleccione al menos un documento pendiente de contabilizar', NotifyType.Warning);
			return;
		}

		const confirma = custom({
			title: 'Confirmación',
			messageHtml: `¿Realmente quiere contabilizar ${seleccionados.length} documento(s) bancario(s)?`,
			buttons: [
				{
					text: 'Sí',
					onClick: () => this.ejecutarContabilizacion(seleccionados),
				},
				{ text: 'No', onClick: () => false },
			],
		});
		confirma.show();
	}

	private ejecutarContabilizacion(seleccionados: any[]): void {
		this.ejecutarLote(seleccionados, (row) => this.service.contabilizar(row), this.service.getExitoLabel(this.modo));
	}

	private ejecutarDescontabilizacion(seleccionados: any[]): void {
		this.ejecutarLote(
			seleccionados,
			(row) => this.service.descontabilizar(row),
			this.service.getDescontabilizarExitoLabel()
		);
	}

	private ejecutarLote(seleccionados: any[], accion: (row: any) => any, mensajeExito: string): void {
		this.loadingVisible = true;
		let errores = 0;
		let ultimoError = '';

		const procesar = (pos: number) => {
			if (pos >= seleccionados.length) {
				this.loadingVisible = false;
				if (errores === 0) {
					this.notifyFx(mensajeExito, NotifyType.Success);
				} else {
					this.notifyFx(
						`Se procesaron ${seleccionados.length - errores} documento(s). Último error: ${ultimoError}`,
						NotifyType.Warning
					);
				}
				this.consultar();
				return;
			}

			accion(seleccionados[pos])
				.pipe(take(1))
				.subscribe({
					next: (response: any) => {
						if (!response.Result || response.ErrorCode !== 0) {
							errores += 1;
							ultimoError = response.ErrorMessage || 'Error al procesar el documento';
						}
						procesar(pos + 1);
					},
					error: (error: any) => {
						errores += 1;
						ultimoError = String(error);
						procesar(pos + 1);
					},
				});
		};

		procesar(0);
	}
}
