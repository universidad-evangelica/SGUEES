// Qué hace: parámetros de consulta del catálogo de documentos de admisión.
// Cómo lo hace: expone el correlativo heredando BaseParam.
using eFramework.Data;

namespace sguees.Models
{
	public class ACA_DOCUMENTO_ADMISIONParam : BaseParam
	{
		public int CORR_DOCUMENTO_ADMISION { get; set; }
	}
}
