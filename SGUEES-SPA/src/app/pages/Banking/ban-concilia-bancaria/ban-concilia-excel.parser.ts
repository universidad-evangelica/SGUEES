import ExcelJS from 'exceljs';
import { BanConciliaImportRow } from './models/ban-concilia-import-row';

function truncImportText(value: string | undefined, maxLen: number): string {
	return (value ?? '').trim().slice(0, maxLen);
}

const IMPORT_LIMITS = {
	NUMERO_REFERENCIA_BANCO: 255,
	CODIGO_TIPO_MOVIMIENTO: 30,
	NOMBRE_TIPO_MOVIMIENTO: 255,
} as const;

function normalizeImportRow(row: BanConciliaImportRow): BanConciliaImportRow {
	return {
		...row,
		NUMERO_REFERENCIA_BANCO: truncImportText(row.NUMERO_REFERENCIA_BANCO, IMPORT_LIMITS.NUMERO_REFERENCIA_BANCO),
		CODIGO_TIPO_MOVIMIENTO: truncImportText(row.CODIGO_TIPO_MOVIMIENTO, IMPORT_LIMITS.CODIGO_TIPO_MOVIMIENTO),
		NOMBRE_TIPO_MOVIMIENTO: truncImportText(row.NOMBRE_TIPO_MOVIMIENTO, IMPORT_LIMITS.NOMBRE_TIPO_MOVIMIENTO),
	};
}

function cellText(cell: any): string {
	const v = cell?.value;
	if (v == null) {
		return '';
	}
	if (v instanceof Date) {
		return v.toISOString();
	}
	if (typeof v === 'object' && 'text' in v) {
		return String(v.text ?? '').trim();
	}
	return String(v).trim();
}

function cellNumber(cell: any): number {
	const raw = cellText(cell).replace(/,/g, '');
	if (!raw) {
		return 0;
	}
	if (raw.includes('(') && raw.includes(')')) {
		const inner = raw.split('(').pop()?.replace(')', '').trim() ?? '0';
		return Math.abs(parseFloat(inner)) || 0;
	}
	return parseFloat(raw) || 0;
}

function cellDate(cell: any): Date | null {
	const v = cell?.value;
	if (v instanceof Date) {
		return v;
	}
	const text = cellText(cell);
	if (!text) {
		return null;
	}
	const parsed = Date.parse(text);
	if (!Number.isNaN(parsed)) {
		return new Date(parsed);
	}
	const mmm = text.match(/^(\d{1,2})\/([A-Za-z]{3})\/(\d{4})$/);
	if (mmm) {
		const months: Record<string, number> = {
			ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
			jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11,
		};
		const mon = months[mmm[2].toLowerCase().slice(0, 3)];
		if (mon != null) {
			return new Date(parseInt(mmm[3], 10), mon, parseInt(mmm[1], 10));
		}
	}
	return null;
}

function rowValues(row: any): string[] {
	const values: string[] = [];
	row.eachCell({ includeEmpty: true }, (cell: any, colNumber: number) => {
		values[colNumber - 1] = cellText(cell);
	});
	return values;
}

function parseCreditoLafis(rows: string[][]): BanConciliaImportRow[] {
	const data = rows.slice(1).filter((r) => r.some((c) => c));
	const result: BanConciliaImportRow[] = [];
	data.forEach((r, index) => {
		const fecha = cellDate({ value: r[0] });
		if (!fecha) {
			return;
		}
		result.push({
			CORR: index + 1,
			FECHA_MOVIMIENTO: fecha,
			NUMERO_REFERENCIA_BANCO: r[1] ?? '',
			CODIGO_TIPO_MOVIMIENTO: r[2] ?? '',
			NOMBRE_TIPO_MOVIMIENTO: r[3] ?? '',
			MONTO_CARGO: cellNumber({ value: r[4] }),
			MONTO_ABONO: cellNumber({ value: r[5] }),
		});
	});
	return result;
}

