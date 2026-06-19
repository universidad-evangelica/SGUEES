export interface ConPartidaImportRow {
	FECHA_PARTIDA: Date;
	NUMERO_DOCUMENTO: string;
	CUENTA_CONTABLE: string;
	CODIGO_CENTRO_COSTO: string;
	CORR_CENTRO_COSTO?: number;
	NOMBRE_TRAN: string;
	MONTO_CARGO: number;
	MONTO_ABONO: number;
}

export interface ConPartidaImportParam {
	CORR_CLASE_PARTIDA: number;
	Rows: ConPartidaImportRow[];
}
