namespace sguees.Models
{
	public class BAN_CONCILIA_BANCARIA_RESUMENView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_CUENTA_BANCO { get; set; }
		public int CORR_CONCILIACION { get; set; }
		public int CORR_LINEA { get; set; }
		public string NOMBRE_LINEA_TRABAJO { get; set; }
		public short AUMENTA_DISMINUYE { get; set; }
		public decimal MONTO { get; set; }
	}
}
