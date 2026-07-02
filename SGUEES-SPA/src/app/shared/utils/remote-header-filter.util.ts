import CustomStore from 'devextreme/data/custom_store';

export type RemoteHeaderFilterLoader = (field: string, searchValue?: string) => Promise<unknown[]>;

export const GRID_DATE_TIME_FIELDS = new Set(['FECHA_CREA', 'FECHA_ACTU']);

export interface BooleanColumnLabels {
	trueLabel?: string;
	falseLabel?: string;
	trueValue?: unknown;
	falseValue?: unknown;
}

export const DEFAULT_BOOLEAN_LABELS: Required<BooleanColumnLabels> = {
	trueLabel: 'Activo',
	falseLabel: 'Inactivo',
	trueValue: true,
	falseValue: false,
};

export function resolveBooleanColumnLabels(labels?: BooleanColumnLabels): Required<BooleanColumnLabels> {
	return { ...DEFAULT_BOOLEAN_LABELS, ...labels };
}

export function isBooleanFilterField(_field: string, column?: { booleanColumnLabels?: BooleanColumnLabels }): boolean {
	return !!column?.booleanColumnLabels;
}

export function shouldForceRemoteHeaderFilter(column: any): boolean {
	return isBooleanFilterField(column?.dataField, column);
}

export type HeaderFilterType = 'include' | 'exclude';

export interface HeaderFilterSelection {
	values: unknown[];
	filterType: HeaderFilterType;
}

const SKIP_COLUMN_TYPES = new Set(['buttons']);

export function shouldAttachRemoteHeaderFilter(column: any): boolean {
	if (!column?.dataField) {
		return false;
	}

	if (column.allowHeaderFiltering === false) {
		return false;
	}

	if (SKIP_COLUMN_TYPES.has(column.type)) {
		return false;
	}

	if (column.headerFilter?.dataSource && !shouldForceRemoteHeaderFilter(column)) {
		return false;
	}

	if (column.lookup?.dataSource && !shouldForceRemoteHeaderFilter(column)) {
		return false;
	}

	return true;
}

export function buildPageHeaderFilterDataSource(rows: any[], field: string): Array<{ text: string; value: unknown }> {
	const seen = new Set<string>();
	const dataSource: Array<{ text: string; value: unknown }> = [];

	for (const row of rows) {
		const value = row?.[field];
		const key = value === null || value === undefined ? '__null__' : JSON.stringify(value);

		if (seen.has(key)) {
			continue;
		}

		seen.add(key);
		dataSource.push({
			text: value === null || value === undefined || `${value}`.trim() === '' ? '(Vacio)' : String(value),
			value,
		});
	}

	return dataSource;
}

export function syncHeaderFiltersFromPageData(grid: any, columns: any[]): void {
	if (!grid || !columns?.length) {
		return;
	}

	const rows = grid.getDataSource()?.items?.() ?? [];

	columns.forEach((column) => {
		if (!shouldAttachRemoteHeaderFilter(column)) {
			return;
		}

		grid.columnOption(column.dataField, 'headerFilter.dataSource', buildPageHeaderFilterDataSource(rows, column.dataField));
	});
}

export function formatBooleanHeaderFilterDisplayText(value: unknown, labels?: BooleanColumnLabels): string {
	if (value === null || value === undefined || `${value}`.trim() === '') {
		return '(Vacio)';
	}

	const resolved = resolveBooleanColumnLabels(labels);
	const normalized = normalizeBooleanHeaderFilterValue(value, labels);

	if (normalized === resolved.trueValue) {
		return resolved.trueLabel;
	}

	if (normalized === resolved.falseValue) {
		return resolved.falseLabel;
	}

	return String(value);
}

export function formatHeaderFilterDisplayText(field: string, value: unknown, labels?: BooleanColumnLabels): string {
	if (value === null || value === undefined || `${value}`.trim() === '') {
		return '(Vacio)';
	}

	if (labels) {
		return formatBooleanHeaderFilterDisplayText(value, labels);
	}

	return String(value);
}

export function createRemoteHeaderFilterDataSource(
	loader: RemoteHeaderFilterLoader,
	field: string,
	labels?: BooleanColumnLabels
): CustomStore {
	return new CustomStore({
		key: 'value',
		loadMode: 'raw',
		cacheRawData: false,
		load: (loadOptions: { searchValue?: string }) =>
			loader(field, loadOptions.searchValue).then((values) =>
				(values ?? []).map((value) => ({
					text: formatHeaderFilterDisplayText(field, value, labels),
					value,
				}))
			),
	});
}

