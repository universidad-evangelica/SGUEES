using eFramework.Data;

namespace SGUEES.Models
{
    // Filtros de consulta (query string) para listar/buscar SC_DESCRIPTOR_PUESTO por empresa e identificador.
    public class SC_DESCRIPTOR_PUESTOParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
    }
}
