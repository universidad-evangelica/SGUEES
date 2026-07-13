import { MockPuesto, MockPuestoReporta, MockUnidad } from './models/sc-descriptor-puesto';

export const FORMATO_CORTA = 'CORTO';
export const FORMATO_EXTENSA = 'EXTENSO';

export const TIPO_FUNCION_CLAVE = 'CLAVE';
export const TIPO_FUNCION_SECUNDARIA = 'SECUNDARIA';

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

export const PERFIL_PUESTO_DEFAULT = {
	EDAD_MINIMA: 18,
	EDAD_MAXIMA: 65,
	SEXO: 'INDIFERENTE',
	ESTADO_FAMILIAR: 'INDIFERENTE',
	CORR_DISPONIBILIDAD_HORARIO: null as number | null,
	CORR_TIPO_MODALIDAD: null as number | null,
	LICENCIA: false,
};

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
