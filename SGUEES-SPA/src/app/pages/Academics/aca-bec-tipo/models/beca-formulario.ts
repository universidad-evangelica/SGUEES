export interface BecaCuestionarioListado { CORR_BECA:number; CODIGO_BECA:string; NOMBRE_BECA:string; CORR_FORMULARIO_BECA?:number|null; CORR_FORMULARIO_VERSION?:number|null; NOMBRE_FORMULARIO?:string; VERSION_FORMULARIO?:string; ESTADO_VERSION?:string; CANT_PREGUNTAS:number; CANT_ASIGNACIONES:number; CANT_SOLICITUDES:number; }
export interface BecaFormulario { CORR_FORMULARIO_BECA: number; CODIGO_FORMULARIO: string; NOMBRE_FORMULARIO: string; DESCRIPCION?: string; ACTIVO: boolean; VERSION_REGISTRO: string; }
export interface BecaVersion { CORR_FORMULARIO_BECA: number; CORR_FORMULARIO_VERSION: number; NOMBRE_FORMULARIO: string; VERSION_FORMULARIO: string; FECHA_INICIO: string; FECHA_FIN?: string; ESTADO_VERSION: 'BORRADOR'|'PUBLICADA'; ACTIVO: boolean; CANT_SECCIONES: number; CANT_PREGUNTAS: number; CANT_SOLICITUDES: number; VERSION_REGISTRO: string; }
export interface BecaAsignacion { CORR_TIPO_FORMULARIO: number; CORR_BECA: number; CORR_FORMULARIO_VERSION: number; CORR_FORMULARIO_BECA: number; NOMBRE_FORMULARIO: string; VERSION_FORMULARIO: string; ESTADO_VERSION: string; FECHA_INICIO: string; FECHA_FIN?: string; ANIO_ADMISION?: number; NUMERO_PERIODO_ADMISION?: number; ACTIVO: boolean; VERSION_REGISTRO: string; }
export interface BecaCiclo { CORR_PERIODO_ACADEMICO: number; ANIO: number; NUMERO_PERIODO: number; ACTIVO: boolean; }
export type BecaFormularioAccion = 'CrearFormularioVacio'|'CrearFormulario'|'EditarFormulario'|'CrearVersion'|'EditarVersion'|'PublicarVersion'|'ReabrirVersion'|'AsignarVersion'|'RetirarAsignacion';
export interface BecaFormularioCambio { CORR_BECA: number; ID: number; CORR_FORMULARIO_BECA?: number; CORR_VERSION_ORIGEN?: number; CORR_BECA_PLANTILLA?: number; CODIGO_FORMULARIO?: string; NOMBRE_FORMULARIO?: string; DESCRIPCION?: string; VERSION_FORMULARIO?: string; FECHA_INICIO?: Date|string|null; FECHA_FIN?: Date|string|null; ANIO_ADMISION?: number|null; NUMERO_PERIODO_ADMISION?: number|null; VERSION_REGISTRO?: string; CICLO?: number; }
export interface BecaPlantilla { CORR_FORMULARIO_VERSION: number; CORR_BECA: number; NOMBRE_BECA: string; }

export enum BecaElemento { Seccion=1,Pregunta=2,Opcion=3,Puntaje=4,Dependencia=5 }
export type TipoRespuestaBeca = 'TEXTO'|'TEXTO_LARGO'|'NUMERO'|'DECIMAL'|'FECHA'|'OPCION_UNICA'|'OPCION_MULTIPLE'|'SI_NO'|'DOCUMENTO'|'ACEPTACION';
export interface BecaSeccion { CORR_SECCION_BECA:number; NOMBRE_SECCION:string; DESCRIPCION?:string; ORDEN:number; PUNTAJE_MAXIMO?:number|null; PORCENTAJE_SECCION?:number|null; }
export interface BecaPregunta { CORR_SECCION_BECA:number; CORR_PREGUNTA_BECA:number; CODIGO_PREGUNTA:string; TEXTO_PREGUNTA:string; AYUDA?:string; TIPO_RESPUESTA:TipoRespuestaBeca; REQUERIDO:boolean; ORDEN:number; }
export interface BecaOpcion { CORR_PREGUNTA_BECA:number; CORR_OPCION_BECA:number; TEXTO_OPCION:string; ORDEN:number; }
export interface BecaPuntaje { CORR_PREGUNTA_BECA:number; CORR_PUNTAJE_BECA:number; CORR_OPCION_BECA?:number|null; TEXTO_OPCION?:string; PUNTAJE:number; PORCENTAJE:number; FECHA_INICIO:string; FECHA_FIN?:string|null; }
export interface BecaDependencia { CORR_DEPENDENCIA_BECA:number; CORR_PREGUNTA_PADRE:number; CORR_OPCION_PADRE:number; CORR_PREGUNTA_HIJA:number; PREGUNTA_PADRE:string; OPCION_PADRE:string; PREGUNTA_HIJA:string; }
export interface BecaCuestionarioContenido { VERSION:BecaVersion; SECCIONES:BecaSeccion[]; PREGUNTAS:BecaPregunta[]; OPCIONES:BecaOpcion[]; PUNTAJES:BecaPuntaje[]; DEPENDENCIAS:BecaDependencia[]; }
export interface BecaCuestionarioCambio { CORR_BECA:number; CORR_FORMULARIO_VERSION:number; ID:number; ELEMENTO:BecaElemento; VERSION_REGISTRO:string;
 CORR_SECCION_BECA?:number; CORR_PREGUNTA_BECA?:number; CORR_OPCION_BECA?:number|null;
 NOMBRE_SECCION?:string; DESCRIPCION?:string; ORDEN?:number; PUNTAJE_MAXIMO?:number|null; PORCENTAJE_SECCION?:number|null;
 CODIGO_PREGUNTA?:string; TEXTO_PREGUNTA?:string; AYUDA?:string; TIPO_RESPUESTA?:TipoRespuestaBeca; REQUERIDO?:boolean;
 TEXTO_OPCION?:string; PUNTAJE?:number; PORCENTAJE?:number; FECHA_INICIO?:Date|string|null; FECHA_FIN?:Date|string|null;
 CORR_PREGUNTA_PADRE?:number; CORR_OPCION_PADRE?:number; CORR_PREGUNTA_HIJA?:number;
}
export type BecaEditorAccion = 'AgregarElemento'|'EditarElemento'|'QuitarElemento';
export interface BecaCuestionarioCreado { CORR_FORMULARIO_BECA:number; CORR_FORMULARIO_VERSION:number; }
