// Modelo principal del descriptor de puesto y constantes/lookups usados por la vista.
export interface ScDescriptorPuesto {
	CORR_EMPRESA: number; // Empresa a la que pertenece el descriptor.
	CORR_DESCRIPTOR_PUESTO: number; // Identificador único del descriptor.
	CODIGO_DESCRIPTOR_PUESTO?: string; // Código legible DES-####, sellado al crear el descriptor.
	CORR_PUESTO: number | null; // Puesto organizacional al que aplica el descriptor.
	CORR_UNIDAD: number | null; // Unidad organizacional del puesto.
	FECHA_EMISION: Date | string | null; // Fecha en que se emitió el descriptor.
	CORR_PUESTO_REPORTA: number | null; // Empleado jefe (CORR_EMPLEADO) al que reporta.
	FECHA_REVISION: Date | string | null; // Fecha de la última revisión del documento.
	NUM_PERSONAL_CARGO: number | null; // Cantidad de personas a cargo del titular.
	OBJETIVO_PUESTO: string; // Objetivo general del puesto.
	CORR_IMPACTO_ECONOMICO: number | null; // Catálogo de impacto económico institucional.
	DESCRIPCION_IMPACTO_ECONOMICO?: string; // Texto del impacto económico (snapshot o catálogo).
	RESPONSABLE: string; // Nombre del responsable del puesto (NOMBRE_EMPLEADO del jefe).
	FORMATO: string; // Formato del descriptor: CORTO, EXTENSO o AMBOS.
	VERSION: number | null; // Número de versión del descriptor.
	CORR_ESTADO: number | null; // FK al estado del flujo (SEG_FLUJO_ESTADO).
	NOMBRE_ESTADO: string; // Nombre del estado de flujo (bandera UI).
	USUARIO_CREA: string; // Usuario que creó el registro.
	ESTACION_CREA: string; // Estación de trabajo de creación.
	FECHA_CREA: Date | string | null; // Fecha y hora de creación.
	USUARIO_ACTU: string; // Usuario de la última actualización.
	ESTACION_ACTU: string; // Estación de la última actualización.
	FECHA_ACTU: Date | string | null; // Fecha y hora de la última actualización.
	NOMBRE_PUESTO?: string; // Nombre del puesto (join o lookup).
	NOMBRE_UNIDAD?: string; // Nombre de la unidad (join o lookup).
}

/** Unidad permitida al usuario de sesión (SC_UNIDADES_USUARIO). */
export interface ScDescriptorUnidadLookup {
	CORR_UNIDAD: number;
	CODIGO_UNIDAD?: string;
	NOMBRE_UNIDAD: string;
	NOMBRE_UNIDAD_CATALOGO?: string;
	ACTIVO?: boolean;
}

/** Puesto asignado a una unidad (GEN_UNIDADES_PUESTO). */
export interface ScDescriptorPuestoLookup {
	CORR_PUESTO: number;
	NOMBRE_PUESTO: string;
	NOMBRE_PUESTO_CATALOGO?: string;
	CORR_UNIDAD?: number;
}

/** Jefe de unidad para Reporta a (SC_ORGANIGRAMA_ESTRUCTURAL_JEFES_UNIDADES + GEN_EMPLEADO). */
export interface ScDescriptorJefeLookup {
	CORR_EMPLEADO: number;
	NOMBRE_EMPLEADO: string;
	CORR_PUESTO?: number | null;
	NOMBRE_PUESTO?: string | null;
	CORR_UNIDAD?: number;
	ACTIVO?: boolean;
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
	// Duración unida para el popup: valor entero + unidad (ej. "2 Semanas").
	DURACION_DISPLAY?: string;
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

// Estados que NO permiten crear otra versión abierta del mismo puesto.
// Cualquier estado distinto de Inactivo (CORR 18) bloquea.
// Ids alineados a SEG_FLUJO_ESTADO (SC_DESCRIPTOR_PUESTO). NOMBRE_* solo etiqueta/UI.
export const CORR_ESTADO_BORRADOR = 11;
export const CORR_ESTADO_APROBADO_JI = 12;
export const CORR_ESTADO_REVISADO_TH = 13;
export const CORR_ESTADO_ACTIVO = 14;
export const CORR_ESTADO_OBSERVADO = 15;
export const CORR_ESTADO_ENVIADO_JI = 16;
export const CORR_ESTADO_ENVIADO_JTH = 17;
export const CORR_ESTADO_INACTIVO = 18;

export const NOMBRE_ESTADO_INACTIVO = 'Inactivo';
export const NOMBRE_ESTADO_BORRADOR = 'Borrador';
export const NOMBRE_ESTADO_OBSERVADO = 'Observado';
export const NOMBRE_ESTADO_ENVIADO_JI = 'Enviado JI';
export const NOMBRE_ESTADO_APROBADO_JI = 'Aprobado JI';
export const NOMBRE_ESTADO_ENVIADO_JTH = 'Enviado a JTH';
export const NOMBRE_ESTADO_ACTIVO = 'Activo';

/** Catálogo OPERACION del SP PRAL_MTTO_SC_DESCRIPTOR_PUESTO_AUTORIZA. */
export const OPERACION_FLUJO = {
	GUARDAR: 1,
	ENVIAR: 2,
	APROBAR: 3,
	OBSERVAR: 4,
	INACTIVAR: 5,
	REACTIVAR: 6,
} as const;

// Qué hace: normaliza CORR_ESTADO a número (0 si vacío/inválido).
export function toCorrEstado(corrEstado: number | null | undefined): number {
	const n = Number(corrEstado);
	return Number.isFinite(n) && n > 0 ? n : 0;
}

export function esEstadoDescriptorBloqueante(corrEstado: number | null | undefined): boolean {
	const c = toCorrEstado(corrEstado);
	return c > 0 && c !== CORR_ESTADO_INACTIVO;
}

/** Qué hace: indica si el contenido del descriptor se puede editar/guardar. */
export function esEstadoDescriptorEditable(corrEstado: number | null | undefined): boolean {
	const c = toCorrEstado(corrEstado);
	return c === 0 || c === CORR_ESTADO_BORRADOR || c === CORR_ESTADO_OBSERVADO;
}

/** Qué hace: indica si el descriptor se puede eliminar (solo Borrador / Observado). */
export function esEstadoDescriptorEliminable(corrEstado: number | null | undefined): boolean {
	return esEstadoDescriptorEditable(corrEstado);
}

export function puedeEnviarDescriptor(corrEstado: number | null | undefined): boolean {
	const c = toCorrEstado(corrEstado);
	return c === CORR_ESTADO_BORRADOR || c === CORR_ESTADO_OBSERVADO;
}

export function puedeAprobarUObservarDescriptor(corrEstado: number | null | undefined): boolean {
	const c = toCorrEstado(corrEstado);
	return (
		c === CORR_ESTADO_ENVIADO_JI ||
		c === CORR_ESTADO_APROBADO_JI ||
		c === CORR_ESTADO_REVISADO_TH ||
		c === CORR_ESTADO_ENVIADO_JTH
	);
}

export function puedeInactivarDescriptor(corrEstado: number | null | undefined): boolean {
	return toCorrEstado(corrEstado) === CORR_ESTADO_ACTIVO;
}

export function puedeReactivarDescriptor(corrEstado: number | null | undefined): boolean {
	return toCorrEstado(corrEstado) === CORR_ESTADO_INACTIVO;
}

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
	OTROS: '',
};
