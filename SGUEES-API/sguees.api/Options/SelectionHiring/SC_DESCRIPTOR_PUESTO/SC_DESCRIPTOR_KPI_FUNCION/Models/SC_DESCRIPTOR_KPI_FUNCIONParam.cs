using eFramework.Data;

namespace SGUEES.Models
{
    // Filtros de consulta de KPI asociados a funciones del descriptor.
    public class SC_DESCRIPTOR_KPI_FUNCIONParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_KPI_FUNCION { get; set; }
    }
}
