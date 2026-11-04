// Qué hace: filtros de consulta de documentos por período.
// Cómo: transporta empresa, documento y período hacia el servicio.
using eFramework.Data;

namespace SGUEES.Models
{
	public class ACA_DOCUMENTO_ADMISION_PERIODOS_ACADEMICOSParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_DOCUMENTO_ADMISION { get; set; }
		public int CORR_PERIODO_ACADEMICO { get; set; }
	}
}
