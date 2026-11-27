import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';

/**
 * ============================================================
 * Visor universal Accounting — UN solo ASPX
 * ============================================================
 * {UrlRpt}Layouts/Accounting/Accounting.aspx
 *   ?fuente=con-partida
 *   &report=rptPartidaContable
 *   [&formato=...]     // opcional si la fuente tiene varios reportes
 *   &CORR_...=...
 *   &token=JWT
 *
 * CÓMO AGREGAR UN REPORTE NUEVO
 * 1. RPT: crear el XtraReport (.cs) y UN case en Accounting.aspx.cs → ResolveReport()
 * 2. SPA: opcionalmente agregar clave en ACCOUNTING_RPT
 * 3. En el componente llamar buildAccountingRptUrl({ fuente, report, formato?, params, token })
 *
 * fuente = resolveAccountingFuente(this.router, this.urlOpcion)  // ruta del componente
 * No hay handlers ni ASPX por fuente.
 * ============================================================
 */

/** Claves `report=` (deben coincidir con el case en Accounting.aspx.cs). */
export const ACCOUNTING_RPT = {
	PARTIDA_CONTABLE: 'rptPartidaContable',
} as const;

export type AccountingRptKey = (typeof ACCOUNTING_RPT)[keyof typeof ACCOUNTING_RPT];

export interface BuildAccountingRptUrlOptions {
	/** Ruta SPA sin slash (ej. con-partida). */
	fuente: string;
	/** Nombre lógico del XtraReport (ACCOUNTING_RPT.*). */
	report: string;
	/** Variante opcional. */
	formato?: string;
	/** Params de negocio que lee el case en Accounting.aspx.cs. */
	params: Record<string, string | number | null | undefined>;
	token: string;
	baseUrl?: string;
}

/** `fuente` desde la ruta del componente (path del menú SPA). */
export function resolveAccountingFuente(
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

/** Arma la URL del único visor Accounting.aspx. */
export function buildAccountingRptUrl(opts: BuildAccountingRptUrlOptions): string {
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

	return `${base}Layouts/Accounting/Accounting.aspx?${qs.toString()}`;
}

export const ACCOUNTING_RPT_MESSAGE_SOURCE = 'Accounting';
