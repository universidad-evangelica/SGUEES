// Qué hace: parámetros de consulta de documentos de identidad por persona.
// Cómo lo hace: filtra por CORR_PERSONA (empresa viene del claim).
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_PERSONA_TIPO_DOCUMENTO_IDENTIDADParam : BaseParam
	{
		public long CORR_PERSONA { get; set; }
		public int CORR_TIPO_DOCUMENTO_IDENTIDAD { get; set; }
	}
}
