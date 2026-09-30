// Qué hace: empleado cargado o disponible para un descriptor de puesto.
// Cómo lo hace: usa la llave del empleado y los datos que muestra la grilla.
export interface ScDescriptorPuestoEmpleado {
	CORR_DESCRIPTOR_PUESTO?: number;
	CORR_EMPLEADO: number;
	NOMBRE_EMPLEADO?: string;
	DUI?: string;
	FECHA_INGRESO?: string | Date | null;
	CORREO_INSTITUCIONAL?: string;
	TELEFONO_INSTITUCIONAL?: string;
	LOGIN_SISTEMA_WEB?: string;
	ACTIVO_EMPLEADO?: boolean | null;
	SELECCION?: boolean;
}
