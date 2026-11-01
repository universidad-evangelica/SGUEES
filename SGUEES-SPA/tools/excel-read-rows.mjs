import ExcelJS from 'exceljs';

function cellPlainValue(value) {
	if (value == null) return '';
	if (value instanceof Date) return value;
	if (typeof value === 'object') {
		if (value.result !== undefined) return value.result;
		if (value.text !== undefined) return value.text;
		if (Array.isArray(value.richText)) {
			return value.richText.map((p) => p.text ?? '').join('');
		}
	}
	return value;
}

export function worksheetToRows(worksheet) {
	const rows = [];
	worksheet.eachRow({ includeEmpty: false }, (row) => {
		const vals = row.values;
		if (!vals || !Array.isArray(vals)) {
			rows.push([]);
			return;
		}
		rows.push(vals.slice(1).map((v) => cellPlainValue(v)));
	});
	return rows;
}

export async function readExcelFile(filePath) {
	const workbook = new ExcelJS.Workbook();
	await workbook.xlsx.readFile(filePath);
	return workbook;
}
