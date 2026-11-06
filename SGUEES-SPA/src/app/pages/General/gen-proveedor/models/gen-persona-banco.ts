export interface GenPersonaBanco {
	CORR_EMPRESA?: number;
	CORR_PERSONA: number;
	CORR_PERSONA_BANCO: number;
	CORR_BANCO: number;
	NOMBRE_BANCO?: string;
	CUENTA_BANCARIA: string;
	USUARIO_CREA?: string;
	FECHA_CREA?: Date | string;
	ESTACION_CREA?: string;
	USUARIO_ACTU?: string;
	FECHA_ACTU?: Date | string;
	ESTACION_ACTU?: string;
}
