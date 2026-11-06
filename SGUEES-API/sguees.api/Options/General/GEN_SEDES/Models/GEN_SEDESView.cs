namespace sguees.Models
{
    // Qué hace: sede para los combos (código y nombre).
    // Cómo lo hace: se lee directo de la tabla (no tiene vista V_); tipos exactos a GEN_SEDES.
    public class GEN_SEDESView
    {
        public int CORR_SEDE { get; set; }
        public int CORR_EMPRESA { get; set; }
        public string CODIGO_SEDE { get; set; }
        public string NOMBRE_SEDE { get; set; }
        public string ESTADO_SEDE { get; set; }
    }
}
