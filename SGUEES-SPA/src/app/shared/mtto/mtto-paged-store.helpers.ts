export interface MttoPagedStorePageResult {
	data: unknown[];
	totalCount: number;
}

export interface MttoPagedStorePageCache {
	serverKey: string;
	result: MttoPagedStorePageResult;
}

export interface MttoHybridBatchCacheEntry {
	data: unknown[];
	totalCount: number;
}

/** Estado de caché por página/sort — evita GetAll al escribir en filter row (DevExtreme vuelve a llamar load). */
export interface MttoPagedStoreCacheState {
	loadGeneration: number;
	cacheGeneration: number;
	pageCache: MttoPagedStorePageCache | null;
	/** Último pageSize efectivo (modo clásico) — DevExtreme a veces omite take al filtrar. */
	lastPageSize: number;
	/** true cuando el pager/lote está en "Todos" (PAGE_SIZE=0 en API). */
	lastPageAll: boolean;
	/** Lote API en modo híbrido (50/100/0). */
	apiPageSize: number;
	/** Caché de lotes API: clave `apiPage|apiPageSize|sortField|sortDesc`. */
	batchCache: Record<string, MttoHybridBatchCacheEntry>;
	/** Carga completa cuando apiPageSize === 0. */
	fullDataCache: MttoPagedStorePageResult | null;
}

export function createMttoPagedStoreCacheState(
	defaultPageSize = 15,
	defaultApiPageSize?: number
): MttoPagedStoreCacheState {
	const apiPageSize = defaultApiPageSize ?? defaultPageSize;
	return {
		loadGeneration: 0,
		cacheGeneration: -1,
		pageCache: null,
		lastPageSize: defaultPageSize,
		lastPageAll: apiPageSize === 0,
		apiPageSize,
		batchCache: {},
		fullDataCache: null,
	};
}

export function invalidateMttoPagedStoreCache(state: MttoPagedStoreCacheState): void {
	state.loadGeneration += 1;
	state.pageCache = null;
	state.cacheGeneration = -1;
	state.batchCache = {};
	state.fullDataCache = null;
}

/** Sincroniza selección del pager antes del load (modo clásico A+P). */
export function syncMttoPagedStorePagerSize(
	state: MttoPagedStoreCacheState,
	pageSize: number
): void {
	const nextPageAll = pageSize === 0;
	const changed = state.lastPageSize !== pageSize || state.lastPageAll !== nextPageAll;

	state.lastPageSize = pageSize;
	state.lastPageAll = nextPageAll;
	state.apiPageSize = pageSize;

	if (changed) {
		invalidateMttoPagedStoreCache(state);
	}
}

/** Sincroniza lote API en modo híbrido (display pageSize no cambia). */
export function syncMttoHybridApiPageSize(
	state: MttoPagedStoreCacheState,
	apiPageSize: number
): void {
	const nextPageAll = apiPageSize === 0;
	const changed = state.apiPageSize !== apiPageSize || state.lastPageAll !== nextPageAll;

	state.apiPageSize = apiPageSize;
	state.lastPageAll = nextPageAll;
	state.lastPageSize = apiPageSize === 0 ? state.lastPageSize : apiPageSize;

	if (changed) {
		invalidateMttoPagedStoreCache(state);
	}
}

export function buildMttoPagedServerKey(
	page: number,
	pageSize: number,
	sortField = '',
	sortDesc = false
): string {
	return `${page}|${pageSize}|${sortField}|${sortDesc}`;
}

export function buildMttoHybridBatchKey(
	apiPage: number,
	apiPageSize: number,
	sortField = '',
	sortDesc = false
): string {
	return buildMttoPagedServerKey(apiPage, apiPageSize, sortField, sortDesc);
}

