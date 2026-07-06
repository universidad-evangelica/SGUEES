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

export interface GenDepto {
	CORR_PAIS: number;
	CORR_DEPTO: number;
	NOMBRE_DEPTO: string;
	CODIGO_DEPTO: string;
	NOMBRE_PAIS?: string;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}

export interface GenMunicipio {
	CORR_DEPTO: number;
	CORR_MUNICIPIO: number;
	CORR_PAIS: number;
	NOMBRE_MUNICIPIO: string;
	CODIGO_MUNICIPIO: string;
	NOMBRE_DEPTO?: string;
	NOMBRE_PAIS?: string;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}

export interface GenDistrito {
	CORR_PAIS: number;
	CORR_DEPTO: number;
	CORR_MUNICIPIO: number;
	CORR_DISTRITO: number;
	NOMBRE_DISTRITO: string;
	NOMBRE_MUNICIPIO?: string;
	NOMBRE_DEPTO?: string;
	NOMBRE_PAIS?: string;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date;
}

export type TerritorialNivel = 'depto' | 'municipio' | 'distrito';