function parsePromer(rows: string[][]): BanConciliaImportRow[] {
	const data = rows.slice(1).filter((r) => (r[2] ?? '').trim());
	const result: BanConciliaImportRow[] = [];
	data.forEach((r, index) => {
		const fecha = cellDate({ value: r[0] });
		if (!fecha) {
			return;
		}
		const descripcion = r[2] ?? '';
		const parts = descripcion.split('-');
		const monto = cellNumber({ value: r[3] });
		result.push({
			CORR: index + 1,
			FECHA_MOVIMIENTO: fecha,
			NUMERO_REFERENCIA_BANCO: r[1] ?? '',
			CODIGO_TIPO_MOVIMIENTO: (parts[0] ?? '').trim(),
			NOMBRE_TIPO_MOVIMIENTO: (parts.slice(1).join('-') ?? descripcion).trim(),
			MONTO_CARGO: monto < 0 ? Math.abs(monto) : 0,
			MONTO_ABONO: monto > 0 ? monto : 0,
		});
	});
	return result;
}

function parseAvanz(rows: string[][]): BanConciliaImportRow[] {
	let data = rows.slice(17);
	if (data.length > 2) {
		data = data.slice(0, data.length - 2);
	}
	const trimmed = data
		.map((r) => {
			const copy = [...r];
			[8, 8, 7, 6, 6, 4, 4, 3, 1].forEach((idx) => {
				if (copy.length > idx) {
					copy.splice(idx, 1);
				}
			});
			return copy;
		})
		.filter((r) => r.some((c) => c));

	const result: BanConciliaImportRow[] = [];
	trimmed.forEach((r, index) => {
		const fecha = cellDate({ value: r[0] });
		if (!fecha) {
			return;
		}
		const montoRaw = r[7] ?? '';
		const cargo = montoRaw.includes('(') ? cellNumber({ value: montoRaw }) : 0;
		const abono = !montoRaw.includes('(') ? cellNumber({ value: montoRaw }) : 0;
		result.push({
			CORR: index + 1,
			FECHA_MOVIMIENTO: fecha,
			NUMERO_REFERENCIA_BANCO: r[1] ?? '',
			CODIGO_TIPO_MOVIMIENTO: '',
			NOMBRE_TIPO_MOVIMIENTO: r[3] ?? '',
			MONTO_CARGO: cargo,
			MONTO_ABONO: abono,
		});
	});
	return result;
}

function normalizeClaseBanco(claseBanco: string): string {
	const clase = (claseBanco ?? '').trim().toUpperCase();
	if (clase === 'BPM') {
		return 'PROME';
	}
	if (clase === 'BAG') {
		return 'BAGRI';
	}
	return clase;
}

function parseCsvLines(text: string): string[] {
	return text.split(/\r?\n/);
}

function trimCsvColumn(value: string | undefined): string {
	return (value ?? '').trim().replace(/^,+|,+$|,$/g, '').trim();
}

/** Credomatic: CSV/TXT con columnas Fecha, Ref, Código, Descripción, Débito, Crédito (e-Admin FillData). */
function parseCreditoCsv(text: string): BanConciliaImportRow[] {
	const filas = parseCsvLines(text);
	const lineasEncabezado = 5;
	const lineasPie = 7;
	const result: BanConciliaImportRow[] = [];
	let corr = 0;

	for (let i = lineasEncabezado; i <= filas.length - 1 - lineasPie; i++) {
		const line = filas[i];
		if (!line?.trim()) {
			continue;
		}
		const columnas = line.split(',');
		if (columnas.length < 6) {
			continue;
		}
		const fecha = cellDate({ value: trimCsvColumn(columnas[0]) });
		if (!fecha) {
			continue;
		}
		corr += 1;
		result.push(
			normalizeImportRow({
				CORR: corr,
				FECHA_MOVIMIENTO: fecha,
				NUMERO_REFERENCIA_BANCO: `${trimCsvColumn(columnas[1])} - ${trimCsvColumn(columnas[3])}`,
				CODIGO_TIPO_MOVIMIENTO: trimCsvColumn(columnas[2]),
				NOMBRE_TIPO_MOVIMIENTO: trimCsvColumn(columnas[3]),
				MONTO_CARGO: cellNumber({ value: trimCsvColumn(columnas[4]) }),
				MONTO_ABONO: cellNumber({ value: trimCsvColumn(columnas[5]) }),
			})
		);
	}
	return result;
}

