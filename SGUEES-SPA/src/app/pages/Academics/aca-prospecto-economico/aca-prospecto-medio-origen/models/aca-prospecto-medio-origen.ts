// Qué hace: fila de V_ACA_PROSPECTO_MEDIO_ORIGEN (medios por los que el prospecto conoció la universidad).
export interface AcaProspectoMedioOrigen {
    CORR_EMPRESA: number;
    CORR_PROSPECTO: number;
    CORR_PROSPECTO_PERSONA: number;
    CORR_PROSPECTO_MEDIO: number;
    CORR_MEDIO_ORIGEN: number;
    NOMBRE_MEDIO: string;
    ORDEN_MEDIO: number | null;
    DESCRIPCION: string;
    ESTUDIANTE_REFIERE: string;
    CORR_CARRERA_REFIERE: number | null;
    CARRERA_REFIERE: string;
}
