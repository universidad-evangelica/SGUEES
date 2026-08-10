// Qué hace: filtros de consulta para SC_UNIDADES_TIPO_USUARIO.
// Cómo: transporta CORR_EMPRESA, CORR_UNIDAD y TIPO_USUARIO hacia el servicio/repositorio.
using eFramework.Data;

namespace SGUEES.Models
{
    public class SC_UNIDADES_TIPO_USUARIOParam : BaseParam
    {
        public int CORR_EMPRESA { get; set; }
        public int CORR_UNIDAD { get; set; }
        public int TIPO_USUARIO { get; set; }
    }
}
