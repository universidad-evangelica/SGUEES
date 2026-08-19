export interface ScSolicitudRequisicion {
	CORR_SOLICITUD_REQUISICION: number;
	CORR_SOLICITUD_EMPLEO: number;
	CORR_REQUISICION_PERSONAL: number;
	FECHA_REQUISICION?: string | Date;
	NOMBRE_UNIDAD?: string;
	NOMBRE_PUESTO_SOLICITADO?: string;
	MODALIDAD_NOMBRE?: string;
	NOMBRE_TIPO_CONTRATACION?: string;
	NOMBRE_TIPO_VACANTE?: string;
	CANTIDAD_PLAZAS?: number;
	PLAZAS_CUBIERTAS?: number;
	SALARIO?: number;
	TIEMPO_CONTRATO?: number;
	HORARIO?: string;
	JUSTIFICACION?: string;
	CORR_EMPLEADO_SUSTITUTO?: string;
	CORR_ESTADO_REQUISICION?: number;
	FECHA_APROBACION?: string | Date | null;
	FECHA_CIERRE?: string | Date | null;
}
