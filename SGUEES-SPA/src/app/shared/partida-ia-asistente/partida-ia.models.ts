export interface PartidaIaContexto {
	/** grid = listado, formulario = edición encabezado/detalle, proceso = aplicar/desaplicar/anular */
	modoPantalla?: 'grid' | 'formulario' | 'proceso';
	/** Código estado partida (DI, AP, AN…) cuando aplica */
	estadoPartida?: string;
	/** Etiqueta legible del estado */
	nombreEstadoPartida?: string;
	/** Número correlativo de partida en edición */
	corrPartida?: string | number;
	/** Modo de proceso: aplicar | desaplicar | anular */
	operacionModo?: string;
}

export type PartidaIaTab = 'guia' | 'preguntar';
