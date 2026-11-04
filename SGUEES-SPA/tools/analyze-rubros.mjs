import { readExcelFile, worksheetToRows } from './excel-read-rows.mjs';

const file = 'c:\\Users\\jonathan.avalos\\OneDrive - Universidad Evangélica de El Salvador\\Escritorio\\COORDINACIÓN SISTEMA UEES\\Contablidad\\Catalogocuentas.xls';
if (!file.toLowerCase().endsWith('.xlsx')) {
	console.error('Convierta el archivo a .xlsx para usar este script con ExcelJS.');
	process.exit(1);
}
const wb = await readExcelFile(file);
const ws = wb.getWorksheet('CATALOGO DE CUENTAS') ?? wb.worksheets[0];
const rows = worksheetToRows(ws);

function normalizeCuenta(raw) {
	const s = String(raw || '').trim();
	if (!s) return '';
	return s.replace(/0+$/, '') || '0';
}

const byRubro = {};
rows.slice(1).forEach((r) => {
	const cuenta = normalizeCuenta(r[0]);
	if (!cuenta) return;
	const rubro = cuenta[0];
	if (!byRubro[rubro]) byRubro[rubro] = new Set();
	byRubro[rubro].add(cuenta.length);
});

console.log('Rubros and lengths:');
Object.keys(byRubro)
	.sort()
	.forEach((r) => {
		console.log('Rubro', r, ':', [...byRubro[r]].sort((a, b) => a - b).join(', '));
	});
