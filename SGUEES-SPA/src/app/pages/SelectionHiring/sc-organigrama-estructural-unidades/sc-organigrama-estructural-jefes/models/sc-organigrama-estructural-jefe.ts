export interface SC_OrganigramaEstructuralJefe {
    CORR_EMPRESA: number;
    CORR_JEFE: number;
    CORR_UNIDAD: number;
    NOMBRE_UNIDAD: string;
    CORR_EMPLEADO: number;
    NOMBRE_EMPLEADO: string;
    LOGIN_SISTEMA_WEB: string;
    FECHA_INICIO: Date;
    FECHA_FIN: Date | null;
    ACTIVO: boolean;
    CORR_PUESTO: number | null;
    NOMBRE_PUESTO: string | null;
}