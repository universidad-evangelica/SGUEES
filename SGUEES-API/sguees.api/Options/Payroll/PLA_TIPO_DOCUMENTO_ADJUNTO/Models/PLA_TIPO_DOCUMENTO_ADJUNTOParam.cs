using eFramework.Data;

namespace SGUEES.Models
{
	public class PLA_TIPO_DOCUMENTO_ADJUNTOParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_DOCUMENTO_ADJUNTO { get; set; }
		public int OPCION_CONSULTA { get; set; } = 0;
	}
}
