import ExcelJS from 'exceljs';
import { BanConciliaImportRow } from './models/ban-concilia-import-row';

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

export async function parseBanConciliaExcel(file: File, claseBanco: string): Promise<BanConciliaImportRow[]> {
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

	const clase = (claseBanco ?? '').toUpperCase();
	if (clase === 'PROME') {
		return parsePromer(rows);
	}
	if (clase === 'AVANZ') {
		return parseAvanz(rows);
	}
	return parseCreditoLafis(rows);
}
