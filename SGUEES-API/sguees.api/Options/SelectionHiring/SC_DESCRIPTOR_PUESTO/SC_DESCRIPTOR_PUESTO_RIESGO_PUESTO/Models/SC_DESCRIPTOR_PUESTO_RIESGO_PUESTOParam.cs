using eFramework.Data;

namespace SGUEES.Models
{
    // Filtros de consulta (query string) para listar/buscar SC_DESCRIPTOR_PUESTO_RIESGO_PUESTO por empresa,
    // descriptor o identificador del riesgo del catálogo (llave compuesta).
    public class SC_DESCRIPTOR_PUESTO_RIESGO_PUESTOParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_RIESGO_PUESTO { get; set; }
    }
}
