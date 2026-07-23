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
	@Input() dropDownWidth: number | string | null = null;

	@Output() valueChange = new EventEmitter<any>();
	claseOpend = false;
	columns: any[] = [];
	internalValue: any;

	constructor() {}

	ngOnInit(): void {
		this.buildColumns();
		this.syncInternalValue();
	}

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['lookupColumns'] && !changes['lookupColumns'].firstChange) {
			this.buildColumns();
		}
		if (changes['value'] || changes['model']) {
			this.syncInternalValue();
		}
	}

	onGridBoxOptionChanged(e: any) {
		if (e.name === 'value') {
			this.claseOpend = false;
		}
	}

	onValueChanged(e: any) {
		if (e.value === null || e.value === undefined || e.value === '') {
			this.value = e.value;
			this.internalValue = e.value;
		} else {
			this.value = this.fromLookupValue(e.value);
			this.internalValue = this.toLookupValue(this.value);
		}
		this.valueChange.emit(this.value);
	}

	selectionChanged(e: any) {
		const rows = e?.selectedRowsData;
		if (!rows?.length) {
			return;
		}

		let newValue = rows[0][this.valueExpr];
		if (this.selectedRowKeys) {
			newValue = this.selectedRowKeys(rows);
		}
		if (newValue === undefined || newValue === null) {
			return;
		}

		if (this.setValue) {
			this.setValue(newValue);
		}
		this.value = newValue;
		this.internalValue = this.toLookupValue(newValue);
		this.valueChange.emit(this.value);
		this.claseOpend = false;
	}

	private syncInternalValue(): void {
		this.internalValue = this.toLookupValue(this.value);
	}

	private toLookupValue(v: any): any {
		if (v == null || v === '' || !Array.isArray(this.model) || this.model.length === 0) {
			return v;
		}
		const sampleKey = this.model[0]?.[this.valueExpr];
		if (typeof sampleKey === 'string' && typeof v === 'number') {
			return String(v);
		}
		return v;
	}

	private fromLookupValue(v: any): any {
		if (v == null || v === '' || !Array.isArray(this.model) || this.model.length === 0) {
			return v;
		}
		const sampleKey = this.model[0]?.[this.valueExpr];
		if (typeof sampleKey === 'string' && typeof v === 'string' && /^-?\d+$/.test(v)) {
			const parsed = Number(v);
			if (!Number.isNaN(parsed)) {
				return parsed;
			}
		}
		return v;
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

	get dropDownOptions(): { width: number | string } {
		if (this.dropDownWidth != null) {
			return { width: this.dropDownWidth };
		}

		if (this.lookupColumns?.length) {
			const totalWidth = this.lookupColumns.reduce((sum, col) => {
				if (typeof col.width === 'number') {
					return sum + col.width;
				}
				return sum + 150;
			}, 0);

			if (totalWidth > 0) {
				return { width: Math.max(totalWidth + 80, 420) };
			}
		}

		return { width: 'auto' };
	}

	get lookupColumnAutoWidth(): boolean {
		return !this.lookupColumns?.length;
	}
}

@NgModule({
	imports: [DxDropDownBoxModule, DxDataGridModule, CommonModule],
	declarations: [DataLookupComponent],
	exports: [DataLookupComponent],
})
export class DataLookupModule {}
