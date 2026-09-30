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

// Qué hace: descriptor asignado o disponible para un empleado.
// Cómo lo hace: muestra código, puesto, unidad y estado.
export interface ScDescriptorAsignadoEmpleado {
	CORR_DESCRIPTOR_PUESTO: number;
	CORR_EMPLEADO: number;
	CODIGO_DESCRIPTOR_PUESTO?: string;
	NOMBRE_PUESTO?: string;
	NOMBRE_UNIDAD?: string;
	FECHA_EMISION?: string | Date | null;
	CORR_ESTADO?: number | null;
	NOMBRE_ESTADO?: string;
	SELECCION?: boolean;
}
