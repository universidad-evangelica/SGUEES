// Modelo principal del descriptor de puesto y constantes/lookups usados por la vista.
export interface ScDescriptorPuesto {
	CORR_EMPRESA: number; // Empresa a la que pertenece el descriptor.
	CORR_DESCRIPTOR_PUESTO: number; // Identificador único del descriptor.
	CORR_PUESTO: number | null; // Puesto organizacional al que aplica el descriptor.
	CORR_UNIDAD: number | null; // Unidad organizacional del puesto.
	FECHA_EMISION: Date | string | null; // Fecha en que se emitió el descriptor.
	CORR_PUESTO_REPORTA: number | null; // Puesto al que reporta (jefe inmediato).
	FECHA_REVISION: Date | string | null; // Fecha de la última revisión del documento.
	NUM_PERSONAL_CARGO: number | null; // Cantidad de personas a cargo del titular.
	OBJETIVO_PUESTO: string; // Objetivo general del puesto.
	CORR_IMPACTO_ECONOMICO: number | null; // Catálogo de impacto económico institucional.
	DESCRIPCION_IMPACTO_ECONOMICO?: string; // Texto del impacto económico (snapshot o catálogo).
	RESPONSABLE: string; // Nombre del responsable del puesto.
	FORMATO: string; // Formato del descriptor: CORTO, EXTENSO o AMBOS.
	VERSION: number | null; // Número de versión del descriptor.
	ESTADO_DESCRIPTOR: string; // Estado del flujo (BORRADOR, ACTIVO, etc.).
	USUARIO_CREA: string; // Usuario que creó el registro.
	ESTACION_CREA: string; // Estación de trabajo de creación.
	FECHA_CREA: Date | string | null; // Fecha y hora de creación.
	USUARIO_ACTU: string; // Usuario de la última actualización.
	ESTACION_ACTU: string; // Estación de la última actualización.
	FECHA_ACTU: Date | string | null; // Fecha y hora de la última actualización.
	NOMBRE_PUESTO?: string; // Nombre del puesto (join o lookup).
	NOMBRE_UNIDAD?: string; // Nombre de la unidad (join o lookup).
}

// Item de lookup de inducción (entrenamiento).
export interface ScInduccionLookupItem {
	CORR_INDUCCION: number; // Identificador del plan de inducción.
	// Texto del valor cerrado (puede ser snapshot del descriptor).
	NOMBRE_INDUCCION: string;
	// Texto del catálogo para el popup del select.
	NOMBRE_INDUCCION_CATALOGO?: string;
	TIEMPO_INDUCCION: number | null; // Duración del plan (junto a UNIDAD_TIEMPO).
	UNIDAD_TIEMPO: string | null; // Unidad de tiempo del plan (Semanas o Meses).
}

// Lookups temporales de unidad/puesto mientras PLA_PUESTO no está integrado.
export interface MockUnidad {
	CORR_UNIDAD: number; // Identificador de la unidad organizacional.
	NOMBRE_UNIDAD: string; // Nombre descriptivo de la unidad.
}

export interface MockPuesto {
	CORR_PUESTO: number; // Identificador del puesto.
	CORR_UNIDAD: number; // Unidad a la que pertenece el puesto.
	NOMBRE_PUESTO: string; // Nombre del puesto.
	CORR_PUESTO_REPORTA: number; // Puesto al que reporta.
	RESPONSABLE: string; // Nombre del titular del puesto.
}

export interface MockPuestoReporta {
	CORR_PUESTO_REPORTA: number; // Identificador del puesto superior.
	NOMBRE_PUESTO_REPORTA: string; // Nombre del jefe o puesto al que reporta.
}

// Catálogo de competencias técnicas (NIV3) para el lookup del grid.
export interface ScCompetenciaTecnicaLookupItem {
	CORR_COMPETENCIAS_TECNICAS: number; // Identificador de la competencia técnica.
	CORR_COMPETENCIAS_TECNICAS_PADRE: number | null; // Competencia padre en la jerarquía.
	CODIGO_COMPETENCIAS_TECNICAS: string; // Código mostrado en el valor cerrado (puede ser snapshot).
	CODIGO_COMPETENCIAS_TECNICAS_CATALOGO?: string; // Código vigente del catálogo (popup).
	NOMBRE_COMPETENCIAS_TECNICAS: string; // Nombre de la competencia técnica.
	DESCRIPCION: string; // Descripción detallada de la competencia.
	NOMBRE_DISPLAY: string; // Texto combinado para mostrar en el lookup.
	GRUPO_NIV1: string; // Agrupación de primer nivel.
	GRUPO_NIV2: string; // Agrupación de segundo nivel.
	GRUPO_PADRE: string; // Nombre del grupo padre.
	NIVEL: string; // Nivel jerárquico de la competencia (ej. NIV3).
}

