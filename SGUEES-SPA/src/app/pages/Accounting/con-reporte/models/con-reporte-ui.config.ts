/** Configuración de presentación por reporte (SPA). Los filtros activos vienen de BD vía ConReporteDefinicion.FILTROS. */

export type ConReporteFormatoColumna = 'texto' | 'fecha' | 'moneda' | 'entero';

export interface ConReporteColumnaUiConfig {
	campo: string;
	titulo: string;
	ancho: number;
	ajustarTexto?: boolean;
	formato?: ConReporteFormatoColumna;
	alineacion?: 'left' | 'center' | 'right';
	visible?: boolean;
}

export interface ConReporteFiltroInicialUiConfig {
	/** Balance / estado: fecha final = último día del mes anterior. */
	fechaCorteMesAnterior?: boolean;
	/** Libro mayor: partida cierre y liquidación activas al abrir. */
	partidaCierreLiquidacionMayor?: boolean;
	nivelDefault?: number;
}

export interface ConReporteUiConfig {
	codigo: string;
	titulo: string;
	columnas: ConReporteColumnaUiConfig[];
	filtroInicial?: ConReporteFiltroInicialUiConfig;
}
