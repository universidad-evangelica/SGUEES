export interface AcaCarreraSede {
    CORR_CARRERA: number;
    CORR_SEDE: number;
    ACTIVO: boolean;
    CODIGO_SEDE: string;
    NOMBRE_SEDE: string;
    ESTADO_SEDE: string;
    USUARIO_CREA?: string;
    FECHA_CREA?: string;
    USUARIO_ACTU?: string;
    FECHA_ACTU?: string;
}
export interface SedeCarreraLookup {
    Key: number;
    Value: string;
    HABILITADA: boolean;
    MOTIVO: string;
}
