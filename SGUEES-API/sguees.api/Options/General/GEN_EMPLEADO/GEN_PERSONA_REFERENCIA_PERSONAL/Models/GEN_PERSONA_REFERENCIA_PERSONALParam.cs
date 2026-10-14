// Qué hace: parámetros de consulta de referencias personales por persona.
// Cómo lo hace: filtra por CORR_PERSONA (empresa viene del claim).
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_PERSONA_REFERENCIA_PERSONALParam : BaseParam
	{
		public long CORR_PERSONA { get; set; }
		public int CORR_REFERENCIA_PERSONAL { get; set; }
	}
}
