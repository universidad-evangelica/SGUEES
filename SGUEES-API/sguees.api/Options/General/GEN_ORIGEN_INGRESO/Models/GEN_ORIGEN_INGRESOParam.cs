// Qué hace: parámetros de consulta del catálogo origen ingreso.
// Cómo lo hace: expone el correlativo y opción de consulta heredando BaseParam.
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_ORIGEN_INGRESOParam : BaseParam
	{
		public int CORR_ORIGEN_INGRESO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
