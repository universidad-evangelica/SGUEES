// Qué hace: parámetros de consulta de domicilios por persona.
// Cómo lo hace: filtra por CORR_PERSONA (empresa viene del claim).
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_PERSONA_DOMICILIOParam : BaseParam
	{
		public long CORR_PERSONA { get; set; }
		public int CORR_DOMICILIO { get; set; }
	}
}