export function resolveMttoPagedLoadParams(
	loadOptions: {
		skip?: number;
		take?: number;
		sort?: Array<{ selector?: string; desc?: boolean }>;
	},
	cacheState: MttoPagedStoreCacheState,
	defaultSortField = '',
	gridPageSize?: number
): {
	page: number;
	pageSize: number;
	sortField: string;
	sortDesc: boolean;
	serverKey: string;
} {
	const requestedTake = loadOptions.take;
	let pageSize =
		requestedTake === undefined || requestedTake === null
			? cacheState.lastPageAll
				? 0
				: cacheState.lastPageSize
			: requestedTake;

	if (gridPageSize === 0) {
		pageSize = 0;
	}

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

export interface MttoHybridLoadPlan {
	skip: number;
	take: number;
	sortField: string;
	sortDesc: boolean;
	apiPageSize: number;
	/** Páginas API 1-based necesarias para cubrir la ventana visible. */
	apiPages: number[];
	displayKey: string;
}

/** Plan de carga híbrida: lote API ≠ filas visibles del grid. */
export function resolveMttoHybridLoadPlan(
	loadOptions: {
		skip?: number;
		take?: number;
		sort?: Array<{ selector?: string; desc?: boolean }>;
	},
	cacheState: MttoPagedStoreCacheState,
	defaultSortField = '',
	displayPageSize = 15
): MttoHybridLoadPlan {
	const apiPageSize = cacheState.apiPageSize;
	let skip = loadOptions.skip || 0;
	let take =
		loadOptions.take === undefined || loadOptions.take === null
			? displayPageSize
			: loadOptions.take;

	/**
	 * El pager DX usa pageSize = lote API (50/100) para el selector inferior.
	 * Convertimos skip/take del pager a la ventana visible de `displayPageSize`.
	 */
	if (apiPageSize > 0 && take === apiPageSize) {
		const pageIndex = Math.floor(skip / apiPageSize);
		skip = pageIndex * displayPageSize;
		take = displayPageSize;
	} else if (apiPageSize <= 0) {
		take = take > 0 ? take : displayPageSize;
	} else if (take !== displayPageSize && take > 0) {
		// DX a veces omite take; si viene otro valor, forzar ventana visible.
		const pageIndex = Math.floor(skip / (take || displayPageSize));
		skip = pageIndex * displayPageSize;
		take = displayPageSize;
	}

	const sort = getMttoGridSort(loadOptions.sort);
	const sortField = sort?.field || defaultSortField || '';
	const sortDesc = sort?.desc ?? false;
	const apiPages = getApiPagesForDisplayWindow(skip, take, apiPageSize);

	return {
		skip,
		take,
		sortField,
		sortDesc,
		apiPageSize,
		apiPages,
		displayKey: `d|${skip}|${take}|${apiPageSize}|${sortField}|${sortDesc}`,
	};
}

/**
 * totalCount que el pager DX necesita cuando pageSize = lote API
 * pero las filas visibles son `displayPageSize`.
 */
export function toHybridPagerTotalCount(
	realTotal: number,
	displayPageSize: number,
	apiPageSize: number
): number {
	if (apiPageSize <= 0 || displayPageSize <= 0) {
		return realTotal;
	}
	const displayPages = Math.max(1, Math.ceil(Math.max(0, realTotal) / displayPageSize));
	return displayPages * apiPageSize;
}

/** Páginas API (1-based) que cubren [skip, skip+take). */
export function getApiPagesForDisplayWindow(
	skip: number,
	take: number,
	apiPageSize: number
): number[] {
	if (apiPageSize <= 0) {
		return [1];
	}
	if (take <= 0) {
		return [Math.floor(skip / apiPageSize) + 1];
	}
	const start = Math.max(0, skip);
	const end = start + take - 1;
	const firstPage = Math.floor(start / apiPageSize) + 1;
	const lastPage = Math.floor(end / apiPageSize) + 1;
	const pages: number[] = [];
	for (let page = firstPage; page <= lastPage; page++) {
		pages.push(page);
	}
	return pages;
}

export function tryGetMttoHybridBatch(
	batchKey: string,
	state: MttoPagedStoreCacheState
): MttoHybridBatchCacheEntry | null {
	if (state.cacheGeneration !== state.loadGeneration) {
		return null;
	}
	return state.batchCache[batchKey] ?? null;
}

export function rememberMttoHybridBatch(
	batchKey: string,
	entry: MttoHybridBatchCacheEntry,
	state: MttoPagedStoreCacheState
): void {
	state.batchCache[batchKey] = entry;
	state.cacheGeneration = state.loadGeneration;
}

export function tryGetMttoHybridFullCache(
	state: MttoPagedStoreCacheState
): MttoPagedStorePageResult | null {
	if (!state.fullDataCache || state.cacheGeneration !== state.loadGeneration) {
		return null;
	}
	return state.fullDataCache;
}

export function rememberMttoHybridFullCache(
	result: MttoPagedStorePageResult,
	state: MttoPagedStoreCacheState
): void {
	state.fullDataCache = result;
	state.cacheGeneration = state.loadGeneration;
	state.lastPageAll = true;
	state.apiPageSize = 0;
}

/** Arma la página visible a partir de uno o más lotes API (incluye cruce de lotes). */
export function sliceMttoHybridDisplayPage(
	skip: number,
	take: number,
	apiPageSize: number,
	batchesByApiPage: Map<number, unknown[]>,
	totalCount: number
): MttoPagedStorePageResult {
	if (apiPageSize <= 0) {
		const all = batchesByApiPage.get(1) ?? [];
		const effectiveTotal = all.length || totalCount;
		return {
			data: all.slice(skip, skip + take),
			totalCount: effectiveTotal,
		};
	}

	const data: unknown[] = [];
	for (let i = 0; i < take; i++) {
		const globalIndex = skip + i;
		if (globalIndex >= totalCount) {
			break;
		}
		const apiPage = Math.floor(globalIndex / apiPageSize) + 1;
		const offsetInBatch = globalIndex % apiPageSize;
		const batch = batchesByApiPage.get(apiPage);
		if (batch && offsetInBatch < batch.length) {
			data.push(batch[offsetInBatch]);
		}
	}

	return { data, totalCount };
}

/**
 * Carga híbrida: obtiene lotes faltantes vía fetchBatch y devuelve el slice visible.
 * `fetchBatch(apiPage, apiPageSize, sortField, sortDesc)` — apiPageSize 0 = Todos.
 * El `totalCount` se ajusta para el pager DX cuando pageSize del grid = lote API.
 */
export async function loadMttoHybridDisplayPage(
	plan: MttoHybridLoadPlan,
	state: MttoPagedStoreCacheState,
	fetchBatch: (
		apiPage: number,
		apiPageSize: number,
		sortField: string,
		sortDesc: boolean
	) => Promise<MttoPagedStorePageResult>,
	displayPageSize = 15
): Promise<MttoPagedStorePageResult> {
	const { skip, take, sortField, sortDesc, apiPageSize, apiPages } = plan;

	if (apiPageSize <= 0) {
		let full = tryGetMttoHybridFullCache(state);
		if (!full) {
			full = await fetchBatch(1, 0, sortField, sortDesc);
			rememberMttoHybridFullCache(full, state);
		}
		const batches = new Map<number, unknown[]>([[1, full.data]]);
		return sliceMttoHybridDisplayPage(skip, take, 0, batches, full.totalCount || full.data.length);
	}

	const batchesByApiPage = new Map<number, unknown[]>();
	let realTotal = 0;

	for (const apiPage of apiPages) {
		const batchKey = buildMttoHybridBatchKey(apiPage, apiPageSize, sortField, sortDesc);
		let entry = tryGetMttoHybridBatch(batchKey, state);
		if (!entry) {
			const fetched = await fetchBatch(apiPage, apiPageSize, sortField, sortDesc);
			entry = { data: fetched.data, totalCount: fetched.totalCount };
			rememberMttoHybridBatch(batchKey, entry, state);
		}
		batchesByApiPage.set(apiPage, entry.data);
		realTotal = entry.totalCount;
	}

	const sliced = sliceMttoHybridDisplayPage(skip, take, apiPageSize, batchesByApiPage, realTotal);
	return {
		data: sliced.data,
		totalCount: toHybridPagerTotalCount(realTotal, displayPageSize, apiPageSize),
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
		state.lastPageAll = pageSize === 0;
		state.apiPageSize = pageSize;
	}
}
