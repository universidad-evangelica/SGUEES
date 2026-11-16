export interface ComPago {
	CORR_EMPRESA: number;
	ANIO_PERIODO: number;
	MES_PERIODO: number;
	CORR_PAGO: number;
	CORR_TIPO_DOC?: number;
	NOMBRE_TIPO_DOC?: string;
	FECHA_SOLICITUD?: Date;
	FECHA_PAGO?: Date;
	CORR_PROVEEDOR?: number;
	NOMBRE_PROVEEDOR?: string;
	NOMBRE_BENEFICIARIO?: string;
	MONTO_PAGO?: number;
	NOMBRE_PARTIDA?: string;
	ESTADO_PAGO?: string;
	NOMBRE_ESTADO_PAGO?: string;
	CORR_ARCHIVO?: number | null;
	SELECCION?: boolean;
}
