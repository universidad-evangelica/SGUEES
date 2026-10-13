// Qué hace: filtros de consulta de documentos por solicitud.
// Cómo: transporta empresa, tipo de flujo y documento hacia el servicio.
using eFramework.Data;

namespace SGUEES.Models
{
	public class ACA_DOCUMENTO_ADMISION_FLUJO_TIPO_DOCUMENTOParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_DOCUMENTO { get; set; }
		public int CORR_DOCUMENTO_ADMISION { get; set; }
	}
}
