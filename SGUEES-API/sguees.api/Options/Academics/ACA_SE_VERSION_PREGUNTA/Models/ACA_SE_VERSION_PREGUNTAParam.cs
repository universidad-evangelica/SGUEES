// Qué hace: parámetros de consulta de preguntas por versión SE.
using eFramework.Data;

namespace sguees.Models
{
	public class ACA_SE_VERSION_PREGUNTAParam : BaseParam
	{
		public int CORR_VERSION_PREGUNTA { get; set; }
		public int CORR_VERSION { get; set; }
	}
}
