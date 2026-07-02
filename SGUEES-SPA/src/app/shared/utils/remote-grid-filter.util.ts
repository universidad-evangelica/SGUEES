import { IParam } from 'src/app/FxAPI/IParam';
import {
	BooleanColumnLabels,
	getColumnHeaderFilterSelection,
	hasColumnHeaderFilterSelection,
	isHeaderFilterExclude,
	normalizeAnyOfMapValues,
	normalizeBooleanHeaderFilterValue,
	normalizeFilterMapValues,
	readGridFilterRowValues,
	resolveBooleanColumnLabels,
} from './remote-header-filter.util';

export const ESTADO_ACTIVO_INACTIVO_LABELS: BooleanColumnLabels = {
	trueLabel: 'Activo',
	falseLabel: 'Inactivo',
};

export type EstadoFiltro = boolean | null;

export interface ParsedGridFilters {
	estado: EstadoFiltro;
	filterRow: Record<string, unknown>;
	filterRowExact: Record<string, unknown>;
	headerAnyOf: Record<string, unknown[]>;
}

export interface RemoteGridFilterConfig {
	estadoField: string;
	booleanColumns?: Record<string, BooleanColumnLabels>;
}

export function createEmptyGridFilters(): ParsedGridFilters {
	return {
		estado: null,
		filterRow: {},
		filterRowExact: {},
		headerAnyOf: {},
	};
}

export function hasRemoteFilterRowSearch(filters: ParsedGridFilters): boolean {
	return (
		(filters.estado !== null && filters.estado !== undefined) ||
		Object.keys(filters.filterRow).length > 0 ||
		Object.keys(filters.filterRowExact).length > 0
	);
}

export function cloneRemoteGridFilters(source: ParsedGridFilters): ParsedGridFilters {
	return {
		estado: source.estado,
		filterRow: { ...source.filterRow },
		filterRowExact: { ...source.filterRowExact },
		headerAnyOf: { ...source.headerAnyOf },
	};
}

function getBooleanLabelsForField(field: string, config: RemoteGridFilterConfig, grid?: any): BooleanColumnLabels | undefined {
	if (config.booleanColumns?.[field]) {
		return config.booleanColumns[field];
	}

	if (grid?.getVisibleColumns) {
		const column = grid.getVisibleColumns().find((item: any) => item?.dataField === field);
		if (column?.booleanColumnLabels) {
			return column.booleanColumnLabels;
		}
	}

	return undefined;
}


export function parseRemoteGridFilters(filter: any, grid: any | undefined, config: RemoteGridFilterConfig): ParsedGridFilters {
	const result = createEmptyGridFilters();
	const { estadoField } = config;
	const headerEquals = new Map<string, unknown[]>();
	const headerFilterFields = getActiveHeaderFilterFields(grid);
	const filterRowFromGrid = readGridFilterRowValues(grid);
	const filterRowFields = new Set([
		...Object.keys(filterRowFromGrid.filterRow),
		...Object.keys(filterRowFromGrid.filterRowExact),
	]);

	for (const node of flattenRemoteGridFilter(filter)) {
		const field = node[0];
		const operator = node[1];
		const value = node[2];
		const booleanLabels = getBooleanLabelsForField(field, config, grid);

		if (operator === 'anyof' && Array.isArray(value) && value.length) {
			if (grid && isHeaderFilterExclude(grid, field)) {
				continue;
			}

			const normalizedValues = booleanLabels
				? value.map((item) => normalizeBooleanHeaderFilterValue(item, booleanLabels))
				: value;

			result.headerAnyOf[field] = mergeRemoteAnyOfValues(result.headerAnyOf[field], normalizedValues);
			continue;
		}

		if (operator === '=' || operator === '==') {
			if (filterRowFields.has(field)) {
				continue;
			}

			const values = headerEquals.get(field) ?? [];
			values.push(value);
			headerEquals.set(field, values);
			continue;
		}

		if (operator === '<' || operator === '>' || operator === '<=' || operator === '>=') {
			if (filterRowFields.has(field)) {
				continue;
			}

			result.filterRowExact[field] = value;
			continue;
		}

		if (value !== null && value !== undefined && `${value}`.trim()) {
			if (filterRowFields.has(field)) {
				continue;
			}

			result.filterRow[field] = value;
		}
	}

	for (const [field, values] of headerEquals.entries()) {
		if (grid && isHeaderFilterExclude(grid, field)) {
			continue;
		}

		const booleanLabels = getBooleanLabelsForField(field, config, grid);

		if (values.length > 1 || headerFilterFields.has(field)) {
			const normalizedValues = booleanLabels
				? values.map((item) => normalizeBooleanHeaderFilterValue(item, booleanLabels))
				: values;

			result.headerAnyOf[field] = mergeRemoteAnyOfValues(result.headerAnyOf[field], normalizedValues);
			continue;
		}

		result.filterRowExact[field] = values[0];
	}

	result.filterRow = filterRowFromGrid.filterRow;
	result.filterRowExact = filterRowFromGrid.filterRowExact;
	applyEstadoFilterRow(result, estadoField, config, grid);
	applyHeaderFiltersFromGrid(grid, result, config);

	if (hasRemoteFilterRowSearch(result)) {
		result.headerAnyOf = {};
	}

	return result;
}

