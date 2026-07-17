// Modelo principal del descriptor de puesto y tipos auxiliares de lookups/catálogos.
// Las constantes de formato, tipo de función/relación y bloqueo de creación se reutilizan en service y component.

export interface ScDescriptorPuesto {
	CORR_EMPRESA: number;
	CORR_DESCRIPTOR_PUESTO: number;
	CORR_PUESTO: number | null;
	CORR_UNIDAD: number | null;
	FECHA_EMISION: Date | string | null;
	CORR_PUESTO_REPORTA: number | null;
	FECHA_REVISION: Date | string | null;
	NUM_PERSONAL_CARGO: number | null;
	OBJETIVO_PUESTO: string;
	CORR_IMPACTO_ECONOMICO: number | null;
	DESCRIPCION_IMPACTO_ECONOMICO?: string;
	CORR_INDUCCION: number | null;
	NOMBRE_INDUCCION?: string;
	SEMANAS_INDUCCION?: number | null;
	RESPONSABLE: string;
	FORMATO: string;
	VERSION: number | null;
	ESTADO_DESCRIPTOR: string;
	USUARIO_CREA: string;
	ESTACION_CREA: string;
	FECHA_CREA: Date | string | null;
	USUARIO_ACTU: string;
	ESTACION_ACTU: string;
	FECHA_ACTU: Date | string | null;
	// Campos de solo lectura enriquecidos desde joins o mocks locales.
	NOMBRE_PUESTO?: string;
	NOMBRE_UNIDAD?: string;
}

// Item del lookup de inducción usado en el tab Entrenamiento.
export interface ScInduccionLookupItem {
	CORR_INDUCCION: number;
	NOMBRE_INDUCCION: string;
	SEMANAS_INDUCCION: number | null;
}

// Mocks temporales de unidad/puesto mientras no exista el catálogo real de organigrama.
export interface MockUnidad {
	CORR_UNIDAD: number;
	NOMBRE_UNIDAD: string;
}

export interface MockPuesto {
	CORR_PUESTO: number;
	CORR_UNIDAD: number;
	NOMBRE_PUESTO: string;
	CORR_PUESTO_REPORTA: number;
	RESPONSABLE: string;
}

export interface MockPuestoReporta {
	CORR_PUESTO_REPORTA: number;
	NOMBRE_PUESTO_REPORTA: string;
}

// Lookups de competencias, requerimientos, riesgos, responsabilidades e impacto económico.
export interface ScCompetenciaTecnicaLookupItem {
	CORR_COMPETENCIAS_TECNICAS: number;
	CORR_COMPETENCIAS_TECNICAS_PADRE: number | null;
	CODIGO_COMPETENCIAS_TECNICAS: string;
	NOMBRE_COMPETENCIAS_TECNICAS: string;
	DESCRIPCION: string;
	NOMBRE_DISPLAY: string;
	GRUPO_NIV1: string;
	GRUPO_NIV2: string;
	GRUPO_PADRE: string;
	NIVEL: string;
}

export interface ScCompetenciaConductualLookupItem {
	CORR_COMPETENCIAS_CONDUCTUALES: number;
	NOMBRE_COMPETENCIAS_CONDUCTUALES: string;
	DESCRIPCION: string;
	NOMBRE_TIPO_PUESTO?: string;
	CODIGO_TIPO_PUESTO?: string;
}

export interface ScRequerimientoOrganizacionalLookupItem {
	CORR_REQUERIMIENTO_ORGANIZACIONAL: number;
	DESCRIPCION: string;
}

export interface ScRiesgoPuestoLookupItem {
	CORR_RIESGO_PUESTO: number;
	NOMBRE_RIESGO_PUESTO: string;
}

export interface ScResponsabilidadCargoLookupItem {
	CORR_RESPONSABILIDAD: number;
	NOMBRE_RESPONSABILIDAD: string;
	APLICA_DESCRIPTOR: string;
}

export interface ScImpactoEconomicoLookupItem {
	CORR_IMPACTO_ECONOMICO: number;
	DESCRIPCION: string;
}

export const FORMATO_CORTO = 'CORTO';
export const FORMATO_EXTENSO = 'EXTENSO';

export const TIPO_FUNCION_CLAVE = 'CLAVE';
export const TIPO_FUNCION_SECUNDARIA = 'SECUNDARIA';

