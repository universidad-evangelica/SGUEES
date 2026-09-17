// Qué hace: parámetros de consulta del catálogo religión.
// Cómo lo hace: expone el correlativo y opción de consulta heredando BaseParam.
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_RELIGIONParam : BaseParam
	{
		public int CORR_RELIGION { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
