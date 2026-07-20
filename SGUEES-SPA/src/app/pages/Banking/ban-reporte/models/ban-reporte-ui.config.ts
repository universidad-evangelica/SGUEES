export type BanReporteFormatoColumna = 'texto' | 'fecha' | 'moneda' | 'entero';

export interface BanReporteColumnaUiConfig {
	campo: string;
	titulo: string;
	ancho: number;
	formato?: BanReporteFormatoColumna;
	alineacion?: 'left' | 'center' | 'right';
	visible?: boolean;
}

export interface BanReporteUiConfig {
	codigo: string;
	titulo: string;
	columnas: BanReporteColumnaUiConfig[];
}
