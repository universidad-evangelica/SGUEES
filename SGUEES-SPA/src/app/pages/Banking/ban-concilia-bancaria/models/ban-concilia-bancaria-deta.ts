export interface BanConciliaBancariaDeta {
	CORR_EMPRESA: number;
	CORR_CUENTA_BANCO: number;
	CORR_CONCILIACION: number;
	CORR_CONCILIACION_DETA: number;
	FECHA_MOVIMIENTO: Date | string;
	CORR_TIPO_MOVIMIENTO: number;
	NOMBRE_TIPO_MOVIMIENTO?: string;
	NUMERO_REFERENCIA_BANCO: string;
	MONTO_CARGO: number;
	MONTO_ABONO: number;
	ANIO_PERIODO?: number | null;
	MES_PERIODO?: number | null;
	CORR_CLASE_PARTIDA?: number | null;
	CORR_PARTIDA?: number | null;
	NUMERO_DOCUMENTO?: string;
	NOMBRE_CORTO_CLASE?: string;
	CORR_PARTIDA_DETA?: number | null;
	NOMBRE_TRAN?: string;
	MONTO_CARGO_CONTA?: number;
	MONTO_ABONO_CONTA?: number;
	CODIGO_TRANSACCION?: string;
	DESCRIPCION_TRANSACCION?: string;
}