function applyEstadoFilterRow(
	result: ParsedGridFilters,
	estadoField: string,
	config: RemoteGridFilterConfig,
	grid?: any
): void {
	if (!estadoField || estadoField === '__NONE__') {
		return;
	}

	const estadoValue = result.filterRowExact[estadoField] ?? result.filterRow[estadoField];

	if (estadoValue === undefined) {
		return;
	}

	const labels = getBooleanLabelsForField(estadoField, config, grid);

	if (estadoValue === '__ALL__' || estadoValue === null) {
		result.estado = null;
	} else if (labels) {
		const normalized = normalizeBooleanHeaderFilterValue(estadoValue, labels);
		const resolved = resolveBooleanColumnLabels(labels);
		result.estado = normalized === null ? null : normalized === resolved.trueValue;
	} else {
		result.estado = estadoValue === true || estadoValue === 'true';
	}

	delete result.filterRowExact[estadoField];
	delete result.filterRow[estadoField];
}

function applyHeaderFiltersFromGrid(grid: any, result: ParsedGridFilters, config: RemoteGridFilterConfig): void {
	if (!grid?.getVisibleColumns) {
		return;
	}

	for (const column of grid.getVisibleColumns()) {
		const dataField = column?.dataField;
		if (!dataField || column.allowHeaderFiltering === false) {
			continue;
		}

		const selection = getColumnHeaderFilterSelection(grid, dataField);
		if (!selection || selection.filterType === 'exclude' || !selection.values.length) {
			continue;
		}

		const booleanLabels = getBooleanLabelsForField(dataField, config, grid);
		const values = booleanLabels
			? selection.values.map((item) => normalizeBooleanHeaderFilterValue(item, booleanLabels))
			: selection.values;

		result.headerAnyOf[dataField] = mergeRemoteAnyOfValues(result.headerAnyOf[dataField], values);
	}
}

export function buildRemoteGridWhere(param: any, estadoField: string): IParam[] {
	const xWhere: IParam[] = [];

	if (param.DISTINCT_FIELD) {
		xWhere.push({ Parameter: 'DISTINCT_FIELD', Value: param.DISTINCT_FIELD });
	}

	if (param.HEADER_FILTER_SEARCH) {
		xWhere.push({ Parameter: 'HEADER_FILTER_SEARCH', Value: param.HEADER_FILTER_SEARCH });
	}

	const gridFilters = param.gridFilters as ParsedGridFilters | undefined;

	const filterRowJson = serializeRemoteFilterMap(gridFilters?.filterRow);
	if (filterRowJson) {
		xWhere.push({ Parameter: 'FILTER_ROW_JSON', Value: filterRowJson });
	}

	const exactJson = serializeRemoteFilterMap(gridFilters?.filterRowExact);
	if (exactJson) {
		xWhere.push({ Parameter: 'COLUMN_EXACT_JSON', Value: exactJson });
	}

	const anyOfJson = serializeRemoteAnyOfMap(gridFilters?.headerAnyOf);
	if (anyOfJson) {
		xWhere.push({ Parameter: 'COLUMN_ANYOF_JSON', Value: anyOfJson });
	}

	if (param.BUSQUEDA) {
		xWhere.push({ Parameter: 'BUSQUEDA', Value: param.BUSQUEDA });
	}

	if (estadoField && estadoField !== '__NONE__' && gridFilters?.estado !== null && gridFilters?.estado !== undefined) {
		xWhere.push({ Parameter: estadoField, Value: gridFilters.estado });
	}

	if (param.PAGE) {
		xWhere.push({ Parameter: 'PAGE', Value: param.PAGE });
	}

	if (param.PAGE_SIZE) {
		xWhere.push({ Parameter: 'PAGE_SIZE', Value: param.PAGE_SIZE });
	}

	if (param.SORT_FIELD) {
		xWhere.push({ Parameter: 'SORT_FIELD', Value: param.SORT_FIELD });
	}

	if (param.SORT_FIELD && param.SORT_DESC !== null && param.SORT_DESC !== undefined) {
		xWhere.push({ Parameter: 'SORT_DESC', Value: param.SORT_DESC });
	}

	return xWhere;
}

