using eFramework.Data;

namespace sguees.Models
{
	// Qué hace: parámetros de filtro para consulta de plantillas de correo.
	// Cómo lo hace: extiende BaseParam permitiendo filtrar por empresa, plantilla, servidor SMTP o código.
	public class GEN_PARAMETRO_PLANTILLAParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PARAMETRO_PLANTILLA { get; set; }
		public int CORR_PARAMETRO_SMTP { get; set; }
		public string CODIGO_PLANTILLA { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
