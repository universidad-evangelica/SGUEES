using eFramework.Data;

namespace sguees.Models
{
    public class ACA_ASIGNATURAS_PLANView
    {
        public int CORR_PLAN_ACADEMICO { get; set; }
        public string CODIGO_PLAN { get; set; }
        public short ANIO_PLAN { get; set; }
        public string NOMBRE_MODALIDAD { get; set; }
        public DateTime FECHA_VIGENCIA_INICIO { get; set; }
        public DateTime? FECHA_VIGENCIA_FIN { get; set; }
        public bool PLAN_VIGENTE { get; set; }
        public bool ASOCIADO { get; set; }
        public byte[] VERSION { get; set; }
        public bool EN_USO { get; set; }
    }
}
