using eFramework.Data;

namespace sguees.Models
{
    public class ACA_TIPOS_PRACTICAView : ACA_TIPOS_PRACTICATable
    {
        public int CANTIDAD_ASIGNATURAS { get; set; }
        public string USUARIO_CREA { get; set; }
        public DateTime FECHA_CREA { get; set; }
        public string USUARIO_ACTU { get; set; }
        public DateTime? FECHA_ACTU { get; set; }
    }
}
