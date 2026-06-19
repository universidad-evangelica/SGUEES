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

const normalized = rows.slice(1, 40).map((r, i) => ({
	row: i + 2,
	raw: String(r[0]).trim(),
	cuenta: normalizeCuenta(r[0]),
	nombre: String(r[1] || '').trim(),
	len: normalizeCuenta(r[0]).length,
	rubro: (normalizeCuenta(r[0]) || '')[0] || '',
}));
console.log(JSON.stringify(normalized, null, 2));

const lengths = new Set();
rows.slice(1).forEach(r => {
	const c = normalizeCuenta(r[0]);
	if (c) lengths.add(c.length);
});
console.log('Distinct account lengths:', [...lengths].sort((a,b)=>a-b));
