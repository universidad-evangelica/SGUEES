// Qué hace: parámetros de consulta de personas de contacto por empleado.
// Cómo lo hace: filtra por CORR_PERSONA (empresa viene del claim).
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_PERSONA_PARENTESCO_CONTACTOParam : BaseParam
	{
		public long CORR_PERSONA { get; set; }
		public int CORR_PARENTESCO_CONTACTO { get; set; }
	}
}
