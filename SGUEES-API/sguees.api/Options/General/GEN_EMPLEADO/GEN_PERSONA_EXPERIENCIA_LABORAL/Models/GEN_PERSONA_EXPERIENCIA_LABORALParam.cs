// Qué hace: parámetros de consulta de experiencia laboral por persona.
// Cómo lo hace: filtra por CORR_PERSONA (empresa viene del claim).
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_PERSONA_EXPERIENCIA_LABORALParam : BaseParam
	{
		public long CORR_PERSONA { get; set; }
		public int CORR_EXPERIENCIA_LABORAL { get; set; }
	}
}
