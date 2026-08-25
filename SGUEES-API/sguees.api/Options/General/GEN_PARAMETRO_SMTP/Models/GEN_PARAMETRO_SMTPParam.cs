using eFramework.Data;

namespace sguees.Models
{
	// Qué hace: parámetros de consulta de GEN_PARAMETRO_SMTP.
	public class GEN_PARAMETRO_SMTPParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PARAMETRO_SMTP { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
