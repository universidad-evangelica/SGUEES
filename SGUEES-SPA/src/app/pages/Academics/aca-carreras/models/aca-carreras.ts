export interface AcaCarrera {
    CORR_CARRERA: number;
    CORR_EMPRESA: number;
    CODIGO_CARRERA: string;
    NOMBRE_CARRERA: string;
    CORR_AREA_ACADEMICA: number | null;
    CORR_FACULTAD: number | null;
    CORR_GRADO_ACADEMICO: number | null;
    ACTIVO: boolean;
    NOMBRE_AREA?: string;
    NOMBRE_FACULTAD?: string;
    NOMBRE_GRADO?: string;
    SEDES_ACTIVAS?: string;
    USUARIO_CREA?: string;
    FECHA_CREA?: string;
    USUARIO_ACTU?: string;
    FECHA_ACTU?: string;
}
export interface CatalogoCarrera {
    Key: number;
    Value: string;
    ACTIVO: boolean;
}

