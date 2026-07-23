// Qué hace: define la estructura del país encabezado (GEN_PAIS) y los niveles territoriales hijos.
export interface GenPais {
	CORR_PAIS: number;
	NOMBRE_PAIS: string;
	CODIGO_PAIS: string;
	NACIONALIDAD: string;
	NOMBRE_CORTO: string;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}

// Niveles hijos del documento país (cascada).
export type TerritorialNivel = 'depto' | 'municipio' | 'distrito';
