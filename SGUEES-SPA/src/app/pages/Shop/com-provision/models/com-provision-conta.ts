export interface ComProvisionConta {
	CORR_EMPRESA: number;
	ANIO_PERIODO: number;
	MES_PERIODO: number;
	CORR_PROVISION: number;
	CORR_DETA: number;
	CUENTA_CONTABLE: string;
	CORR_AUXILIAR?: number | null;
	CORR_CENTRO_COSTO?: number | null;
	NOMBRE_TRAN: string;
	MONTO_CARGO: number;
	MONTO_ABONO: number;
	CORR_AUXILIAR_UNICO?: string;
	NOMBRE_AUXILIAR?: string;
	NOMBRE_CUENTA?: string;
	NOMBRE_CENTRO?: string;
}
