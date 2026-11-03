export interface MateriaPractica {
    CORR_ASIGNATURA: number;
    CORR_CARRERA: number;
    CODIGO_ASIGNATURA: string;
    NOMBRE_ASIGNATURA: string;
    CORR_TIPO_PRACTICA: number | null;
    NOMBRE_TIPO_PRACTICA: string | null;
    ACTIVO: boolean;
    EN_USO: boolean;
    VERSION: string;
}
export interface AsignarPracticaInput {
    CORR_FACULTAD: number;
    CORR_CARRERA: number;
    CORR_TIPO_PRACTICA: number;
    VERSION_TIPO: string;
    CONFIRMAR_REEMPLAZOS: boolean;
    ASIGNATURAS: { CORR_ASIGNATURA: number; VERSION: string }[];
}
