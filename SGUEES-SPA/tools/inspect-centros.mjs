import XLSX from 'xlsx';

const file = 'c:\\Users\\jonathan.avalos\\OneDrive - Universidad Evangélica de El Salvador\\Escritorio\\COORDINACIÓN SISTEMA UEES\\Contablidad\\Centro de costos.xlsx';
const wb = XLSX.readFile(file);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });

console.log('First 25 rows:');
rows.slice(0, 25).forEach((r, i) => console.log(i, JSON.stringify(r)));
