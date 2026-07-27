export interface SegFlujoEstado {
    CORR_EMPRESA: number;
    CORR_ESTADO: number;
    CORR_TIPO_DOCUMENTO: number;
    NOMBRE_ESTADO: string;
    DESCRIPCION: string;
    ES_INICIAL: boolean;
    ES_FINAL: boolean;
    ACTIVO: boolean;
    USUARIO_CREA: string;
    ESTACION_CREA: string;
    FECHA_CREA: Date;
    USUARIO_ACTU: string;
    ESTACION_ACTU: string;
    FECHA_ACTU: Date;
}