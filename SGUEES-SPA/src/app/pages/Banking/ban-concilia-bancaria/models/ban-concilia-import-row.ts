export interface BanConciliaImportRow {
	CORR: number;
	FECHA_MOVIMIENTO: Date | string;
	NUMERO_REFERENCIA_BANCO: string;
	CODIGO_TIPO_MOVIMIENTO: string;
	NOMBRE_TIPO_MOVIMIENTO: string;
	MONTO_CARGO: number;
	MONTO_ABONO: number;
}
