// Qué hace: parámetros de consulta del catálogo Seguro Social.
// Cómo lo hace: expone el correlativo heredando BaseParam.
using eFramework.Data;

namespace SGUEES.Models
{
	public class PLA_SEGURO_SOCIALParam : BaseParam
	{
		public int CORR_SEGURO_SOCIAL { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
