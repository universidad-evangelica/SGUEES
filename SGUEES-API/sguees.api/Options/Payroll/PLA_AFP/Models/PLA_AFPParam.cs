// Qué hace: parámetros de consulta del catálogo AFP.
// Cómo lo hace: expone el correlativo heredando BaseParam.
using eFramework.Data;

namespace SGUEES.Models
{
	public class PLA_AFPParam : BaseParam
	{
		public int CORR_AFP { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