// I = Interna, E = Externa
export const TIPO_RELACION_INTERNA = 'I';
export const TIPO_RELACION_EXTERNA = 'E';

// Estados que impiden crear otra versión del mismo puesto en paralelo.
export const ESTADOS_DESCRIPTOR_BLOQUEO_CREACION = ['BORRADOR', 'ENVIADO', 'REVISADO', 'ACTIVO'];

export const MOCK_UNIDADES: MockUnidad[] = [
	{ CORR_UNIDAD: 3, NOMBRE_UNIDAD: 'Gerencia General' },
	{ CORR_UNIDAD: 4, NOMBRE_UNIDAD: 'Gerencia de Talento Humano' },
	{ CORR_UNIDAD: 5, NOMBRE_UNIDAD: 'Subgerencia de Tecnologia de Informacion' },
];

export const MOCK_PUESTOS: MockPuesto[] = [
	{
		CORR_PUESTO: 1,
		CORR_UNIDAD: 4,
		NOMBRE_PUESTO: 'Gerente de Talento Humano',
		CORR_PUESTO_REPORTA: 5,
		RESPONSABLE: 'Maria Lopez',
	},
	{
		CORR_PUESTO: 2,
		CORR_UNIDAD: 4,
		NOMBRE_PUESTO: 'Analista de Reclutamiento y Seleccion',
		CORR_PUESTO_REPORTA: 1,
		RESPONSABLE: 'Carlos Perez',
	},
	{
		CORR_PUESTO: 3,
		CORR_UNIDAD: 5,
		NOMBRE_PUESTO: 'Subgerente de Tecnologia de Informacion',
		CORR_PUESTO_REPORTA: 5,
		RESPONSABLE: 'Ana Garcia',
	},
	{
		CORR_PUESTO: 4,
		CORR_UNIDAD: 5,
		NOMBRE_PUESTO: 'Desarrollador de Software',
		CORR_PUESTO_REPORTA: 3,
		RESPONSABLE: 'Luis Ramirez',
	},
	{
		CORR_PUESTO: 5,
		CORR_UNIDAD: 3,
		NOMBRE_PUESTO: 'Gerente General',
		CORR_PUESTO_REPORTA: 1,
		RESPONSABLE: 'Sofia Mendez',
	},
];

export const MOCK_PUESTOS_REPORTA: MockPuestoReporta[] = [
	{ CORR_PUESTO_REPORTA: 1, NOMBRE_PUESTO_REPORTA: 'Maria Lopez' },
	{ CORR_PUESTO_REPORTA: 2, NOMBRE_PUESTO_REPORTA: 'Carlos Perez' },
	{ CORR_PUESTO_REPORTA: 3, NOMBRE_PUESTO_REPORTA: 'Ana Garcia' },
	{ CORR_PUESTO_REPORTA: 4, NOMBRE_PUESTO_REPORTA: 'Luis Ramirez' },
	{ CORR_PUESTO_REPORTA: 5, NOMBRE_PUESTO_REPORTA: 'Sofia Mendez' },
];

// Valores iniciales del perfil cuando el descriptor aún no tiene registro padre.
export const PERFIL_PUESTO_DEFAULT = {
	EDAD_MINIMA: null as number | null,
	EDAD_MAXIMA: null as number | null,
	SEXO: 'INDIFERENTE',
	ESTADO_FAMILIAR: 'INDIFERENTE',
	CORR_DISPONIBILIDAD_HORARIO: null as number | null,
	CORR_TIPO_MODALIDAD: null as number | null,
	LICENCIA: false,
};

// Datos de demostración para la bitácora (aún no conectada a API).
export const MOCK_BITACORA = [
	{
		CORR_DESCRIPTOR_PUESTO: 0,
		NOMBRE_ESTADO: 'Borrador',
		USUARIO: 'admin',
		OBSERVACIONES: 'Descriptor creado',
		FECHA: '2026-07-01T10:30:00',
	},
	{
		CORR_DESCRIPTOR_PUESTO: 0,
		NOMBRE_ESTADO: 'En revision',
		USUARIO: 'rrhh',
		OBSERVACIONES: 'Enviado a revision',
		FECHA: '2026-07-03T14:15:00',
	},
];
