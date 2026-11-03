// Qué hace: parámetros de consulta del catálogo secciones SE.
using eFramework.Data;

namespace sguees.Models
{
	public class ACA_SE_SECCIONParam : BaseParam
	{
		public int CORR_SECCION_SE { get; set; }
		public int CORR_VERSION { get; set; }
	}
}
