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

const byRubro = {};
rows.slice(1).forEach(r => {
	const cuenta = normalizeCuenta(r[0]);
	if (!cuenta) return;
	const rubro = cuenta[0];
	if (!byRubro[rubro]) byRubro[rubro] = new Set();
	byRubro[rubro].add(cuenta.length);
});

console.log('Rubros and lengths:');
Object.keys(byRubro).sort().forEach(r => {
	console.log('Rubro', r, ':', [...byRubro[r]].sort((a,b)=>a-b).join(', '));
});
