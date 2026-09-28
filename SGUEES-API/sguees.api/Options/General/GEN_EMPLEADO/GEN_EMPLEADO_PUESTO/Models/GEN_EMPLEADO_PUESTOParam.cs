// Qué hace: parámetros de consulta de puestos del empleado.
// Cómo lo hace: filtra por CORR_EMPLEADO (empresa viene del claim).
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_EMPLEADO_PUESTOParam : BaseParam
	{
		public int CORR_EMPLEADO { get; set; }
	}
}
