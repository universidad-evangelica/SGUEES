// Qué hace: parámetros de consulta de contactos por persona.
// Cómo lo hace: filtra por CORR_PERSONA (empresa viene del claim).
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_PERSONA_CONTACTOParam : BaseParam
	{
		public long CORR_PERSONA { get; set; }
		public int CORR_CONTACTO { get; set; }
		public int CORR_TIPO_CONTACTO { get; set; }
	}
}
