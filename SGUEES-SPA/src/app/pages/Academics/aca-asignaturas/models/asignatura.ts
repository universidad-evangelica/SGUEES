export interface Asignatura {
    CORR_ASIGNATURA: number;
    CORR_EMPRESA?: number;
    CORR_CARRERA: number | null;
    CORR_FACULTAD: number | null;
    CODIGO_ASIGNATURA: string;
    ALIAS: string | null;
    NOMBRE_ASIGNATURA: string;
    UNIDADES_VALORATIVAS: number | null;
    FECHA_APERTURA: string | null;
    CORR_PERIODO_CURSO: number | null;
    CORR_TIPO_PRACTICA?: number | null;
    NOMBRE_TIPO_PRACTICA?: string;
    HABILITA_COBROS_ADICIONALES?: boolean;
    ACTIVO: boolean;
    VERSION?: string;
    NOMBRE_FACULTAD?: string;
    NOMBRE_CARRERA?: string;
    NOMBRE_PERIODO?: string;
    CANTIDAD_PLANES?: number;
}
export interface CarreraAsignatura {
    CORR_CARRERA: number;
    CORR_FACULTAD: number;
    NOMBRE_CARRERA: string;
    NOMBRE_FACULTAD: string;
    ACTIVO: boolean;
}
export interface PlanAsignatura {
    CORR_PLAN_ACADEMICO: number;
    CODIGO_PLAN: string;
    ANIO_PLAN: number;
    NOMBRE_MODALIDAD: string;
    FECHA_VIGENCIA_INICIO: string;
    FECHA_VIGENCIA_FIN: string | null;
    PLAN_VIGENTE: boolean;
    ASOCIADO: boolean;
    VERSION: string | null;
    EN_USO: boolean;
}
export interface AsociacionPlanInput {
    CORR_ASIGNATURA: number;
    CORR_PLAN_ACADEMICO: number;
    ACTIVO: boolean;
    VERSION: string | null;
}
