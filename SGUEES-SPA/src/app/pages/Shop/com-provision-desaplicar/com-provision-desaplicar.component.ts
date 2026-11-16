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
import { ComProvisionDesAplicarService } from './com-provision-desaplicar.service';

@Component({
	standalone: false,
	selector: 'app-com-provision-desaplicar',
	templateUrl: './com-provision-desaplicar.component.html',
	styleUrls: ['./com-provision-desaplicar.component.scss'],
})
export class ComProvisionDesAplicarComponent extends CBaseComponent implements OnInit {
	//#region <Declarando Variables>
	readOnly = false;
	vFECHA_INICIAL: any;
	vFECHA_FINAL: any;
	allowEditing = false;
	// #endregion

	constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ComProvisionDesAplicarService
	) {
		super(appInfoService, router);
	}

	//#region <Inicializando Opciones>
	ngOnInit(): void {
		this.inicializaOpciones();
		this.llenaComboBox();
		this.consultar();
	}

	inicializaOpciones() {
		this.vFECHA_INICIAL = this.appInfoService.dateAdd(this.appInfoService.getDate(), 'day', -30);
		this.vFECHA_FINAL = this.appInfoService.getDate();
	}
	// #endregion

	//#region <Manejo de Combos>
	llenaComboBox() {}
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
		this.service
			.getAllDesAplicar(this.fillParam())
			.pipe(take(1))
			.subscribe({
				next: (response: any) => {
					if (response.Result) {
						this.models = response.Data;
					}
					this.loadingVisible = false;
				},
				error: (error: any) => {
					this.loadingVisible = false;
					this.notifyFx(error, NotifyType.Error);
				},
			});
	}

	onExporting(e: any) {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('ProvisionesDesaplicar');

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
				saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'ProvisionesDesaplicar.xlsx');
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
			this.notifyFx('Seleccione al menos una provisión', NotifyType.Warning);
			return;
		}

		const confirpreli = custom({
			title: 'Confirmación de Desaplicar',
			messageHtml: '¿Realmente quiere desaplicar las provisiones seleccionadas?',
			buttons: [
				{
					text: 'Sí',
					onClick: () => {
						selectedModels.forEach((x: any) => {
							this.service
								.DesAplicar(x)
								.pipe(take(1))
								.subscribe({
									next: (response: any) => {
										if (response.Result || response.ErrorCode === 0) {
											this.notifyFx('Desaplicado con éxito!', NotifyType.Success);
										} else {
											this.notifyFx(response.ErrorMessage, NotifyType.Error);
										}
										this.consultar();
										this.loadingVisible = false;
									},
									error: (error: any) => {
										this.notifyFx(error, NotifyType.Error);
										this.loadingVisible = false;
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
		confirpreli.show();
	}
	// #endregion
}
