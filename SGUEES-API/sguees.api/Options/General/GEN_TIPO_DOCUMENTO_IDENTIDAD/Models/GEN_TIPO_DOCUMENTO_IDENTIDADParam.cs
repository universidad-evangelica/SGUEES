// Qué hace: parámetros de consulta del catálogo tipo documento identidad.
// Cómo lo hace: expone el correlativo y opción de consulta heredando BaseParam.
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_TIPO_DOCUMENTO_IDENTIDADParam : BaseParam
	{
		public int CORR_TIPO_DOCUMENTO_IDENTIDAD { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
