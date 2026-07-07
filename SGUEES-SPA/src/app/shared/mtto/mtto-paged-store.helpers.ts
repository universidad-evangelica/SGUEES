export interface MttoPagedStorePageResult {
	data: unknown[];
	totalCount: number;
}

export interface MttoPagedStorePageCache {
	serverKey: string;
	result: MttoPagedStorePageResult;
}

/** Estado de caché por página/sort — evita GetAll al escribir en filter row (DevExtreme vuelve a llamar load). */
export interface MttoPagedStoreCacheState {
	loadGeneration: number;
	cacheGeneration: number;
	pageCache: MttoPagedStorePageCache | null;
	/** Último pageSize efectivo — DevExtreme a veces omite take al filtrar. */
	lastPageSize: number;
}

export function createMttoPagedStoreCacheState(defaultPageSize = 20): MttoPagedStoreCacheState {
	return {
		loadGeneration: 0,
		cacheGeneration: -1,
		pageCache: null,
		lastPageSize: defaultPageSize,
	};
}

export function invalidateMttoPagedStoreCache(state: MttoPagedStoreCacheState): void {
	state.loadGeneration += 1;
	state.pageCache = null;
	state.cacheGeneration = -1;
}

export function buildMttoPagedServerKey(
	page: number,
	pageSize: number,
	sortField = '',
	sortDesc = false
): string {
	return `${page}|${pageSize}|${sortField}|${sortDesc}`;
}

export function resolveMttoPagedLoadParams(
	loadOptions: {
		skip?: number;
		take?: number;
		sort?: Array<{ selector?: string; desc?: boolean }>;
	},
	fallbackPageSize = 20,
	defaultSortField = ''
): {
	page: number;
	pageSize: number;
	sortField: string;
	sortDesc: boolean;
	serverKey: string;
} {
	const requestedTake = loadOptions.take;
	const pageSize =
		requestedTake === undefined || requestedTake === null ? fallbackPageSize : requestedTake;
	const skipRows = loadOptions.skip || 0;
	const page = pageSize > 0 ? Math.floor(skipRows / pageSize) + 1 : 1;
	const sort = getMttoGridSort(loadOptions.sort);
	const sortField = sort?.field || defaultSortField || '';
	const sortDesc = sort?.desc ?? false;

	return {
		page,
		pageSize,
		sortField,
		sortDesc,
		serverKey: buildMttoPagedServerKey(page, pageSize, sortField, sortDesc),
	};
}

export function getMttoGridSort(
	sort?: Array<{ selector?: string; desc?: boolean }>
): { field: string; desc: boolean } | null {
	if (!Array.isArray(sort) || !sort.length) {
		return null;
	}

	const first = sort[0];
	if (!first?.selector) {
		return null;
	}

	return {
		field: `${first.selector}`,
		desc: !!first.desc,
	};
}

/**
 * Si ya se trajo esta página/orden en la generación actual, devolver caché.
 * DevExtreme no siempre manda loadOptions.filter aunque el usuario filtre en filter row.
 */
export function tryGetMttoPagedServerCache(
	serverKey: string,
	state: MttoPagedStoreCacheState
): MttoPagedStorePageResult | null {
	if (!state.pageCache || state.pageCache.serverKey !== serverKey) {
		return null;
	}

	if (state.cacheGeneration !== state.loadGeneration) {
		return null;
	}

	return state.pageCache.result;
}

export function rememberMttoPagedServerCache(
	serverKey: string,
	result: MttoPagedStorePageResult,
	state: MttoPagedStoreCacheState,
	pageSize?: number
): void {
	state.pageCache = { serverKey, result };
	state.cacheGeneration = state.loadGeneration;
	if (pageSize !== undefined && pageSize !== null) {
		state.lastPageSize = pageSize;
	}
}
