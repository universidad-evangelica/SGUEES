using eFramework.Data;

namespace SGUEES.Models
{
    // Filtros de consulta de funciones del descriptor (incluye TIPO_FUNCION).
    public class SC_DESCRIPTOR_FUNCIONParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_FUNCION { get; set; }
        // Filtro opcional por tipo de función.
        public string TIPO_FUNCION { get; set; }
    }
}
