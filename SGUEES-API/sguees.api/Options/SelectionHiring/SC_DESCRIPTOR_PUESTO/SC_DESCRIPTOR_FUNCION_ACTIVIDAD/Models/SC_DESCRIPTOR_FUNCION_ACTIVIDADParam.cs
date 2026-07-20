using eFramework.Data;

namespace SGUEES.Models
{
    // Filtros de consulta (query string) para listar/buscar SC_DESCRIPTOR_FUNCION_ACTIVIDAD por empresa,
    // descriptor, función o identificador de actividad.
    public class SC_DESCRIPTOR_FUNCION_ACTIVIDADParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_FUNCION { get; set; }
        public int CORR_ACTIVIDAD { get; set; }
    }
}
