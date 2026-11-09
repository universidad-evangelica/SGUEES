export interface GenProveedorDoc {
	CORR_EMPRESA?: number;
	CORR_PROVEEDOR: number;
	CORR_DOCUMENTO: number;
	URL_DOCUMENTO?: string;
	NOMBRE_ARCHIVO?: string;
	USUARIO_CREA?: string;
	FECHA_CREA?: Date | string;
	ESTACION_CREA?: string;
	USUARIO_ACTU?: string;
	FECHA_ACTU?: Date | string;
	ESTACION_ACTU?: string;
}
