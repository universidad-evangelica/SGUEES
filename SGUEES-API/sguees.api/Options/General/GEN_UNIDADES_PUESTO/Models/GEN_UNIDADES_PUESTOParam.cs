// Qué hace: filtros de consulta para GEN_UNIDADES_PUESTO.
// Cómo: transporta CORR_EMPRESA, CORR_UNIDAD y CORR_PUESTO hacia el servicio/repositorio.
using eFramework.Data;

namespace SGUEES.Models
{
    public class GEN_UNIDADES_PUESTOParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_UNIDAD { get; set; }
        public int CORR_PUESTO { get; set; }
    }
}
