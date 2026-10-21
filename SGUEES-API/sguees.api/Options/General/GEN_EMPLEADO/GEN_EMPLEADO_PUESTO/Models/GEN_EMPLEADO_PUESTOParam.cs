// Qué hace: parámetros de consulta de puestos del empleado.
// Cómo lo hace: filtra por CORR_EMPLEADO (empresa viene del claim).
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_EMPLEADO_PUESTOParam : BaseParam
	{
		public int CORR_EMPLEADO { get; set; }
		// Qué hace: filtros para búsqueda de empleados por unidad y puesto.
		// Cómo lo hace: propiedades utilizadas por el lookup de empleado sustituto.
		public int CORR_UNIDAD { get; set; }
		public int CORR_PUESTO { get; set; }
	}
}
