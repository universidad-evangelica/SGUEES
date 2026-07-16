import { ConReporteColumnaUiConfig } from '../models/con-reporte-ui.config';

export function columna(
	campo: string,
	titulo: string,
	ancho: number,
	opciones?: Partial<ConReporteColumnaUiConfig>,
): ConReporteColumnaUiConfig {
	return {
		campo,
		titulo,
		ancho,
		visible: true,
		...opciones,
	};
}

export const COL_CUENTA = columna('CUENTA_CONTABLE', 'Cuenta', 200);
export const COL_NOMBRE_CUENTA = columna('NOMBRE_CUENTA', 'Descripción', 160, { ajustarTexto: true });
export const COL_FECHA = columna('FECHA_PARTIDA', 'Fecha', 105, { formato: 'fecha', alineacion: 'center' });
export const COL_DOCUMENTO = columna('NUMERO_DOCUMENTO', 'Documento', 115);
export const COL_CLASE = columna('NOMBRE_CLASE_PARTIDA', 'Clase', 85);
export const COL_SALDO_INICIAL = columna('SALDO_INICIAL', 'Saldo inicial', 110, { formato: 'moneda' });
export const COL_CARGOS = columna('CARGO_PERIODO', 'Cargos', 110, { formato: 'moneda' });
export const COL_ABONOS = columna('ABONO_PERIODO', 'Abonos', 110, { formato: 'moneda' });
export const COL_SALDO_FINAL = columna('SALDO_FINAL', 'Saldo final', 110, { formato: 'moneda' });
export const COL_SALDO_MES = columna('SALDO_FINAL_MES', 'Saldo mes', 110, { formato: 'moneda' });
export const COL_MONTO_CARGO = columna('MONTO_CARGO', 'Cargo', 110, { formato: 'moneda' });
export const COL_MONTO_ABONO = columna('MONTO_ABONO', 'Abono', 110, { formato: 'moneda' });
export const COL_CENTRO = columna('NOMBRE_CENTRO', 'Centro costo', 160, { ajustarTexto: true });
export const COL_TRANSACCION = columna('NOMBRE_TRAN', 'Transacción', 250, { ajustarTexto: true });
