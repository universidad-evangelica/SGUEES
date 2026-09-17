// Qué hace: parámetros de consulta del catálogo parentesco.
// Cómo lo hace: expone el correlativo y opción de consulta heredando BaseParam.
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_PARENTESCOParam : BaseParam
	{
		public int CORR_PARENTESCO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
