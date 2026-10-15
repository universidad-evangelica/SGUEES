// Qué hace: fila del combo de ciclos (ACA_PERIODOS_ACADEMICOS/GetCICLO_ACA_PROSPECTO).
// Cómo lo hace: CICLO ('2027-01') es la llave del combo; ANIO y NUMERO_PERIODO filtran el listado.
export interface AcaProspectoCiclo {
    CORR_EMPRESA: number;
    CICLO: string;
    ANIO: number;
    NUMERO_PERIODO: number | null;
    NOMBRE_CICLO: string;
    CLAVE_CICLO: number | null;
    CANTIDAD_PROSPECTOS: number | null;
    ES_CICLO_DEFECTO: boolean | null;
}
