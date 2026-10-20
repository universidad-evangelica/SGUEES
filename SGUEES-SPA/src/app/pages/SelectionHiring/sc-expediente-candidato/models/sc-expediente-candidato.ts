export interface ScExpedienteCandidato {
	CORR_EMPRESA: number;
	CORR_EXPEDIENTE_CANDIDATO: number;
	CORR_PERSONA_DATOS: number;
	CORR_ESTADO_EXPEDIENTE: number;
	FECHA_GENERACION: Date | string;
	ACTIVO: boolean;
	DUI_PERSONA?: string;
	NOMBRE_PERSONA?: string;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date | string;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date | string;
}

/** Estructura de cada estado del expediente del candidato. */
export interface ScEstadoExpediente {
	CORR_ESTADO_EXPEDIENTE: number;
	ESTADO_EXPEDIENTE: string;
}

/** Constantes numéricas de los estados del expediente. */
export const ESTADO_EXPEDIENTE_ID = {
	BORRADOR: 1,
	PROCESO_SELECCION: 2,
	SELECCIONADO: 3,
	LISTO_CREAR_USUARIO: 4,
	CONTRATADO: 5,
} as const;

// Qué hace: Catálogo maestro de estados formales del expediente general del candidato.
// Cómo lo hace: Define los tres estados del ciclo de vida del expediente (Borrador, Proceso de selección y Contratado).
export const ESTADOS_EXPEDIENTE: ScEstadoExpediente[] = [
	{ CORR_ESTADO_EXPEDIENTE: ESTADO_EXPEDIENTE_ID.BORRADOR, ESTADO_EXPEDIENTE: 'Borrador' },
	{ CORR_ESTADO_EXPEDIENTE: ESTADO_EXPEDIENTE_ID.PROCESO_SELECCION, ESTADO_EXPEDIENTE: 'Proceso de selección' },
	{ CORR_ESTADO_EXPEDIENTE: ESTADO_EXPEDIENTE_ID.CONTRATADO, ESTADO_EXPEDIENTE: 'Contratado' },
];

