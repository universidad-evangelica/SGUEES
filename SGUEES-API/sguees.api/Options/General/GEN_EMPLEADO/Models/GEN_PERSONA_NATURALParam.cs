// Qué hace: parámetros de consulta de GEN_PERSONA_NATURAL.
// Cómo lo hace: permite filtrar por CORR_PERSONA o CORR_PERSONA_NATURAL.
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_PERSONA_NATURALParam : BaseParam
	{
		public long CORR_PERSONA { get; set; }
		public long CORR_PERSONA_NATURAL { get; set; }
	}
}
