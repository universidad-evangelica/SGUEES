// Qué hace: modelo de puesto asignado al empleado (tab Puestos).
// Cómo lo hace: refleja V_GEN_EMPLEADO_PUESTO. HORARIO_LABORAL no se edita en pantalla.
export interface GenEmpleadoPuesto {
	CORR_EMPRESA: number;
	CORR_EMPLEADO: number;
	CORR_UNIDAD: number;
	CODIGO_UNIDAD?: string;
	NOMBRE_UNIDAD?: string;
	CORR_PUESTO: number;
	CODIGO_PUESTO?: string;
	NOMBRE_PUESTO?: string;
	FECHA_INGRESO: string | null;
	FECHA_FIN?: string | null;
	ACTIVO_PUESTO?: boolean;
	CORR_EMPLEADO_PUESTO_HISTORIAL?: number;
	SUELDO: number | null;
	CORR_TIPO_CONTRATACION: number | null;
	NOMBRE_TIPO_CONTRATACION?: string;
	CORR_TIPO_MODALIDAD: number | null;
	MODALIDAD_NOMBRE?: string;
}
