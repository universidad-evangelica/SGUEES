// Qué hace: parámetros de consulta y descarga de documentos para GEN_EMPLEADO_CONTRATO.
// Cómo lo hace: transporta CORR_EMPRESA (desde claims), CORR_EMPLEADO y CORR_EMPLEADO_CONTRATO.
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_EMPLEADO_CONTRATOParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_EMPLEADO { get; set; }
		public int CORR_EMPLEADO_CONTRATO { get; set; }
		public string NOMBRE_ARCHIVO { get; set; }
	}
}

