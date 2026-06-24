export interface ConPartidaDeta {
	CORR_EMPRESA: number;
	ANIO_PERIODO: number;
	MES_PERIODO: number;
	CORR_CLASE_PARTIDA: number;
	CORR_PARTIDA: number;
	CORR_PARTIDA_DETA: number;
	CUENTA_CONTABLE: string;
	NOMBRE_CUENTA: string;
	CORR_CENTRO_COSTO: number;
	CODIGO_CENTRO_COSTO?: string;
	NOMBRE_CENTRO: string;
	NOMBRE_TRAN: string;
	MONTO_CARGO: number;
	MONTO_ABONO: number;
	ESTA_CONCILIA: boolean;
	CORR_AUXILIAR: number;
	NOMBRE_AUXILIAR: string;
	MONTO_CARGO_FORANEA: number;
	MONTO_ABONO_FORANEA: number;
}
