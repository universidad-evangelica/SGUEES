export interface ScRequisicionCandidato {
	CORR_EMPRESA: number;
	CORR_REQUISICION_CANDIDATO: number;
	CORR_REQUISICION_PERSONAL: number;
	CORR_SOLICITUD_EMPLEO: number;
	CORR_EXPEDIENTE_CANDIDATO: number;
	ESTADO_DECISION: string;
	OBSERVACION_DECISION?: string;
	FECHA_DECISION?: Date | string;
	USUARIO_DECISION?: string;
	NOMBRE_UNIDAD?: string;
	NOMBRE_PUESTO?: string;
	MODALIDAD_NOMBRE?: string;
	CORR_ESTADO_REQUISICION?: number;
}

export interface ScExpedienteCandidatoPostulacion {
	CORR_EMPRESA: number;
	CORR_EXPEDIENTE_CANDIDATO: number;
	CORR_EXPEDIENTE_SOLICITUD: number;
	CORR_SOLICITUD_EMPLEO: number;
	CORR_SOLICITUD_REQUISICION: number;
	CORR_REQUISICION_PERSONAL: number;
	NOMBRE_UNIDAD?: string;
	NOMBRE_PUESTO?: string;
	MODALIDAD_NOMBRE?: string;
	CORR_ESTADO_REQUISICION?: number;
	CORR_REQUISICION_CANDIDATO?: number | null;
	ESTADO_DECISION: string;
	OBSERVACION_DECISION?: string;
	FECHA_DECISION?: Date | string | null;
	USUARIO_DECISION?: string;
}

export type EstadoDecisionJefatura = 'PENDIENTE' | 'APLICA' | 'NO_APLICA';
