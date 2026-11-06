export interface AcaCicloInput {
    CORR_CICLO_ACADEMICO: number;
    CORR_AREA_ACADEMICA: number;
    ANIO: number;
    NUMERO_PERIODO: number;
    FECHA_INICIO: string | null;
    FECHA_FIN: string | null;
    FECHA_INICIO_INSCRIPCION: string | null;
    FECHA_FIN_INSCRIPCION: string | null;
    CORR_SEDE: number;
    CORR_FACULTAD: number;
    CORR_CARRERA: number;
    ACTIVO: boolean;
}

export type AcaCicloAsignacion = Partial<AcaCicloInput> & Pick<AcaCicloInput, 'CORR_CICLO_ACADEMICO'>;
