// Qué hace: parámetros de consulta de rangos de monto SE.
using eFramework.Data;

namespace sguees.Models
{
	public class ACA_SE_RANGO_MONTOParam : BaseParam
	{
		public int CORR_RANGO_MONTO { get; set; }
		public int CORR_VERSION { get; set; }
		public int CORR_SECCION_SE { get; set; }
	}
}
