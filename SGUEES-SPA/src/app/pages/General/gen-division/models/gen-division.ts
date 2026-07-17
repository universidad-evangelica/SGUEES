// Contrato del registro de división usado por el mantenimiento.
export interface GenDivision {
	CORR_EMPRESA: number;
	CORR_DIVISION: number;
	NOMBRE_DIVISION: string;
	CODIGO_DIVISION: string;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}
