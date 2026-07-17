// Requisito de experiencia del perfil (texto y tipo requerido/deseable).
export interface ScPerfilPuestoExperiencia {
	CORR_EMPRESA?: number;
	CORR_DESCRIPTOR_PUESTO?: number;
	CORR_PERFIL_PUESTO?: number;
	CORR_EXPERIENCIA: number;
	REQUISITO: string;
	TIPO_REQUERIDO: string;
	_clientKey?: string | number;
}
