import { Component, EventEmitter, Input, NgModule, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';

import { exportDataGrid } from 'devextreme/excel_exporter';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver-es';

@Component({
	selector: 'app-data-grid-mtto',
	templateUrl: './data-grid-mtto.component.html',
	styleUrls: ['./data-grid-mtto.component.scss'],
})
export class DataGridMttoComponent implements OnInit {
	@Input() models!: any;
	@Input() columns: any;
	@Input() summary: any;
	@Input() isBrowse: boolean = true;
	@Input() keyExpr: string | string[] = '';
	@Input() permiteEditar: boolean | Function = true;
	@Input() permiteDele: boolean | Function = true;
	@Output() rowDblClick = new EventEmitter<any>();
	@Output() rowClick = new EventEmitter<any>();
	@Output() rowRemoving = new EventEmitter<any>();
	@Output() focusedRowChanged = new EventEmitter<any>();
	@Output() editClick = new EventEmitter<any>();
  @Input() filterValue: any = null;

	constructor() {
		this.OneditClick = this.OneditClick.bind(this);
	}

	ngOnInit(): void {
      this.columns.push({
        type: 'buttons',
        name: 'btnEditar',
        visibleIndex: 0,
        width: 40,
        buttons: [
          { hint: 'Editar Registro', icon: 'edit', visible: this.permiteEditar, onClick: this.OneditClick }
        ],
      },
      {
        type: 'buttons',
        name: 'btnEliminar',
        visibleIndex: 1,
        width: 40,
        buttons: [
          { name: 'delete', visible: this.permiteDele }
        ],
      },
    );
	}

	OnrowDblClick(e: any) {
		this.rowDblClick.emit(e);
	}

	OnrowRemoving(e: any) {
		this.rowRemoving.emit(e);
	}

	OnfocusedRowChanged(e: any) {
		this.focusedRowChanged.emit(e);
	}

	OnRowClick(e: any) {
		this.rowClick.emit(e);
	}

	OneditClick(e: any) {
		this.editClick.emit(e);
	}

  onExporting(e: any) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

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
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'Data.xlsx');
      });
    });
  }
}

@NgModule({
	imports: [DxDataGridModule, CommonModule],
	declarations: [DataGridMttoComponent],
	exports: [DataGridMttoComponent],
})
export class DataGridMttoModule {}
