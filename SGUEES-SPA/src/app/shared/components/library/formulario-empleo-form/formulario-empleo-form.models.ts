/** Modelos del Portal de Candidatos (formulario público por token). */

export type PortalPaso = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface PortalStepMeta {
	id: PortalPaso;
	titulo: string;
	corto: string;
	icono: string;
	motivacion: string;
}

export interface FamiliarDirecto {
	TIPO: 'PADRE' | 'MADRE' | 'ESPOSO';
	ETIQUETA: string;
	NOMBRE: string;
	DOMICILIO: string;
	FECHA_NACIMIENTO: Date | null;
	OCUPACION: string;
}

export interface HijoRow {
	ID: number;
	NOMBRE: string;
	EDAD: number | null;
	SEXO: string;
	FECHA_NACIMIENTO: Date | null;
}

export interface EstudioRow {
	ID: number;
	NIVEL: string;
	INSTITUCION: string;
	DESDE: Date | null;
	HASTA: Date | null;
	TITULO: string;
}

export interface IdiomaRow {
	ID: number;
	IDIOMA: string;
	NIVEL: string;
}

export interface CompetenciaRow {
	ID: number;
	HERRAMIENTA: string;
	NIVEL: string;
}

export interface ExperienciaRow {
	ID: number;
	EMPRESA: string;
	TELEFONO: string;
	CARGO: string;
	JEFE_INMEDIATO: string;
	FECHA_INICIO: Date | null;
	FECHA_FIN: Date | null;
	SALARIO_INICIAL: number | null;
	SALARIO_FINAL: number | null;
	MOTIVO_SALIDA: string;
}

export interface FamiliarUeesRow {
	ID: number;
	NOMBRE: string;
	PARENTESCO: string;
	UNIDAD: string;
	TELEFONO: string;
}

export interface FormularioEmpleoData {
	// Información básica
	FOTO_URL: string;
	NOMBRE1: string;
	NOMBRE2: string;
	APELLIDO1: string;
	APELLIDO2: string;
	FECHA_NACIMIENTO: Date | null;
	EDAD: number;
	ESTADO_CIVIL: string;
	NACIONALIDAD: string;

	// Contacto
	CORREO: string;
	CELULAR: string;
	TELEFONO: string;
	DIRECCION: string;

	// Documentación
	DUI: string;
	PASAPORTE: string;
	ISSS: string;
	AFP: string;
	NOMBRE_AFP: string;
	LICENCIA: string;

	// Laboral
	PLAZA_SOLICITADA: string;
	PRETENSION_SALARIAL: number | 0;
	DISPONIBILIDAD: string;

	// Adicional personales
	RELIGION: string;
	IGLESIA: string;
	DIRECCION_IGLESIA: string;
	ES_CONTRIBUYENTE_CCF: boolean;
	ES_JUBILADO: boolean;
	POSEE_DISCAPACIDAD: boolean;
	TIPO_DISCAPACIDAD: string;

	// Emergencia
	EMERGENCIA_NOMBRE: string;
	EMERGENCIA_PARENTESCO: string;
	EMERGENCIA_TELEFONO: string;

	// Información adicional (paso 5)
	TIENE_FAMILIARES_UEES: boolean;
	// DISPONIBILIDAD_VIAJAR: boolean;
	// DISPONIBILIDAD_INMEDIATA: boolean;
	// CAMBIO_RESIDENCIA: boolean;
	// LINKEDIN: string;
	// PORTAFOLIO: string;

	// Confirmación
	DECLARA_VERDAD: boolean;
	AUTORIZA_VERIFICACION: boolean;
	FECHA_DECLARACION: Date;
	FIRMA_ELECTRONICA: string;
}

export type FamiliarDirectoPayload = Omit<FamiliarDirecto, 'ETIQUETA'>;
export type HijoPayload = Omit<HijoRow, 'ID'>;
export type EstudioPayload = Omit<EstudioRow, 'ID'>;
export type IdiomaPayload = Omit<IdiomaRow, 'ID'>;
export type CompetenciaPayload = Omit<CompetenciaRow, 'ID'>;
export type ExperienciaPayload = Omit<ExperienciaRow, 'ID'>;
export type FamiliarUeesPayload = Omit<FamiliarUeesRow, 'ID'>;

