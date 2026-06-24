import * as XLSX from 'xlsx';

export function normalizeCuentaClassWeb(raw: unknown): string {
	const s = String(raw ?? '').trim();
	if (!s) return '';
	return s.replace(/0+$/, '') || '0';
}

export function parseClassWebWorkbook(buffer: ArrayBuffer): {
	cuentaRows: any[];
	centroRows: any[];
} {
	const wb = XLSX.read(buffer, { type: 'array', cellDates: true });
	let cuentaSheet: XLSX.WorkSheet | null = null;
	let centroSheet: XLSX.WorkSheet | null = null;

	for (const name of wb.SheetNames) {
		const normalized = name.toLowerCase().replace(/[\s_-]/g, '');
		if (!cuentaSheet && (normalized.includes('catalogo') || normalized.includes('cuentas'))) {
			cuentaSheet = wb.Sheets[name];
		}
		if (!centroSheet && (normalized.includes('centro') || normalized.includes('costo'))) {
			centroSheet = wb.Sheets[name];
		}
	}

	if (!cuentaSheet && wb.SheetNames.length > 0) {
		cuentaSheet = wb.Sheets[wb.SheetNames.find((n) => n.toUpperCase().includes('CATALOGO')) || wb.SheetNames[0]];
	}
	if (!centroSheet && wb.SheetNames.length > 1) {
		centroSheet = wb.Sheets[wb.SheetNames[1]];
	}

	return {
		cuentaRows: cuentaSheet ? parseCuentaSheet(cuentaSheet) : [],
		centroRows: centroSheet ? parseCentroSheet(centroSheet) : [],
	};
}

function parseCuentaSheet(ws: XLSX.WorkSheet) {
	const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: '' });
	const accounts: any[] = [];
	const seen = new Set<string>();
	const all: any[] = [];
	const byRubro: Record<string, Set<number>> = {};

	for (const row of rows.slice(1)) {
		const cuenta = normalizeCuentaClassWeb(row[0]);
		const nombre = String(row[1] ?? '').trim();
		if (!cuenta || !nombre || seen.has(cuenta)) continue;
		seen.add(cuenta);
		all.push({ cuenta, nombre, rubro: cuenta[0], len: cuenta.length });
		if (!byRubro[all[all.length - 1].rubro]) byRubro[all[all.length - 1].rubro] = new Set();
		byRubro[all[all.length - 1].rubro].add(all[all.length - 1].len);
	}

	const nivelMap: Record<string, Record<number, number>> = {};
	for (const [rubro, lengths] of Object.entries(byRubro)) {
		const sorted = [...lengths].sort((a, b) => a - b);
		nivelMap[rubro] = {};
		sorted.forEach((len, idx) => {
			nivelMap[rubro][len] = idx + 1;
		});
	}

	const cuentaSet = new Set(all.map((a) => a.cuenta));
	for (const acc of all) {
		const rubroNum = acc.rubro;
		const esDebe = ['1', '5', '6'].includes(rubroNum);
		const esHaber = ['2', '3', '4'].includes(rubroNum);
		let mayor = '';
		for (let len = acc.cuenta.length - 1; len >= 1; len--) {
			const prefix = acc.cuenta.substring(0, len);
			if (cuentaSet.has(prefix)) {
				mayor = prefix;
				break;
			}
		}
		accounts.push({
			CUENTA_CONTABLE: acc.cuenta,
			NOMBRE_CUENTA: acc.nombre,
			ES_DEBE: esDebe || (!esDebe && !esHaber),
			ES_HABER: esHaber || (!esDebe && !esHaber),
			ES_DETALLE: !all.some((other) => other.cuenta !== acc.cuenta && other.cuenta.startsWith(acc.cuenta)),
			NIVEL: nivelMap[acc.rubro]?.[acc.len] || 1,
			CUENTA_MAYOR: mayor,
			CODIGO_RUBRO: acc.rubro,
			NO_HABILITADA: false,
			CLASE_RUBRO: 'AC',
			ES_LIQUIDADORA: false,
			CLASE_VALUACION: '',
		});
	}

	return accounts;
}

function parseCentroSheet(ws: XLSX.WorkSheet) {
	const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1, defval: '' });
	const centros: any[] = [];
	const seen = new Set<string>();

	for (const row of rows.slice(1)) {
		let codigo = '';
		let nombre = '';
		for (let col = 0; col < row.length; col += 2) {
			const c = String(row[col] ?? '').trim();
			const n = String(row[col + 1] ?? '').trim();
			if (c) {
				codigo = c;
				nombre = n;
			}
		}
		if (!codigo || !nombre) continue;
		const key = `${codigo}|${nombre}`;
		if (seen.has(key)) continue;
		seen.add(key);
		centros.push({
			CORR_CENTRO_COSTO: 0,
			CODIGO_CENTRO_COSTO: codigo,
			NOMBRE_CENTRO: nombre,
			CUENTA_CONTABLE: '',
			CORR_TIPO_CENTRO_COSTO: 1,
			ESTADO_CENTRO_COSTO: 'AC',
			CORR_UNIDAD_NEGOCIO: 0,
			CORR_AREA_FUNCIONAL: 0,
			CODIGO_TERMINACION: '',
			CORR_EMPLEADO_JEFE: 0,
			CORR_CLIENTE: 0,
		});
	}

	return centros;
}