export function attachRemoteHeaderFilters(
	columns: any[],
	loader: RemoteHeaderFilterLoader,
	options?: { skipFields?: string[] }
): any[] {
	const skip = new Set(options?.skipFields ?? []);

	return columns.map((column) => {
		if (!shouldAttachRemoteHeaderFilter(column) || skip.has(column.dataField)) {
			return column;
		}

		return {
			...column,
			allowHeaderFiltering: column.allowHeaderFiltering ?? true,
			headerFilter: {
				...(column.headerFilter ?? {}),
				dataSource: createRemoteHeaderFilterDataSource(loader, column.dataField, column.booleanColumnLabels),
			},
		};
	});
}

export function getColumnHeaderFilterSelection(grid: any, dataField: string): HeaderFilterSelection | null {
	if (!grid || !dataField) {
		return null;
	}

	const filterType: HeaderFilterType = grid.columnOption(dataField, 'filterType') === 'exclude' ? 'exclude' : 'include';
	const filterValues = grid.columnOption(dataField, 'filterValues');

	if (Array.isArray(filterValues) && filterValues.length) {
		return { values: filterValues, filterType };
	}

	return null;
}

export function clearGridHeaderFilterSelections(grid: any): void {
	if (!grid?.getVisibleColumns) {
		return;
	}

	for (const column of grid.getVisibleColumns()) {
		const dataField = column?.dataField;
		if (!dataField || column.allowHeaderFiltering === false) {
			continue;
		}

		const selection = getColumnHeaderFilterSelection(grid, dataField);
		if (!hasColumnHeaderFilterSelection(selection)) {
			continue;
		}

		grid.columnOption(dataField, 'filterValues', null);
		grid.columnOption(dataField, 'filterType', 'include');
	}
}

export function hasGridFilterRowValue(value: unknown): boolean {
	if (value === null || value === undefined || value === '__ALL__') {
		return false;
	}

	if (typeof value === 'boolean') {
		return true;
	}

	return `${value}`.trim() !== '';
}

export function readGridFilterRowValues(grid: any): {
	filterRow: Record<string, unknown>;
	filterRowExact: Record<string, unknown>;
} {
	const filterRow: Record<string, unknown> = {};
	const filterRowExact: Record<string, unknown> = {};

	if (!grid?.getVisibleColumns) {
		return { filterRow, filterRowExact };
	}

	for (const column of grid.getVisibleColumns()) {
		const dataField = column?.dataField;
		if (!dataField || column.allowFiltering === false) {
			continue;
		}

		const filterValue = grid.columnOption(dataField, 'filterValue');
		if (!hasGridFilterRowValue(filterValue)) {
			continue;
		}

		const operation = grid.columnOption(dataField, 'selectedFilterOperation') ?? 'contains';
		if (
			isBooleanFilterField(dataField, column) ||
			operation === '=' ||
			operation === '<' ||
			operation === '>' ||
			operation === '<=' ||
			operation === '>='
		) {
			filterRowExact[dataField] = filterValue;
		} else if (operation === 'contains' || operation === 'notcontains' || operation === 'startswith' || operation === 'endswith') {
			filterRow[dataField] = filterValue;
		} else {
			filterRowExact[dataField] = filterValue;
		}
	}

	return { filterRow, filterRowExact };
}

export function hasColumnHeaderFilterSelection(selection: HeaderFilterSelection | null): boolean {
	return !!selection?.values.length;
}

export function isHeaderFilterExclude(grid: any, dataField: string): boolean {
	return getColumnHeaderFilterSelection(grid, dataField)?.filterType === 'exclude';
}

export function headerFilterValueKey(value: unknown): string {
	if (value === null || value === undefined) {
		return '__null__';
	}

	return `${typeof value}:${value}`;
}

export function normalizeBooleanHeaderFilterValue(value: unknown, labels?: BooleanColumnLabels): unknown {
	const resolved = resolveBooleanColumnLabels(labels);

	if (value && typeof value === 'object' && 'value' in (value as Record<string, unknown>)) {
		return normalizeBooleanHeaderFilterValue((value as Record<string, unknown>).value, labels);
	}

	if (value === null || value === undefined || value === '' || value === '__BLANK__' || value === '(Vacio)') {
		return null;
	}

	if (
		value === resolved.trueValue ||
		value === 'true' ||
		value === resolved.trueLabel ||
		(resolved.trueValue === true && value === true)
	) {
		return resolved.trueValue;
	}

	if (
		value === resolved.falseValue ||
		value === 'false' ||
		value === resolved.falseLabel ||
		(resolved.falseValue === false && value === false)
	) {
		return resolved.falseValue;
	}

	return value;
}

