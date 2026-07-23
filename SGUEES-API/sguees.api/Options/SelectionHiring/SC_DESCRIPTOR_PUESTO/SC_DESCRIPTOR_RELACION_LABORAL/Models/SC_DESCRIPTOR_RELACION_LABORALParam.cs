using eFramework.Data;

namespace SGUEES.Models
{
    // Filtros de consulta (query string) para listar/buscar SC_DESCRIPTOR_RELACION_LABORAL por empresa,
    // descriptor, identificador o tipo de relación.
    public class SC_DESCRIPTOR_RELACION_LABORALParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_RELACION_LABORAL { get; set; }
        public string TIPO_RELACION { get; set; }
    }
}
