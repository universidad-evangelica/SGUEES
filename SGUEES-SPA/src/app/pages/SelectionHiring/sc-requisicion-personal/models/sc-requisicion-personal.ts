export interface ScRequisicionPersonal {
    CORR_EMPRESA: number;
    CORR_REQUISICION_PERSONAL: number;
    CORR_DESCRIPTOR: number;
    CORR_DEPARTAMENTO: number;
    CORR_PUESTO: number;
    CORR_TIPO_MODALIDAD: number;
    CORR_TIPO_CONTRATACION: number;
    CORR_TIPO_VACANTE: number;
    CANTIDAD_PLAZAS: number;
    PLAZAS_CUBIERTAS: number;
    FECHA_REQUISICION: Date;
    JUSTIFICACION: string;
    CORR_EMPLEADO_SUSTITUTO: string;
    SALARIO_MINIMO: number;
    SALARIO_MAXIMO: number;
    CORR_ESTADO_REQUISICION: number;
    FECHA_APROBACION?: Date | null;
    FECHA_CIERRE?: Date | null;
    TIEMPO_CONTRATO: number;
    HORARIO: string;
    USUARIO_CREA: string;
    FECHA_CREA: Date;
    ESTACION_CREA: string;
    USUARIO_ACTU: string;
    FECHA_ACTU: Date;
    ESTACION_ACTU: string;
}
