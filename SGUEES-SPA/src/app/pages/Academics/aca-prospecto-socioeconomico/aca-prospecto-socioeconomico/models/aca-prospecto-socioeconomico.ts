// Qué hace: fila de V_ACA_PROSPECTO_SOCIOECONOMICO (cabecera del estudio socioeconómico del prospecto).
export interface AcaProspectoSocioeconomico {
    CORR_EMPRESA: number;
    CORR_PROSPECTO: number;
    CORR_PROSPECTO_PERSONA: number;
    CORR_PROSPECTO_SOCIOECONOMICO: number;
    CORR_VERSION: number;
    CODIGO_VERSION: string;
    NOMBRE_VERSION: string;
    TERMINOS_ACEPTADOS: boolean;
    APLICA_CUOTA_MAXIMA: boolean;
    CORR_TIPO_INSTITUCION: number | null;
    TIPO_INSTITUCION_NOMBRE: string;
    FECHA_REGISTRO: Date;
    FECHA_ACTUALIZACION: Date | null;
    TOTAL_PREGUNTAS: number;
    PREGUNTAS_RESPONDIDAS: number;
}
