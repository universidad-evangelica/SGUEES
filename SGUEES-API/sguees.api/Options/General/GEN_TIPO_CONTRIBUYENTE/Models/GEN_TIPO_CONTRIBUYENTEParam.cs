// Qué hace: parámetros de consulta del catálogo tipo contribuyente.
// Cómo lo hace: expone el correlativo y opción de consulta heredando BaseParam.
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_TIPO_CONTRIBUYENTEParam : BaseParam
	{
		public int CORR_TIPO_CONTRIBUYENTE { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
