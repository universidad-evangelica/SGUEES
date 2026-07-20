using eFramework.Data;

namespace sguees.Models
{
	public class BAN_TIPO_MOVI_SEGUN_BANCOParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_TIPO_MOVIMIENTO { get; set; }
		public int CORR_BANCO { get; set; }
		public string CODIGO_MOVIMIENTO { get; set; }
	}
}
