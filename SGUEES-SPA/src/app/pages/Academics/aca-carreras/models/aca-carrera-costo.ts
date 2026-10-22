export interface AcaCarreraCosto {
    CORR_COSTO: number;
    CORR_CARRERA: number;
    CORR_SEDE: number;
    CORR_MONEDA: number;
    FECHA_INICIO: string | null;
    FECHA_FIN: string | null;
    MATRICULA_NACIONAL: number;
    MATRICULA_EXTRANJERA: number;
    INSCRIPCION: number;
    INSCRIPCION_TUTORIA: number;
    COSTO_CARNE: number;
    COBRA_DIFERENCIA_INSCRIPCION: boolean;
    TIPO_IMPUESTO: string;
    REFERENCIA_FINANCIAMIENTO: string;
    MONTO_FINANCIAMIENTO: number;
    PORCENTAJE_RECUPERACION: number;
    CARGO_CAMBIO_ASIGNATURA: number;
    POLITICA_CARGO: string;
    MODALIDAD_PAGO: string;
    TIPO_COBRO_ASIGNATURA: string;
    ACTIVO: boolean;
    VERSION: string;
}
