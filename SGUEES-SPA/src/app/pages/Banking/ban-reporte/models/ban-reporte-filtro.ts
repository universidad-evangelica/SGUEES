export interface BanReporteFiltro {
	CODIGO_REPORTE: string;
	FECHA_INICIAL?: Date | string | null;
	FECHA_FINAL?: Date | string | null;
	FECHA_IMPRESION?: Date | string | null;
	CORR_CUENTA_BANCO?: number | null;
	CORR_TIPO_MOVIMIENTO?: number | null;
	NUMERO_DOCUMENTO_INICIAL?: number | null;
	NUMERO_DOCUMENTO_FINAL?: number | null;
}

export interface BanReporteDefinicion {
	CODIGO_REPORTE: string;
	TITULO: string;
	STORED_PROCEDURE: string;
	DESTINO: string;
	OLEADA: number;
	SP_DISPONIBLE: boolean;
	RPT_FILE?: string | null;
	RPT_DISPONIBLE?: boolean;
	CONSULTA_GRID?: boolean;
	URL_OPCION?: string | null;
	FILTROS: string[];
}
