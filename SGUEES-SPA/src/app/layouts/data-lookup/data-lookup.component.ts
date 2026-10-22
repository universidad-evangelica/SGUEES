import { DxDataGridModule } from 'devextreme-angular/ui/data-grid';
import { CommonModule } from '@angular/common';
import {
	Component,
	EventEmitter,
	Input,
	NgModule,
	Output,
	OnInit,
	OnChanges,
	SimpleChanges,
	ViewChild,
} from '@angular/core';
import { DxDropDownBoxComponent, DxDropDownBoxModule } from 'devextreme-angular/ui/drop-down-box';

@Component({
	selector: 'app-data-lookup',
	templateUrl: './data-lookup.component.html',
	styleUrls: ['./data-lookup.component.scss'],
})
export class DataLookupComponent implements OnInit, OnChanges {
	@ViewChild('dataLookUp', { static: false }) dataLookUp?: DxDropDownBoxComponent;

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
	/** Estado visual de validación (templates no lo heredan del dx-form). */
	@Input() isValid = true;
	@Input() validationError: { message?: string } | null = null;

	@Output() valueChange = new EventEmitter<any>();
	claseOpend = false;
	columns: any[] = [];
	internalValue: any;
	// Qué hace: selección del grid del dropdown, alineada con el valor del combo.
	// Cómo: array estable; vacío cuando no hay valor para poder reelegir la misma fila.
	gridSelectedKeys: any[] = [];

	constructor() {}

	/** Enfoca el dx-drop-down-box interno (útil desde mtto / validación). */
	focus(): void {
		this.dataLookUp?.instance?.focus();
	}

	markInvalid(message: string): void {
		this.isValid = false;
		this.validationError = { message };
	}

	markValid(): void {
		this.isValid = true;
		this.validationError = null;
	}

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
		let nextValue: any;
		if (e.value === null || e.value === undefined || e.value === '') {
			nextValue = e.value;
		} else {
			nextValue = this.fromLookupValue(e.value);
		}
		if (this.sameLookupValue(nextValue, this.value)) {
			this.syncGridSelectedKeys();
			return;
		}
		this.value = nextValue;
		this.internalValue = this.toLookupValue(this.value);
		this.syncGridSelectedKeys();
		if (this.hasLookupValue(this.value)) {
			this.markValid();
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

		if (this.sameLookupValue(newValue, this.value)) {
			this.claseOpend = false;
			return;
		}

		if (this.setValue) {
			this.setValue(newValue);
		}
		this.value = newValue;
		this.internalValue = this.toLookupValue(newValue);
		this.syncGridSelectedKeys();
		this.markValid();
		this.valueChange.emit(this.value);
		this.claseOpend = false;
	}

	private hasLookupValue(v: any): boolean {
		return !(v === null || v === undefined || v === '' || v === 0);
	}

	private syncInternalValue(): void {
		this.internalValue = this.toLookupValue(this.value);
		this.syncGridSelectedKeys();
	}

	// Qué hace: deja el grid con la misma selección que el valor del combo.
	// Cómo: si el valor está vacío, selectedRowKeys = [] para que un nuevo clic sí dispare selección.
	private syncGridSelectedKeys(): void {
		const next =
			this.internalValue === null || this.internalValue === undefined || this.internalValue === ''
				? []
				: [this.internalValue];
		if (this.sameKeys(this.gridSelectedKeys, next)) {
			return;
		}
		this.gridSelectedKeys = next;
	}

	private sameLookupValue(a: any, b: any): boolean {
		if (a === b) {
			return true;
		}
		if (a == null || a === '' || b == null || b === '') {
			return a == null || a === '' ? b == null || b === '' : false;
		}
		return String(a) === String(b);
	}

	private sameKeys(current: any[], next: any[]): boolean {
		if (current.length !== next.length) {
			return false;
		}
		if (current.length === 0) {
			return true;
		}
		return this.sameLookupValue(current[0], next[0]);
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
