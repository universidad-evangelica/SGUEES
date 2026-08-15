export interface SC_OrganigramaEstructuralUnidad {
    CORR_EMPRESA: number;
    CORR_UNIDAD: number;
    CODIGO_UNIDAD: string;
    NOMBRE_UNIDAD: string;
    CORR_NIVEL: number;
    NOMBRE_NIVEL: string;
    CORR_UNIDAD_PADRE: number | null;
    NOMBRE_UNIDAD_PADRE: string | null;
    ACTIVO: boolean;
    USUARIO_CREA: string;
    ESTACION_CREA: string;
    FECHA_CREA: Date;
    USUARIO_ACTU: string;
    ESTACION_ACTU: string;
    FECHA_ACTU: Date;
    TIENE_HIJAS: number;
    TIENE_JEFES: number;
}