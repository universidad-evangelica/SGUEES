namespace sguees.Models
{
	public class BAN_CHEQUERAView
	{
		public int CORR_EMPRESA { get; set; }
		public int CORR_CUENTA_BANCO { get; set; }
		public string NUMERO_CUENTA_BANCO { get; set; }
		public int CORR_CHEQUERA { get; set; }
		public int NUMERO_CHEQUE_INICIAL { get; set; }
		public int NUMERO_CHEQUE_FINAL { get; set; }
		public int NUMERO_CHEQUE_ACTUAL { get; set; }
		public string SERIE_CHEQUE { get; set; }
		public string ESTADO_CHEQUERA { get; set; }
		public string CLASE_CHEQUE { get; set; }
	}
}
