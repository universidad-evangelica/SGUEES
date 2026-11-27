export interface OfertaAdmisionFila {
 CORR_CARRERA: number; CODIGO_CARRERA: string; NOMBRE_CARRERA: string;
 CORR_FACULTAD: number; NOMBRE_FACULTAD: string;
 CORR_PLAN_ACADEMICO: number | null; CODIGO_PLAN: string | null;
 CORR_MODALIDAD: number | null; NOMBRE_MODALIDAD: string | null;
 FECHA_VIGENCIA_INICIO: string | null; FECHA_VIGENCIA_FIN: string | null;
 PUBLICAR_NUEVO_INGRESO: boolean; USA_PERIODOS_VIGENTES: boolean; VERSION_CICLO: string; VERSION_OFERTA: string | null;
 PUBLICAR_CARRERA: boolean; PUBLICAR_MODALIDAD: boolean; PUBLICAR_PLAN: boolean;
 CARRERA_ELEGIBLE: boolean; PLAN_ELEGIBLE: boolean; ES_PRINCIPAL: boolean; DIAGNOSTICO: string;
}
export interface OfertaAdmisionInput {
 CORR_CICLO_ACADEMICO: number; CORR_SEDE: number; PUBLICAR_NUEVO_INGRESO: boolean;
 VERSION_CICLO: string; VERSION_OFERTA: string | null;
 CARRERAS: { id: number; publicar: boolean }[];
 MODALIDADES: { carrera: number; modalidad: number; publicar: boolean; principal: number | null }[];
 PLANES: { id: number; publicar: boolean }[];
}
export interface OfertaAdmisionModalidad { id: number; nombre: string; publicar: boolean; principal: number | null; planes: OfertaAdmisionFila[]; }
export interface OfertaAdmisionCarrera { id: number; nombre: string; facultad: number; publicar: boolean; elegible: boolean; modalidades: OfertaAdmisionModalidad[]; diagnostico: string; }
