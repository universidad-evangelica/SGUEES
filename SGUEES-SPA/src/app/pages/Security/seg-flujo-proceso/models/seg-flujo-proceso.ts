export interface SegFlujoProceso {
    CORR_EMPRESA: number;
    CORR_FLUJO_PROCESO: number;
    CORR_TIPO_DOCUMENTO: number;
    NOMBRE_FLUJO: string;
    DESCRIPCION: string;
    ES_DEFECTO: boolean;
    ACTIVO: boolean;
    USUARIO_CREA: string;
    ESTACION_CREA: string;
    FECHA_CREA: Date;
    USUARIO_ACTU: string;
    ESTACION_ACTU: string;
    FECHA_ACTU: Date;
    NOMBRE_TIPO_DOCUMENTO: string;
}