/** @deprecated Use normalizeBooleanHeaderFilterValue. Kept for backward compatibility. */
export function normalizeEstadoHeaderFilterValue(value: unknown): unknown {
	return normalizeBooleanHeaderFilterValue(value);
}

export function getBooleanHeaderFilterDomain(labels?: BooleanColumnLabels): unknown[] {
	const resolved = resolveBooleanColumnLabels(labels);
	return [null, resolved.trueValue, resolved.falseValue];
}

/** @deprecated Use getBooleanHeaderFilterDomain. Kept for backward compatibility. */
export const ESTADO_HEADER_FILTER_DOMAIN: unknown[] = getBooleanHeaderFilterDomain();

export function invertBooleanExcludedHeaderFilterValues(excluded: unknown[], labels?: BooleanColumnLabels): unknown[] {
	const resolved = resolveBooleanColumnLabels(labels);
	const excludedKeys = new Set(
		excluded.map((value) => headerFilterValueKey(normalizeBooleanHeaderFilterValue(value, resolved)))
	);

	return getBooleanHeaderFilterDomain(resolved).filter(
		(value) => !excludedKeys.has(headerFilterValueKey(normalizeBooleanHeaderFilterValue(value, resolved)))
	);
}

/** @deprecated Use invertBooleanExcludedHeaderFilterValues. Kept for backward compatibility. */
export function invertEstadoExcludedHeaderFilterValues(excluded: unknown[]): unknown[] {
	return invertBooleanExcludedHeaderFilterValues(excluded);
}

export function resolveBooleanExcludeHeaderFilter(
	column: any,
	excludedValues: unknown[],
	labelsOverride?: BooleanColumnLabels
): unknown[] | null {
	const labels = labelsOverride ?? column?.booleanColumnLabels;
	if (!labels) {
		return null;
	}

	const resolved = resolveBooleanColumnLabels(labels);
	return invertBooleanExcludedHeaderFilterValues(
		excludedValues.map((value) => normalizeBooleanHeaderFilterValue(value, resolved)),
		resolved
	);
}

export function invertExcludedHeaderFilterValues(excluded: unknown[], distinctValues: unknown[]): unknown[] {
	const excludedKeys = new Set(excluded.map((value) => headerFilterValueKey(value)));

	return distinctValues.filter((value) => !excludedKeys.has(headerFilterValueKey(value)));
}

export function formatDateTimeFilterValue(value: unknown): string {
	if (value === null || value === undefined) {
		return '';
	}

	if (value instanceof Date && !Number.isNaN(value.getTime())) {
		return formatLocalDateTime(value);
	}

	const text = `${value}`.trim();
	if (!text) {
		return '';
	}

	if (/^\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}/.test(text)) {
		return text.slice(0, 16);
	}

	if (text.includes('T') || /^\d{4}-\d{2}-\d{2}/.test(text)) {
		const parsed = new Date(text);
		if (!Number.isNaN(parsed.getTime())) {
			return formatLocalDateTime(parsed);
		}
	}

	return text;
}

export function normalizeFilterMapValues(
	map?: Record<string, unknown>,
	dateTimeFields: ReadonlySet<string> = GRID_DATE_TIME_FIELDS
): Record<string, unknown> {
	if (!map) {
		return {};
	}

	const normalized: Record<string, unknown> = {};
	for (const [field, value] of Object.entries(map)) {
		normalized[field] = dateTimeFields.has(field) ? formatDateTimeFilterValue(value) : value;
	}

	return normalized;
}

export function normalizeAnyOfMapValues(
	map?: Record<string, unknown[]>,
	dateTimeFields: ReadonlySet<string> = GRID_DATE_TIME_FIELDS
): Record<string, unknown[]> {
	if (!map) {
		return {};
	}

	const normalized: Record<string, unknown[]> = {};
	for (const [field, values] of Object.entries(map)) {
		normalized[field] =
			dateTimeFields.has(field)
				? values.map((value) => formatDateTimeFilterValue(value)).filter((value) => value !== '')
				: values;
	}

	return normalized;
}

export function createDateTimeFilterExpression(dataField: string) {
	return (filterValue: unknown, selectedFilterOperation?: string) => {
		if (filterValue === null || filterValue === undefined) {
			return null;
		}

		if (selectedFilterOperation === 'anyof' && Array.isArray(filterValue)) {
			const values = filterValue.map((value) => formatDateTimeFilterValue(value)).filter(Boolean);
			return values.length ? [dataField, 'anyof', values] : null;
		}

		const normalized = formatDateTimeFilterValue(filterValue);
		return normalized ? [dataField, selectedFilterOperation || '=', normalized] : null;
	};
}

function formatLocalDateTime(date: Date): string {
	const pad = (part: number) => `${part}`.padStart(2, '0');
	return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
