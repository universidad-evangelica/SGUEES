// Qué hace: fila de V_ACA_PROSPECTO_FAMILIAR (familiares y contacto de emergencia del prospecto).
export interface AcaProspectoFamiliar {
    CORR_EMPRESA: number;
    CORR_PROSPECTO: number;
    CORR_PROSPECTO_PERSONA: number;
    CORR_PROSPECTO_FAMILIAR: number;
    CORR_PARENTESCO: number;
    NOMBRE_PARENTESCO: string;
    NOMBRE_COMPLETO: string;
    TRABAJA: boolean | null;
    PROFESION: string;
    OCUPACION: string;
    NOMBRE_EMPRESA: string;
    TELEFONO_TRABAJO: string;
    DIRECCION_TRABAJO: string;
    DIRECCION_CASA: string;
    TELEFONO: string;
    TELEFONO2: string;
    VIVE_CON_EL: boolean | null;
    FINANCIA_ESTUDIOS: boolean | null;
    ACTIVO: boolean | null;
    ES_EMERGENCIA: boolean | null;
    DIRECCION_EMERGENCIA: string;
    TELEFONO_EMERGENCIA: string;
    ES_NUCLEO: boolean | null;
    ES_SOLO_EMERGENCIA: boolean | null;
}
