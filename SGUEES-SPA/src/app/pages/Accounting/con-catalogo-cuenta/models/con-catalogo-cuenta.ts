export interface ConCatalogoCuenta {
	CORR_EMPRESA: number;
	CUENTA_CONTABLE: string;
	NOMBRE_CUENTA: string;
	ES_DEBE: boolean;
	ES_HABER: boolean;
	ES_DETALLE: boolean;
	NIVEL: number;
	CUENTA_MAYOR: string;
	CODIGO_RUBRO: string;
	NOMBRE_RUBRO: string;
	NO_HABILITADA: boolean;
	CLASE_RUBRO: string;
	ES_LIQUIDADORA: boolean;
	CLASE_VALUACION: string;
	NOMBRE_CLASE_VALUACION?: string;
}
