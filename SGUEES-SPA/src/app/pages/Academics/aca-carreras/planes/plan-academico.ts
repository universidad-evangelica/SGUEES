export interface PlanAcademico {
    CORR_PLAN_ACADEMICO: number;
    CORR_CARRERA: number;
    CODIGO_PLAN: string;
    CORR_MODALIDAD: number | null;
    ANIO_PLAN: number;
    FECHA_VIGENCIA_INICIO: string | null;
    FECHA_VIGENCIA_FIN: string | null;
    PLAN_VIGENTE: boolean;
    EN_USO: boolean;
    NOMBRE_MODALIDAD?: string;
}
export interface ModalidadPlan { Key: number; Value: string; ACTIVO: boolean; }
