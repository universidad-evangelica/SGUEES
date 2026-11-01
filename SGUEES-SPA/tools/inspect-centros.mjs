import { readExcelFile, worksheetToRows } from './excel-read-rows.mjs';

const file = 'c:\\Users\\jonathan.avalos\\OneDrive - Universidad Evangélica de El Salvador\\Escritorio\\COORDINACIÓN SISTEMA UEES\\Contablidad\\Centro de costos.xlsx';
const wb = await readExcelFile(file);
const rows = worksheetToRows(wb.worksheets[0]);

console.log('First 25 rows:');
rows.slice(0, 25).forEach((r, i) => console.log(i, JSON.stringify(r)));
