// Qué hace: fila de V_ACA_PROSPECTO_ESTUDIO (estudios previos del prospecto).
export interface AcaProspectoEstudio {
    CORR_EMPRESA: number;
    CORR_PROSPECTO: number;
    CORR_PROSPECTO_PERSONA: number;
    CORR_PROSPECTO_ESTUDIO: number;
    NIVEL_ESTUDIO: string;
    SECCION: string;
    SECCION_TEXTO: string;
    ORDEN_SECCION: number;
    NOMBRE_INSTITUCION: string;
    CORR_TIPO_INSTITUCION: number | null;
    TIPO_INSTITUCION_NOMBRE: string;
    TIPO_INSTITUCION: string;
    TIPO_EDUCACION: string;
    TITULO_OBTENIDO: string;
    CORR_GRADO_ACADEMICO: number | null;
    NOMBRE_GRADO: string;
    CORR_CARRERA: number | null;
    NOMBRE_CARRERA: string;
    CARRERA_TEXTO: string;
    NIVEL_CURSADO: string;
    BACHILLER_OPCION: string;
    ANIO_TITULACION: number | null;
    FECHA_EGRESO: Date | null;
    FECHA_GRADUACION: Date | null;
    CUOTA: number | null;
    QUIEN_PAGO_CUOTA: string;
    GRADUADO: boolean;
    GRADUADO_UEES: boolean;
    CORR_PAIS: number | null;
    NOMBRE_PAIS: string;
    CORR_DEPTO: number | null;
    NOMBRE_DEPTO: string;
    CORR_MUNICIPIO: number | null;
    NOMBRE_MUNICIPIO: string;
}
