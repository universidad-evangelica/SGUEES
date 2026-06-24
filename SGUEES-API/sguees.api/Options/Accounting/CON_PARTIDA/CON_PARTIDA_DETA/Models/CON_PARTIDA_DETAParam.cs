using eFramework.Data;

namespace sguees.Models
{
	public class CON_PARTIDA_DETAParam : BaseParam
	{
		public int CORR_EMPRESA { get; set; }
		public int ANIO_PERIODO { get; set; }
		public int MES_PERIODO { get; set; }
		public int CORR_CLASE_PARTIDA { get; set; }
		public int CORR_PARTIDA { get; set; }
		public int CORR_PARTIDA_DETA { get; set; }
	}
}
