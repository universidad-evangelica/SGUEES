import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, NgModule, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { DxDropDownBoxModule } from 'devextreme-angular/ui/drop-down-box';

@Component({
	selector: 'app-data-lookup',
	templateUrl: './data-lookup.component.html',
	styleUrls: ['./data-lookup.component.scss'],
})
export class DataLookupComponent implements OnInit, OnChanges {
	@Input() model!: any;
	@Input() valueExpr: string = 'Key';
	@Input() displayExpr: string = 'Value';
	@Input() value: any;
	@Input() selectedRowKeys!: Function;
	@Input() readOnly: boolean = false;
	@Input() showClearButton: boolean = false;
	@Input() setValue!: Function;
	@Input() lookupColumns: any[] | null = null;

	@Output() valueChange = new EventEmitter<any>();
	claseOpend = false;
	columns: any[] = [];

	constructor() {}

	ngOnInit(): void {
		this.buildColumns();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['lookupColumns'] && !changes['lookupColumns'].firstChange) {
			this.buildColumns();
		}
	}

	onGridBoxOptionChanged(e: any) {
		if (e.name === 'value') {
			this.claseOpend = false;
		}
	}

  onValueChanged(e: any) {
    this.valueChange.emit(this.value);
  }

	selectionChanged(selectedRowKeys: any) {
		if (selectedRowKeys.length > 0) {
			if (this.setValue) {
				this.setValue(this.selectedRowKeys(selectedRowKeys));
			}
			this.value = this.selectedRowKeys(selectedRowKeys);
			this.valueChange.emit(this.value);
		}
	}

	buildColumns(): void {
		if (this.lookupColumns?.length) {
			this.columns = [...this.lookupColumns];
			return;
		}

		this.columns = [];
		if (this.valueExpr !== this.displayExpr) {
			this.columns.push({ dataField: this.valueExpr, caption: 'Código', width: 0, visible: false });
		}
		this.columns.push({ dataField: this.displayExpr, caption: 'Descripción', width: '100%' });
	}
}

@NgModule({
	imports: [DxDropDownBoxModule, DxDataGridModule, CommonModule],
	declarations: [DataLookupComponent],
	exports: [DataLookupComponent],
})
export class DataLookupModule {}
