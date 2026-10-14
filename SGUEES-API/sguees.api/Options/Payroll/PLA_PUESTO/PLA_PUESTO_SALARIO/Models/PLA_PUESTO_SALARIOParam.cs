// Qué hace: parámetros de consulta de salarios de un puesto.
// Cómo lo hace: filtra por CORR_PUESTO (empresa viene del claim).
using eFramework.Data;

namespace SGUEES.Models
{
	public class PLA_PUESTO_SALARIOParam : BaseParam
	{
		public int CORR_PUESTO { get; set; }
		public int CORR_PUESTO_SALARIO { get; set; }
	}
}
