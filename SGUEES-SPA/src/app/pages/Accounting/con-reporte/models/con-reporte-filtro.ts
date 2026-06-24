export interface ConReporteFiltro {
	CODIGO_REPORTE: string;
	FECHA_INICIAL?: Date | string | null;
	FECHA_FINAL?: Date | string | null;
	FECHA_IMPRESION?: Date | string | null;
	ANIO_PERIODO?: number | null;
	MES_PERIODO?: number | null;
	CUENTA_CONTABLE_INICIAL?: string | null;
	CUENTA_CONTABLE_FINAL?: string | null;
	CUENTA_CONTABLE?: string | null;
	CUENTA_DEPARTAMENTO?: string | null;
	CORR_CONFI_REPORTE?: number | null;
	CORR_AUXILIAR?: number | null;
	CORR_CENTRO_COSTO?: number | null;
	CORR_MONEDA?: number | null;
	PARTIDA_CIERRE?: boolean | null;
	PARTIDA_LIQUIDACION?: boolean | null;
	CUENTA_A_CERO?: boolean | null;
	CONSOLIDADO?: boolean | null;
	FOLIADO?: boolean | null;
	NUMERO_FOLIO?: number | null;
	NIVEL?: number | null;
	ORIENTACION?: string | null;
}

export interface ConReporteDefinicion {
	CODIGO_REPORTE: string;
	TITULO: string;
	STORED_PROCEDURE: string;
	DESTINO: string;
	OLEADA: number;
	SP_DISPONIBLE: boolean;
	RPT_FILE?: string | null;
	RPT_DISPONIBLE?: boolean;
	CONSULTA_GRID?: boolean;
	URL_CONSULTA?: string | null;
	URL_REPORTE?: string | null;
	URL_OPCION?: string | null;
	FILTROS: string[];
}

export interface ConConfiReporte {
	CORR_CONFI_REPORTE: number;
	NOMBRE_REPORTE: string;
}
