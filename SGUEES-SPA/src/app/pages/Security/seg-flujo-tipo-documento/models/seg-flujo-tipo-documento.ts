export interface SegFlujoTipoDocumento {
    CORR_EMPRESA: number;
    CORR_TIPO_DOCUMENTO: number;
    NOMBRE_TIPO: string;
    DESCRIPCION: string;
    CODIGO_OPCION: string;
    ACTIVO: boolean;
    USUARIO_CREA: string;
    ESTACION_CREA: string;
    FECHA_CREA: Date;
    USUARIO_ACTU: string;
    ESTACION_ACTU: string;
    FECHA_ACTU: Date;
}