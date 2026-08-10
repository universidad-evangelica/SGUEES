// Qué hace: filtros de consulta para PLA_PUESTO.
// Cómo: transporta CORR_EMPRESA y CORR_PUESTO hacia el servicio/repositorio.
using eFramework.Data;

namespace SGUEES.Models
{
    public class PLA_PUESTOParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_PUESTO { get; set; }
    }
}
