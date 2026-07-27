export interface SegFlujoEstadoMensaje {
    CORR_EMPRESA: number;
    CORR_ESTADO_MENSAJE: number;
    CORR_FLUJO_PROCESO: number;
    CORR_PASO: number;
    NOMBRE_PASO?: string;
    CORR_ESTADO: number;
    NOMBRE_ESTADO?: string;
    CORR_ACTOR: number | null;
    NOMBRE_ACTOR?: string;
    LOGIN_SISTEMA: string | null;
    MENSAJE: string;
    ACTIVO: boolean;
    USUARIO_CREA: string;
    ESTACION_CREA: string;
    FECHA_CREA: Date;
    USUARIO_ACTU: string;
    ESTACION_ACTU: string;
    FECHA_ACTU: Date;
}
