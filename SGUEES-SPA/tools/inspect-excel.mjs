import XLSX from 'xlsx';

const files = [
	'c:\\Users\\jonathan.avalos\\OneDrive - Universidad Evangélica de El Salvador\\Escritorio\\COORDINACIÓN SISTEMA UEES\\Contablidad\\Catalogocuentas.xls',
	'c:\\Users\\jonathan.avalos\\OneDrive - Universidad Evangélica de El Salvador\\Escritorio\\COORDINACIÓN SISTEMA UEES\\Contablidad\\Centro de costos.xlsx',
];

for (const file of files) {
	console.log('\n==========', file.split('\\').pop(), '==========');
	const wb = XLSX.readFile(file, { cellDates: true });
	for (const name of wb.SheetNames) {
		const ws = wb.Sheets[name];
		const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
		console.log('Sheet:', name, 'rows:', rows.length);
		console.log('Header:', JSON.stringify(rows[0]));
		console.log('Sample 1:', JSON.stringify(rows[1]));
		console.log('Sample 2:', JSON.stringify(rows[2]));
		console.log('Sample 3:', JSON.stringify(rows[3]));
	}
}
