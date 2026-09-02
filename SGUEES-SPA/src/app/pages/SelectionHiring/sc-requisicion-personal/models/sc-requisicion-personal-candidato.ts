/**
 * Candidato activo en proceso de selección relacionado con una requisición.
 */
export interface ScRequisicionPersonalCandidato {
	CORR_EMPRESA: number;
	CORR_REQUISICION_PERSONAL: number;
	CORR_SOLICITUD_EMPLEO: number;
	CORR_EXPEDIENTE_CANDIDATO: number;
	CORR_PERSONA_DATOS: number;
	NOMBRE_PERSONA: string;
	DUI_PERSONA: string;
	FECHA_GENERACION: Date | string;
	CORR_ESTADO_EXPEDIENTE: number;
}
