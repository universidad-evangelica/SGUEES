export interface AcaProspectoBeca {
    CORR_EMPRESA: number;
    CORR_PROSPECTO_BECA: number;
    CORR_PROSPECTO: number;
    CODIGO_PROSPECTO: string;
    NOMBRE_COMPLETO: string;
    DUI: string;
    NOMBRE_CARRERA: string;
    CORR_BECA: number;
    CODIGO_BECA: string;
    NOMBRE_BECA: string;
    CORR_PERIODO_ACADEMICO: number;
    ANIO: number;
    NUMERO_PERIODO: number | null;
    CICLO: string;
    ESTADO_BECA: string;
    ESTADO_BECA_TEXTO: string;
    PUNTAJE_TOTAL: number | null;
    PORCENTAJE_TOTAL: number | null;
    RESULTADO_EVALUACION: string;
    PRIORIDAD_EVALUACION: string;
    FECHA_SOLICITUD: string | null;
}
