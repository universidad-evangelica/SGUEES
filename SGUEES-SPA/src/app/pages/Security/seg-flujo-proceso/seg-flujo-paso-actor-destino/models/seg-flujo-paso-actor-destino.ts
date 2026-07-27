export interface SegFlujoPasoActorDestino {
    CORR_EMPRESA: number;
    CORR_PASO_ACTOR_DESTINO: number;
    CORR_PASO: number;
    NOMBRE_PASO?: string;
    CORR_ACTOR: number;
    NOMBRE_ACTOR?: string;
    CORR_UNIDAD: number | null;
    NOMBRE_UNIDAD?: string;
    ORDEN: number;
    ACTIVO: boolean;
    USUARIO_CREA: string;
    ESTACION_CREA: string;
    FECHA_CREA: Date;
    USUARIO_ACTU: string;
    ESTACION_ACTU: string;
    FECHA_ACTU: Date;
}
