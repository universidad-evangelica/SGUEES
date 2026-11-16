export interface ComPagoDeta {
	CORR_EMPRESA: number;
	ANIO_PERIODO: number;
	MES_PERIODO: number;
	CORR_PAGO: number;
	CORR_DETA: number;
	ANIO_PERIODO_COM: number;
	MES_PERIODO_COM: number;
	CORR_DOCUMENTO_COM: number;
	NUMERO_DOCUMENTO?: string;
	NOMBRE_TIPO_DOC?: string;
	CORR_PROVEEDOR?: number;
	CORR_TIENDA_COM?: number;
	FECHA_DOCUMENTO?: Date;
	TOTAL_DOCUMENTO?: number;
	SALDO_DOCUMENTO?: number;
	TOTAL_NETO?: number;
	MONTO_DOCUMENTO: number;
	MONTO_INICIAL: number;
	MONTO_PAGO: number;
	MONTO_FINAL: number;
	ESTADO_PAGO?: string;
	FECHA_PAGO?: Date;
	GENERA_DETALLE_CONTABLE?: boolean;
	GENERA_CONCEPTO?: boolean;
	SELECCION?: boolean;
}
