import { AsistenteOpcion } from 'src/app/components/sguees-asistente/models/asistente-opcion.model';

export type RecorridoPasoTipo =
	| 'bienvenida'
	| 'portal'
	| 'favoritos'
	| 'header'
	| 'perfil'
	| 'sidebar'
	| 'menu'
	| 'cierre';

export type RecorridoSpotlight = 'center' | 'content' | 'header' | 'sidebar' | 'none';

export interface RecorridoPasoAccion {
	label: string;
	ruta: string;
}

export interface RecorridoPaso {
	index: number;
	tipo: RecorridoPasoTipo;
	titulo: string;
	subtitulo: string;
	icon: string;
	spotlight: RecorridoSpotlight;
	modulo: string;
	menuNombre: string;
	menuKey: string;
	opciones: AsistenteOpcion[];
	textoGuia: string;
	tips: string[];
	accion?: RecorridoPasoAccion;
}

export interface RecorridoGuiaState {
	visible: boolean;
	loading: boolean;
	loadingAi: boolean;
	pasoIndex: number;
	pasos: RecorridoPaso[];
	aiTexto: string;
	errorAi: string | null;
	error: string | null;
	highlightMenuKey: string;
	spotlight: RecorridoSpotlight;
}
