export interface BanDocumentoDeta {
	CORR_EMPRESA: number;
	ANIO_PERIODO: number;
	MES_PERIODO: number;
	CORR_TIPO_MOVIMIENTO: number;
	CORR_DOCUMENTO: number;
	CORR_DOCUMENTO_DETA: number;
	CUENTA_CONTABLE: string;
	NOMBRE_CUENTA: string;
	CORR_CENTRO_COSTO: number;
	CODIGO_CENTRO_COSTO?: string;
	NOMBRE_CENTRO: string;
	NOMBRE_TRAN: string;
	MONTO_CARGO: number;
	MONTO_ABONO: number;
}
