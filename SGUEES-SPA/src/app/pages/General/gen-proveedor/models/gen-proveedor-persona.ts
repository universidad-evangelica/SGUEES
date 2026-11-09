export interface GenProveedorPersona {
	CORR_EMPRESA?: number;
	CORR_PERSONA: number;
	CORR_PERSONA_NATURAL?: number;
	CORR_PERSONA_JURIDICA?: number;
	CODIGO_PERSONA?: string;
	TIPO_PERSONERIA: string;
	NOMBRE_TIPO_PERSONERIA?: string;
	NOMBRE_PERSONA?: string;
	ACTIVO_PERSONA?: boolean;

	PRIMER_NOMBRE?: string;
	SEGUNDO_NOMBRE?: string;
	PRIMER_APELLIDO?: string;
	SEGUNDO_APELLIDO?: string;

	NOMBRE_EMPRESA?: string;
	RAZON_SOCIAL?: string;
	GIRO?: string;

	ES_EXTRANJERO?: boolean;
	DOMICILIADO?: string;
	CORR_TIPO_CONTRIBUYENTE?: number;
	NOMBRE_TIPO_CONTRIBUYENTE?: string;
	CORR_ACTIVIDAD_ECONOMICA?: number;
	NOMBRE_ACTIVIDAD_ECONOMICA?: string;

	NUMERO_DIP?: string;
	NUMERO_NIT?: string;
	NUMERO_NRC?: string;

	DIRECCION?: string;
	CORR_PAIS?: number;
	NOMBRE_PAIS?: string;
	CORR_DEPTO?: number;
	NOMBRE_DEPTO?: string;
	CORR_MUNICIPIO?: number;
	NOMBRE_MUNICIPIO?: string;
	CORR_DISTRITO?: number;

	TELEFONO_FIJO?: string;
	TELEFONO_MOVIL?: string;
	CORREO_ELECTRONICO_1?: string;
	CORREO_ELECTRONICO_2?: string;
}

export function emptyGenProveedorPersona(tipo: 'N' | 'J' = 'N'): GenProveedorPersona {
	return {
		CORR_PERSONA: 0,
		TIPO_PERSONERIA: tipo,
		PRIMER_NOMBRE: '',
		SEGUNDO_NOMBRE: '',
		PRIMER_APELLIDO: '',
		SEGUNDO_APELLIDO: '',
		NOMBRE_EMPRESA: '',
		RAZON_SOCIAL: '',
		GIRO: '',
		ES_EXTRANJERO: false,
		DOMICILIADO: '',
		CORR_TIPO_CONTRIBUYENTE: 0,
		CORR_ACTIVIDAD_ECONOMICA: 0,
		NUMERO_DIP: '',
		NUMERO_NIT: '',
		NUMERO_NRC: '',
		DIRECCION: '',
		CORR_PAIS: 0,
		CORR_DEPTO: 0,
		CORR_MUNICIPIO: 0,
		CORR_DISTRITO: 0,
		TELEFONO_FIJO: '',
		TELEFONO_MOVIL: '',
		CORREO_ELECTRONICO_1: '',
		CORREO_ELECTRONICO_2: '',
	};
}
