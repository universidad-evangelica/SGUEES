// Qué hace: fila de V_ACA_PROSPECTO_CONTACTO (correos y teléfonos del prospecto).
export interface AcaProspectoContacto {
    CORR_EMPRESA: number;
    CORR_PROSPECTO: number;
    CORR_PROSPECTO_PERSONA: number;
    CORR_PROSPECTO_CONTACTO: number;
    CONTACTO: string;
    TIPO_CONTACTO: string;
    ES_CORREO: boolean;
    ES_TELEFONO: boolean;
    ES_PRINCIPAL: boolean;
    ES_TRABAJO: boolean;
}
