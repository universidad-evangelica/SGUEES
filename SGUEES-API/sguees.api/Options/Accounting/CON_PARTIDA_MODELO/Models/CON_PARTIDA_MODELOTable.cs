using eFramework.Data;

namespace sguees.Models
{
	public class CON_PARTIDA_MODELOTable : BaseEntity
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_CLASE_PARTIDA { get; set; }
		public int CORR_PARTIDA { get; set; }
		public string NUMERO_DOCUMENTO { get; set; }
		public string NOMBRE_PARTIDA { get; set; }
		public string ESTADO_PARTIDA { get; set; }
		public string CLASE_PARTIDA { get; set; }
		public int? CORR_MONEDA { get; set; }
		public decimal? FACTOR_CAMBIO { get; set; }
		public string OPERADOR { get; set; }
	}
}