export function createEstadoColumnConfig(
	estadoField: string,
	labels?: BooleanColumnLabels,
	options?: { caption?: string }
): Record<string, unknown> {
	const resolved = resolveBooleanColumnLabels(labels);

	return {
		dataField: estadoField,
		caption: options?.caption ?? 'Estado',
		width: 140,
		allowFiltering: true,
		allowHeaderFiltering: true,
		booleanColumnLabels: resolved,
		// Evita syncLookupFilterValues: con lookup dinámico DevExtreme omite false (Inactivo).
		calculateCellValue: (rowData: Record<string, unknown>) => rowData?.[estadoField],
		cellTemplate: (cellElement: HTMLElement, cellInfo: any) => {
			const badge = document.createElement('span');
			const isTrue = cellInfo.value === resolved.trueValue;
			badge.classList.add('estado-badge', isTrue ? 'estado-badge--activo' : 'estado-badge--inactivo');
			badge.textContent = isTrue ? resolved.trueLabel : resolved.falseLabel;
			cellElement.innerHTML = '';
			cellElement.appendChild(badge);
		},
		lookup: {
			dataSource: [
				{ value: resolved.trueValue, text: resolved.trueLabel },
				{ value: resolved.falseValue, text: resolved.falseLabel },
			],
			valueExpr: 'value',
			displayExpr: 'text',
		},
		headerFilter: {
			allowSearch: false,
		},
		selectedFilterOperation: '=',
		defaultSelectedFilterOperation: '=',
		filterOperations: ['='],
		calculateFilterExpression: (filterValue: any, selectedFilterOperation?: string) => {
			if (filterValue === '__ALL__' || filterValue === null || filterValue === undefined) {
				return null;
			}

			if (selectedFilterOperation === 'anyof' && Array.isArray(filterValue)) {
				return filterValue.length ? [estadoField, 'anyof', filterValue] : null;
			}

			return [estadoField, '=', filterValue];
		},
	};
}

function getActiveHeaderFilterFields(grid: any): Set<string> {
	const fields = new Set<string>();

	if (!grid?.getVisibleColumns) {
		return fields;
	}

	for (const column of grid.getVisibleColumns()) {
		const dataField = column?.dataField;
		if (!dataField || column.allowHeaderFiltering === false) {
			continue;
		}

		const selection = getColumnHeaderFilterSelection(grid, dataField);
		if (hasColumnHeaderFilterSelection(selection) && selection!.filterType !== 'exclude') {
			fields.add(dataField);
		}
	}

	return fields;
}

function flattenRemoteGridFilter(node: any): any[] {
	if (!Array.isArray(node) || !node.length) {
		return [];
	}

	if (node.length === 3 && (node[1] === 'and' || node[1] === 'or') && Array.isArray(node[0])) {
		return [...flattenRemoteGridFilter(node[0]), ...flattenRemoteGridFilter(node[2])];
	}

	if (typeof node[0] === 'string' && node.length >= 3) {
		return [node];
	}

	return node.flatMap((child) => flattenRemoteGridFilter(child));
}

function mergeRemoteAnyOfValues(current: unknown[] | undefined, incoming: unknown[]): unknown[] {
	const merged = [...(current ?? []), ...incoming];
	const seen = new Set<string>();

	return merged.filter((value) => {
		const key = value === null || value === undefined ? '__null__' : `${typeof value}:${value}`;
		if (seen.has(key)) {
			return false;
		}

		seen.add(key);
		return true;
	});
}

function serializeRemoteFilterMap(map?: Record<string, unknown>): string {
	const cleaned = Object.fromEntries(
		Object.entries(normalizeFilterMapValues(map)).filter(
			([, value]) => value !== null && value !== undefined && `${value}`.trim() !== ''
		)
	);

	return Object.keys(cleaned).length ? JSON.stringify(cleaned) : '';
}

function serializeRemoteAnyOfMap(map?: Record<string, unknown[]>): string {
	const normalized = normalizeAnyOfMapValues(map);
	if (!normalized || !Object.keys(normalized).length) {
		return '';
	}

	return JSON.stringify(normalized);
}
