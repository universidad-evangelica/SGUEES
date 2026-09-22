// Qué hace: modelo de domicilio de persona (tab Direcciones).
// Cómo lo hace: refleja V_GEN_PERSONA_DOMICILIO + nombres de territorio.
export interface GenPersonaDomicilio {
	CORR_EMPRESA: number;
	CORR_PERSONA: number;
	CORR_DOMICILIO: number;
	DIRECCION: string;
	CORR_PAIS: number | null;
	NOMBRE_PAIS?: string;
	CORR_DEPTO: number | null;
	NOMBRE_DEPTO?: string;
	CORR_MUNICIPIO: number | null;
	NOMBRE_MUNICIPIO?: string;
	CORR_DISTRITO: number | null;
	NOMBRE_DISTRITO?: string;
	ACTIVO_DOMICILIO: boolean;
}
