export interface SegFlujoPasoAccionEstado {
    CORR_EMPRESA: number;
    CORR_FLUJO_PROCESO: number;
    CORR_PASO: number;
    CORR_ACCION: number;
    CORR_ESTADO_DESTINO: number;
    NOMBRE_ESTADO: string;
    PERMITIDO: boolean;
    CORR_TIPO_MOVIMIENTO: number;
    TIPO_MOVIMIENTO: string;
    CORR_TIPO_NOTIFICACION: number;
    TIPO_NOTIFICACION: string;
    CORR_PASO_DESTINO: number | null;
    ACTIVO: boolean;
    USUARIO_CREA: string;
    ESTACION_CREA: string;
    FECHA_CREA: Date;
    USUARIO_ACTU: string;
    ESTACION_ACTU: string;
    FECHA_ACTU: Date;
}
