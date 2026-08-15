/** Datos del participante (lectura desde sc-solicitud-empleo). */

export interface ScPersonaDatos {
	CORR_EMPRESA: number;
	CORR_PERSONA_DATOS: number;
	NOMBRE1: string;
	NOMBRE2: string;
	APELLIDO1: string;
	APELLIDO2: string;
	FECHA_NACIMIENTO: string | Date | null;
	EDAD: number;
	ESTADO_CIVIL: string;
	NACIONALIDAD: string;
	CORREO: string;
	CELULAR: string;
	TELEFONO: string;
	DIRECCION: string;
	DUI: string;
	PASAPORTE: string;
	ISSS: string;
	AFP: string;
	NOMBRE_AFP: string;
	LICENCIA: string;
	PLAZA_SOLICITADA: string;
	PRETENSION_SALARIAL: number;
	DISPONIBILIDAD: string;
	RELIGION: string;
	IGLESIA: string;
	DIRECCION_IGLESIA: string;
	ES_CONTRIBUYENTE_CCF: boolean;
	ES_JUBILADO: boolean;
	POSEE_DISCAPACIDAD: boolean;
	TIPO_DISCAPACIDAD: string;
	EMERGENCIA_NOMBRE: string;
	EMERGENCIA_PARENTESCO: string;
	EMERGENCIA_TELEFONO: string;
	TIENE_FAMILIARES_UEES: boolean;
	DECLARA_VERDAD: boolean;
	AUTORIZA_VERIFICACION: boolean;
	FECHA_DECLARACION: string | Date | null;
	FIRMA_ELECTRONICA: string;
	FOTO_URL?: string;
}

export interface ScPersonaFamiliar {
	CORR_FAMILIAR: number;
	TIPO: string;
	NOMBRE: string;
	DOMICILIO: string;
	FECHA_NACIMIENTO: string | Date | null;
	OCUPACION: string;
}

export interface ScPersonaHijo {
	CORR_HIJO: number;
	NOMBRE: string;
	EDAD: number | null;
	SEXO: string;
	FECHA_NACIMIENTO: string | Date | null;
}

export interface ScPersonaEstudio {
	CORR_ESTUDIO: number;
	NIVEL: string;
	INSTITUCION: string;
	DESDE: string | Date | null;
	HASTA: string | Date | null;
	TITULO: string;
}

export interface ScPersonaIdioma {
	CORR_IDIOMA: number;
	IDIOMA: string;
	NIVEL: string;
}

export interface ScPersonaCompetencia {
	CORR_COMPETENCIA_TECNICA: number;
	HERRAMIENTA: string;
	NIVEL: string;
}

export interface ScPersonaExperiencia {
	CORR_EXPERIENCIA_LABORAL: number;
	EMPRESA: string;
	TELEFONO: string;
	CARGO: string;
	JEFE_INMEDIATO: string;
	FECHA_INICIO: string | Date | null;
	FECHA_FIN: string | Date | null;
	SALARIO_INICIAL: number | null;
	SALARIO_FINAL: number | null;
	MOTIVO_SALIDA: string;
}

export interface ScPersonaFamiliarUees {
	CORR_FAMILIAR_UEES: number;
	NOMBRE: string;
	PARENTESCO: string;
	UNIDAD: string;
	TELEFONO: string;
}
