using eFramework.Data;

namespace SGUEES.Models
{
    // Filtros de consulta (query string) para listar/buscar SC_DESCRIPTOR_PUESTO_KPI_FUNCION por empresa,
    // descriptor o identificador del indicador.
    public class SC_DESCRIPTOR_PUESTO_KPI_FUNCIONParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_KPI_FUNCION { get; set; }
    }
}
