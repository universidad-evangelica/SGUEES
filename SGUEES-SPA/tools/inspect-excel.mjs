import { readExcelFile, worksheetToRows } from './excel-read-rows.mjs';

const files = [
	'c:\\Users\\jonathan.avalos\\OneDrive - Universidad Evangélica de El Salvador\\Escritorio\\COORDINACIÓN SISTEMA UEES\\Contablidad\\Catalogocuentas.xls',
	'c:\\Users\\jonathan.avalos\\OneDrive - Universidad Evangélica de El Salvador\\Escritorio\\COORDINACIÓN SISTEMA UEES\\Contablidad\\Centro de costos.xlsx',
];

for (const file of files) {
	console.log('\n==========', file.split('\\').pop(), '==========');
	if (!file.toLowerCase().endsWith('.xlsx')) {
		console.log('Omitido: use formato .xlsx (ExcelJS no lee .xls legacy).');
		continue;
	}
	const wb = await readExcelFile(file);
	for (const ws of wb.worksheets) {
		const rows = worksheetToRows(ws);
		console.log('Sheet:', ws.name, 'rows:', rows.length);
		console.log('Header:', JSON.stringify(rows[0]));
		console.log('Sample 1:', JSON.stringify(rows[1]));
		console.log('Sample 2:', JSON.stringify(rows[2]));
		console.log('Sample 3:', JSON.stringify(rows[3]));
	}
}
