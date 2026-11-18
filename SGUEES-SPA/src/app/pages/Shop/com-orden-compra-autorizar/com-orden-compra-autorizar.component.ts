import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { custom } from 'devextreme/ui/dialog';
import { exportDataGrid } from 'devextreme/excel_exporter';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver-es';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ComOrdenCompraAutorizarService } from './com-orden-compra-autorizar.service';

@Component({
	standalone: false,
	selector: 'app-com-orden-compra-autorizar',
	templateUrl: './com-orden-compra-autorizar.component.html',
	styleUrls: ['./com-orden-compra-autorizar.component.scss'],
})
export class ComOrdenCompraAutorizarComponent extends CBaseComponent implements OnInit {
	//#region <Declarando Variables>
	readOnly = false;
	allowEditing = false;
	vFECHA_INICIAL: any;
	vFECHA_FINAL: any;
	btnAutorizar = 'Autorizar orden de compra';
	btnAnular = 'Anular';
	mCOM_ORDEN_COMPRA_DETA: any[] = [];
	// #endregion

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ComOrdenCompraAutorizarService,
	) {
		super(appInfoService, router);
	}

	//#region <Inicializando Opciones>
	ngOnInit(): void {
		this.inicializaOpciones();
		this.consultar();
	}

	inicializaOpciones() {
		this.vFECHA_INICIAL = this.appInfoService.dateAdd(this.appInfoService.getDate(), 'day', -30);
		this.vFECHA_FINAL = this.appInfoService.getDate();
	}
	// #endregion

	//#region <Metodos Mtto>
	fillParam(): any {
		return {
			FECHA_INICIAL: this.vFECHA_INICIAL.toISOString(),
			FECHA_FINAL: this.vFECHA_FINAL.toISOString(),
		};
	}

	consultar() {
		this.loadingVisible = true;
		this.mCOM_ORDEN_COMPRA_DETA = [];
		this.service
			.getPendientesAutorizar(this.fillParam())
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.models = (response.Data || []).map((row: any) => ({
							...row,
							SELECCION: !!row.SELECCION,
						}));
					} else {
						this.models = [];
						this.notifyFx(response.ErrorMessage || 'No se pudo consultar', NotifyType.Error);
					}
					this.loadingVisible = false;
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.models = [];
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	onExporting(e: any) {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('OrdenesAutorizar');

		function setAlternatingRowsBackground(gridCell: any, excelCell: any): void {
			if (gridCell.rowType === 'header' || gridCell.rowType === 'data') {
				if (excelCell.fullAddress.row % 2 === 0) {
					excelCell.fill = {
						type: 'pattern',
						pattern: 'solid',
						fgColor: { argb: 'D3D3D3' },
						bgColor: { argb: 'D3D3D3' },
					};
				}
			}
		}

		exportDataGrid({
			worksheet,
			component: e.component,
			keepColumnWidths: true,
			autoFilterEnabled: true,
			topLeftCell: { row: 1, column: 1 },
			customizeCell: ({ gridCell, excelCell }) => {
				setAlternatingRowsBackground(gridCell, excelCell);
			},
		}).then(() => {
			workbook.xlsx.writeBuffer().then((buffer: BlobPart) => {
				saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'OrdenesCompraAutorizar.xlsx');
			});
		});
	}

	selectTodos() {
		this.models.forEach((x: any) => {
			x.SELECCION = true;
		});
	}

	selectNinguno() {
		this.models.forEach((x: any) => {
			x.SELECCION = false;
		});
	}

	private getSeleccionados(): any[] {
		return (this.models || []).filter((y: { SELECCION: boolean }) => y.SELECCION === true);
	}

	focusedRowChanged(e: any) {
		const row = e?.row?.data;
		if (!row?.CORR_ORDEN_COMPRA) {
			this.mCOM_ORDEN_COMPRA_DETA = [];
			return;
		}
		this.model = row;
		this.service
			.getDetalle({
				ANIO_PERIODO: row.ANIO_PERIODO,
				CORR_ORDEN_COMPRA: row.CORR_ORDEN_COMPRA,
			})
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.mCOM_ORDEN_COMPRA_DETA = response.Data || [];
					} else {
						this.mCOM_ORDEN_COMPRA_DETA = [];
					}
				},
				error: () => {
					this.mCOM_ORDEN_COMPRA_DETA = [];
				},
			});
	}

	autorizar() {
		const selectedModels = this.getSeleccionados();
		if (selectedModels.length <= 0) {
			this.notifyFx('Seleccione al menos una orden de compra', NotifyType.Warning);
			return;
		}

		const confir = custom({
			title: 'Confirmación de Autorización',
			messageHtml: '¿Realmente quiere autorizar las órdenes de compra seleccionadas?',
			buttons: [
				{
					text: 'Sí',
					onClick: () => {
						this.loadingVisible = true;
						let pendientes = selectedModels.length;
						selectedModels.forEach((x: any) => {
							this.service
								.Autorizar(x)
								.pipe(take(1))
								.subscribe({
									next: (response: any) => {
										if (response.Result || response.ErrorCode === 0) {
											this.notifyFx('Orden autorizada con éxito!', NotifyType.Success);
										} else {
											this.notifyFx(response.ErrorMessage, NotifyType.Error);
										}
										pendientes -= 1;
										if (pendientes <= 0) {
											this.consultar();
										}
									},
									error: (error: any) => {
										this.notifyFx(error, NotifyType.Error);
										pendientes -= 1;
										if (pendientes <= 0) {
											this.loadingVisible = false;
											this.consultar();
										}
									},
								});
						});
					},
				},
				{
					text: 'No',
					onClick: () => false,
				},
			],
		});
		confir.show();
	}

	anular() {
		const selectedModels = this.getSeleccionados();
		if (selectedModels.length <= 0) {
			this.notifyFx('Seleccione al menos una orden de compra', NotifyType.Warning);
			return;
		}

		const confir = custom({
			title: 'Confirmación de Anulación',
			messageHtml: '¿Realmente quiere anular las órdenes de compra seleccionadas?',
			buttons: [
				{
					text: 'Sí',
					onClick: () => {
						this.loadingVisible = true;
						let pendientes = selectedModels.length;
						selectedModels.forEach((x: any) => {
							this.service
								.Anular(x)
								.pipe(take(1))
								.subscribe({
									next: (response: any) => {
										if (response.Result || response.ErrorCode === 0) {
											this.notifyFx('Orden anulada con éxito!', NotifyType.Success);
										} else {
											this.notifyFx(response.ErrorMessage, NotifyType.Error);
										}
										pendientes -= 1;
										if (pendientes <= 0) {
											this.consultar();
										}
									},
									error: (error: any) => {
										this.notifyFx(error, NotifyType.Error);
										pendientes -= 1;
										if (pendientes <= 0) {
											this.loadingVisible = false;
											this.consultar();
										}
									},
								});
						});
					},
				},
				{
					text: 'No',
					onClick: () => false,
				},
			],
		});
		confir.show();
	}
	// #endregion
}