/** Banco Agrícola: archivo de ancho fijo (e-Admin FillDataAgricola). */
function parseAgricolaFixedWidth(text: string): BanConciliaImportRow[] {
	const filas = parseCsvLines(text);
	const lineasEncabezado = 6;
	const lineasPie = 1;
	const result: BanConciliaImportRow[] = [];
	let corr = 0;

	for (let i = lineasEncabezado; i <= filas.length - 1 - lineasPie; i++) {
		const xFila = filas[i];
		if (!xFila || xFila.length < 177) {
			continue;
		}
		const fecha = cellDate({ value: xFila.substring(24, 34).trim() });
		if (!fecha) {
			continue;
		}
		const codigo = xFila.substring(64, 79).trim();
		const descripcion = xFila.substring(80, 120).trim();
		const referencia = xFila.substring(120, 145).trim();
		let cargo = 0;
		let abono = 0;
		const montoCargo = xFila.substring(146, 161).trim();
		if (montoCargo) {
			cargo = cellNumber({ value: montoCargo.replace(/\$/g, '') });
		}
		const montoAbono = xFila.substring(162, 177).trim();
		if (montoAbono) {
			abono = cellNumber({ value: montoAbono.replace(/\$/g, '') });
		}
		corr += 1;
		result.push(
			normalizeImportRow({
				CORR: corr,
				FECHA_MOVIMIENTO: fecha,
				NUMERO_REFERENCIA_BANCO: referencia,
				CODIGO_TIPO_MOVIMIENTO: codigo,
				NOMBRE_TIPO_MOVIMIENTO: descripcion,
				MONTO_CARGO: cargo,
				MONTO_ABONO: abono,
			})
		);
	}
	return result;
}

function parseRowsByClase(rows: string[][], clase: string): BanConciliaImportRow[] {
	let parsed: BanConciliaImportRow[];
	if (clase === 'PROME') {
		parsed = parsePromer(rows);
	} else if (clase === 'AVANZ') {
		parsed = parseAvanz(rows);
	} else {
		parsed = parseCreditoLafis(rows);
	}
	return parsed.map(normalizeImportRow);
}

async function parseBanConciliaExcelInternal(file: File, clase: string): Promise<BanConciliaImportRow[]> {
	const buffer = await file.arrayBuffer();
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.load(buffer);
	const worksheet = workbook.worksheets[0];
	if (!worksheet) {
		throw new Error('El archivo Excel no contiene hojas de cálculo.');
	}

	const rows: string[][] = [];
	worksheet.eachRow((row: any) => {
		rows.push(rowValues(row));
	});

	return parseRowsByClase(rows, clase);
}

export async function parseBanConciliaImportFile(file: File, claseBanco: string): Promise<BanConciliaImportRow[]> {
	const clase = normalizeClaseBanco(claseBanco);
	const ext = (file.name.split('.').pop() ?? '').toLowerCase();

	if (ext === 'csv' || ext === 'txt') {
		const text = await file.text();
		if (clase === 'BAGRI') {
			return parseAgricolaFixedWidth(text);
		}
		if (clase === 'CREDO') {
			return parseCreditoCsv(text);
		}
		throw new Error(
			'Este banco no admite importación CSV/TXT. Use Excel o verifique la clase del banco (Agrícola = CSV, Credomatic = CSV/Excel).'
		);
	}

	if (ext === 'xlsx' || ext === 'xls') {
		return parseBanConciliaExcelInternal(file, clase);
	}

	throw new Error('Formato no soportado. Use Excel (.xlsx, .xls) o CSV/TXT según el banco.');
}

/** @deprecated Use parseBanConciliaImportFile */
export async function parseBanConciliaExcel(file: File, claseBanco: string): Promise<BanConciliaImportRow[]> {
	return parseBanConciliaImportFile(file, claseBanco);
}
