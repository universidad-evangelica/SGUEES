using eFramework.Data;

namespace sguees.Models
{
    public class ACA_PERIODOS_CURSOView : ACA_PERIODOS_CURSOTable
    {
        public int CANTIDAD_ASIGNATURAS { get; set; }
        public string USUARIO_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
