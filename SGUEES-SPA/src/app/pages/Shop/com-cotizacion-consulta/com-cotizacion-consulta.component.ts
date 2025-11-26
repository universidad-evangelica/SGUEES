import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { take } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

import { CBaseComponent } from 'src/app/FxAPI/CBaseComponent.component';
import { NotifyType } from 'src/app/shared/models/NotifyType';
import { UpdateType } from 'src/app/shared/models/UpdateType.enum';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { ComCotizacionConsultaService } from './com-cotizacion-consulta.service';
import { exportDataGrid } from 'devextreme/excel_exporter';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver-es';

@Component({
	selector: 'app-com-cotizacion-consulta',
	templateUrl: './com-cotizacion-consulta.component.html',
	styleUrls: ['./com-cotizacion-consulta.component.scss'],
})
export class ComCotizacionConsultaComponent extends CBaseComponent implements OnInit {

  //#region <Declarando Variales>
  isDropDownBoxOpened = false;
	readOnly = false;
  vFECHA_INICIAL: any;
	vFECHA_FINAL: any;
  isDrawerOpen = true;

  toolbarContent = [
    {
      widget: 'dxButton',
      location: 'before',
      options: {
        icon: 'menu',
        onClick: () => (this.isDrawerOpen = !this.isDrawerOpen),
      },
    },
  ];
	// #endregion
  constructor(
		public override appInfoService: AppInfoService,
		public override router: ActivatedRoute,
		private service: ComCotizacionConsultaService
	) {super(appInfoService, router);
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
	llenaComboBox() {
	}
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
		.getAll(this.fillParam())
		.pipe(take(1))
		.subscribe({
			next: (response: any) => {
				if (response.Result) {
					this.models = response.Data;
					this.loadingVisible = false;
				}
			},
			error: (error: any) => {
				this.loadingVisible = false;
				this.notifyFx(error, NotifyType.Error);
			},
		});
	}
	//#endregion

	selectedLookUpLista(vRow: any): any {
		return vRow[0].Key;
	}

  onExporting(e: any) {
		const workbook = new ExcelJS.Workbook();
		const worksheet = workbook.addWorksheet('CotizacionConsulta');

		function setAlternatingRowsBackground(gridCell: any, excelCell: any): void {
			if (gridCell.rowType === 'header' || gridCell.rowType === 'data') {
				if (excelCell.fullAddress.row % 2 === 0) {
          excelCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D3D3D3' }, bgColor: { argb: 'D3D3D3' }};
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
      }
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer: BlobPart) => {
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'CotizacionConsulta.xlsx');
			});
    });
 	}
}
