export interface FirmaDocumento {
    CORR_EMPRESA: number;
    CORR_TIPO_DOCUMENTO: number;
    CORR_DOCUMENTO: number;
    CORR_INSTANCIA: number;
    CORR_BITACORA: number;
    CORR_PASO: number;
    CORR_ESTADO_ANTERIOR: number | null;
    CORR_ESTADO_NUEVO: number;
    ESTADO_DESTINO: string;
    LOGIN_SISTEMA: string;
    COMENTARIO: string;
    FECHA_ACCION: Date;
    FECHA_BITACORA: Date;
    CORR_UNIDAD_EJECUTOR: number;
    NOMBRE_PASO: string;
    ESTADO_ORIGEN: string;
    ORDEN_FIRMA: number;
}