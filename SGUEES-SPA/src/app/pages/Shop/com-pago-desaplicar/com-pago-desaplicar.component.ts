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
import { ComPagoDesAplicarService } from './com-pago-desaplicar.service';

@Component({
	standalone: false,
	selector: 'app-com-pago-desaplicar',
	templateUrl: './com-pago-desaplicar.component.html',
	styleUrls: ['./com-pago-desaplicar.component.scss'],
})
export class ComPagoDesAplicarComponent extends CBaseComponent implements OnInit {
	//#region <Declarando Variables>
	readOnly = false;
	vFECHA_INICIAL: any;
	vFECHA_FINAL: any;
	allowEditing = false;
	// #endregion

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ComPagoDesAplicarService
	) {
		super(appInfoService, router);
		if (!this.tituloVentana?.trim()) {
			this.tituloVentana = router.snapshot.data['titulo'] || 'Desaplicar Pagos';
		}
		if (!this.urlOpcion || this.urlOpcion === '/') {
			this.urlOpcion = '/com-pago-desaplicar';
		}
	}

	//#region <Inicializando Opciones>
	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {
		this.vFECHA_INICIAL = this.appInfoService.dateAdd(this.appInfoService.getDate(), 'day', -1);
		this.vFECHA_FINAL = this.appInfoService.getDate();
	}
	// #endregion

	//#region <Manejo de Combos>
	llenaComboBox() {}
	//#endregion

	//#region <Metodos Mtto>
	fillParam(): any {
		return {
			FECHA_INICIAL: this.vFECHA_INICIAL.toISOString(),
			FECHA_FINAL: this.vFECHA_FINAL.toISOString(),
		};
	}

	consultar() {
		this.loadingVisible = true;
		this.service
			.getAllDesAplicar(this.fillParam())
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					this.loadingVisible = false;
					if (response.Result) {
						this.models = (response.Data || []).map((x: any) => ({
							...x,
							SELECCION: !!x.SELECCION,
						}));
					}
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}
	//#endregion

	onExporting(e: any) {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('PagosDesAplicar');

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
				saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'PagosDesAplicar.xlsx');
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

	desAplicar() {
		const selectedModels = this.models.filter((y: { SELECCION: boolean }) => y.SELECCION === true);
		if (selectedModels.length <= 0) {
			this.notifyFx('Debe seleccionar al menos un pago.', NotifyType.Warning);
			return;
		}

		const confir = custom({
			title: 'Confirmación de Desaplicar',
			messageHtml: '¿Realmente quiere desaplicar el pago?',
			buttons: [
				{
					text: 'Sí',
					onClick: () => {
						selectedModels.forEach((x: any) => {
							this.loadingVisible = true;
							this.service
								.DesAplicar(x)
								.pipe(take(1))
								.subscribe({
									next: (response: any) => {
										this.loadingVisible = false;
										if (response.Result) {
											this.notifyFx('Desaplicado con éxito!', NotifyType.Success);
										} else {
											this.notifyFx(response.ErrorMessage, NotifyType.Error);
										}
										this.consultar();
									},
									error: (error: any) => {
										this.loadingVisible = false;
										this.notifyFx(error, NotifyType.Error);
									},
								});
						});
					},
				},
				{ text: 'No', onClick: () => false },
			],
		});
		confir.show();
	}
}
