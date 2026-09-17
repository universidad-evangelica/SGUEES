// Qué hace: parámetros de consulta del catálogo tipo contacto.
// Cómo lo hace: expone el correlativo y opción de consulta heredando BaseParam.
using eFramework.Data;

namespace sguees.Models
{
	public class GEN_TIPO_CONTACTOParam : BaseParam
	{
		public int CORR_TIPO_CONTACTO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
