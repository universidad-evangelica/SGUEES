using eFramework.Data;

namespace SGUEES.Models
{
    // filtros de consulta de SC_DESCRIPTOR_FUNCION.
    public class SC_DESCRIPTOR_FUNCIONParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_FUNCION { get; set; }
        public string TIPO_FUNCION { get; set; }
    }
}
