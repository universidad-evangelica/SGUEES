using eFramework.Data;

namespace sguees.Models
{
    public class ACA_PERIODOS_CURSOTable : BaseEntity
    {
        public int CORR_PERIODO_CURSO { get; set; }
        public int CORR_EMPRESA { get; set; }
        public string CODIGO_PERIODO { get; set; }
        public string NOMBRE_PERIODO { get; set; }
        public int DURACION_MESES { get; set; }
        public bool ACTIVO { get; set; }
        public byte[] VERSION { get; set; }
    }
}
