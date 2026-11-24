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
    VERSION_REGISTRO?: string | null;
    HUELLA_FALTANTES?: string | null;
}

export type AcaCicloAsignacion = Partial<AcaCicloInput> & Pick<AcaCicloInput, 'CORR_CICLO_ACADEMICO'>;

export interface AcaCicloCandidata {
    CORR_EMPRESA: number;
    CORR_AREA_ACADEMICA: number;
    CORR_CARRERA: number;
    CORR_FACULTAD: number;
    CORR_SEDE: number | null;
    NOMBRE_CARRERA: string;
    NOMBRE_FACULTAD: string;
    NOMBRE_SEDE: string;
    ES_ELEGIBLE: boolean;
    DIAGNOSTICO: string;
    MOTIVO: string;
    FECHA_VIGENCIA_INICIO: string | null;
    FECHA_VIGENCIA_FIN: string | null;
}

export interface AcaCicloFaltante extends AcaCicloCandidata {
    AGREGAR: boolean;
    HUELLA_FALTANTES: string;
}
