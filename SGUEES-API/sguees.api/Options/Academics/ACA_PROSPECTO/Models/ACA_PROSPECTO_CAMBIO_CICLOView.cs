namespace sguees.Models
{
    // Qué hace: respuesta de ACA_SP_CAMBIAR_CICLO_PROSPECTO (validación previa o cambio aplicado).
    // Cómo lo hace: RESULTADO 0 = válido/aplicado; 1 = la carrera no se oferta en el ciclo; 2 = ciclo no
    //               disponible; 3 = sin plan vigente; 4 = sin período; 5 = parámetros o prospecto inválidos.
    public class ACA_PROSPECTO_CAMBIO_CICLOView
    {
        public int RESULTADO { get; set; }
        public string MENSAJE { get; set; }
        public int? CORR_PLAN_ACADEMICO { get; set; }
        public int? CORR_PERIODO_ACADEMICO { get; set; }
        public bool CAMBIA_CICLO { get; set; }
        public bool CARRERA_CONSERVADA { get; set; }
        public int BECAS_DEPURADAS { get; set; }
        public int BECAS_CLONADAS { get; set; }
        public bool REABRE_POSTULACION { get; set; }
        public string ESTADO_BECA { get; set; }
        // Regreso a un ciclo donde ya tuvo solicitud: se restaura esa en vez de clonar la activa.
        public bool BECA_RESTAURADA { get; set; }
        public string ESTADO_BECA_RESTAURADA { get; set; }
        public decimal? PUNTAJE_RESTAURADO { get; set; }
    }
}
