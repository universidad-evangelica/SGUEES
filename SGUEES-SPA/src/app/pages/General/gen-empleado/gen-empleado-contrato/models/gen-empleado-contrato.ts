// Qué hace: modelos TypeScript para el tab Contratos de gen-empleado (GEN_EMPLEADO_CONTRATO).
// Cómo lo hace: espeja V_GEN_EMPLEADO_CONTRATO, plantillas activas disponibles y el payload de acciones/borrador.
export interface GenEmpleadoContrato {
	CORR_EMPRESA: number;
	CORR_EMPLEADO_CONTRATO: number;
	CORR_EMPLEADO: number;
	CODIGO_EMPLEADO?: string;
	NOMBRE_EMPLEADO?: string;
	DUI?: string;
	CORR_UNIDAD: number | null;
	NOMBRE_UNIDAD?: string;
	CORR_PUESTO: number | null;
	NOMBRE_PUESTO?: string;
	CORR_PLANTILLA_CONTRATO_VERSION: number;
	CORR_PLANTILLA_CONTRATO?: number | null;
	NOMBRE_PLANTILLA?: string;
	CORR_TIPO_CONTRATACION?: number | null;
	NOMBRE_TIPO_CONTRATACION?: string;
	NUMERO_VERSION?: number | null;
	NOMBRE_VERSION?: string;
	CUERPO_CONTRATO?: string;
	FECHA_INICIO: string | Date | null;
	FECHA_FIN: string | Date | null;
	FECHA_FIRMA: string | Date | null;
	ESTADO_CONTRATO: number;
	NOMBRE_ESTADO_CONTRATO?: string;
	NOMBRE_ARCHIVO?: string | null;
	RUTA_ARCHIVO?: string | null;
	TIENE_ARCHIVO_FIRMADO: boolean;
	FECHA_CARGA?: string | Date | null;
	MOTIVO_ANULACION?: string | null;
	USUARIO_CREA?: string | null;
	ESTACION_CREA?: string | null;
	FECHA_CREA?: string | Date | null;
	USUARIO_ACTU?: string | null;
	ESTACION_ACTU?: string | null;
	FECHA_ACTU?: string | Date | null;
}

export interface GenPlantillaContratoActiva {
	CORR_PLANTILLA_CONTRATO: number;
	NOMBRE_PLANTILLA: string;
	CORR_TIPO_CONTRATACION: number;
	NOMBRE_TIPO_CONTRATACION: string;
	CORR_PLANTILLA_CONTRATO_VERSION: number;
	NUMERO_VERSION: number;
	NOMBRE_VERSION: string;
}

export interface GenEmpleadoContratoAccion {
	CORR_EMPRESA?: number;
	CORR_EMPLEADO_CONTRATO: number;
	CORR_EMPLEADO: number;
	CORR_UNIDAD: number | null;
	CORR_PUESTO: number | null;
	CORR_PLANTILLA_CONTRATO_VERSION: number;
	FECHA_INICIO: string | Date | null;
	FECHA_FIN: string | Date | null;
	FECHA_FIRMA: string | Date | null;
	MOTIVO_ANULACION?: string | null;
	REGENERAR_CONTENIDO?: boolean;
	CUERPO_CONTRATO?: string | null;
}

