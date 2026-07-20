using eFramework.Data;

namespace SGUEES.Models
{
    // Filtros de consulta (query string) para listar/buscar SC_DESCRIPTOR_FUNCION por empresa, descriptor,
    // identificador o tipo de función.
    public class SC_DESCRIPTOR_FUNCIONParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_DESCRIPTOR_PUESTO { get; set; }
        public int CORR_FUNCION { get; set; }
        public string TIPO_FUNCION { get; set; }
    }
}