/** Contrato SPA para Completar. Excluye campos exclusivos de UI como FOTO_URL e ID. */
export interface CompletarFormularioEmpleoPayload
	extends Omit<FormularioEmpleoData, 'FOTO_URL' | 'FECHA_NACIMIENTO'> {
	TOKEN: string;
	/** DateOnly requerido por la API, en formato local yyyy-MM-dd. */
	FECHA_NACIMIENTO: string;
	FAMILIARES_DIRECTOS: FamiliarDirectoPayload[];
	HIJOS: HijoPayload[];
	ESTUDIOS: EstudioPayload[];
	IDIOMAS: IdiomaPayload[];
	COMPETENCIAS: CompetenciaPayload[];
	EXPERIENCIAS: ExperienciaPayload[];
	FAMILIARES_UEES: FamiliarUeesPayload[];
}

export function createEmptyFormData(): FormularioEmpleoData {
	return {
		FOTO_URL: '',
		NOMBRE1: '',
		NOMBRE2: '',
		APELLIDO1: '',
		APELLIDO2: '',
		FECHA_NACIMIENTO: null,
		EDAD: 0,
		ESTADO_CIVIL: '',
		NACIONALIDAD: 'Salvadoreña',
		CORREO: '',
		CELULAR: '',
		TELEFONO: '',
		DIRECCION: '',
		DUI: '',
		PASAPORTE: '',
		ISSS: '',
		AFP: '',
		NOMBRE_AFP: '',
		LICENCIA: '',
		PLAZA_SOLICITADA: '',
		PRETENSION_SALARIAL: 0,
		DISPONIBILIDAD: '',
		RELIGION: '',
		IGLESIA: '',
		DIRECCION_IGLESIA: '',
		ES_CONTRIBUYENTE_CCF: false,
		ES_JUBILADO: false,
		POSEE_DISCAPACIDAD: false,
		TIPO_DISCAPACIDAD: '',
		EMERGENCIA_NOMBRE: '',
		EMERGENCIA_PARENTESCO: '',
		EMERGENCIA_TELEFONO: '',
		TIENE_FAMILIARES_UEES: false,
		// DISPONIBILIDAD_VIAJAR: false,
		// DISPONIBILIDAD_INMEDIATA: false,
		// CAMBIO_RESIDENCIA: false,
		// LINKEDIN: '',
		// PORTAFOLIO: '',
		DECLARA_VERDAD: false,
		AUTORIZA_VERIFICACION: false,
		FECHA_DECLARACION: new Date(),
		FIRMA_ELECTRONICA: '',
	};
}

export function createFamiliaresDirectos(): FamiliarDirecto[] {
	return [
		{ TIPO: 'PADRE', ETIQUETA: 'Padre', NOMBRE: '', DOMICILIO: '', FECHA_NACIMIENTO: null, OCUPACION: '' },
		{ TIPO: 'MADRE', ETIQUETA: 'Madre', NOMBRE: '', DOMICILIO: '', FECHA_NACIMIENTO: null, OCUPACION: '' },
		{ TIPO: 'ESPOSO', ETIQUETA: 'Esposo', NOMBRE: '', DOMICILIO: '', FECHA_NACIMIENTO: null, OCUPACION: '' },
	];
}

export const PORTAL_STEPS: PortalStepMeta[] = [
	{
		id: 1,
		titulo: 'Datos Personales',
		corto: 'Personales',
		icono: 'user',
		motivacion: 'Empieza con lo esencial. Un perfil completo genera mejor primera impresión.',
	},
	{
		id: 2,
		titulo: 'Información Familiar',
		corto: 'Familiar',
		icono: 'group',
		motivacion: '¡Vas bien! La información familiar ayuda a completar tu expediente.',
	},
	{
		id: 3,
		titulo: 'Formación Académica',
		corto: 'Formación',
		icono: 'bookmark',
		motivacion: 'Destaca tu preparación. Cada estudio suma a tu postulación.',
	},
	{
		id: 4,
		titulo: 'Experiencia Laboral',
		corto: 'Experiencia',
		icono: 'card',
		motivacion: 'Ya pasaste la mitad. Cuenta tu trayectoria con claridad.',
	},
	{
		id: 5,
		titulo: 'Información Adicional',
		corto: 'Adicional',
		icono: 'tips',
		motivacion: 'Casi listo. Estos datos agilizan el proceso de RRHH.',
	},
	{
		id: 6,
		titulo: 'Confirmación y Envío',
		corto: 'Envío',
		icono: 'check',
		motivacion: 'Último paso. Revisa el resumen y envía tu solicitud con confianza.',
	},
];
