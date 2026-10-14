export interface ScRequisicionPersonal {
    CORR_EMPRESA: number;
    CORR_REQUISICION_PERSONAL: number;
    CORR_DESCRIPTOR_PUESTO: number;
    CORR_UNIDAD: number;
    CORR_PUESTO: number;
    CORR_TIPO_MODALIDAD: number;
    CORR_TIPO_CONTRATACION: number;
    CORR_TIPO_VACANTE: number;
    CANTIDAD_PLAZAS: number;
    PLAZAS_CUBIERTAS: number;
    FECHA_REQUISICION: Date;
    JUSTIFICACION: string;
    CORR_EMPLEADO_SUSTITUTO: string;
    SALARIO: number;
    CORR_ESTADO_REQUISICION: number;
    // Qué hace: Nombre descriptivo del estado según la última firma/acción registrada en bitácora (ej. Aprobado JI, Aprobado JU, Aprobado GG, Devuelta JI).
    // Cómo lo hace: Mapea la columna NOMBRE_ESTADO_FLUJO devuelta por la API/vista SQL.
    NOMBRE_ESTADO_FLUJO?: string;
    FECHA_APROBACION?: Date | null;
    FECHA_CIERRE?: Date | null;
    TIEMPO_CONTRATO: number;
    HORARIO: string;
    /** Flag UI (lookup contratación). No es columna de BD. */
    ES_PERMANENTE?: boolean;
    /** Flag UI (lookup vacante). No es columna de BD. */
    REQUIERE_SUSTITUCION?: boolean;
    USUARIO_CREA: string;
    FECHA_CREA: Date;
    ESTACION_CREA: string;
    USUARIO_ACTU: string;
	FECHA_ACTU: Date;
    ESTACION_ACTU: string;
}

/** Catálogo OPERACION del SP PRAL_MTTO_SC_REQUISICION_PERSONAL_AUTORIZA. */
export const OPERACION_FLUJO_REQUISICION = {
	GUARDAR: 1,
	ENVIAR: 2,
	APROBAR: 3,
	DEVOLVER: 4,
	RECHAZAR: 5,
} as const;
