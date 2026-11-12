// Qué hace: modelo TypeScript de plantilla de contrato.
// Cómo lo hace: define los campos de GEN_PLANTILLA_CONTRATO más el nombre derivado del tipo de contrato y auditoría.
export interface GenPlantillaContrato {
	CORR_EMPRESA: number;
	CORR_PLANTILLA_CONTRATO: number;
	NOMBRE_PLANTILLA: string;
	CORR_TIPO_CONTRATACION: number | null;
	NOMBRE_TIPO_CONTRATACION?: string;
	CORR_VERSION_ACTIVA?: number | null;
	NUMERO_VERSION_ACTIVA?: number | null;
	NOMBRE_VERSION_ACTIVA?: string | null;
	CUERPO_PLANTILLA?: string | null;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}

// Qué hace: representa un parámetro individual disponible para insertar en contratos.
// Cómo lo hace: expone su clave token, etiqueta visible y origen descriptivo en BD.
export interface ParametroContratoItem {
	key: string;
	label: string;
	descripcion?: string;
}

// Qué hace: agrupa parámetros de contrato por categoría funcional para el panel lateral.
// Cómo lo hace: contiene el título de la categoría y la lista de parámetros asociados.
export interface GrupoParametrosContrato {
	categoria: string;
	items: ParametroContratoItem[];
}

// Qué hace: representa una versión registrada de plantilla de contrato.
// Cómo lo hace: mapea las columnas de V_GEN_PLANTILLA_CONTRATO_VERSION incluyendo referencia al padre v1.
export interface GenPlantillaContratoVersion {
	CORR_EMPRESA: number;
	CORR_PLANTILLA_CONTRATO_VERSION: number;
	CORR_PLANTILLA_CONTRATO: number;
	NUMERO_VERSION: number;
	NOMBRE_VERSION: string;
	CORR_VERSION_PADRE?: number | null;
	NOMBRE_VERSION_PADRE?: string | null;
	CUERPO_PLANTILLA?: string | null;
	ES_VERSION_ACTIVA: boolean;
	OBSERVACION?: string | null;
	USUARIO_CREA?: string;
	ESTACION_CREA?: string;
	FECHA_CREA?: Date | string | null;
	USUARIO_ACTU?: string;
	ESTACION_ACTU?: string;
	FECHA_ACTU?: Date | string | null;
}

// Qué hace: cuerpo enviado al endpoint CrearVersion para generar v2+ desde v1.
// Cómo lo hace: envía correlativo de plantilla, HTML redactado y observación opcional.
export interface CrearVersionPlantillaRequest {
	CORR_PLANTILLA_CONTRATO: number;
	CUERPO_PLANTILLA: string;
	OBSERVACION?: string | null;
}

// Qué hace: cuerpo enviado al endpoint ActualizarVersion para modificar la versión activa v2+.
// Cómo lo hace: envía correlativo de plantilla, correlativo de versión activa y HTML actualizado.
export interface ActualizarVersionPlantillaRequest {
	CORR_PLANTILLA_CONTRATO: number;
	CORR_PLANTILLA_CONTRATO_VERSION: number;
	CUERPO_PLANTILLA: string;
}

// Qué hace: cuerpo enviado al endpoint ActivarVersion para activar una versión histórica v2+.
// Cómo lo hace: envía la llave compuesta de plantilla y versión a activar.
export interface ActivarVersionPlantillaRequest {
	CORR_PLANTILLA_CONTRATO: number;
	CORR_PLANTILLA_CONTRATO_VERSION: number;
}

// Qué hace: representa una entrada en la bitácora de cambios de la plantilla.
// Cómo lo hace: mapea las columnas devueltas por V_GEN_PLANTILLA_CONTRATO_BITACORA.
export interface GenPlantillaContratoBitacora {
	CORR_EMPRESA: number;
	CORR_BITACORA: number;
	CORR_PLANTILLA_CONTRATO: number;
	NOMBRE_PLANTILLA?: string | null;
	CORR_PLANTILLA_CONTRATO_VERSION?: number | null;
	NOMBRE_VERSION?: string | null;
	TIPO_EVENTO: string;
	DETALLE: string;
	FECHA_ACCION: Date | string;
	USUARIO_CREA?: string;
	ESTACION_CREA?: string;
	FECHA_CREA?: Date | string | null;
}

