export interface SegFlujoActor {
    CORR_EMPRESA: number;
    CORR_ACTOR: number;
    NOMBRE_ACTOR: string;
    DESCRIPCION: string;
    REQUIERE_UNIDAD: boolean;
    RESOLUCION_AUTOMATICA: boolean;
    ACTIVO: boolean;
    USUARIO_CREA: string;
    ESTACION_CREA: string;
    FECHA_CREA: Date;
    USUARIO_ACTU: string;
    ESTACION_ACTU: string;
    FECHA_ACTU: Date;
}