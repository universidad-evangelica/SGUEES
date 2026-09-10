/** Tipos de movimiento de la bandeja TH (sin pestaña Aprobaciones). */
export type ScBandejaTipo = 'REQUISICION' | 'CANDIDATO' | 'CONTRATACION';

/** Pestaña activa del grid. */
export type ScBandejaTab = 'TODAS' | 'REQUISICIONES' | 'CANDIDATOS' | 'CONTRATACIONES';

/**
 * Estados del ciclo Candidatos (derivados / visuales).
 *
 * Opción A:
 * - Candidatos: POSTULANTE → CON_EXPEDIENTE → EN_SELECCION (+ NO_APLICA cierre).
 * - Contrataciones: APLICA (listo para movimiento personal).
 */
export type ScBandejaEstadoCandidato =
	| 'POSTULANTE'
	| 'CON_EXPEDIENTE'
	| 'EN_SELECCION'
	| 'APLICA'
	| 'NO_APLICA';

/** Evento de historial / bitácora del panel lateral. */
export interface ScBandejaHistorialItem {
	FECHA: string;
	USUARIO: string;
	ACCION: string;
	COMENTARIO?: string;
}

/**
 * Fila unificada de la bandeja.
 * Códigos solo frontend: REQ-, SOL-/CAN-, CON-.
 */
export interface ScBandejaItem {
	ID: string;
	TIPO: ScBandejaTipo;
	CODIGO: string;
	DESCRIPCION: string;
	SUBTITULO: string;
	SOLICITANTE: string;
	CARGO_SOLICITANTE?: string;
	FECHA: string;
	ESTADO: string;
	ESTADO_TONE: string;

	CORR_REQUISICION_PERSONAL?: number;
	CORR_ESTADO_REQUISICION?: number;
	CORR_EXPEDIENTE_CANDIDATO?: number;
	CORR_SOLICITUD_EMPLEO?: number;
	CORR_PERSONA_DATOS?: number | null;
	NOMBRE_UNIDAD?: string;
	NOMBRE_PUESTO?: string;
	NOMBRE_CANDIDATO?: string;
	DUI_CANDIDATO?: string;
	NOMBRE_TIPO_VACANTE?: string;
	NOMBRE_TIPO_MODALIDAD?: string;
	NOMBRE_TIPO_CONTRATACION?: string;
	CANTIDAD_PLAZAS?: number;
	PLAZAS_CUBIERTAS?: number;
	SALARIO?: number;
	HORARIO?: string;
	TIEMPO_CONTRATO?: number;
	JUSTIFICACION?: string;
	/** Etapa del ciclo candidato (cuando TIPO = CANDIDATO). */
	ESTADO_CICLO_CANDIDATO?: ScBandejaEstadoCandidato;
	ESTADO_DECISION?: 'PENDIENTE' | 'APLICA' | 'NO_APLICA';
	OBSERVACION_DECISION?: string;
	CANTIDAD_CANDIDATOS?: number;
	CANTIDAD_PENDIENTES?: number;
	CANTIDAD_ENTREVISTAS?: number;
	ULTIMA_ENTREVISTA?: string;
	REQUIERE_ATENCION?: boolean;
	/** Standby: movimiento personal / contrato aún no conectados. */
	LISTO_CONTRATACION?: boolean;
	HISTORIAL?: ScBandejaHistorialItem[];
}

export interface ScBandejaKpi {
	KEY: string;
	LABEL: string;
	VALUE: number;
	SUBLABEL: string;
	TONE?: 'default' | 'warning' | 'info' | 'success';
	ICON?: string;
}
