export interface AcaPeriodoInput {
    CORR_EMPRESA: number;
    CORR_PERIODO_ACADEMICO: number;
    CORR_SEDE: number;
    CORR_AREA_ACADEMICA: number;
    CORR_FACULTAD: number | null;
    CORR_CARRERA: number | null;
    ANIO: number;
    NUMERO_PERIODO: number | null;
    FECHA_INICIO: string | null;
    FECHA_FIN: string | null;
    FECHA_INICIO_INSCRIPCION: string | null;
    FECHA_FIN_INSCRIPCION: string | null;
}
