// Qué hace: fila de V_ACA_PROSPECTO_SE_RESPUESTA (preguntas de la versión del estudio socioeconómico con su respuesta).
export interface AcaProspectoSeRespuesta {
    CORR_EMPRESA: number;
    CORR_PROSPECTO: number;
    CORR_PROSPECTO_SOCIOECONOMICO: number;
    CORR_VERSION: number;
    CORR_VERSION_PREGUNTA: number;
    ORDEN: number;
    ES_REQUERIDO: boolean;
    CORR_PREGUNTA: number;
    CODIGO_PREGUNTA: string;
    CORR_TIPO_PREGUNTA: number;
    TIPO_PREGUNTA: string;
    TIPO_PREGUNTA_NOMBRE: string;
    ENUNCIADO: string;
    AYUDA: string;
    CORR_RESPUESTA: number | null;
    VALOR_TEXTO: string;
    VALOR_NUMERO: number | null;
    VALOR_BIT: boolean | null;
    CORR_OPCION: number | null;
    TEXTO_OPCION: string;
    TEXTO_OPCIONES_MULTIPLES: string;
    TIENE_RESPUESTA: boolean | null;
    FECHA_RESPUESTA: Date | null;
}
