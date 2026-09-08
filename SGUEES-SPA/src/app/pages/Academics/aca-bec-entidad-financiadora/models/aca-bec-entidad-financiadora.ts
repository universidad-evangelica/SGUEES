export interface AcaBecEntidadFinanciadora {
	CORR_EMPRESA?: number;
	CORR_ENTIDAD_FINANCIADORA: number;
	CODIGO_ENTIDAD: string;
	NOMBRE_ENTIDAD: string;
	TIPO_ENTIDAD: string;
	CONTACTO?: string | null;
	TELEFONO?: string | null;
	CORREO?: string | null;
	ACTIVO: boolean;
	USUARIO_CREA?: string;
	ESTACION_CREA?: string;
	FECHA_CREA?: Date | string;
	USUARIO_ACTU?: string;
	ESTACION_ACTU?: string;
	FECHA_ACTU?: Date | string;
}
