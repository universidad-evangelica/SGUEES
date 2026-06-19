import XLSX from 'xlsx';

const file = 'c:\\Users\\jonathan.avalos\\OneDrive - Universidad Evangélica de El Salvador\\Escritorio\\COORDINACIÓN SISTEMA UEES\\Contablidad\\Catalogocuentas.xls';
const wb = XLSX.readFile(file);
const ws = wb.Sheets['CATALOGO DE CUENTAS'];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

function normalizeCuenta(raw) {
	const s = String(raw || '').trim();
	if (!s) return '';
	return s.replace(/0+$/, '') || '0';
}

const map = new Map();
for (const row of rows.slice(1)) {
	const raw = String(row[0]).trim();
	const cuenta = normalizeCuenta(raw);
	if (!cuenta) continue;
	if (!map.has(cuenta)) map.set(cuenta, []);
	map.get(cuenta).push({ raw, nombre: String(row[1] || '').trim() });
}

let count = 0;
for (const [cuenta, items] of map.entries()) {
	if (items.length > 1) {
		count++;
		console.log('DUPLICATE', cuenta, JSON.stringify(items));
	}
}
console.log('Total duplicates:', count);
