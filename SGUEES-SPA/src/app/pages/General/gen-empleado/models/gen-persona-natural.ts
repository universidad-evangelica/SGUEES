// Qué hace: modelo de GEN_PERSONA_NATURAL para tab Personales.
// Cómo lo hace: interface alineada a V_GEN_PERSONA_NATURAL (sin escribir NOMBRE_COMPLETO).
export interface GenPersonaNatural {
	CORR_PERSONA: number;
	CORR_PERSONA_NATURAL: number;
	PRIMER_NOMBRE: string;
	SEGUNDO_NOMBRE: string;
	PRIMER_APELLIDO: string;
	SEGUNDO_APELLIDO: string;
	APELLIDO_CASADA: string;
	NOMBRE_COMPLETO?: string;
	FOTO_URL: string;
	SEXO: string;
	ESTADO_CIVIL: string;
	NACIONALIDAD: string;
	EDAD: number | null;
	FECHA_NACIMIENTO: Date | string | null;
	ES_JUBILADO: boolean;
	POSEE_DISCAPACIDAD: boolean;
	TIPO_DISCAPACIDAD: string;
	CORR_RELIGION: number | null;
	NOMBRE_RELIGION?: string;
	IGLESIA_CONGREGA: string;
	CARTA_PASTORAL: string;
	ES_EXTRANJERO: boolean;
	DOMICILIADO: string;
	CORR_PAIS_NACIMIENTO: number | null;
	NOMBRE_PAIS_NACIMIENTO?: string;
	CORR_DEPTO_NACIMIENTO: number | null;
	NOMBRE_DEPTO_NACIMIENTO?: string;
	CORR_MUNICIPIO_NACIMIENTO: number | null;
	NOMBRE_MUNICIPIO_NACIMIENTO?: string;
	CORR_DISTRITO_NACIMIENTO: number | null;
	NOMBRE_DISTRITO_NACIMIENTO?: string;
	CORR_ORIGEN_INGRESO: number | null;
	NOMBRE_ORIGEN_INGRESO?: string;
	CORR_TIPO_CONTRIBUYENTE: number | null;
	NOMBRE_TIPO_CONTRIBUYENTE?: string;
	CORR_ACTIVIDAD_ECONOMICA: number | null;
	NOMBRE_ACTIVIDAD_ECONOMICA?: string;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date | string | null;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date | string | null;
}
