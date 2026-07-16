export interface SegFlujoPaso {
    CORR_EMPRESA: number;
    CORR_FLUJO_PROCESO: number;
    CORR_FLUJO_PASO: number;
    NUMERO_PASO: number;
    CORR_ACTOR_ORIGEN:number;
    CORR_ACTOR_DESTINO:number;
    NOMBRE_PASO: string;
    DESCRIPCION_PASO: string;
    ACTIVO: boolean;
    USUARIO_CREA: string;
    ESTACION_CREA: string;
    FECHA_CREA: Date;
    USUARIO_ACTU: string;
    ESTACION_ACTU: string;
    FECHA_ACTU: Date;
}
