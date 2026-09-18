// Qué hace: modelo de fila del browse de Empleado (V_GEN_EMPLEADO).
// Cómo lo hace: refleja persona + documentos DUI/NIT + datos laborales básicos.
export interface GenEmpleado {
	CORR_EMPRESA: number;
	CORR_EMPLEADO: number;
	CORR_PERSONA: number;
	CODIGO_EMPLEADO: string;
	NOMBRE_EMPLEADO: string;
	DUI: string;
	NIT: string;
	FECHA_INGRESO: Date | string | null;
	CORREO_INSTITUCIONAL: string;
	TELEFONO_INSTITUCIONAL: string;
	LOGIN_SISTEMA_WEB: string;
	ACTIVO_EMPLEADO: boolean;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date | string | null;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date | string | null;
}
