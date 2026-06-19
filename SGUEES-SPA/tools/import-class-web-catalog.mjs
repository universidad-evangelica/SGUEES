import XLSX from 'xlsx';
import fs from 'fs';
import { execSync } from 'child_process';

const CORR_EMPRESA = 1;
const CUENTAS_FILE =
	'c:\\Users\\jonathan.avalos\\OneDrive - Universidad Evangélica de El Salvador\\Escritorio\\COORDINACIÓN SISTEMA UEES\\Contablidad\\Catalogocuentas.xls';
const CENTROS_FILE =
	'c:\\Users\\jonathan.avalos\\OneDrive - Universidad Evangélica de El Salvador\\Escritorio\\COORDINACIÓN SISTEMA UEES\\Contablidad\\Centro de costos.xlsx';
const SQL_OUT = 'c:\\Desarrollo GIT\\SGUEES\\SGUEES-DB\\Scripts\\IMPORT_CLASS_WEB_CATALOGOS.sql';

function normalizeCuenta(raw) {
	const s = String(raw || '').trim();
	if (!s) return '';
	return s.replace(/0+$/, '') || '0';
}

function sqlStr(value) {
	if (value === null || value === undefined) return "''";
	return "N'" + String(value).replace(/'/g, "''").trim() + "'";
}

function parseCuentas() {
	const wb = XLSX.readFile(CUENTAS_FILE);
	const ws = wb.Sheets['CATALOGO DE CUENTAS'];
	const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
	const accounts = [];
	const seen = new Set();

	for (const row of rows.slice(1)) {
		const cuenta = normalizeCuenta(row[0]);
		const nombre = String(row[1] || '').trim();
		if (!cuenta || !nombre) continue;
		if (seen.has(cuenta)) continue;
		seen.add(cuenta);
		accounts.push({ cuenta, nombre, rubro: cuenta[0], len: cuenta.length });
	}

	const byRubro = {};
	for (const acc of accounts) {
		if (!byRubro[acc.rubro]) byRubro[acc.rubro] = new Set();
		byRubro[acc.rubro].add(acc.len);
	}

	const nivelMap = {};
	for (const [rubro, lengths] of Object.entries(byRubro)) {
		const sorted = [...lengths].sort((a, b) => a - b);
		nivelMap[rubro] = {};
		sorted.forEach((len, idx) => {
			nivelMap[rubro][len] = idx + 1;
		});
	}

	const cuentaSet = new Set(accounts.map((a) => a.cuenta));
	for (const acc of accounts) {
		acc.nivel = nivelMap[acc.rubro][acc.len] || 1;
		acc.esDetalle = !accounts.some(
			(other) => other.cuenta !== acc.cuenta && other.cuenta.startsWith(acc.cuenta)
		);
		let mayor = '';
		for (let len = acc.cuenta.length - 1; len >= 1; len--) {
			const prefix = acc.cuenta.substring(0, len);
			if (cuentaSet.has(prefix)) {
				mayor = prefix;
				break;
			}
		}
		acc.cuentaMayor = mayor;
		const rubroNum = acc.rubro;
		const esDebe = ['1', '5', '6'].includes(rubroNum);
		const esHaber = ['2', '3', '4'].includes(rubroNum);
		acc.esDebe = esDebe || (!esDebe && !esHaber);
		acc.esHaber = esHaber || (!esDebe && !esHaber);
	}

	accounts.sort((a, b) => a.len - b.len || a.cuenta.localeCompare(b.cuenta));
	return { accounts, byRubro, nivelMap };
}

function parseCentros() {
	const wb = XLSX.readFile(CENTROS_FILE);
	const ws = wb.Sheets[wb.SheetNames[0]];
	const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
	const centros = [];
	const seenCentros = new Set();

	for (const row of rows.slice(1)) {
		let codigo = '';
		let nombre = '';
		for (let col = 0; col < row.length; col += 2) {
			const c = String(row[col] || '').trim();
			const n = String(row[col + 1] || '').trim();
			if (c) {
				codigo = c;
				nombre = n;
			}
		}
		if (!codigo || !nombre) continue;
		const key = codigo + '|' + nombre;
		if (seenCentros.has(key)) continue;
		seenCentros.add(key);
		centros.push({ codigo, nombre });
	}

	return centros;
}

function rubroName(code) {
	const names = {
		1: 'ACTIVO',
		2: 'PASIVO',
		3: 'PATRIMONIO',
		4: 'INGRESOS',
		5: 'COSTOS',
		6: 'GASTOS',
	};
	return names[code] || `RUBRO ${code}`;
}

function buildSql({ accounts, byRubro }, centros) {
	const lines = [];
	lines.push('SET NOCOUNT ON;');
	lines.push('BEGIN TRY');
	lines.push('BEGIN TRAN;');
	lines.push(`DECLARE @CORR_EMPRESA INT = ${CORR_EMPRESA};`);
	lines.push('');
	lines.push('-- Limpieza previa');
	lines.push('DELETE FROM CON_CATALOGO_CUENTA_CENTRO_COSTO WHERE CORR_EMPRESA=@CORR_EMPRESA;');
	lines.push('DELETE FROM CON_CATALOGO_CUENTA WHERE CORR_EMPRESA=@CORR_EMPRESA;');
	lines.push('DELETE FROM CON_CENTRO_COSTO WHERE CORR_EMPRESA=@CORR_EMPRESA;');
	lines.push('');
	lines.push('-- Rubros faltantes');
	for (const rubro of Object.keys(byRubro).sort()) {
		const esDebe = ['1', '5', '6'].includes(rubro) ? 1 : 0;
		const esHaber = ['2', '3', '4'].includes(rubro) ? 1 : 0;
		lines.push(`IF NOT EXISTS (SELECT 1 FROM CON_RUBRO WHERE CORR_EMPRESA=@CORR_EMPRESA AND CODIGO_RUBRO=${sqlStr(rubro)})`);
		lines.push(
			`  INSERT INTO CON_RUBRO (CORR_EMPRESA, CODIGO_RUBRO, NOMBRE_RUBRO, ES_DEBE, ES_HABER, CLASE_RUBRO) VALUES (@CORR_EMPRESA, ${sqlStr(rubro)}, ${sqlStr(rubroName(rubro))}, ${esDebe}, ${esHaber}, 'AC');`
		);
	}
	lines.push('');
	lines.push('-- Niveles por rubro segun largos reales del catalogo CLASS_WEB');
	for (const rubro of Object.keys(byRubro).sort()) {
		const sorted = [...byRubro[rubro]].sort((a, b) => a - b);
		sorted.forEach((len, idx) => {
			const nivel = idx + 1;
			lines.push(`IF NOT EXISTS (SELECT 1 FROM CON_RUBRO_NIVEL WHERE CORR_EMPRESA=@CORR_EMPRESA AND CODIGO_RUBRO=${sqlStr(rubro)} AND NIVEL=${nivel})`);
			lines.push(`  INSERT INTO CON_RUBRO_NIVEL (CORR_EMPRESA, CODIGO_RUBRO, NIVEL, NUMERO_CARACTERES) VALUES (@CORR_EMPRESA, ${sqlStr(rubro)}, ${nivel}, ${len});`);
			lines.push('ELSE');
			lines.push(`  UPDATE CON_RUBRO_NIVEL SET NUMERO_CARACTERES=${len} WHERE CORR_EMPRESA=@CORR_EMPRESA AND CODIGO_RUBRO=${sqlStr(rubro)} AND NIVEL=${nivel};`);
		});
	}
	lines.push('');
	lines.push('DELETE FROM CON_CATALOGO_CUENTA WHERE CORR_EMPRESA=@CORR_EMPRESA;');
	lines.push('');
	lines.push('-- Catalogo de cuentas');
	for (const acc of accounts) {
		lines.push(
			'INSERT INTO CON_CATALOGO_CUENTA (CORR_EMPRESA, CUENTA_CONTABLE, NOMBRE_CUENTA, ES_DEBE, ES_HABER, ES_DETALLE, NIVEL, CUENTA_MAYOR, CODIGO_RUBRO, NO_HABILITADA, CLASE_RUBRO, ES_LIQUIDADORA, CLASE_VALUACION) VALUES (' +
				`@CORR_EMPRESA, ${sqlStr(acc.cuenta)}, ${sqlStr(acc.nombre)}, ${acc.esDebe ? 1 : 0}, ${acc.esHaber ? 1 : 0}, ${acc.esDetalle ? 1 : 0}, ${acc.nivel}, ${sqlStr(acc.cuentaMayor)}, ${sqlStr(acc.rubro)}, 0, 'AC', 0, '');`
		);
	}
	lines.push('');
	lines.push('-- Centros de costo');
	let corr = 0;
	for (const c of centros) {
		corr++;
		lines.push(
			'INSERT INTO CON_CENTRO_COSTO (CORR_EMPRESA, CORR_CENTRO_COSTO, NOMBRE_CENTRO, CUENTA_CONTABLE, CODIGO_CENTRO_COSTO, CORR_TIPO_CENTRO_COSTO, ESTADO_CENTRO_COSTO, CORR_UNIDAD_NEGOCIO, CORR_AREA_FUNCIONAL, CODIGO_TERMINACION, CORR_EMPLEADO_JEFE, CORR_CLIENTE, FECHA_INICIAL, FECHA_FINAL) VALUES (' +
				`@CORR_EMPRESA, ${corr}, ${sqlStr(c.nombre)}, '', ${sqlStr(c.codigo)}, 1, 'AC', 0, 0, '', 0, 0, GETDATE(), '9999-12-31');`
		);
	}
	lines.push('');
	lines.push(`SELECT COUNT(*) AS CuentasImportadas FROM CON_CATALOGO_CUENTA WHERE CORR_EMPRESA=@CORR_EMPRESA;`);
	lines.push(`SELECT COUNT(*) AS CentrosImportados FROM CON_CENTRO_COSTO WHERE CORR_EMPRESA=@CORR_EMPRESA;`);
	lines.push('COMMIT;');
	lines.push('END TRY');
	lines.push('BEGIN CATCH');
	lines.push('  IF @@TRANCOUNT > 0 ROLLBACK;');
	lines.push('  THROW;');
	lines.push('END CATCH');
	return lines.join('\n');
}

const cuentas = parseCuentas();
const centros = parseCentros();
console.log(`Cuentas: ${cuentas.accounts.length}, Centros: ${centros.length}`);
const sql = buildSql(cuentas, centros);
fs.writeFileSync(SQL_OUT, sql, 'utf8');
console.log('SQL written to', SQL_OUT);

process.env.SQLCMDPASSWORD = 'Uees$$2026';
try {
	const out = execSync(
		`sqlcmd -S 192.168.0.250 -U erp -d SGUEES -i "${SQL_OUT}" -W -s "|"`,
		{ encoding: 'utf8', maxBuffer: 20 * 1024 * 1024 }
	);
	console.log(out);
} catch (e) {
	console.error(e.stdout?.toString() || e.message);
	process.exit(1);
}
