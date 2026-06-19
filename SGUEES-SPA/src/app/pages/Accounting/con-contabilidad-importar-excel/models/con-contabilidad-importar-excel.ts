export interface ConCatalogoCuentaImportRow {
	CUENTA_CONTABLE: string;
	NOMBRE_CUENTA: string;
	ES_DEBE: boolean;
	ES_HABER: boolean;
	ES_DETALLE: boolean;
	NIVEL: number;
	CUENTA_MAYOR: string;
	CODIGO_RUBRO: string;
	NO_HABILITADA: boolean;
	CLASE_RUBRO: string;
	ES_LIQUIDADORA: boolean;
	CLASE_VALUACION: string;
}

export interface ConCentroCostoImportRow {
	CORR_CENTRO_COSTO: number;
	CODIGO_CENTRO_COSTO: string;
	NOMBRE_CENTRO: string;
	CUENTA_CONTABLE: string;
	CORR_TIPO_CENTRO_COSTO: number;
	ESTADO_CENTRO_COSTO: string;
	CORR_UNIDAD_NEGOCIO: number;
	CORR_AREA_FUNCIONAL: number;
	CODIGO_TERMINACION: string;
	CORR_EMPLEADO_JEFE: number;
	CORR_CLIENTE: number;
}

export interface ConCatalogoCuentaImportParam {
	Rows: ConCatalogoCuentaImportRow[];
}

export interface ConCentroCostoImportParam {
	Rows: ConCentroCostoImportRow[];
}
