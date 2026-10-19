// Qué hace: parámetros de filtro para consultar el versionamiento de plantillas de correo.
// Cómo lo hace: extiende de BaseParam permitiendo filtrar por empresa, plantilla y número de versión.
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_PARAMETRO_PLANTILLA_VERSIONParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_PARAMETRO_PLANTILLA { get; set; }
		public int NUMERO_VERSION { get; set; }
	}
}
