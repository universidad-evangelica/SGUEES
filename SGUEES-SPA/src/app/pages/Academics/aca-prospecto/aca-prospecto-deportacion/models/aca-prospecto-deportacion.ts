// Qué hace: fila de V_ACA_PROSPECTO_DEPORTACION (deportaciones declaradas por el prospecto).
export interface AcaProspectoDeportacion {
    CORR_EMPRESA: number;
    CORR_PROSPECTO: number;
    CORR_PROSPECTO_PERSONA: number;
    CORR_PROSPECTO_DEPORTACION: number;
    CORR_PAIS: number;
    NOMBRE_PAIS: string;
    ES_VIGENTE: boolean;
    OBSERVACION: string;
}