// Catálogo de competencias conductuales para el lookup del grid.
export interface ScCompetenciaConductualLookupItem {
	CORR_COMPETENCIAS_CONDUCTUALES: number; // Identificador de la competencia conductual.
	NOMBRE_COMPETENCIAS_CONDUCTUALES: string; // Nombre de la competencia.
	DESCRIPCION: string; // Descripción de la competencia conductual.
	NOMBRE_TIPO_PUESTO?: string; // Tipo de puesto asociado (snapshot o catálogo).
	CODIGO_TIPO_PUESTO?: string; // Código del tipo de puesto (valor cerrado).
	CODIGO_TIPO_PUESTO_CATALOGO?: string; // Código vigente del catálogo (popup).
}

// Catálogo de requerimientos organizacionales para el lookup del grid.
export interface ScRequerimientoOrganizacionalLookupItem {
	CORR_REQUERIMIENTO_ORGANIZACIONAL: number; // Identificador del requerimiento.
	DESCRIPCION: string; // Texto del requerimiento organizacional.
}

// Catálogo de riesgos del puesto para el lookup del grid.
export interface ScRiesgoPuestoLookupItem {
	CORR_RIESGO_PUESTO: number; // Identificador del riesgo.
	NOMBRE_RIESGO_PUESTO: string; // Nombre del riesgo del puesto.
}

// Catálogo de responsabilidades del cargo para el lookup del grid.
export interface ScResponsabilidadCargoLookupItem {
	CORR_RESPONSABILIDAD: number; // Identificador de la responsabilidad.
	NOMBRE_RESPONSABILIDAD: string; // Nombre de la responsabilidad.
	APLICA_DESCRIPTOR: string; // Indica si aplica al descriptor (S/N).
}

// Catálogo de impacto económico institucional para el select del descriptor.
export interface ScImpactoEconomicoLookupItem {
	CORR_IMPACTO_ECONOMICO: number; // Identificador del impacto económico.
	// Texto mostrado en el valor cerrado del select (puede ser el snapshot del descriptor).
	DESCRIPCION: string;
	// Texto del catálogo para las columnas del popup (siempre el nombre actual del catálogo).
	DESCRIPCION_CATALOGO?: string;
}

// Valor del formato corto del descriptor.
export const FORMATO_CORTO = 'CORTO';
// Valor del formato extenso del descriptor.
export const FORMATO_EXTENSO = 'EXTENSO';
// Valor del formato ambos (corto + extenso) del descriptor.
export const FORMATO_AMBOS = 'AMBOS';

// Tipo de función clave en el descriptor.
export const TIPO_FUNCION_CLAVE = 'CLAVE';
// Tipo de función secundaria en el descriptor.
export const TIPO_FUNCION_SECUNDARIA = 'SECUNDARIA';

// I = Interna, E = Externa
export const TIPO_RELACION_INTERNA = 'I';
export const TIPO_RELACION_EXTERNA = 'E';

// Estados que impiden crear otra versión abierta del mismo puesto.
export const ESTADOS_DESCRIPTOR_BLOQUEO_CREACION = ['BORRADOR', 'ENVIADO', 'REVISADO', 'ACTIVO'];

// Datos mock de unidades organizacionales (temporal hasta integrar PLA_PUESTO).
export const MOCK_UNIDADES: MockUnidad[] = [
	{ CORR_UNIDAD: 3, NOMBRE_UNIDAD: 'Gerencia General' },
	{ CORR_UNIDAD: 4, NOMBRE_UNIDAD: 'Gerencia de Talento Humano' },
	{ CORR_UNIDAD: 5, NOMBRE_UNIDAD: 'Subgerencia de Tecnologia de Informacion' },
];

// Datos mock de puestos organizacionales (temporal hasta integrar PLA_PUESTO).
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

// Datos mock de puestos superiores para el lookup de "reporta a" (temporal).
export const MOCK_PUESTOS_REPORTA: MockPuestoReporta[] = [
	{ CORR_PUESTO_REPORTA: 1, NOMBRE_PUESTO_REPORTA: 'Maria Lopez' },
	{ CORR_PUESTO_REPORTA: 2, NOMBRE_PUESTO_REPORTA: 'Carlos Perez' },
	{ CORR_PUESTO_REPORTA: 3, NOMBRE_PUESTO_REPORTA: 'Ana Garcia' },
	{ CORR_PUESTO_REPORTA: 4, NOMBRE_PUESTO_REPORTA: 'Luis Ramirez' },
	{ CORR_PUESTO_REPORTA: 5, NOMBRE_PUESTO_REPORTA: 'Sofia Mendez' },
];

// Valores por defecto al crear el perfil local si aún no existe en BD.
export const PERFIL_PUESTO_DEFAULT = {
	EDAD_MINIMA: null as number | null,
	EDAD_MAXIMA: null as number | null,
	SEXO: 'INDIFERENTE',
	ESTADO_FAMILIAR: 'INDIFERENTE',
	CORR_DISPONIBILIDAD_HORARIO: null as number | null,
	NOMBRE_DISPONIBILIDAD_HORARIO: '',
	CORR_TIPO_MODALIDAD: null as number | null,
	NOMBRE_MODALIDAD: '',
	LICENCIA: false,
};

// Datos mock de bitácora hasta integrar el endpoint real.
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
