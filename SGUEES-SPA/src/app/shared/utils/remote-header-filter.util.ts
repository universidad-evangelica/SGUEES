import CustomStore from 'devextreme/data/custom_store';

export type RemoteHeaderFilterLoader = (field: string, searchValue?: string) => Promise<unknown[]>;

export const GRID_DATE_TIME_FIELDS = new Set(['FECHA_CREA', 'FECHA_ACTU']);
export const GRID_BOOLEAN_FILTER_FIELDS = new Set([
	'ESTADO_COMPETENCIAS_TECNICAS',
	'ESTADO_NIVEL_ACADEMICO',
	'ESTADO_TIPO_PUESTO',
	'ESTADO_FRECUENCIA',
	'ESTADO_INDUCCION',
	'ESTADO_DISPONIBILIDAD_HORARIO',
	'ESTADO_IMPACTO_ECONOMICO',
	'ESTADO_REQUERIMIENTO_ORGANIZACIONAL',
	'ESTADO_RESPONSABILIDAD',
	'ESTADO_RIESGO_PUESTO',
]);
export const REMOTE_HEADER_FILTER_FORCE_FIELDS = new Set([
	'ESTADO_COMPETENCIAS_TECNICAS',
	'ESTADO_NIVEL_ACADEMICO',
	'ESTADO_TIPO_PUESTO',
	'ESTADO_FRECUENCIA',
	'ESTADO_INDUCCION',
	'ESTADO_DISPONIBILIDAD_HORARIO',
	'ESTADO_IMPACTO_ECONOMICO',
	'ESTADO_REQUERIMIENTO_ORGANIZACIONAL',
	'ESTADO_RESPONSABILIDAD',
	'ESTADO_RIESGO_PUESTO',
]);

export function isEstadoField(field: string): boolean {
	return GRID_BOOLEAN_FILTER_FIELDS.has(field);
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

	if (column.headerFilter?.dataSource && !REMOTE_HEADER_FILTER_FORCE_FIELDS.has(column.dataField)) {
		return false;
	}

	if (column.lookup?.dataSource && !REMOTE_HEADER_FILTER_FORCE_FIELDS.has(column.dataField)) {
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

export function formatHeaderFilterDisplayText(field: string, value: unknown): string {
	if (value === null || value === undefined || `${value}`.trim() === '') {
		return '(Vacio)';
	}

	if (isEstadoField(field)) {
		if (value === true || value === 'true') {
			return 'Activo';
		}

		if (value === false || value === 'false') {
			return 'Inactivo';
		}
	}

	return String(value);
}

export function createRemoteHeaderFilterDataSource(loader: RemoteHeaderFilterLoader, field: string): CustomStore {
	return new CustomStore({
		key: 'value',
		loadMode: 'raw',
		cacheRawData: false,
		load: (loadOptions: { searchValue?: string }) =>
			loader(field, loadOptions.searchValue).then((values) =>
				(values ?? []).map((value) => ({
					text: formatHeaderFilterDisplayText(field, value),
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
				dataSource: createRemoteHeaderFilterDataSource(loader, column.dataField),
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
			GRID_BOOLEAN_FILTER_FIELDS.has(dataField) ||
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

export function normalizeEstadoHeaderFilterValue(value: unknown): unknown {
	if (value && typeof value === 'object' && 'value' in (value as Record<string, unknown>)) {
		return normalizeEstadoHeaderFilterValue((value as Record<string, unknown>).value);
	}

	if (value === null || value === undefined || value === '' || value === '__BLANK__' || value === '(Vacio)') {
		return null;
	}

	if (value === true || value === 'true' || value === 'Activo') {
		return true;
	}

	if (value === false || value === 'false' || value === 'Inactivo') {
		return false;
	}

	return value;
}

export const ESTADO_HEADER_FILTER_DOMAIN: unknown[] = [null, true, false];

export function invertEstadoExcludedHeaderFilterValues(excluded: unknown[]): unknown[] {
	const excludedKeys = new Set(
		excluded.map((value) => headerFilterValueKey(normalizeEstadoHeaderFilterValue(value)))
	);

	return ESTADO_HEADER_FILTER_DOMAIN.filter(
		(value) => !excludedKeys.has(headerFilterValueKey(normalizeEstadoHeaderFilterValue(value)))
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
