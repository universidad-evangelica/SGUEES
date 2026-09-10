/** Tipos de la bandeja de actores (jefatura). */
export type ScBandejaActoresTipo = 'REQUISICION' | 'CANDIDATO';

export type ScBandejaActoresTab = 'REQUISICIONES' | 'CANDIDATOS';

export type ScBandejaActoresEstadoCandidato = 'EN_SELECCION' | 'APLICA' | 'NO_APLICA';

export interface ScBandejaActoresHistorialItem {
	FECHA: string;
	USUARIO: string;
	ACCION: string;
	COMENTARIO?: string;
}

export interface ScBandejaActoresItem {
	ID: string;
	TIPO: ScBandejaActoresTipo;
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
	CORR_UNIDAD?: number;
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
	ESTADO_CICLO_CANDIDATO?: ScBandejaActoresEstadoCandidato;
	ESTADO_DECISION?: 'PENDIENTE' | 'APLICA' | 'NO_APLICA';
	OBSERVACION_DECISION?: string;
	CANTIDAD_ENTREVISTAS?: number;
	ULTIMA_ENTREVISTA?: string;
	MENSAJE_NOTIFICACION?: string;
	REQUIERE_ATENCION?: boolean;
	HISTORIAL?: ScBandejaActoresHistorialItem[];
}

export interface ScBandejaActoresKpi {
	KEY: string;
	LABEL: string;
	VALUE: number;
	SUBLABEL: string;
	TONE?: 'default' | 'warning' | 'info' | 'success';
	ICON?: string;
}
