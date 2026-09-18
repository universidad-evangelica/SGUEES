import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

/**
 * ============================================================
 * Visor universal SelectionHiring — UN solo ASPX
 * ============================================================
 * {UrlRpt}Layouts/SelectionHiring/SelectionHiring.aspx
 *   ?fuente=sc-requisicion-personal
 *   &report=rptRequisicionPersonal
 *   [&formato=corto]     // opcional si la fuente tiene varios reportes
 *   &CORR_...=...
 *   &token=JWT
 *
 * CÓMO AGREGAR UN REPORTE NUEVO
 * 1. RPT: crear el XtraReport (.cs) y UN case en SelectionHiring.aspx.cs → ResolveReport()
 * 2. SPA: opcionalmente agregar clave en SELECTION_HIRING_RPT
 * 3. En el componente llamar buildSelectionHiringRptUrl({ fuente, report, formato?, params, token })
 *
 * fuente = resolveSelectionHiringFuente(this.router, this.urlOpcion)  // ruta del componente
 * No hay handlers ni ASPX por fuente.
 * ============================================================
 */

/** Claves `report=` (deben coincidir con el case en SelectionHiring.aspx.cs). */
export const SELECTION_HIRING_RPT = {
	REQUISICION_PERSONAL: 'rptRequisicionPersonal',
	// DESCRIPTOR_PUESTO: 'rptDescriptorPuesto', // + formato corto|extenso cuando exista
} as const;

export type SelectionHiringRptKey =
	(typeof SELECTION_HIRING_RPT)[keyof typeof SELECTION_HIRING_RPT];

export interface BuildSelectionHiringRptUrlOptions {
	/** Ruta SPA sin slash (ej. sc-requisicion-personal). */
	fuente: string;
	/** Nombre lógico del XtraReport (SELECTION_HIRING_RPT.*). */
	report: string;
	/** Variante opcional (corto | extenso, etc.). */
	formato?: string;
	/** Params de negocio que lee el case en SelectionHiring.aspx.cs. */
	params: Record<string, string | number | null | undefined>;
	token: string;
	baseUrl?: string;
}

/** `fuente` desde la ruta del componente (path del menú SPA). */
export function resolveSelectionHiringFuente(
	route: ActivatedRoute | null | undefined,
	urlOpcion?: string | null,
): string {
	let current: ActivatedRoute | null | undefined = route;
	while (current) {
		const path = (current.snapshot?.routeConfig?.path || '').trim();
		if (path && path !== '**') {
			return path.replace(/^\/+/, '');
		}
		current = current.parent;
	}

	const fromOpcion = (urlOpcion || '').trim().replace(/^\/+/, '');
	return fromOpcion || '';
}

/** Arma la URL del único visor SelectionHiring.aspx. */
export function buildSelectionHiringRptUrl(opts: BuildSelectionHiringRptUrlOptions): string {
	const base = (opts.baseUrl ?? (environment as { UrlRpt?: string }).UrlRpt ?? '').replace(/\/?$/, '/');
	const qs = new URLSearchParams();
	qs.set('fuente', (opts.fuente || '').trim());
	qs.set('report', (opts.report || '').trim());
	if (opts.formato?.trim()) {
		qs.set('formato', opts.formato.trim());
	}
	Object.keys(opts.params || {}).forEach((key) => {
		const value = opts.params[key];
		if (value === null || value === undefined || value === '') {
			return;
		}
		qs.set(key, String(value));
	});
	qs.set('token', opts.token);

	return `${base}Layouts/SelectionHiring/SelectionHiring.aspx?${qs.toString()}`;
}

export const SELECTION_HIRING_RPT_MESSAGE_SOURCE = 'SelectionHiring';
