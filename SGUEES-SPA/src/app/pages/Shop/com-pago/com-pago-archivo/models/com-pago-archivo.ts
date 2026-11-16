export interface ComPagoArchivo {
	CORR_EMPRESA: number;
	CORR_ARCHIVO: number;
	CORR_CUENTA_BANCO: number;
	FECHA_PAGO: Date;
	CODIGO_EMPRESARIAL?: string;
	CORRELATIVO?: string;
}

export interface ComPagoAPagarArchivo {
	CORR_EMPRESA: number;
	ANIO_PERIODO: number;
	MES_PERIODO: number;
	CORR_PAGO: number;
	NUMERO_PAGO?: number;
	FECHA_PAGO: Date;
	CORR_PROVEEDOR: number;
	NOMBRE_PROVEEDOR?: string;
	CORR_CUENTA_BANCO: number;
	NOMBRE_PARTIDA?: string;
	MONTO_PAGO: number;
	NOMBRE_BENEFICIARIO?: string;
	CORR_ARCHIVO?: number | null;
	SELECCION?: boolean;
	MONTO_ARCHIVO?: number;
}
