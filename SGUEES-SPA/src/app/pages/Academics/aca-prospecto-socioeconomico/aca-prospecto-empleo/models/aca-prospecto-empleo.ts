// Qué hace: fila de V_ACA_PROSPECTO_EMPLEO (información laboral del prospecto).
export interface AcaProspectoEmpleo {
    CORR_EMPRESA: number;
    CORR_PROSPECTO: number;
    CORR_PROSPECTO_PERSONA: number;
    CORR_PROSPECTO_EMPLEO: number;
    EMPRESA: string;
    CARGO: string;
    DIRECCION: string;
    TELEFONO: string;
    EMAIL: string;
    CORR_SECTOR_LABORAL: number | null;
    SECTOR_LABORAL: string;
    CORR_PAIS: number | null;
    NOMBRE_PAIS: string;
    CORR_DEPTO: number | null;
    NOMBRE_DEPTO: string;
    CORR_MUNICIPIO: number | null;
    NOMBRE_MUNICIPIO: string;
    TRABAJA_AUN: boolean | null;
    TIENE_EMPLEO_FUERA: boolean | null;
    SALARIO_MENSUAL: number | null;
    APORTE_LIQUIDO: number | null;
}
