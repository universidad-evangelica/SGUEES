// Qué hace: fila de V_ACA_PROSPECTO_LIMITACION_FISICA (limitaciones físicas declaradas por el prospecto).
export interface AcaProspectoLimitacionFisica {
    CORR_EMPRESA: number;
    CORR_PROSPECTO: number;
    CORR_PROSPECTO_PERSONA: number;
    CORR_PROSPECTO_LIMITACION_FISICA: number;
    CORR_LIMITACION_FISICA: number;
    NOMBRE_LIMITACION: string;
    ESPECIFIQUE: string;
}
