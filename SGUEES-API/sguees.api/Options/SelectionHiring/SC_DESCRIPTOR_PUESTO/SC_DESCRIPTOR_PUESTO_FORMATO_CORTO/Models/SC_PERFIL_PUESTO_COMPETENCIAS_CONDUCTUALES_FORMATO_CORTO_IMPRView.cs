namespace SGUEES.Models
{
    // Qué hace: par de nombres de competencias conductuales para impresión Formato corto.
    // Cómo: mapea result set 11 (vista empareja 2 nombres por CORR_FILA).
    public class SC_PERFIL_PUESTO_COMPETENCIAS_CONDUCTUALES_FORMATO_CORTO_IMPRView
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_PERFIL_PUESTO { get; set; }
        public int CORR_FILA { get; set; }
        public string NOMBRE_COMPETENCIA_COLUMNA_1 { get; set; }
        public string NOMBRE_COMPETENCIA_COLUMNA_2 { get; set; }
    }
}
