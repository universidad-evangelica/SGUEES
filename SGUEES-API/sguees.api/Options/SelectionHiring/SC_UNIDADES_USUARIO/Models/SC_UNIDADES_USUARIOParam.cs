// Qué hace: filtros de consulta para SC_UNIDADES_USUARIO.
// Cómo: transporta las tres columnas de la llave compuesta hacia servicio y repositorio.
using eFramework.Data;

namespace SGUEES.Models
{
    public class SC_UNIDADES_USUARIOParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_UNIDAD { get; set; }
        public string LOGIN_SISTEMA { get; set; }
    }
}
